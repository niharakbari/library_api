require('dotenv').config({ path: 'backend/.env' });
const db = require('./backend/src/config/database');

async function check() {
  try {
    const [books] = await db.query('SELECT COUNT(*) as c FROM books');
    console.log('Books before:', books[0].c);
    process.exit(0);
  } catch(e) {
    console.log(e);
    process.exit(1);
  }
}
check();
