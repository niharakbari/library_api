const openLibraryClient = require("./openLibraryClient");

const searchBooks = async (title, author , limit=10, offset = 0) => {
    console.log("in openlibraryservice.searchbook");
    const page = Math.floor(offset / limit) + 1;
    return openLibraryClient.get(`/search.json`, {
        title,
        author,
        limit,
        page
    })
}


const getWork = async (workKey) => {
    const cleanWorkKey = workKey.replace(/^\/?works\//, '');
    console.log("GET WORK - original:", JSON.stringify(workKey));
    console.log("GET WORK - cleaned:", JSON.stringify(cleanWorkKey));
    return openLibraryClient.get(`/works/${cleanWorkKey}.json`);
};

const getWorkEditions = async (workKey, limit = 50, offset = 0 ) => {
    const cleanWorkKey = workKey.replace(/^\/?works\//, '');
    return openLibraryClient.get(`/works/${cleanWorkKey}/editions.json`, {
        limit,
        offset,
    });
};

const getAuthor = async (authorKey) => {
    const cleanAuthorKey = authorKey.replace(/^\/?authors\//, '');
    return openLibraryClient.get(`/authors/${cleanAuthorKey}.json`)
}


module.exports = {
    searchBooks,
    getWork,
    getWorkEditions,
    getAuthor
};