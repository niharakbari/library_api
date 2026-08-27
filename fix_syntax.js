const fs = require('fs');
const file = 'backend/src/controllers/bookController.js';
let content = fs.readFileSync(file, 'utf8');

content = content.replace(/\\nmodule\.exports = \{\\n    clearLibrary,/g, '\nmodule.exports = {\n    clearLibrary,');

fs.writeFileSync(file, content, 'utf8');
