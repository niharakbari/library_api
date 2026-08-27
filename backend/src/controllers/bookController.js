const bookService = require("../services/bookService");

const languageModel = require('../models/languageModel');
const subjectModel = require('../models/subjectModel');
const authorModel = require('../models/authorModel');
const bookReviewsModel = require('../models/bookReviewsModel');

const inventoryModel = require(`../models/inventoryModel`)
const bookAuthorModel = require('../models/bookAuthorModel');
const bookLanguageModel = require(`../models/bookLanguageModel`);
const bookSubjectsModel = require('../models/bookSubjectsModel');

const db = require(`../config/database`);


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
const { Connection } = require("mysql2");

const getLocalCatalog = async (req, res, next) => {
    try {
        const { q, title, author, subject, language, year, sort, workKey, id } = req.query;

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
            year,
            workKey,
            id
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



const checkExistingWorks = async (req, res, next) => {
    try {

        const { workKeys } = req.body;

        if (!Array.isArray(workKeys) || workKeys.length === 0) {
            return res.status(400).json({
                success: false,
                message: "workKeys must be a non-empty array"
            });
        }

        const existingWork = await inventoryModel.existingWork(workKeys);

        return res.status(200).json({
            success: true,
            data: {
                total_existing_books: existingWork.length,
                existingWork
            }
        });

    } catch (error) {
        next(error);
    }
};


const updateAuthor = async (req, res, next) => {

    try {

        const bookId = req.params.id;

        const {  newAuthor } = req.body;

        if (!bookId || !newAuthor) {
            return res.status(400).json({
                success: false,
                message: "Book id and new author are required"
            });
        }

        let authorId = await authorModel.getIdByName(newAuthor);

        if (!authorId) {

            const authorKey = `manual:${Date.now()}`;

            authorId = await authorModel.create({
                authorKey,
                name: newAuthor
            });

        }

        await inventoryModel.updateBookAuthor(bookId, authorId);

        const io = req.app.get('io');
        if (io) {
            io.emit('library_updated', { reason: 'author_updated' });
        }

        return res.status(200).json({
            success: true,
            message: `Updated author with id ${authorId}`
        });

    } catch (error) {
        next(error);
    }

};

const updatePublishYear = async (req, res, next) => {
    try {
        const bookId = req.params.id;
        const { publishYear } = req.body;

        if (!bookId || !publishYear) {
            return res.status(400).json({
                success: false,
                message: "Book id and new publish year are required"
            });
        }

        await inventoryModel.updatePublishYear(bookId, publishYear);

        const io = req.app.get('io');
        if (io) {
            io.emit('library_updated', { reason: 'year_updated' });
        }

        return res.status(200).json({
            success: true,
            message: ` Publish year of book ${bookId} updated `
        });
    } catch (error) {
        next(error);
    }
};



const getReview = async (req, res, next) => {
    try {
        const { bookId } = req.params;
        const userId = req.user.id;

        const review = await bookReviewsModel.getReviewByBookAndUser(bookId, userId);
        
        return res.status(200).json({
            success: true,
            data: review || null
        });
    } catch (error) {
        next(error);
    }
};

const createReview = async (req, res, next) => {
    try {
        const { bookId } = req.params;
        const userId = req.user.id;
        const { rating, reviewText } = req.body;

        const existing = await bookReviewsModel.getReviewByBookAndUser(bookId, userId);
        if (existing) {
            return res.status(400).json({ success: false, message: "Review already exists for this book." });
        }

        await bookReviewsModel.createReview(bookId, userId, rating, reviewText);
        await bookReviewsModel.markBookAsReviewed(bookId);

        const io = req.app.get('io');
        if (io) {
            io.emit('library_updated', { reason: 'review_created' });
        }

        return res.status(201).json({ success: true, message: "Review created successfully." });
    } catch (error) {
        next(error);
    }
};



const updateReview = async (req, res, next) => {
    try {
        const { bookId } = req.params;
        const userId = req.user.id;
        const { rating, reviewText } = req.body;

        const existing = await bookReviewsModel.getReviewByBookAndUser(bookId, userId);

        if (!existing) {
            return res.status(404).json({ success: false, message: "Review not found." });
        }

        await bookReviewsModel.updateReview(bookId, userId, rating, reviewText);
        await bookReviewsModel.markBookAsReviewed(bookId)

        const io = req.app.get('io');
        if (io) {
            io.emit('library_updated', { reason: 'review_updated' });
        }

        return res.status(200).json({ 
            success: true, 
            message: "Review updated successfully." 
        });

    } catch (error) {
        next(error);
    }
};



// for deleteing book

const deleteBook = async (req, res, next) => {

    const { bookIds } = req.body;

    if (!Array.isArray(bookIds) || bookIds.length === 0) {
        return res.status(400).json({
            success: false,
            message: "Book ids are required"
        });
    };


    
    for (const id of bookIds) {
        
        let connection;

        try {
            connection = await db.getConnection();
            await connection.beginTransaction();


            await bookAuthorModel.deleteBookAuthor(id, connection);
            await bookLanguageModel.deleteBookLanguage(id, connection);
            await bookReviewsModel.deleteBookReview(id, connection);
            await bookSubjectsModel.deleteBookSubject(id, connection);
            await bookModel.deleteBook(id, connection);

            await connection.commit();

            // logger.info(`Book id: ${id} deleted successfully`);

        }catch(err) {

            if (connection) {
                await connection.rollback();
            }

            return next(err);
        } finally {
            if (connection) {
                connection.release();
            };
        };  

    };

    const io = req.app.get('io');
    if (io) {
        io.emit('library_updated', { reason: 'books_deleted' });
    }

    return res.status(200).json({
                success: true,
                message: "Book Deleteded successfully"
            });

};


const clearLibrary = async (req, res, next) => {
    let connection;
    try {
        connection = await db.getConnection();
        
        // Check if library is already empty
        const [countResult] = await connection.query('SELECT COUNT(*) as total FROM books');
        if (countResult[0].total === 0) {
            connection.release();
            return res.status(200).json({
                success: true,
                message: "Library is already empty"
            });
        }

        await connection.beginTransaction();

        // Delete all mappings and reviews (cascade deletes)
        await connection.query('DELETE FROM book_authors');
        await connection.query('DELETE FROM book_languages');
        await connection.query('DELETE FROM book_reviews');
        await connection.query('DELETE FROM book_subjects');
        
        // Finally, delete all books
        await connection.query('DELETE FROM books');

        await connection.commit();

        const io = req.app.get('io');
        if (io) {
            io.emit('library_updated', { reason: 'library_cleared' });
        }

        return res.status(200).json({
            success: true,
            message: "Library cleared successfully"
        });

    } catch (err) {
        if (connection) {
            await connection.rollback();
        }
        return next(err);
    } finally {
        if (connection) {
            connection.release();
        }
    }
};

module.exports = {
    clearLibrary,
    searchBooks,
    getBookWork,
    getBookEditions,
    getLocalCatalog,
    getLanguages,
    getSubjects,
    getAuthors,
    checkExistingWorks,
    updateAuthor,
    updatePublishYear,
    getReview,
    createReview,
    updateReview,
    deleteBook
}