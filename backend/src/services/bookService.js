const openLibraryService = require("./openLibrary/openLibraryService");

const getBooksFromOpenLibrary = async (q, title, author, subject, language, limit, offset) => {
    return await openLibraryService.searchBooks(q, title, author, subject, language, limit, offset);
};

const getBookWorkFromOpenLibrary = async (workKey) => {
    return await openLibraryService.getWork(workKey);
}

const getBookEditionsFromOpenLibrary = async (workKey, limit, offset) => {
    return await openLibraryService.getWorkEditions(workKey, limit, offset);
};

module.exports = {
    getBooksFromOpenLibrary,
    getBookWorkFromOpenLibrary,
    getBookEditionsFromOpenLibrary
};