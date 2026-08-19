const db = require("../config/database");


const searchAuthorByName = async (authorName) => {
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
        INNER JOIN book_authors ba
            ON b.id = ba.book_id
        INNER JOIN authors a
            ON ba.author_id = a.id
        WHERE a.name LIKE ?
        ORDER BY b.title ASC
        `,
        [`%${authorName}%`]
    );

    return rows;
};


const searchLanguageByName = async (languageName) => {
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
        INNER JOIN book_languages bl
            ON b.id = bl.book_id
        INNER JOIN languages l
            ON bl.language_id = l.id
        WHERE l.code LIKE ?
        ORDER BY b.title ASC
        `,
        [`${languageName}`]
    );

    return rows;
};


const searchTitleByName = async (bookTitle) => {
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
        WHERE b.title LIKE ?
        ORDER BY b.title ASC
        `,
        [`%${bookTitle}%`]
    );

    return rows;
};

const searchSubjectByName = async (subjectName) => {
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
        INNER JOIN book_subjects bs
            ON b.id = bs.book_id
        INNER JOIN subjects s
            ON bs.subject_id = s.id
        WHERE s.name LIKE ?
        ORDER BY b.title ASC
        `,
        [`%${subjectName}%`]
    );

    return rows;

};

const searchByYear = async (year) => {
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
        WHERE b.first_publish_year = ?
        ORDER BY b.title ASC

        `,
        [`${year}`]
    );

    return rows;
};




module.exports = {
    searchAuthorByName,
    searchLanguageByName,
    searchTitleByName,
    searchSubjectByName,
    searchByYear
}