const fs = require('fs');
const file = 'frontend/src/pages/MyLibrary.jsx';
let content = fs.readFileSync(file, 'utf8');

// Add new state variables right before handleDeleteBook
const newStates = `
  // Clear Library State
  const [clearModalOpen, setClearModalOpen] = useState(false);
  const [clearInput, setClearInput] = useState('');
  const [isClearing, setIsClearing] = useState(false);

  const handleClearLibrary = async () => {
    if (clearInput !== 'DELETE') return;
    setIsClearing(true);
    try {
      const response = await axios.delete('/api/books/clear');
      if (response.data.success) {
        setResults([]);
        setTotal(0);
        setClearModalOpen(false);
        setClearInput('');
        setMessage({ type: 'success', text: 'Library cleared successfully.' });
        setTimeout(() => setMessage(null), 5000);
      } else {
        setMessage({ type: 'error', text: response.data.message || 'Failed to clear library.' });
        setTimeout(() => setMessage(null), 5000);
      }
    } catch (err) {
      setMessage({ type: 'error', text: err.response?.data?.message || 'Failed to clear library.' });
      setTimeout(() => setMessage(null), 5000);
    } finally {
      setIsClearing(false);
    }
  };

  const handleDeleteBook = async () => {`;
  
content = content.replace('  const handleDeleteBook = async () => {', newStates);

// Update Header to include both buttons
const oldHeaderRegex = /<header className="page-header" style={{ display: 'flex', alignItems: 'flex-end', gap: '12px', marginBottom: '24px' }}>\s*<Library size={32} color="var\(--primary\)" \/>\s*<div>\s*<h1 className="page-title">My Library<\/h1>\s*<p className="page-subtitle">View books imported into your local catalog\.<\/p>\s*<\/div>\s*<\/header>/m;

const newHeader = `<header className="page-header" style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '24px', flexWrap: 'wrap', gap: '16px' }}>
        <div style={{ display: 'flex', alignItems: 'flex-end', gap: '12px' }}>
          <Library size={32} color="var(--primary)" />
          <div>
            <h1 className="page-title" style={{ marginBottom: 0 }}>My Library</h1>
            <p className="page-subtitle" style={{ marginTop: '4px', marginBottom: 0 }}>View books imported into your local catalog.</p>
          </div>
        </div>
        <div style={{ display: 'flex', gap: '12px' }}>
          <button 
            className="btn-secondary" 
            onClick={handleExport} 
            disabled={exporting}
            style={{ display: 'flex', alignItems: 'center', gap: '8px' }}
          >
            {exporting ? <Loader2 size={16} style={{ animation: 'spin 1s linear infinite' }} /> : <Download size={16} />}
            Export Books
          </button>
          <button 
            className="btn-primary" 
            onClick={() => setClearModalOpen(true)} 
            style={{ display: 'flex', alignItems: 'center', gap: '8px', backgroundColor: 'var(--error)', borderColor: 'var(--error)' }}
          >
            <Trash2 size={16} />
            Clear Library
          </button>
        </div>
      </header>`;
      
content = content.replace(oldHeaderRegex, newHeader);

// Add the Clear Library Modal at the end of the return statement, right before final </div>
const modalUI = `
      {clearModalOpen && (
        <div style={{ 
          position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, 
          backgroundColor: 'rgba(0,0,0,0.5)', zIndex: 1000, 
          display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '20px' 
        }}>
          <div className="card" style={{ padding: '32px', width: '100%', maxWidth: '400px', backgroundColor: 'var(--bg)', display: 'flex', flexDirection: 'column' }}>
            <h3 style={{ marginTop: 0, marginBottom: '16px', fontSize: '18px', color: 'var(--error)' }}>Clear Library</h3>
            <p style={{ margin: '0 0 16px 0', fontSize: '15px', color: 'var(--text-secondary)', lineHeight: 1.5 }}>
              This will permanently delete ALL books, authors, languages, and subject mappings. 
              <br/><br/>
              Type <strong>DELETE</strong> below to confirm.
            </p>
            <input 
              type="text" 
              value={clearInput}
              onChange={(e) => setClearInput(e.target.value)}
              placeholder="DELETE"
              style={{ width: '100%', padding: '10px 12px', borderRadius: '8px', border: '1px solid var(--border)', marginBottom: '24px', outline: 'none' }}
            />
            <div style={{ display: 'flex', gap: '12px', justifyContent: 'flex-end' }}>
              <button className="btn-secondary" onClick={() => { setClearModalOpen(false); setClearInput(''); }} disabled={isClearing}>Cancel</button>
              <button 
                className="btn-primary" 
                style={{ backgroundColor: 'var(--error)', borderColor: 'var(--error)' }}
                onClick={handleClearLibrary} 
                disabled={isClearing || clearInput !== 'DELETE'}
              >
                {isClearing ? <Loader2 size={16} style={{ animation: 'spin 1s linear infinite' }} /> : 'Clear All'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
`;

content = content.replace(/    <\/div>\s*\);\s*}\s*$/m, modalUI);

fs.writeFileSync(file, content, 'utf8');
console.log('Fixed MyLibrary.jsx with Clear Library UI');
