const db = require("../config/database");

const create = async (
    subject
) => {
    const [result] = await db.query (
         `INSERT INTO subjects (
         name           
          )
          VALUES 
          ( ? )`,
          [subject]
    );

    return result.insertId;
    };


const findByName = async (name) => {
    const [rows] = await db.query(
        `SELECT id
         FROM subjects
         WHERE name = ?`,
        [name]
    );

    return rows[0] || null;
};

module.exports = {
    create,
    findByName
}