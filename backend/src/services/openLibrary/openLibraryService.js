const openLibraryClient = require("./openLibraryClient");

const searchBooks = async (title, author , limit=10, offset = 0) => {
    return openLibraryClient.get(`/search.json`, {
        title,
        author,
        limit,
        offset
    })
}


const getWork = async (workKey) => {
    const cleanWorkKey = workKey.replace(/^\/?works\//, '');
    return openLibraryClient.get(`/works/${cleanWorkKey}.json`);
};

const getWorkEditions = async (workKey, limit = 50, offset = 0 ) => {
    const cleanWorkKey = workKey.replace(/^\/?works\//, '');
    return openLibraryClient.get(`/works/${cleanWorkKey}/editions.json`, {
        limit,
        offset,
    });
};


module.exports = {
    searchBooks,
    getWork,
    getWorkEditions,
};