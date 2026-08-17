const db = require("../config/database");

const create = async (
    subject,
    connection = db
) => {
    const [result] = await connection.query (
         `INSERT INTO subjects (
         name           
          )
          VALUES 
          ( ? )`,
          [subject]
    );

    return result.insertId;
    };


const findByName = async (name, connection = db) => {
    const [rows] = await connection.query(
        `SELECT id
         FROM subjects
         WHERE name = ?`,
        [name]
    );

    return rows[0] || null;
};

const getAll = async () => {
    const [results] = await db.query(`SELECT * FROM subjects`);
    return results;
};

module.exports = {
    create,
    findByName,
    getAll
}