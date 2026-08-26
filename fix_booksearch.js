const fs = require('fs');
const file = 'frontend/src/pages/BookSearch.jsx';
let content = fs.readFileSync(file, 'utf8');

// 1. Replace the API call in executeLocalSearch
content = content.replace(
  /const response = await axios\.get\(`\/inventory\/search\/\$\{typeToUse\}`,\s*\{\s*params:\s*\{\s*\[typeToUse\]:\s*queryToUse\s*\}\s*\}\);([\s\S]*?)setResults\(formattedResults\);/m,
  `const response = await axios.get('/api/books/catalog', {
        params: { [typeToUse]: queryToUse, limit: 100 }
      });
      if (response.data.success) {
        setResults(response.data.data.results || []);`
);

// 2. Add 'year' option to select
content = content.replace(
  '<option value="subject">Subject</option>',
  '<option value="subject">Subject</option>\n              <option value="year">Publish Year</option>'
);

fs.writeFileSync(file, content, 'utf8');
console.log('Fixed BookSearch.jsx');
