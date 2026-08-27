const fs = require('fs');
const file = 'frontend/src/pages/Dashboard.jsx';
let content = fs.readFileSync(file, 'utf8');

if (!content.includes('downloadCSV')) {
  content = content.replace(/import {.*?Lucide-react.*?;/im, 
    "import { downloadCSV } from '../utils/exportUtils';\n$&"
  );
  // Add Download to lucide imports if not there
  if (!content.includes('Download,')) {
    content = content.replace('AlertCircle', 'AlertCircle, Download');
  }
}

const stateRegex = /const \[loading, setLoading\] = useState\(true\);/m;
content = content.replace(stateRegex, 
  `const [loading, setLoading] = useState(true);
  const [downloadMenuOpen, setDownloadMenuOpen] = useState(false);
  const [exportingType, setExportingType] = useState(null);
  const [message, setMessage] = useState(null);
  
  const handleExport = (type, endpoint, filename) => {
    setExportingType(type);
    setDownloadMenuOpen(false);
    downloadCSV(endpoint, filename, () => setExportingType(null), setMessage);
  };
`);

// Add relative positioning to header and replace it
const headerRegex = /<header className="page-header" style={{ marginBottom: '40px' }}>[\s\S]*?<\/header>/m;
const newHeader = `<header className="page-header" style={{ marginBottom: '40px', display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '16px' }}>
        <div>
          <h1 className="page-title" style={{ marginBottom: 0 }}>Welcome, {user.name || 'Admin'}</h1>
          <p className="page-subtitle" style={{ marginTop: '4px', marginBottom: 0 }}>Library Management Overview</p>
        </div>
        
        <div style={{ position: 'relative' }}>
          <button 
            className="btn-secondary" 
            onClick={() => setDownloadMenuOpen(!downloadMenuOpen)}
            style={{ display: 'flex', alignItems: 'center', gap: '8px' }}
          >
            <Download size={16} />
            {exportingType ? \`Exporting \${exportingType}...\` : 'Download Reports'}
          </button>
          
          {downloadMenuOpen && (
            <div className="card" style={{
              position: 'absolute', top: '100%', right: '0', marginTop: '8px', padding: '8px', minWidth: '180px',
              display: 'flex', flexDirection: 'column', gap: '4px', zIndex: 1000, boxShadow: '0 4px 12px rgba(0,0,0,0.1)'
            }}>
              <button className="btn-secondary" style={{ border: 'none', justifyContent: 'flex-start', padding: '8px 12px' }} onClick={() => handleExport('Books', '/api/export/books', 'library_books.csv')}>Books Report</button>
              <button className="btn-secondary" style={{ border: 'none', justifyContent: 'flex-start', padding: '8px 12px' }} onClick={() => handleExport('Authors', '/api/export/authors', 'library_authors.csv')}>Authors Report</button>
              <button className="btn-secondary" style={{ border: 'none', justifyContent: 'flex-start', padding: '8px 12px' }} onClick={() => handleExport('Subjects', '/api/export/subjects', 'library_subjects.csv')}>Subjects Report</button>
              <button className="btn-secondary" style={{ border: 'none', justifyContent: 'flex-start', padding: '8px 12px' }} onClick={() => handleExport('Languages', '/api/export/languages', 'library_languages.csv')}>Languages Report</button>
            </div>
          )}
        </div>
      </header>`;
      
content = content.replace(headerRegex, newHeader);

// Add the Toast/Message UI if it doesn't exist
if (!content.includes('message && (')) {
    content = content.replace('return (', `return (
    <>
      {message && (
        <div style={{
          position: 'fixed', bottom: '24px', right: '24px', zIndex: 9999,
          backgroundColor: message.type === 'error' ? 'var(--error)' : 'var(--success)',
          color: 'white', padding: '16px 24px', borderRadius: '8px', boxShadow: '0 4px 12px rgba(0,0,0,0.15)',
          display: 'flex', alignItems: 'center', gap: '12px'
        }}>
          {message.type === 'error' ? <AlertCircle size={20} /> : <CheckCircle2 size={20} />}
          <span>{message.text}</span>
        </div>
      )}`);
    content = content.replace(/<\/div>\s*$/m, '</div>\n    </>');
}

fs.writeFileSync(file, content, 'utf8');
console.log('Dashboard patched successfully');
