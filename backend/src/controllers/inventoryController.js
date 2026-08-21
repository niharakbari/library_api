const inventoryModel = require('../models/inventoryModel');
const asyncHandler = require('../utils/asyncHandler');

const bookReviewModel = require('../models/bookReviewsModel');

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

const searchSubject = asyncHandler(async (req, res) => {
    const { subject } = req.query;

    if (!subject) {
        return res.status(400).json({
            success: false,
            message: "Subject is required"
        });
    }

    const data = await inventoryModel.searchSubjectByName(subject);

    return res.status(200).json({
        success: true,
        data
    });
});

const addReview = async (req, res, next) => {
    
    const userId = req.user.id;

    const { bookId, reviewText, rating  } = req.body;

    if (!reviewText) {
        return res.status(400).json({
            success: true,
            message: "Some text required"
        });
    };

    if (rating<0 || rating>5) {
        return res.status(400).json({
            success : false,
            message: "Rating must be between 0 and 5"
        });
    };

    await bookReviewModel.addReview(bookId, rating, reviewText);   

}

module.exports = {
    searchAuthor,
    searchLanguage,
    searchTitle,
    searchSubject,
    addReview
}