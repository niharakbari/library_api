const db = require("../config/database");

const create = async (bookId, languageId) => {
    await db.query(
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