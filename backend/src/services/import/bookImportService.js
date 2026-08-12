const openLibraryService = require("../../services/openLibrary/openLibraryService");
const bookModel = require("../../models/bookModel");

const authorModel = require("../../models/authorModel");
const bookAuthorModel = require("../../models/bookAuthorModel");


const importBook = async (workKey) => {
console.log("into import service");

    console.log("before fetching work");
    const work = await openLibraryService.getWork(workKey);

    const cleanWorkKey = work.key.replace("/works/", "");

    console.log("before existingbook");

    const existingBook = await bookModel.findByOpenLibraryWorkKey(cleanWorkKey);

    if (existingBook) {
        return {
            status: "duplicate",
            bookId: existingBook.id,
            bookTitle: existingBook.title
        };
    }

    console.log(`Book importing.....`);

    // Filling books table    
    const bookId = await bookModel.create({
        workKey: cleanWorkKey,
        title: work.title,
        firstPublishYear: work.first_publish_year || null,
        coverEditionKey: work.covers?.[0] || null,
        coverId: work.covers?.[0] || null,
    });
    console.log(`Book with id ${bookId} imported`);

    const existingAuthor = await authorModel.findByOpenLibraryAuthorKey(work.author_key);

    if (existingAuthor) {
        return {
            status: "duplicate author",
            authorKey: existingAuthor.open_library_author_key,
            authorName: existingAuthor.name
        };
    }
    
    const authorId = await authorModel.create({
        authorKey: work.author_key,  
        name : work.author_name
    });
    console.log(`Author of book id ${bookId} imported`);

    await bookAuthorModel.create(
        bookId,
        authorId,
    );


    return {
        status: "imported",
        bookId,
    };
};

module.exports = {
    importBook,
};