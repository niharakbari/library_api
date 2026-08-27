const fs = require('fs');
const file = 'frontend/src/components/Layout/TopNavLayout.jsx';
let content = fs.readFileSync(file, 'utf8');

const stateCode = `
  const [showProfileMenu, setShowProfileMenu] = React.useState(false);
  const menuRef = React.useRef(null);

  React.useEffect(() => {
    const handleClickOutside = (event) => {
      if (menuRef.current && !menuRef.current.contains(event.target)) {
        setShowProfileMenu(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const getInitials = () => {
    if (!user) return 'A';
    const name = user.name || user.username || (user.email ? user.email.split('@')[0] : 'Admin');
    return name.substring(0, 2).toUpperCase();
  };

  const handleLogout = async () => {`;
  
content = content.replace('  const handleLogout = async () => {', stateCode);

const rightSideRegex = /<div style={{ display: 'flex', alignItems: 'center', gap: '16px', marginLeft: 'auto', borderLeft: '1px solid var\(--border\)', paddingLeft: '16px' }}>[\s\S]*?<\/button>\s*<\/div>/m;
const newRightSide = `<div style={{ display: 'flex', alignItems: 'center', marginLeft: 'auto', borderLeft: '1px solid var(--border)', paddingLeft: '16px', position: 'relative' }} ref={menuRef}>
          {user && (
            <button 
              onClick={() => setShowProfileMenu(!showProfileMenu)}
              style={{
                width: '36px', height: '36px', borderRadius: '50%', backgroundColor: 'var(--primary)', color: '#fff', 
                display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 'bold', fontSize: '14px', border: 'none', cursor: 'pointer', padding: 0
              }}
            >
              {getInitials()}
            </button>
          )}
          {showProfileMenu && user && (
            <div className="card" style={{
              position: 'absolute', top: '100%', right: '0', marginTop: '12px', padding: '16px', minWidth: '220px',
              display: 'flex', flexDirection: 'column', gap: '16px', zIndex: 1000, boxShadow: '0 4px 12px rgba(0,0,0,0.15)'
            }}>
              <div style={{ paddingBottom: '12px', borderBottom: '1px solid var(--border)', display: 'flex', flexDirection: 'column' }}>
                <span style={{ fontSize: '14px', fontWeight: 600, color: 'var(--text-dark)', marginBottom: '4px' }}>{user.name || user.username || 'Admin'}</span>
                <span style={{ fontSize: '13px', color: 'var(--text-secondary)' }}>{user.email}</span>
              </div>
              <button 
                onClick={handleLogout} 
                className="btn-secondary" 
                style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px', width: '100%', border: 'none', backgroundColor: '#fff0f0', color: 'var(--error)' }}
              >
                <LogOut size={16} /> Logout
              </button>
            </div>
          )}
        </div>`;
content = content.replace(rightSideRegex, newRightSide);

fs.writeFileSync(file, content, 'utf8');
console.log('TopNavLayout patched successfully');
