const db = require('../config/database');


const getBooksForExport = async (connection = db) => {

    const [rows] = await connection.query(`
        SELECT
            b.id AS book_id,
            b.title AS title,
            b.open_library_work_key AS open_library_work_key,
            b.first_publish_year AS publish_year,
            GROUP_CONCAT(DISTINCT a.name SEPARATOR ' || ') AS authors,
            GROUP_CONCAT(DISTINCT s.name SEPARATOR ' || ') AS subjects,
            GROUP_CONCAT(DISTINCT l.code SEPARATOR ' || ') AS languages,
            b.is_reviewed AS is_reviewed,
            b.created_at AS created_at,
            b.updated_at AS updated_at
        FROM books b
        LEFT JOIN book_authors ba
            ON b.id = ba.book_id
        LEFT JOIN authors a
            ON ba.author_id = a.id
        LEFT JOIN book_subjects bs
            ON b.id = bs.book_id
        LEFT JOIN subjects s
            ON bs.subject_id = s.id
        LEFT JOIN book_languages bl
            ON b.id = bl.book_id
        LEFT JOIN languages l
            ON bl.language_id = l.id
        GROUP BY
            b.id,
            b.title,
            b.open_library_work_key,
            b.first_publish_year,
            b.is_reviewed,
            b.created_at,
            b.updated_at
        ORDER BY b.id;
    `);

    return rows;
};


const getAuthorsForExport = async (connection = db) => {

    const [rows] = await connection.query(`
        SELECT
            a.id AS author_id,
            a.name AS author_name,
            a.open_library_author_key AS open_library_author_key,
            COUNT(DISTINCT ba.book_id) AS total_books,
            a.created_at AS created_at,
            a.updated_at AS updated_at
        FROM authors a
        LEFT JOIN book_authors ba
            ON a.id = ba.author_id
        GROUP BY
            a.id,
            a.name,
            a.open_library_author_key,
            a.created_at,
            a.updated_at
        ORDER BY a.name ASC;
    `);

    return rows;
};


const getSubjectsForExport = async (connection = db) => {

    const [rows] = await connection.query(`
        SELECT
            s.id AS subject_id,
            s.name AS subject_name,
            COUNT(DISTINCT bs.book_id) AS total_books,
            s.created_at AS created_at,
            s.updated_at AS updated_at
        FROM subjects s
        LEFT JOIN book_subjects bs
            ON s.id = bs.subject_id
        GROUP BY
            s.id,
            s.name,
            s.created_at,
            s.updated_at
        ORDER BY s.name ASC;
    `);

    return rows;
};


const getLanguagesForExport = async (connection = db) => {

    const [rows] = await connection.query(`
        SELECT
            l.id AS language_id,
            l.code AS language_code,
            COUNT(DISTINCT bl.book_id) AS total_books
        FROM languages l
        LEFT JOIN book_languages bl
            ON l.id = bl.language_id
        GROUP BY
            l.id,
            l.code
        ORDER BY l.code ASC;
    `);

    return rows;
};


const getBooksByAuthorForExport = async (authorId, connection = db) => {

    const [rows] = await connection.query(`
        SELECT
            b.id AS book_id,
            b.title AS title,
            b.open_library_work_key AS open_library_work_key,
            b.first_publish_year AS publish_year,
            a.id AS author_id,
            a.name AS author_name,
            GROUP_CONCAT(DISTINCT s.name SEPARATOR ' || ') AS subjects,
            GROUP_CONCAT(DISTINCT l.code SEPARATOR ' || ') AS languages,
            b.is_reviewed AS is_reviewed
        FROM books b
        INNER JOIN book_authors ba
            ON b.id = ba.book_id
        INNER JOIN authors a
            ON ba.author_id = a.id
        LEFT JOIN book_subjects bs
            ON b.id = bs.book_id
        LEFT JOIN subjects s
            ON bs.subject_id = s.id
        LEFT JOIN book_languages bl
            ON b.id = bl.book_id
        LEFT JOIN languages l
            ON bl.language_id = l.id
        WHERE a.id = ?
        GROUP BY
            b.id,
            b.title,
            b.open_library_work_key,
            b.first_publish_year,
            a.id,
            a.name,
            b.is_reviewed
        ORDER BY b.title ASC;
    `, [authorId]);

    return rows;
};


const getBooksBySubjectForExport = async (subjectId, connection = db) => {

    const [rows] = await connection.query(`
        SELECT
            b.id AS book_id,
            b.title AS title,
            b.open_library_work_key AS open_library_work_key,
            b.first_publish_year AS publish_year,
            s.id AS subject_id,
            s.name AS subject_name,
            GROUP_CONCAT(DISTINCT a.name SEPARATOR ' || ') AS authors,
            GROUP_CONCAT(DISTINCT l.code SEPARATOR ' || ') AS languages,
            b.is_reviewed AS is_reviewed
        FROM books b
        INNER JOIN book_subjects bs
            ON b.id = bs.book_id
        INNER JOIN subjects s
            ON bs.subject_id = s.id
        LEFT JOIN book_authors ba
            ON b.id = ba.book_id
        LEFT JOIN authors a
            ON ba.author_id = a.id
        LEFT JOIN book_languages bl
            ON b.id = bl.book_id
        LEFT JOIN languages l
            ON bl.language_id = l.id
        WHERE s.id = ?
        GROUP BY
            b.id,
            b.title,
            b.open_library_work_key,
            b.first_publish_year,
            s.id,
            s.name,
            b.is_reviewed
        ORDER BY b.title ASC;
    `, [subjectId]);

    return rows;
};


module.exports = {
    getBooksForExport,
    getAuthorsForExport,
    getSubjectsForExport,
    getLanguagesForExport,
    getBooksByAuthorForExport,
    getBooksBySubjectForExport
};