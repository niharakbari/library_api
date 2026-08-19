const db = require("../config/database");

const checkConditions = {
    authors: `
        NOT EXISTS (
            SELECT 1
            FROM book_authors ba
            WHERE ba.book_id = b.id
        )
    `,

    language: `
        NOT EXISTS (
            SELECT 1
            FROM book_languages bl
            WHERE bl.book_id = b.id
        )
    `,

    subject: `
        NOT EXISTS (
            SELECT 1
            FROM book_subjects bs
            WHERE bs.book_id = b.id
        )
    `,

    publish_year: `
        b.first_publish_year IS NULL
    `
};

const findBooksWithMissingFields = async (checkList) => {

    const conditions = checkList.map(check => checkConditions[check]);

    const whereClause = conditions.join(" AND ");

    const [rows] = await db.query(
        `
        SELECT DISTINCT
            b.id,
            b.open_library_work_key,
            b.title,
            b.first_publish_year,
            b.cover_edition_key,
            b.cover_id
        FROM books b
        WHERE ${whereClause}
        ORDER BY b.title ASC
        `
    );

    return rows;
};

module.exports = {
    findBooksWithMissingFields
};