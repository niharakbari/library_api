const fs = require('fs');
const file = 'backend/src/routes/bookRoutes.js';
let content = fs.readFileSync(file, 'utf8');

content = content.replace(
  'router.delete("/delete/:id", protect, bookController.deleteBook);',
  'router.delete("/clear", protect, bookController.clearLibrary);\nrouter.delete("/delete/:id", protect, bookController.deleteBook);'
);

fs.writeFileSync(file, content, 'utf8');
console.log('Added /clear route to bookRoutes.js');
