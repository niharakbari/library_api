const db = require("../config/database");

const findByCode = async (code) => {
    const [rows] = await db.query(
        `SELECT id
         FROM languages
         WHERE code = ?`,
        [code]
    );

    return rows[0] || null;
};

const create = async (code) => {
    const [result] = await db.query(
        `INSERT INTO languages (
            code
        )
        VALUES (?)`,
        [code]
    );

    return result.insertId;
};

module.exports = {
    findByCode,
    create
};