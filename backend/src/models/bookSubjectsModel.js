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

module.exports = {
    create,
};