const db = require("../config/database");

const findByOpenLibraryAuthorKey = async (authorKey) => {
    const [rows] = await db.query(
        `SELECT id
         FROM authors
         WHERE open_library_author_key = ?`,
        [authorKey]
    );

    return rows[0] || null;
};

const create = async ({ authorKey, name }) => {
    console.log("AUTHOR: before INSERT");
    console.log("authorKey:", authorKey);
    console.log("name:", name);
    const [result] = await db.query(
        `INSERT INTO authors (
            open_library_author_key,
            name
        )
        VALUES (?, ?)`,
        [authorKey, name]
    );

    return result.insertId;
};



module.exports = {
    findByOpenLibraryAuthorKey,
    create,
};