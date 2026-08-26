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

const deleteBookAuthor = async (bookId, connection  = db ) => {
    const [result] = await connection.query(
        `
        DELETE 
        FROM book_authors
        WHERE book_id = ?
        `,
        [bookId]
    );

    return result;
}

const topAuthors = async (limit, connection = db) => {

    const [topAuthorslist] = await connection.query (
        `
        SELECT
            a.id AS author_id,
            a.name AS author_name,
            COUNT(ba.book_id) AS total_books
        FROM authors a
        INNER JOIN book_authors ba
            ON a.id = ba.author_id
        GROUP BY a.id, a.name
        ORDER BY total_books DESC
        LIMIT ?;
        `,
        [limit]
    );

    return topAuthorslist;

};

module.exports = {
    create,
    deleteBookAuthor,
    topAuthors
};