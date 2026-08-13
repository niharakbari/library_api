const db = require("../config/database");

const findByOpenLibraryWorkKey = async (workKey) => {
    const [rows] = await db.query(
        `SELECT id
         FROM books
         WHERE open_library_work_key = ?`,
        [workKey]
    );

    return rows[0] || null;
};

const create = async ({
    workKey,
    title,
    firstPublishYear,
    coverEditionKey,
    coverId,
}) => {
    const [result] = await db.query(
        `INSERT INTO books (
            open_library_work_key,
            title,
            first_publish_year,
            cover_edition_key,
            cover_id
        )
        VALUES (?, ?, ?, ?, ?)`,
        [
            workKey,
            title,
            firstPublishYear,
            coverEditionKey,
            coverId,
        ]
    );

    return result.insertId;
};


module.exports = {
    findByOpenLibraryWorkKey,
    create,
};