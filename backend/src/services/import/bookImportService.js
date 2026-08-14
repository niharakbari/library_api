const openLibraryService = require("../../services/openLibrary/openLibraryService");
const bookModel = require("../../models/bookModel");

const authorModel = require("../../models/authorModel");
const bookAuthorModel = require("../../models/bookAuthorModel");

const subjectModel = require('../../models/subjectModel');
const bookSubjectsModel = require('../../models/bookSubjectsModel');

const languageModel = require("../../models/languageModel");
const bookLanguagesModel = require("../../models/bookLanguageModel");


const importBook = async (workKey, languages = []) => {


    const work = await openLibraryService.getWork(workKey);

    const cleanWorkKey = work.key.replace("/works/", "");


    console.log("WORK KEY RECEIVED BY IMPORT:", JSON.stringify(workKey));

    const existingBook = await bookModel.findByOpenLibraryWorkKey(cleanWorkKey);

    if (existingBook) {
        return {
            status: "duplicate",
            bookId: existingBook.id,
            bookTitle: existingBook.title
        };
    }



    // Filling books table    
    const bookId = await bookModel.create({
        workKey: cleanWorkKey,
        title: work.title,
        firstPublishYear: work.first_publish_year || null,
        coverEditionKey: work.covers?.[0] || null,
        coverId: work.covers?.[0] || null,
    });

    

    // search author details...and adding authors one by one
    const authors = work.authors || [];

    for (const authorEntry of authors) {
       const authorKey = authorEntry.author.key;

       const author = await openLibraryService.getAuthor(authorKey);

       const cleanAuthorKey = author.key.replace(/\/authors\//,'');

       const existingAuthor = await authorModel.findByOpenLibraryAuthorKey(cleanAuthorKey);

       let authorId
       if (existingAuthor){
            authorId = existingAuthor.id;
        }
       else{
            authorId = await authorModel.create({
            authorKey: cleanAuthorKey,  
            name : author.name
        });
       }

       console.log("Author:", author);
       
        console.log(`Author of book id ${bookId} imported`);

        await bookAuthorModel.create(
            bookId,
            authorId,
        );
   };




    // adding subjects
   const subjects = Array.isArray(work.subjects) ? work.subjects : [];

    for (const subject of subjects) {

        const normalizedSubject = subject.trim().toLowerCase();

        const existingSubject =
            await subjectModel.findByName(normalizedSubject);

        let subjectId;

        if (existingSubject) {
            subjectId = existingSubject.id;
        } else {
            subjectId = await subjectModel.create(normalizedSubject);
        }

        await bookSubjectsModel.create(bookId, subjectId);
    };
    




    // Adding languages
    const languageList = Array.isArray(languages)
        ? languages
        : [];

    for (const language of languageList) {
        const code = language.trim().toLowerCase();

        if (!code) continue;

        const existingLanguage =
            await languageModel.findByCode(code);

        let languageId;

        if (existingLanguage) {
            languageId = existingLanguage.id;
        } else {
            languageId = await languageModel.create(code);
        }

        await bookLanguagesModel.create(
            bookId,
            languageId
        );
    }



    return {
        status: "imported",
        bookId,
    };
};

module.exports = {
    importBook,
};