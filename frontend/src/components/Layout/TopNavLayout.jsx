import React from 'react';
import { Link, Outlet, useLocation, useNavigate } from 'react-router-dom';
import { BookOpen, Search, List, LogOut, LayoutDashboard, Library } from 'lucide-react';
import axios from 'axios';
import './TopNavLayout.css';

export default function TopNavLayout() {
  const location = useLocation();
  const navigate = useNavigate();

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

        <button className="nav-logout" onClick={handleLogout} title="Logout">
          <LogOut size={16} />
        </button>
      </nav>

      <main className="main-content">
        <Outlet />
      </main>
    </div>
  );
}
