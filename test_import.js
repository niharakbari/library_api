require('dotenv').config({ path: 'backend/.env' });
const { importBook } = require('./backend/src/services/import/bookImportService');

async function test() {
  try {
    const res = await importBook('OL15626917W', []);
    console.log(res);
    process.exit(0);
  } catch(e) {
    console.error(e);
    process.exit(1);
  }
}
test();
