const fs = require('fs');
const file = 'frontend/src/pages/MyLibrary.jsx';
let content = fs.readFileSync(file, 'utf8');

const oldHeaderRegex = /<header className="page-header"[\s\S]*?<\/header>/m;

const newHeader = `<header className="page-header" style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '24px', flexWrap: 'wrap', gap: '16px' }}>
        <div style={{ display: 'flex', alignItems: 'flex-end', gap: '12px' }}>
          <Library size={32} color="var(--primary)" />
          <div>
            <h1 className="page-title" style={{ marginBottom: 0 }}>My Library</h1>
            <p className="page-subtitle" style={{ marginTop: '4px', marginBottom: 0 }}>View books imported into your local catalog.</p>
          </div>
        </div>
        <div style={{ display: 'flex', gap: '12px', flexWrap: 'wrap' }}>
          <button 
            className="btn-secondary" 
            onClick={handleExport} 
            disabled={exporting}
            style={{ display: 'flex', alignItems: 'center', gap: '8px' }}
          >
            {exporting ? <Loader2 size={16} style={{ animation: 'spin 1s linear infinite' }} /> : <Download size={16} />}
            Export
          </button>
          
          <button 
            className={isSelectMode ? "btn-primary" : "btn-secondary"} 
            onClick={handleToggleSelectMode}
          >
            {isSelectMode ? 'Cancel Selection' : 'Select'}
          </button>
          
          {isSelectMode && selectedBooks.size > 0 && (
             <button 
               className="btn-primary" 
               onClick={() => setDeleteSelectedModalOpen(true)} 
               style={{ backgroundColor: 'var(--error)', borderColor: 'var(--error)' }}
             >
               Delete Selected ({selectedBooks.size})
             </button>
          )}

          {isSelectMode && (
             <button 
               className="btn-secondary" 
               onClick={() => setClearModalOpen(true)} 
               style={{ color: 'var(--error)', borderColor: 'var(--error)' }}
             >
               Delete All
             </button>
          )}
        </div>
      </header>`;

if (oldHeaderRegex.test(content)) {
    content = content.replace(oldHeaderRegex, newHeader);
    fs.writeFileSync(file, content, 'utf8');
    console.log("Successfully replaced header!");
} else {
    console.log("Regex did not match header!");
}
