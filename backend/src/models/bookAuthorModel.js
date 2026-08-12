const db = require("../config/database");

const create = async (bookId, authorId) => {
    const [result] = await db.query(
        `INSERT INTO book_authors (
            book_id,
            author_id
        )
        VALUES (?, ?)`,
        [bookId, authorId]
    );
    return result;
};

module.exports = {
    create,
};