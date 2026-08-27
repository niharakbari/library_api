const fs = require('fs');
const file = 'frontend/src/pages/Dashboard.jsx';
let content = fs.readFileSync(file, 'utf8');

// The stray ` style={{ maxWidth: '1200px', margin: '0 auto' }}>` needs to be removed
content = content.replace(/ \}\s*style=\{\{ maxWidth: '1200px', margin: '0 auto' \}\}>/g, '');

fs.writeFileSync(file, content, 'utf8');
