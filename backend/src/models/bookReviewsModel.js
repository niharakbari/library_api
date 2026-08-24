const db = require('../config/database'); 

const getReviewByBookAndUser = async (bookId, userId, connection = db) => {
    const [rows] = await connection.query(
        `SELECT * FROM book_reviews WHERE book_id = ? AND user_id = ?`,
        [bookId, userId]
    );
    return rows[0] || null;
};

const createReview = async (bookId, userId, rating, reviewText, connection = db) => {
    const [result] = await connection.query(
        `INSERT INTO book_reviews (book_id, user_id, rating, review_text) VALUES (?, ?, ?, ?)`,
        [bookId, userId, rating || null, reviewText || null]
    );
    return result;
};

const updateReview = async (bookId, userId, rating, reviewText, connection = db) => {
    const [result] = await connection.query(
        `UPDATE book_reviews SET rating = ?, review_text = ? WHERE book_id = ? AND user_id = ?`,
        [rating || null, reviewText || null, bookId, userId]
    );
    return result;
};

const markBookAsReviewed = async (bookId, connection = db) => {
    await connection.query(
        `UPDATE books SET is_reviewed = TRUE WHERE id = ?`,
        [bookId]
    );
};


const deleteBookReview = async (bookId, connection  = db ) => {
    const [result] = await connection.query(
        `
        DELETE 
        FROM book_reviews
        WHERE book_id = ?
        `,
        [bookId]
    );

    return result;
}

module.exports = {
    getReviewByBookAndUser,
    createReview,
    updateReview,
    markBookAsReviewed,
    deleteBookReview
};