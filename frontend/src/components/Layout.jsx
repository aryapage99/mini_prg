import React from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';

const Layout = ({ children }) => {
  const navigate = useNavigate();
  const location = useLocation();
  const user = JSON.parse(localStorage.getItem('developer')) || { name: 'Developer' };

  const handleLogout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('developer');
    navigate('/');
  };

  const navLinkStyle = (path) => ({
    display: 'block',
    padding: '0.875rem 1rem',
    textDecoration: 'none',
    color: location.pathname === path ? '#60a5fa' : '#94a3b8',
    backgroundColor: location.pathname === path ? '#0f172a' : 'transparent',
    borderRadius: '6px',
    marginBottom: '0.5rem',
    fontWeight: location.pathname === path ? '600' : 'normal',
    transition: 'all 0.2s'
  });

  return (
    <div className="layout-wrapper">
      {/* Sidebar using CSS Class */}
      <div className="layout-sidebar">
        <h2 style={{ color: '#3b82f6', marginBottom: '2.5rem', fontSize: '1.5rem', fontWeight: 'bold' }}>CAP Docs AI</h2>
        <nav style={{ flex: 1 }}>
          <Link to="/dashboard" style={navLinkStyle('/dashboard')}>🏠 Welcome</Link>
          <Link to="/query" style={navLinkStyle('/query')}>🔍 Query & Search</Link>
          <Link to="/history" style={navLinkStyle('/history')}>⏱️ History</Link>
        </nav>
      </div>

      {/* Main Content Area */}
      <div style={{ flex: 1, display: 'flex', flexDirection: 'column', overflow: 'hidden' }}>
        {/* Top Header */}
        <header style={{ backgroundColor: '#1e293b', padding: '1.2rem 2rem', borderBottom: '1px solid #334155', display: 'flex', justifyContent: 'flex-end', alignItems: 'center' }}>
          <span style={{ marginRight: '1.5rem', color: '#cbd5e1' }}>Welcome, <strong style={{color: '#f8fafc'}}>{user.name}</strong></span>
          <button onClick={handleLogout} style={{ backgroundColor: '#ef4444', color: 'white', border: 'none', padding: '0.5rem 1.2rem', borderRadius: '6px', cursor: 'pointer', fontWeight: 'bold', fontSize: '0.9rem' }}>
            Logout
          </button>
        </header>

        {/* Dynamic Page Content */}
        <main style={{ flex: 1, padding: '2.5rem', overflowY: 'auto' }}>
          {children}
        </main>
      </div>
    </div>
  );
};

export default Layout;