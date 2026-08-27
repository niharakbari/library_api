require('dotenv').config();
const db = require('./backend/src/config/database');
async function run() {
  try {
    const [tables] = await db.query("SHOW TABLES");
    console.log("TABLES:");
    for (let row of tables) {
      let tableName = Object.values(row)[0];
      const [indexes] = await db.query(`SHOW INDEX FROM ${tableName}`);
      console.log(`\n--- ${tableName} Indexes ---`);
      indexes.forEach(idx => console.log(`${idx.Key_name} (${idx.Column_name}) - Unique: ${idx.Non_unique === 0}`));
    }
  } catch (e) { console.error(e); } finally { process.exit(); }
}
run();
