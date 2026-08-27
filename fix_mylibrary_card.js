const fs = require('fs');
const file = 'frontend/src/pages/MyLibrary.jsx';
let content = fs.readFileSync(file, 'utf8');

const oldCardRegex = /<div\s*key=\{work\.key\}\s*className="card"\s*onClick=\{\(\) => navigate\([^)]+\)\}\s*style=\{\{([\s\S]*?cursor: 'pointer'\s*)\}\}\s*>/m;

// Add selection logic to the card
const replacement = `<div 
                key={work.key} 
                className="card" 
                onClick={(e) => {
                  if (isSelectMode) {
                    e.preventDefault();
                    e.stopPropagation();
                    handleToggleSelectBook(work.id);
                  } else {
                    navigate(\`/books/\${work.key.replace('/works/', '')}\`);
                  }
                }}
                style={{ 
                  display: 'flex', 
                  flexDirection: 'column', 
                  padding: '16px', 
                  gap: '16px',
                  boxShadow: '0 4px 12px rgba(0, 0, 0, 0.02)',
                  cursor: isSelectMode ? 'default' : 'pointer',
                  border: isSelectMode && selectedBooks.has(work.id) ? '2px solid var(--primary)' : '1px solid var(--border)',
                  position: 'relative'
                }}
              >
                {isSelectMode && (
                  <div style={{ position: 'absolute', top: 16, left: 16, zIndex: 20 }}>
                    <input 
                      type="checkbox" 
                      checked={selectedBooks.has(work.id)}
                      readOnly
                      style={{ transform: 'scale(1.5)', pointerEvents: 'none' }}
                    />
                  </div>
                )}`;

if (oldCardRegex.test(content)) {
    content = content.replace(oldCardRegex, replacement);
    fs.writeFileSync(file, content, 'utf8');
    console.log("Successfully replaced card!");
} else {
    console.log("Regex did not match card!");
}
