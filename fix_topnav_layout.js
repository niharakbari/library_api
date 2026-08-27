const fs = require('fs');
const file = 'frontend/src/components/Layout/TopNavLayout.jsx';
let content = fs.readFileSync(file, 'utf8');

const oldDropdownRegex = /<div className="card" style={{[\s\S]*?<\/div>\s*<\/div>\s*\)\}\s*<\/div>/m;

const newDropdown = `<div className="card" style={{
              position: 'absolute', top: '100%', right: '0', marginTop: '12px', padding: '12px 16px', minWidth: '280px',
              display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: '16px', zIndex: 1000, boxShadow: '0 4px 12px rgba(0,0,0,0.15)'
            }}>
              <div style={{ display: 'flex', flexDirection: 'column', minWidth: 0 }}>
                <span style={{ fontSize: '14px', fontWeight: 600, color: 'var(--text-dark)', marginBottom: '4px', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{user.name || user.username || 'Admin'}</span>
                <span style={{ fontSize: '13px', color: 'var(--text-secondary)', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{user.email}</span>
              </div>
              <button 
                onClick={handleLogout} 
                className="btn-secondary" 
                style={{ display: 'flex', alignItems: 'center', gap: '6px', border: 'none', backgroundColor: '#fff0f0', color: 'var(--error)', padding: '6px 12px', flexShrink: 0 }}
                title="Logout"
              >
                <LogOut size={14} /> Logout
              </button>
            </div>
          )}
        </div>`;

content = content.replace(oldDropdownRegex, newDropdown);
fs.writeFileSync(file, content, 'utf8');
console.log('TopNav dropdown layout fixed');
