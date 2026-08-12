const mysql = require("mysql2");
const config = require("./config");
const logger = require("./logger");

const db = mysql
    .createConnection({
        host: config.database.host,
        user: config.database.user,
        password: config.database.password,
        database: config.database.name,
        dateStrings: true,
    })
    .promise();

db.connect()
    .then(() => {
        logger.info("Database Connected Successfully");
    })
    .catch((err) => {
        logger.error("Database Connection Failed");
        logger.error(err.message);
        process.exit(1);
    });

module.exports = db;