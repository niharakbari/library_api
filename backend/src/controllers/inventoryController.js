const inventoryModel = require('../models/inventoryModel');
const asyncHandler = require('../utils/asyncHandler');


const searchAuthor = asyncHandler(async (req, res) => {
    const { author } = req.query;

    if (!author) {
        return res.status(400).json({
            success: false,
            message: "Author name is required"
        });
    }

    const data = await inventoryModel.searchAuthorByName(author);

    return res.status(200).json({
        success: true,
        data
    });
});



const searchLanguage = asyncHandler(async (req, res) => {
    const { language } = req.query;

    if (!language) {
        return res.status(400).json({
            success: false,
            message: "Language is required"
        });
    }

    const data = await inventoryModel.searchLanguageByName(language);

    return res.status(200).json({
        success: true,
        data
    });
});


const searchTitle = asyncHandler(async (req, res) => {
    const { title } = req.query;

    if (!title) {
        return res.status(400).json({
            success: false,
            message: "Title is required"
        });
    }

    const data = await inventoryModel.searchTitleByName(title);

    return res.status(200).json({
        success: true,
        data
    });
});


module.exports = {
    searchAuthor,
    searchLanguage,
    searchTitle
    
}