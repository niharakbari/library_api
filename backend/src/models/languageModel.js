const db = require("../config/database");

const findByCode = async (code, connection = db) => {
    const [rows] = await connection.query(
        `SELECT id
         FROM languages
         WHERE code = ?`,
        [code]
    );

    return rows[0] || null;
};

const create = async (code, connection = db) => {
    const [result] = await connection.query(
        `INSERT INTO languages (
            code
        )
        VALUES (?)`,
        [code]
    );

    return result.insertId;
};

const getAll = async () => {
    const [results] = await db.query(`SELECT * FROM languages`);
    return results;
};

module.exports = {
    findByCode,
    create,
    getAll
};