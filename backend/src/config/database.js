const mysql = require("mysql2");
const config = require("./config");
const logger = require("./logger");

const db = mysql.createPool({
    host: config.database.host,
    user: config.database.user,
    password: config.database.password,
    database: config.database.name,
    dateStrings: true,
    connectionLimit: 10
});

db.getConnection((err, connection) => {
    if (err) {
        logger.error("Database Connection Failed");
        logger.error(err.message);
        process.exit(1);
    }

    if (connection) connection.release();


    logger.info("Database Connected Successfully");
});

module.exports = db;