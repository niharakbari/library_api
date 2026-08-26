const db = require("../config/database");

const create = async (bookId, subjectId, connection = db) => {
    const [result] = await connection.query(
        `INSERT IGNORE INTO book_subjects (
            book_id,
            subject_id
        )
        VALUES (?, ? )`,
        [bookId, subjectId]
    );
    return result;
};



const deleteBookSubject = async (bookId, connection = db) => {
    await connection.query(
        `
        DELETE
        FROM book_subjects
        WHERE 
        book_id = ?
        `,
        [bookId] 
    );
};

const subjectWiseBooks = async (limit, connection = db) => {

    const [subjectWiseBookList] = await connection.query (
        `
        SELECT
            s.id AS subject_id,
            s.name AS subject_name,
            COUNT(bs.book_id) AS total_books
        FROM subjects s
        INNER JOIN book_subjects bs
            ON s.id = bs.subject_id
        GROUP BY s.id, s.name
        ORDER BY total_books DESC
        LIMIT ?;   
        `,
        [limit]
    );

    return subjectWiseBookList;

};

module.exports = {
    create,
    deleteBookSubject,
    subjectWiseBooks
};