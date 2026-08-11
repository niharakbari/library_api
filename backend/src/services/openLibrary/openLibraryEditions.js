const { get } = require("./openLibraryClient");

const getWorkEditions = async ({
    workKey,
    limit = 20,
    offset = 0,
}) => {
    const cleanWorkKey = workKey
        .replace(/^\/works\//, "")
        .replace(/\.json$/, "");

    return get(`/works/${cleanWorkKey}/editions.json`, {
        limit,
        offset,
    });
};

module.exports = {
    getWorkEditions,
};