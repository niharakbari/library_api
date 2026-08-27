const fs = require('fs');
const file = 'frontend/src/pages/Dashboard.jsx';
let content = fs.readFileSync(file, 'utf8');

if (!content.includes('downloadCSV')) {
  content = content.replace("import socket from '../socket';", "import socket from '../socket';\nimport { downloadCSV } from '../utils/exportUtils';");
  fs.writeFileSync(file, content, 'utf8');
  console.log('Fixed import');
}
