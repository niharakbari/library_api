const db = require("../config/database");

const findByOpenLibraryWorkKey = async (workKey, connection = db) => {
    const [rows] = await connection.query(
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
},  connection = db) => {
    const [result] = await connection.query(
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


const findAllBooks = async (limit = 20, offset = 0, filters = {}, sort = 'recently_added') => {
    let baseQuery = `
         FROM books b
         LEFT JOIN book_authors ba ON b.id = ba.book_id
         LEFT JOIN authors a ON ba.author_id = a.id
         LEFT JOIN book_subjects bs ON b.id = bs.book_id
         LEFT JOIN subjects s ON bs.subject_id = s.id
         LEFT JOIN book_languages bl ON b.id = bl.book_id
         LEFT JOIN languages l ON bl.language_id = l.id
    `;

    const whereConditions = [];
    const queryParams = [];

    // whereConditions( ex : title=percy )         and          queryparams (ex limit, offset)
    if (filters.q) {
        whereConditions.push(`(b.title LIKE ? OR a.name LIKE ? OR s.name LIKE ?)`);
        const qParam = `%${filters.q}%`;
        queryParams.push(qParam, qParam, qParam);
    }
    if (filters.title) {
        whereConditions.push(`b.title LIKE ?`);
        queryParams.push(`%${filters.title}%`);
    }
    if (filters.author) {
        whereConditions.push(`a.name LIKE ?`);
        queryParams.push(`%${filters.author}%`);
    }
    if (filters.subject) {
        whereConditions.push(`s.name LIKE ?`);
        queryParams.push(`%${filters.subject}%`);
    }
    if (filters.language) {
        whereConditions.push(`l.code = ?`);
        queryParams.push(filters.language);
    }
    if (filters.year) {
        whereConditions.push(`b.first_publish_year = ?`);
        queryParams.push(filters.year);
    }
    if (filters.workKey) {
        whereConditions.push(`b.open_library_work_key = ?`);
        queryParams.push(filters.workKey);
    }
    if (filters.id) {
        whereConditions.push(`b.id = ?`);
        queryParams.push(filters.id);
    }

    const whereClause = whereConditions.length > 0 ? ` WHERE ${whereConditions.join(' AND ')}` : '';

    // Sorting
    let orderByClause = 'ORDER BY b.created_at DESC';
    switch (sort) {
        case 'title_asc':
            orderByClause = 'ORDER BY b.title ASC';
            break;
        case 'title_desc':
            orderByClause = 'ORDER BY b.title DESC';
            break;
        case 'year_newest':
            orderByClause = 'ORDER BY b.first_publish_year DESC, b.id DESC';
            break;
        case 'year_oldest':
            orderByClause = 'ORDER BY b.first_publish_year ASC, b.id ASC';
            break;
        case 'recently_added':
        default:
            orderByClause = 'ORDER BY b.created_at DESC';
            break;
    }

    // Since we are filtering on joined tables and using GROUP BY, 
    // we should apply WHERE before GROUP BY
    const fullQuery = `
        SELECT 
            b.id,
            b.open_library_work_key AS work_key,
            b.title,
            b.first_publish_year,
            b.cover_id AS cover_i,
            b.is_reviewed,
            GROUP_CONCAT(DISTINCT a.name SEPARATOR '||') AS author_name,
            GROUP_CONCAT(DISTINCT s.name SEPARATOR '||') AS subject,
            GROUP_CONCAT(DISTINCT l.code SEPARATOR '||') AS language
        ${baseQuery}
        ${whereClause}
        GROUP BY b.id
        ${orderByClause}
        LIMIT ? OFFSET ?
    `;

    // Add pagination params
    const fullQueryParams = [...queryParams, parseInt(limit), parseInt(offset)];

    const [rows] = await db.query(fullQuery, fullQueryParams);

    // Count query
    // To correctly count filtered results with JOINs, we need to COUNT(DISTINCT b.id)
    const countQuery = `
        SELECT COUNT(DISTINCT b.id) AS total
        ${baseQuery}
        ${whereClause}
    `;

    const [countRows] = await db.query(countQuery, queryParams);

    const formattedRows = rows.map(row => ({
        id: row.id,
        key: `/works/${row.work_key}`,
        title: row.title,
        first_publish_year: row.first_publish_year,
        cover_i: row.cover_i,
        is_reviewed: !!row.is_reviewed,
        author_name: row.author_name ? row.author_name.split('||') : [],
        subject: row.subject ? row.subject.split('||') : [],
        language: row.language ? row.language.split('||') : []
    }));

    return {
        books: formattedRows,
        total: countRows[0].total
    };
};

const update = async (id, {
    title,
    firstPublishYear,
    coverEditionKey,
    coverId,
}, connection = db) => {
    await connection.query(
        `UPDATE books SET
            title = ?,
            first_publish_year = ?,
            cover_edition_key = ?,
            cover_id = ?
         WHERE id = ?`,
        [title, firstPublishYear, coverEditionKey, coverId, id]
    );
};

const deleteBook = async (bookId, connection = db) => {
    await connection.query(
        `
        DELETE
        FROM books
        WHERE 
        id = ?
        `,
        [bookId] 
    );
};


const booksByYear = async  ( connection = db ) => {
    const [bookListByYear] = await connection.query(
        `
        SELECT
            first_publish_year AS publish_year,
            COUNT(id) AS total_books
        FROM books
        WHERE first_publish_year IS NOT NULL
        GROUP BY first_publish_year
        ORDER BY publish_year ASC;
        `,
    );
    return bookListByYear;
};

module.exports = {
    findByOpenLibraryWorkKey,
    create,
    findAllBooks,
    update,
    deleteBook,
    booksByYear
};