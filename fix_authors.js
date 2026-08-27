const fs = require('fs');
const file = 'frontend/src/pages/Authors.jsx';
let content = fs.readFileSync(file, 'utf8');

// Imports
content = content.replace(
  /import { Users, Search, ArrowLeft } from 'lucide-react';/,
  `import { Users, Search, ArrowLeft, Download, Loader2, CheckSquare, AlertTriangle } from 'lucide-react';\nimport { downloadCSV } from '../utils/exportUtils';`
);

// State & handlers
content = content.replace(
  /const \[searchQuery, setSearchQuery\] = useState\(''\);/,
  `const [searchQuery, setSearchQuery] = useState('');
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

// Toast and Header
content = content.replace(
  /<div className="page-container">\s*<div style=\{\{ marginBottom: '24px' \}\}>\s*<button onClick=\{\(\) => navigate\(-1\)\} className="btn-secondary" style=\{\{ display: 'inline-flex', alignItems: 'center', gap: '8px' \}\}>\s*<ArrowLeft size=\{16\} \/> Back\s*<\/button>\s*<\/div>\s*<header className="page-header">\s*<h1 className="page-title">Authors<\/h1>\s*<p className="page-subtitle">Select an author to search the Open Library catalog\.<\/p>\s*<\/header>/m,
  `<div className="page-container">
      {message && (
        <div className={\`toast toast-\${message.type}\`}>
          {message.type === 'success' ? <CheckSquare size={18} /> : <AlertTriangle size={18} />}
          {message.text}
        </div>
      )}
      <div style={{ marginBottom: '24px' }}>
        <button onClick={() => navigate(-1)} className="btn-secondary" style={{ display: 'inline-flex', alignItems: 'center', gap: '8px' }}>
          <ArrowLeft size={16} /> Back
        </button>
      </div>

      <header className="page-header" style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '16px' }}>
        <div>
          <h1 className="page-title">Authors</h1>
          <p className="page-subtitle">Select an author to search the Open Library catalog.</p>
        </div>
        <button 
          className="btn-secondary" 
          onClick={handleExportAll} 
          disabled={exportingAll}
          style={{ display: 'flex', alignItems: 'center', gap: '8px' }}
        >
          {exportingAll ? <Loader2 size={16} style={{ animation: 'spin 1s linear infinite' }} /> : <Download size={16} />}
          Export Authors
        </button>
      </header>`
);

// Card export button
content = content.replace(
  /<div style=\{\{ fontSize: '13px', color: 'var\(--text-secondary\)', marginTop: '2px' \}\}>Key: \{author\.open_library_author_key\}<\/div>\s*<\/div>\s*<\/div>/g,
  `<div style={{ fontSize: '13px', color: 'var(--text-secondary)', marginTop: '2px' }}>Key: {author.open_library_author_key}</div>
                </div>
                <button 
                  className="btn-secondary" 
                  onClick={(e) => handleExportAuthorBooks(e, author)}
                  disabled={exportingId === author.id}
                  title="Export this author's books"
                  style={{ padding: '6px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}
                >
                  {exportingId === author.id ? <Loader2 size={16} style={{ animation: 'spin 1s linear infinite' }} /> : <Download size={16} />}
                </button>
              </div>`
);

fs.writeFileSync(file, content, 'utf8');
console.log('Fixed Authors.jsx');
