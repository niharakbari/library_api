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

const topLanguages = async (connection = db) => {

    const [topLanguages] = await connection.query (
        `
        SELECT
            l.id AS language_id,
            l.code AS language_code,
            COUNT(bl.book_id) AS total_books
        FROM languages l
        INNER JOIN book_languages bl
            ON l.id = bl.language_id
        GROUP BY l.id, l.code
        ORDER BY total_books DESC;
        `
    );

    return topLanguages;

}

module.exports = {
    create,
    deleteBookLanguage,
    topLanguages
};