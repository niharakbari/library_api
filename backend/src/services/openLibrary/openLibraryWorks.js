const { get } = require("./openLibraryClient");

const getWork = async (workKey) => {
    const cleanWorkKey = workKey.replace(/^\/works\//, "");

    return get(`/works/${cleanWorkKey}.json`);
};

module.exports = {
    getWork,
};