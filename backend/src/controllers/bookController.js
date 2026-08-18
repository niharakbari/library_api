const bookService = require("../services/bookService");

const languageModel = require('../models/languageModel');
const subjectModel = require('../models/subjectModel');
const authorModel = require('../models/authorModel');




const searchBooks = async (req, res, next) => {
    try {
        const { q, title, author, subject, language } = req.query;

        const limit = Number(req.query.limit) || 20;
        const offset = Number(req.query.offset) || 0;

        if (!q && !title && !author && !subject && !language) {
            return res.status(400).json({
                success: false,
                message: "Please Provide details like general query (q), title, author, subject or language",
            });
        }

        if (limit < 1 || limit > 100) {
            return res.status(400).json({
                success: false,
                message: "Limit must be between 1 and 100.",
            });
        }

        if (offset < 0) {
            return res.status(400).json({
                success: false,
                message: "Offset cannot be negative.",
            });
        }

        const data = await bookService.getBooksFromOpenLibrary(
            q,
            title,
            author,
            subject,
            language,
            limit,
            offset,
        );

        return res.status(200).json({
            success: true,
            data: {
                total: data.num_found,
                limit,
                offset,
                results: data.docs,
            },
        });
    } catch (error) {
        next(error);
    }
};


const getBookWork = async (req, res, next) => {
    try {
        const { workKey } = req.params;

        if (!workKey) {
            return res.status(400).json({
                success: false,
                message: "Work key is required.",
            });
        }

        const data = await bookService.getBookWorkFromOpenLibrary(workKey);

        return res.status(200).json({
            success: true,
            data,
        });
    } catch (error) {
        next(error);
    }
};


const getBookEditions = async (req, res, next) => {
    try {
        const { workKey } = req.params;

        const limit = Number(req.query.limit) || 20;
        const offset = Number(req.query.offset) || 0;

        if (!workKey) {
            return res.status(400).json({
                success: false,
                message: "Work key is required.",
            });
        }

        if (limit < 1 || limit > 100) {
            return res.status(400).json({
                success: false,
                message: "Limit must be between 1 and 100.",
            });
        }

        if (offset < 0) {
            return res.status(400).json({
                success: false,
                message: "Offset cannot be negative.",
            });
        }

        const data = await bookService.getBookEditionsFromOpenLibrary(workKey, limit, offset);


        return res.status(200).json({
            success: true,
            data: {
                total: data.size,
                limit,
                offset,
                results: data.entries,
            },
        });
    } catch (error) {
        next(error);
    }
};


const bookModel = require("../models/bookModel");

const getLocalCatalog = async (req, res, next) => {
    try {
        const { q, title, author, subject, language, year, sort } = req.query;

        const limit = Number(req.query.limit) || 20;
        const offset = Number(req.query.offset) || 0;

        if (limit < 1 || limit > 100) {
            return res.status(400).json({
                success: false,
                message: "Limit must be between 1 and 100.",
            });
        }

        if (offset < 0) {
            return res.status(400).json({
                success: false,
                message: "Offset cannot be negative.",
            });
        }

        const filters = {
            q,
            title,
            author,
            subject,
            language,
            year
        };

        const data = await bookModel.findAllBooks(limit, offset, filters, sort);

        return res.status(200).json({
            success: true,
            data: {
                total: data.total,
                limit,
                offset,
                results: data.books,
            },
        });
    } catch (error) {
        next(error);
    }
};

const getLanguages = async (req, res, next) => {
    try {
        const languages = await languageModel.getAll();
        return res.status(200).json({
            success: true,
            data: languages
        });
    } catch (error) {
        next(error);
    }
};

const getSubjects = async (req, res, next) => {
    try {
        const subjects = await subjectModel.getAll();
        return res.status(200).json({
            success: true,
            data: subjects
        });
    } catch (error) {
        next(error);
    }
};

const getAuthors = async (req, res, next) => {
    try {
        const authors = await authorModel.getAll();
        return res.status(200).json({
            success: true,
            data: authors
        });
    } catch (error) {
        next(error);
    }
};

module.exports = {
    searchBooks,
    getBookWork,
    getBookEditions,
    getLocalCatalog,
    getLanguages,
    getSubjects,
    getAuthors
}