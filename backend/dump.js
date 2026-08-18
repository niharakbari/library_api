const mysql = require("mysql2/promise");
require("dotenv").config({ path: "./.env" });

async function dump() {
    const db = await mysql.createConnection({
        host: process.env.DB_HOST,
        user: process.env.DB_USER,
        password: process.env.DB_PASSWORD,
        database: process.env.DB_NAME,
    });
    
    const [tables] = await db.query("SHOW TABLES");
    for (let row of tables) {
        const tableName = Object.values(row)[0];
        const [create] = await db.query(`SHOW CREATE TABLE ${tableName}`);
        console.log(create[0]["Create Table"]);
        console.log("-----------------------");
    }
    
    db.end();
}

dump().catch(console.error);
