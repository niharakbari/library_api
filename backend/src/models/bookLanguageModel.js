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

const deleteBookLanguage = async (bookId, connection = db) => {
    await connection.query(
        `
        DELETE 
        FROM book_languages
        WHERE
        book_id = ?
        `,
        [bookId]
    )

};

module.exports = {
    create,
    deleteBookLanguage
};