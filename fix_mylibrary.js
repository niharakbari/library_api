const fs = require('fs');
const file = 'frontend/src/pages/MyLibrary.jsx';
let content = fs.readFileSync(file, 'utf8');

if (!content.includes('downloadCSV')) {
  content = content.replace(
    /import axios from 'axios';/,
    `import axios from 'axios';\nimport { downloadCSV } from '../utils/exportUtils';`
  );
}

if (!content.includes('const [exporting, setExporting]')) {
  content = content.replace(
    /const \[sort, setSort\] = useState\('recently_added'\);/,
    `const [sort, setSort] = useState('recently_added');\n  const [exporting, setExporting] = useState(false);`
  );
}

content = content.replace(
  /<header className="page-header" style={{ display: 'flex', alignItems: 'flex-end', gap: '12px', marginBottom: '24px' }}>\s*<Library size={32} color="var\(--primary\)" \/>\s*<div>\s*<h1 className="page-title">My Library<\/h1>\s*<p className="page-subtitle">View books imported into your local catalog\.<\/p>\s*<\/div>\s*<\/header>/m,
  `<header className="page-header" style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '24px' }}>
        <div style={{ display: 'flex', alignItems: 'flex-end', gap: '12px' }}>
          <Library size={32} color="var(--primary)" />
          <div>
            <h1 className="page-title" style={{ marginBottom: 0 }}>My Library</h1>
            <p className="page-subtitle" style={{ marginTop: '4px', marginBottom: 0 }}>View books imported into your local catalog.</p>
          </div>
        </div>
        <button 
          className="btn-secondary" 
          onClick={handleExport} 
          disabled={exporting}
          style={{ display: 'flex', alignItems: 'center', gap: '8px' }}
        >
          {exporting ? <Loader2 size={16} style={{ animation: 'spin 1s linear infinite' }} /> : <Download size={16} />}
          Export Books
        </button>
      </header>`
);

fs.writeFileSync(file, content, 'utf8');
console.log('Fixed MyLibrary');
