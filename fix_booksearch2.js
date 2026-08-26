const fs = require('fs');
const file = 'frontend/src/pages/BookSearch.jsx';
let content = fs.readFileSync(file, 'utf8');

content = content.replace(
  /setResults\(response\.data\.data\.results \|\| \[\]\);\s*setTotal\(formattedResults\.length\);\s*setOffset\(0\);\s*\}/m,
  `const fetchedResults = response.data.data.results || [];
        setResults(fetchedResults);
        setTotal(fetchedResults.length);
        setOffset(0);
        if (fetchedResults.length === 0) {
          setMessage({ type: 'error', text: 'No local records found.' });
        }
      } else {
        setMessage({ type: 'error', text: 'Failed to search Local Library.' });
      }`
);

fs.writeFileSync(file, content, 'utf8');
console.log('Fixed BookSearch.jsx again');
