const fs = require('fs');
const file = 'frontend/src/pages/Authors.jsx';
let content = fs.readFileSync(file, 'utf8');

content = content.replace(
  /const \[searchQuery, setSearchQuery\] = useState\(""\);/,
  `const [searchQuery, setSearchQuery] = useState("");
  const [exportingAll, setExportingAll] = useState(false);
  const [exportingId, setExportingId] = useState(null);
  const [message, setMessage] = useState(null);
  
  const handleExportAll = () => {
    downloadCSV('/api/export/authors', 'library_authors.csv', setExportingAll, setMessage);
  };
  
  const handleExportAuthorBooks = (e, author) => {
    e.stopPropagation();
    downloadCSV(\`/api/export/books/author/\${author.id}\`, \`author_\${author.id}_books.csv\`, 
      (isExporting) => setExportingId(isExporting ? author.id : null), 
      setMessage
    );
  };`
);

fs.writeFileSync(file, content, 'utf8');
console.log('Fixed Authors.jsx state');
