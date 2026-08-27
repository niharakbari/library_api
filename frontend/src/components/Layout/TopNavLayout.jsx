import React from 'react';
import { Link, Outlet, useLocation, useNavigate } from 'react-router-dom';
import { BookOpen, Search, List, LogOut, LayoutDashboard, Library, Database, PieChart } from 'lucide-react';
import axios from 'axios';
import './TopNavLayout.css';

export default function TopNavLayout() {
  const location = useLocation();
  const navigate = useNavigate();

  const [user, setUser] = React.useState(null);

  React.useEffect(() => {
    try {
      const stored = localStorage.getItem('user');
      if (stored) {
        setUser(JSON.parse(stored));
      }
    } catch (e) {
      console.error('Error parsing user from localStorage', e);
    }
  }, []);


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

  const handleLogout = async () => {
    try {
      await axios.post('/auth/logout');
    } catch (e) {
      console.error(e);
    } finally {
      localStorage.removeItem('accessToken');
      localStorage.removeItem('user');
      navigate('/login');
    }
  };

  const navItems = [
    { path: '/dashboard', label: 'Dashboard', icon: LayoutDashboard },
    { path: '/library', label: 'My Library', icon: Library },
    { path: '/search', label: 'Search', icon: Search },
    { path: '/jobs', label: 'Jobs', icon: List },
    { path: '/data-quality', label: 'Data Quality', icon: Database },
    { path: '/reports', label: 'Reports', icon: PieChart },
  ];

  return (
    <div className="app-layout">
      <nav className="floating-nav">
        <div className="nav-brand">
          <BookOpen size={20} color="#E8C547" />
          <span>Library Admin</span>
        </div>
        
        <div className="nav-links">
          {navItems.map((item) => {
            const Icon = item.icon;
            const isActive = location.pathname.startsWith(item.path);
            return (
              <Link 
                key={item.path} 
                to={item.path} 
                className={`nav-link ${isActive ? 'active' : ''}`}
              >
                <Icon size={16} />
                <span>{item.label}</span>
              </Link>
            );
          })}
        </div>

        <div style={{ display: 'flex', alignItems: 'center', marginLeft: 'auto', borderLeft: '1px solid var(--border)', paddingLeft: '16px', position: 'relative' }} ref={menuRef}>
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
        </div></nav>

      <main className="main-content">
        <Outlet />
      </main>
    </div>
  );
}
