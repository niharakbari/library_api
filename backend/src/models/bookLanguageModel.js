const db = require("../config/database");

const create = async (bookId, languageId, connection = db) => {
    await connection.query(
        `INSERT IGNORE INTO book_languages (
            book_id,
            language_id
        )
        VALUES (?, ?)`,
        [bookId, languageId]
    );
};

module.exports = {
    create
};