const { get } = require("./openLibraryClient");

const searchBooks = async ({
    title,
    author,
    limit = 20,
    offset = 0,
}) => {
    return get("/search.json", {
        title,
        author,
        limit,
        offset,
    });
};

module.exports = {
    searchBooks,
};