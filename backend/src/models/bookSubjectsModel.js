const db = require("../config/database");

const create = async (bookId, subjectId) => {
    const [result] = await db.query(
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