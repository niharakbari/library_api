const bookService = require("../services/bookService");

const searchBooks = async (req, res, next) => {
    try {
        const { title, author } = req.query;

        const limit = Number(req.query.limit) || 20;
        const offset = Number(req.query.offset) || 0;

        if (!title && !author) {
            return res.status(400).json({
                success: false,
                message: "Please provide a title or author to search.",
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
            title,
            author,
            limit,
            offset,
        );

        return res.status(200).json({
            success: true,
            data: {
                total: data.numFound,
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


module.exports = {
    searchBooks,
    getBookWork,
    getBookEditions
};