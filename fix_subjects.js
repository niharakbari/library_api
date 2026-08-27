const fs = require('fs');
const file = 'frontend/src/pages/Subjects.jsx';
let content = fs.readFileSync(file, 'utf8');

// Imports
content = content.replace(
  /import \{ Tags, Search, ArrowLeft \} from 'lucide-react';/,
  `import { Tags, Search, ArrowLeft, Download, Loader2, CheckSquare, AlertTriangle } from 'lucide-react';\nimport { downloadCSV } from '../utils/exportUtils';`
);

// State & handlers
content = content.replace(
  /const \[searchQuery, setSearchQuery\] = useState\(""\);/,
  `const [searchQuery, setSearchQuery] = useState("");
  const [exportingAll, setExportingAll] = useState(false);
  const [exportingId, setExportingId] = useState(null);
  const [message, setMessage] = useState(null);
  
  const handleExportAll = () => {
    downloadCSV('/api/export/subjects', 'library_subjects.csv', setExportingAll, setMessage);
  };
  
  const handleExportSubjectBooks = (e, subject) => {
    e.stopPropagation();
    downloadCSV(\`/api/export/books/subject/\${subject.id}\`, \`subject_\${subject.id}_books.csv\`, 
      (isExporting) => setExportingId(isExporting ? subject.id : null), 
      setMessage
    );
  };`
);

// Toast and Header
content = content.replace(
  /<div className="page-container">\s*<div style=\{\{ marginBottom: '24px' \}\}>\s*<button onClick=\{\(\) => navigate\(-1\)\} className="btn-secondary" style=\{\{ display: 'inline-flex', alignItems: 'center', gap: '8px' \}\}>\s*<ArrowLeft size=\{16\} \/> Back\s*<\/button>\s*<\/div>\s*<header className="page-header">\s*<h1 className="page-title">Subjects<\/h1>\s*<p className="page-subtitle">Select a subject to search the Open Library catalog\.<\/p>\s*<\/header>/m,
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
          <h1 className="page-title">Subjects</h1>
          <p className="page-subtitle">Select a subject to search the Open Library catalog.</p>
        </div>
        <button 
          className="btn-secondary" 
          onClick={handleExportAll} 
          disabled={exportingAll}
          style={{ display: 'flex', alignItems: 'center', gap: '8px' }}
        >
          {exportingAll ? <Loader2 size={16} style={{ animation: 'spin 1s linear infinite' }} /> : <Download size={16} />}
          Export Subjects
        </button>
      </header>`
);

// Card export button
content = content.replace(
  /<span style=\{\{ fontWeight: 500, fontSize: '14px', textTransform: 'capitalize', color: 'var\(--text-dark\)' \}\}>\{subject\.name\}<\/span>\s*<\/div>/g,
  `<span style={{ flex: 1, fontWeight: 500, fontSize: '14px', textTransform: 'capitalize', color: 'var(--text-dark)' }}>{subject.name}</span>
                <button 
                  className="btn-secondary" 
                  onClick={(e) => handleExportSubjectBooks(e, subject)}
                  disabled={exportingId === subject.id}
                  title="Export books for this subject"
                  style={{ padding: '4px 6px', display: 'flex', alignItems: 'center', justifyContent: 'center', border: 'none', backgroundColor: 'transparent' }}
                  onMouseOver={e => e.currentTarget.style.color = 'var(--primary)'}
                  onMouseOut={e => e.currentTarget.style.color = ''}
                >
                  {exportingId === subject.id ? <Loader2 size={16} style={{ animation: 'spin 1s linear infinite' }} /> : <Download size={16} />}
                </button>
              </div>`
);

fs.writeFileSync(file, content, 'utf8');
console.log('Fixed Subjects.jsx');
