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


const findAllBooks = async (limit = 20, offset = 0) => {
    const [rows] = await db.query(
        `SELECT 
            b.open_library_work_key AS work_key,
            b.title,
            b.first_publish_year,
            b.cover_id AS cover_i,
            GROUP_CONCAT(DISTINCT a.name SEPARATOR '||') AS author_name,
            GROUP_CONCAT(DISTINCT s.name SEPARATOR '||') AS subject,
            GROUP_CONCAT(DISTINCT l.code SEPARATOR '||') AS language
         FROM books b
         LEFT JOIN book_authors ba ON b.id = ba.book_id
         LEFT JOIN authors a ON ba.author_id = a.id
         LEFT JOIN book_subjects bs ON b.id = bs.book_id
         LEFT JOIN subjects s ON bs.subject_id = s.id
         LEFT JOIN book_languages bl ON b.id = bl.book_id
         LEFT JOIN languages l ON bl.language_id = l.id
         GROUP BY b.id
         ORDER BY b.created_at DESC
         LIMIT ? OFFSET ?`,
        [parseInt(limit), parseInt(offset)]
    );

    const [countRows] = await db.query(
        `SELECT COUNT(*) AS total FROM books`
    );

    const formattedRows = rows.map(row => ({
        key: `/works/${row.work_key}`,
        title: row.title,
        first_publish_year: row.first_publish_year,
        cover_i: row.cover_i,
        author_name: row.author_name
            ? row.author_name.split('||')
            : [],
        subject: row.subject
            ? row.subject.split('||')
            : [],
        language: row.language
            ? row.language.split('||')
            : []
    }));

    return {
        books: formattedRows,
        total: countRows[0].total
    };
};

module.exports = {
    findByOpenLibraryWorkKey,
    create,
    findAllBooks,
};