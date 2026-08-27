const fs = require('fs');
const file = 'frontend/src/pages/MyLibrary.jsx';
let content = fs.readFileSync(file, 'utf8');

const targetString = `<div 
                key={work.key} 
                className="card" 
                onClick={() => navigate(\`/books/\${work.key.replace('/works/', '')}\`)}
                style={{ 
                  display: 'flex', 
                  flexDirection: 'column', 
                  padding: '16px', 
                  gap: '16px',
                  boxShadow: '0 4px 12px rgba(0, 0, 0, 0.02)',
                  cursor: 'pointer'
                }}
              >`;

const replacementString = `<div 
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

if (content.includes(targetString)) {
    content = content.replace(targetString, replacementString);
    fs.writeFileSync(file, content, 'utf8');
    console.log("Card replaced successfully!");
} else {
    console.log("Target string not found precisely! Let's try splitting.");
    
    // Fallback:
    const splitStr = 'className="card" \n                onClick={() => navigate(`/books/${work.key.replace(\'/works/\', \'\')}`)}';
    if (content.includes('cursor: \'pointer\'\n                }}\n              >')) {
        content = content.replace(
            /<div \s*key=\{work\.key\} \s*className="card" \s*onClick=\{\(\) => navigate\(\`\/books\/\$\{work\.key\.replace\('\/works\/', ''\)\}\`\)\}\s*style=\{\{ \s*display: 'flex', \s*flexDirection: 'column', \s*padding: '16px', \s*gap: '16px',\s*boxShadow: '0 4px 12px rgba\(0, 0, 0, 0\.02\)',\s*cursor: 'pointer'\s*\}\}\s*>/m, 
            replacementString
        );
        fs.writeFileSync(file, content, 'utf8');
        console.log("Card replaced via fallback regex.");
    }
}
