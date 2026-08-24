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
}

module.exports = {
    create,
    deleteBookSubject
};