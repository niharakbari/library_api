const db = require("../config/database");

const create = async (bookId, authorId, connection = db) => {
    const [result] = await connection.query(
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