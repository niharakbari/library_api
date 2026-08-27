const fs = require('fs');
const file = 'frontend/src/pages/Dashboard.jsx';
let content = fs.readFileSync(file, 'utf8');

// The bad replacement happened at line 94:
//    return (
//    <>
//      {message && (
//        <div style={{ ... }}> ... </div>
//      )}
//      () => {
//        socket.off("library_updated", handleLibraryUpdated);
//      }
//    );
//
// And at the bottom: 
// </div>
//     </>
// );

content = content.replace(/return \(\s*<>\s*\{message && \([\s\S]*?<\/div>\s*\)\}\s*\(\) => \{\s*socket\.off\("library_updated", handleLibraryUpdated\);\s*\}\s*\);/m, 
  'return () => {\n      socket.off("library_updated", handleLibraryUpdated);\n    };');

// Remove the `</>` from the end
content = content.replace(/<\/div>\n    <\/>\s*\}\s*$/m, '</div>\n  );\n}\n');

// Now add the message UI in the CORRECT place: before `return (` of the MAIN component, we don't need <>. We can just place it inside the root `<div className="page-container" ...>`
const mainReturnRegex = /return \(\s*<div className="page-container"/m;
content = content.replace(mainReturnRegex, 
  `return (
    <div className="page-container" style={{ maxWidth: '1200px', margin: '0 auto', position: 'relative' }}>
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
      )}`
);

fs.writeFileSync(file, content, 'utf8');
console.log('Fixed Dashboard.jsx structure');
