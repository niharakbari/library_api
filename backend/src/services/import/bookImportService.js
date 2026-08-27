const openLibraryService = require("../../services/openLibrary/openLibraryService");
const bookModel = require("../../models/bookModel");

const authorModel = require("../../models/authorModel");
const bookAuthorModel = require("../../models/bookAuthorModel");

const subjectModel = require('../../models/subjectModel');
const bookSubjectsModel = require('../../models/bookSubjectsModel');

const languageModel = require("../../models/languageModel");
const bookLanguagesModel = require("../../models/bookLanguageModel");

const bookReviewModel = require (`../../models/bookReviewsModel`);

const db = require("../../config/database");

const importBook = async (workKey, languages = [], connection = db) => {


    const work = await openLibraryService.getWork(workKey);

    const cleanWorkKey = work.key.replace("/works/", "");



    if (!work.title) {
        return {
            status: "skipped",
            errorMessage: "Missing title"
        };
    }

  
    let safeCoverId = null;
    if (Array.isArray(work.covers) && work.covers.length > 0) {
        const firstCover = Number(work.covers[0]);
        if (!isNaN(firstCover) && firstCover > 0) {
            safeCoverId = firstCover;
        }
    }

        let parsedYear = null;
    if (work.first_publish_date) {
        const match = String(work.first_publish_date).match(/\b(1\d{3}|20\d{2})\b/);
        if (match) {
            parsedYear = parseInt(match[0], 10);
        }
    }
    parsedYear = parsedYear || work.first_publish_year || null;

    const existingBook = await bookModel.findByOpenLibraryWorkKey(cleanWorkKey, connection);

    let finalBookId;
    let finalStatus;

    if (existingBook) {
        await bookModel.update(existingBook.id, {
            title: work.title,
            firstPublishYear: parsedYear,
            coverEditionKey: null,
            coverId: safeCoverId,
        }, connection);

        finalBookId = existingBook.id;
        finalStatus = "updated";

        // Clear existing mappings to prevent duplication on upsert
        await bookAuthorModel.deleteBookAuthor(finalBookId, connection);
        await bookSubjectsModel.deleteBookSubject(finalBookId, connection);
        await bookLanguagesModel.deleteBookLanguage(finalBookId, connection);
    } else {
        finalBookId = await bookModel.create({
            workKey: cleanWorkKey,
            title: work.title,
            firstPublishYear: parsedYear,
            coverEditionKey: null,
            coverId: safeCoverId,
        }, connection);
        finalStatus = "imported";
    }

    
    // search author details...and adding authors one by one
    const authors = work.authors || [];

    for (const authorEntry of authors) {
       const authorKey = authorEntry.author.key;

       const author = await openLibraryService.getAuthor(authorKey);

       const cleanAuthorKey = author.key.replace(/\/authors\//,'');

       const existingAuthor = await authorModel.findByOpenLibraryAuthorKey(cleanAuthorKey, connection);

       let authorId
       if (existingAuthor){
            authorId = existingAuthor.id;
        }
       else{
            authorId = await authorModel.create({
            authorKey: cleanAuthorKey,  
            name : author.name
        },
        connection
        );
       }


        await bookAuthorModel.create(
            finalBookId,
            authorId,
            connection
        );
   };




    // adding subjects
   const subjects = Array.isArray(work.subjects) ? work.subjects : [];

    for (const subject of subjects) {

        const normalizedSubject = subject.trim().toLowerCase();

        const existingSubject =
            await subjectModel.findByName(normalizedSubject, connection);

        let subjectId;

        if (existingSubject) {
            subjectId = existingSubject.id;
        } else {
            subjectId = await subjectModel.create(normalizedSubject, connection);
        }

        await bookSubjectsModel.create(finalBookId, subjectId, connection);
    };
    




    // Adding languages
    const languageList = Array.isArray(languages)
        ? languages
        : [];

    for (const language of languageList) {
        const code = language.trim().toLowerCase();

        if (!code) continue;

        const existingLanguage =
            await languageModel.findByCode(code, connection);

        let languageId;

        if (existingLanguage) {
            languageId = existingLanguage.id;
        } else {
            languageId = await languageModel.create(code, connection);
        }

        await bookLanguagesModel.create(
            finalBookId,
            languageId,
            connection
        );
    }

    return {
        status: finalStatus,
        bookId: finalBookId,
        bookTitle: work.title
    };
};

module.exports = {
    importBook,
};