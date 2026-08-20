const db = require("../config/database");

const findByOpenLibraryAuthorKey = async (authorKey, connection = db) => {
    const [rows] = await connection.query(
        `SELECT id
         FROM authors
         WHERE open_library_author_key = ?`,
        [authorKey]
    );

    return rows[0] || null;
};



const create = async ({ authorKey, name }, connection = db) => {
    console.log("AUTHOR: before INSERT");
    console.log("authorKey:", authorKey);
    console.log("name:", name);
    const [result] = await connection.query(
        `INSERT INTO authors (
            open_library_author_key,
            name
        )
        VALUES (?, ?)`,
        [authorKey, name]
    );

    return result.insertId;
};

const getAll = async () => {
    const [results] = await db.query(
        `SELECT * FROM authors` 
    );

    return results;
}

const getIdByName = async (authorName, connection = db ) => {

    const [rows] = await connection.query(
        `
        SELECT id
        FROM authors
        WHERE name = ?
        `,
        [authorName]
    );

    return rows[0]?.id || null;

};



module.exports = {
    findByOpenLibraryAuthorKey,
    create,
    getAll,
    getIdByName
};