const openLibraryService = require("../services/openLibrary/openLibraryService");

const test = async () => {
    const work = await openLibraryService.getWork("OL19669049W");

    console.log(work);
};

test().catch(console.error);