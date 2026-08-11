const { getEdition } = require("./openLibrary/openLibraryEditions");
const { searchBooks } = require("./openLibrary/openLibrarySearch");
const { getWork } = require("./openLibrary/openLibraryWorks");

const searchBooksFromOpenLibrary = async ({
    title,
    author,
    limit,
    offset,
}) => {
    return await searchBooks({
        title,
        author,
        limit,
        offset,
    });
};

const getWorkFromOpenLibrary = async (workKey) => {
    return getWork(workKey);
}

const getBookEditionsFromOpenLibrary = async ({
    workKey,
    limit,
    offset,
}) => {
    return await getWorkEditions({
        workKey,
        limit,
        offset,
    });
};

module.exports = {
    searchBooksFromOpenLibrary,
    getWorkFromOpenLibrary,
    getBookEditionsFromOpenLibrary
};