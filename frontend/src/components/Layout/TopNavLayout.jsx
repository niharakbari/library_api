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

        <div style={{ display: 'flex', alignItems: 'center', gap: '16px', marginLeft: 'auto', borderLeft: '1px solid var(--border)', paddingLeft: '16px' }}>
          {user && (
            <div className="nav-user-profile" style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-end', justifyContent: 'center' }}>
              <span style={{ fontSize: '13px', fontWeight: 600, color: 'var(--text-dark)', lineHeight: 1.2 }}>
                {user.name || user.username || (user.email ? user.email.split('@')[0] : 'Admin')}
              </span>
              <span style={{ fontSize: '11px', color: 'var(--text-secondary)' }}>{user.email}</span>
            </div>
          )}
          <button className="nav-logout" onClick={handleLogout} title="Logout">
            <LogOut size={16} />
          </button>
        </div>
      </nav>

      <main className="main-content">
        <Outlet />
      </main>
    </div>
  );
}
