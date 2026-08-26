const openLibraryClient = require("./openLibraryClient");

const searchBooks = async (q, title, author, subject, language, limit=10, offset = 0) => {
    const page = Math.floor(offset / limit) + 1;
    
    // Build query params dynamically to avoid sending undefined values
    const queryParams = { limit, page };
    if (q) queryParams.q = q;
    if (title) queryParams.title = title;
    if (author) queryParams.author = author;
    if (subject) queryParams.subject = subject;
    if (language) queryParams.language = language;
    
    return openLibraryClient.get(`/search.json`, queryParams);
};


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

const getAuthor = async (authorKey) => {
    const cleanAuthorKey = authorKey.replace(/^\/?authors\//, '');
    return openLibraryClient.get(`/authors/${cleanAuthorKey}.json`)
}



module.exports = {
    searchBooks,
    getWork,
    getWorkEditions,
    getAuthor,
    };