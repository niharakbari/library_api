const mysql = require("mysql2");
const config = require("./config");
const logger = require("./logger");

const db = mysql
    .createPool({
        host: config.database.host,
        user: config.database.user,
        password: config.database.password,
        database: config.database.name,
        dateStrings: true,
        waitForConnections : true,
        connectionLimit: 10,
        queueLimit: 0,
    })
    .promise();

db.getConnection()
    .then((connection) => {
        logger.info("Database Connected Successfully");
        connection.release();
    })
    .catch((err) => {
        logger.error("Database Connection Failed");
        logger.error(err.message);
        process.exit(1);
    });

module.exports = db;