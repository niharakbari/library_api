const fs = require('fs');
const file = 'frontend/src/pages/MyLibrary.jsx';
let content = fs.readFileSync(file, 'utf8');

// Add Selection state
const stateInsertion = `
  // Selection State
  const [isSelectMode, setIsSelectMode] = useState(false);
  const [selectedBooks, setSelectedBooks] = useState(new Set());
  const [deleteSelectedModalOpen, setDeleteSelectedModalOpen] = useState(false);

  const handleToggleSelectMode = () => {
    setIsSelectMode(!isSelectMode);
    setSelectedBooks(new Set());
  };

  const handleToggleSelectBook = (id) => {
    const newSet = new Set(selectedBooks);
    if (newSet.has(id)) newSet.delete(id);
    else newSet.add(id);
    setSelectedBooks(newSet);
  };

  const handleDeleteSelected = async () => {
    const ids = Array.from(selectedBooks);
    if (!ids.length) return;
    setIsDeleting(true);
    try {
      const response = await axios.delete(\`/api/books/delete/\${ids[0]}\`, {
        data: { bookIds: ids }
      });
      if (response.data.success) {
        setMessage({ type: 'success', text: 'Selected books deleted successfully.' });
        setSelectedBooks(new Set());
        setDeleteSelectedModalOpen(false);
        fetchCatalog(offset);
      }
    } catch (err) {
      setMessage({ type: 'error', text: 'Failed to delete selected books.' });
    } finally {
      setIsDeleting(false);
    }
  };
`;
content = content.replace('  // Delete State', stateInsertion + '\n  // Delete State');

// Replace header buttons
const oldHeaderRegex = /<div style={{ display: 'flex', gap: '12px' }}>[\s\S]*?<\/div>\s*<\/header>/m;
const newHeaderBtns = `<div style={{ display: 'flex', gap: '12px', flexWrap: 'wrap' }}>
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
content = content.replace(oldHeaderRegex, newHeaderBtns);

// Update book card rendering
const cardStartRegex = /<div\s*key=\{book\.id\}\s*className="book-card"\s*>/m;
const newCardStart = `<div 
                key={book.id} 
                className="book-card"
                style={{ 
                  border: isSelectMode && selectedBooks.has(book.id) ? '2px solid var(--primary)' : '1px solid var(--border)',
                  cursor: isSelectMode ? 'pointer' : 'default',
                  position: 'relative'
                }}
                onClick={() => {
                  if (isSelectMode) handleToggleSelectBook(book.id);
                }}
              >
                {isSelectMode && (
                  <div style={{ position: 'absolute', top: 8, left: 8, zIndex: 10 }}>
                    <input 
                      type="checkbox" 
                      checked={selectedBooks.has(book.id)}
                      readOnly
                      style={{ transform: 'scale(1.5)', pointerEvents: 'none' }}
                    />
                  </div>
                )}`;
content = content.replace(cardStartRegex, newCardStart);

// Also we need to disable the normal "Delete" button inside the card if we are in select mode, 
// or let it be but clicking the card triggers selection. We'll leave it as is, or maybe add pointerEvents: isSelectMode ? 'none' : 'auto' to the actions.
// Actually, wrapping actions in a div with pointer-events is cleaner.
const actionOverlayRegex = /<div className="book-card-actions">/m;
content = content.replace(actionOverlayRegex, `<div className="book-card-actions" style={{ pointerEvents: isSelectMode ? 'none' : 'auto' }}>`);

// Add ConfirmModal for deleteSelected
const endRegex = /\{clearModalOpen && \(/m;
const deleteSelectedModal = `
      <ConfirmModal 
        isOpen={deleteSelectedModalOpen}
        title="Delete Selected Books"
        message={\`Are you sure you want to permanently delete \${selectedBooks.size} selected books?\`}
        confirmText="Delete"
        confirmVariant="danger"
        isProcessing={isDeleting}
        onConfirm={handleDeleteSelected}
        onCancel={() => setDeleteSelectedModalOpen(false)}
      />

      {clearModalOpen && (`;
content = content.replace(endRegex, deleteSelectedModal);

fs.writeFileSync(file, content, 'utf8');
console.log('MyLibrary patched successfully');
