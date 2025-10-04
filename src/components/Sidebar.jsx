import React from 'react';
import { Home, BarChart3, Leaf, Upload, Download } from 'lucide-react';

const Sidebar = ({ currentPage, setCurrentPage, exportToCSV, onImportClick, theme, isDarkMode }) => {
  const sidebarStyle = {
    position: 'fixed',
    top: 0,
    left: 0,
    height: '100vh',
    width: 240,
    background: isDarkMode ? '#161616' : '#ffffff',
    borderRight: '1px solid ' + theme.border,
    padding: 16,
    display: 'flex',
    flexDirection: 'column',
    gap: 12
  };

  const brandStyle = {
    fontWeight: 800,
    fontSize: '1.25rem',
    color: theme.accent,
    marginBottom: 16
  };

  const sectionTitle = {
    marginTop: 12,
    marginBottom: 8,
    fontSize: 12,
    letterSpacing: 1,
    color: theme.textMuted,
    textTransform: 'uppercase'
  };

  const itemStyle = (active) => ({
    display: 'flex',
    alignItems: 'center',
    gap: 10,
    padding: '10px 12px',
    borderRadius: 10,
    background: active ? theme.accent : 'transparent',
    color: active ? '#fff' : theme.text,
    border: '1px solid ' + (active ? theme.accent : theme.border),
    cursor: 'pointer',
    transform: 'scale(1)',
    transition: 'all 0.2s ease'
  });

  return (
    <aside style={sidebarStyle}>
      <div style={brandStyle}>HydroMonitor</div>
      <div style={sectionTitle}>Pages</div>
      <button
        onClick={() => setCurrentPage('dashboard')}
        style={itemStyle(currentPage === 'dashboard')}
        onMouseEnter={(e) => {
          e.currentTarget.style.transform = 'scale(1.04)';
          if (! (currentPage === 'dashboard')) {
            e.currentTarget.style.background = isDarkMode ? 'rgba(255,255,255,0.06)' : 'rgba(0,0,0,0.05)';
          }
        }}
        onMouseLeave={(e) => {
          e.currentTarget.style.transform = 'scale(1)';
          if (! (currentPage === 'dashboard')) {
            e.currentTarget.style.background = 'transparent';
          }
        }}
      >
        <Home size={18} /> Dashboard
      </button>
      <button
        onClick={() => setCurrentPage('analytics')}
        style={itemStyle(currentPage === 'analytics')}
        onMouseEnter={(e) => {
          e.currentTarget.style.transform = 'scale(1.04)';
          if (! (currentPage === 'analytics')) {
            e.currentTarget.style.background = isDarkMode ? 'rgba(255,255,255,0.06)' : 'rgba(0,0,0,0.05)';
          }
        }}
        onMouseLeave={(e) => {
          e.currentTarget.style.transform = 'scale(1)';
          if (! (currentPage === 'analytics')) {
            e.currentTarget.style.background = 'transparent';
          }
        }}
      >
        <BarChart3 size={18} /> Analytics
      </button>
      <button
        onClick={() => setCurrentPage('entry')}
        style={itemStyle(currentPage === 'entry')}
        onMouseEnter={(e) => {
          e.currentTarget.style.transform = 'scale(1.04)';
          if (! (currentPage === 'entry')) {
            e.currentTarget.style.background = isDarkMode ? 'rgba(255,255,255,0.06)' : 'rgba(0,0,0,0.05)';
          }
        }}
        onMouseLeave={(e) => {
          e.currentTarget.style.transform = 'scale(1)';
          if (! (currentPage === 'entry')) {
            e.currentTarget.style.background = 'transparent';
          }
        }}
      >
        <Leaf size={18} /> Add Entry
      </button>
      <button
        onClick={() => setCurrentPage('mlModel')}
        style={itemStyle(currentPage === 'mlModel')}
        onMouseEnter={(e) => {
          e.currentTarget.style.transform = 'scale(1.04)';
          if (! (currentPage === 'mlModel')) {
            e.currentTarget.style.background = isDarkMode ? 'rgba(255,255,255,0.06)' : 'rgba(0,0,0,0.05)';
          }
        }}
        onMouseLeave={(e) => {
          e.currentTarget.style.transform = 'scale(1)';
          if (! (currentPage === 'mlModel')) {
            e.currentTarget.style.background = 'transparent';
          }
        }}
      >
        <Leaf size={18} /> ML Model
      </button>

      <div style={sectionTitle}>Data</div>
      <button
        onClick={exportToCSV}
        style={itemStyle(false)}
        onMouseEnter={(e) => {
          e.currentTarget.style.transform = 'scale(1.04)';
          e.currentTarget.style.background = isDarkMode ? 'rgba(255,255,255,0.06)' : 'rgba(0,0,0,0.05)';
        }}
        onMouseLeave={(e) => {
          e.currentTarget.style.transform = 'scale(1)';
          e.currentTarget.style.background = 'transparent';
        }}
      >
        <Download size={18} /> Export CSV
      </button>
      <button
        onClick={onImportClick}
        style={itemStyle(false)}
        onMouseEnter={(e) => {
          e.currentTarget.style.transform = 'scale(1.04)';
          e.currentTarget.style.background = isDarkMode ? 'rgba(255,255,255,0.06)' : 'rgba(0,0,0,0.05)';
        }}
        onMouseLeave={(e) => {
          e.currentTarget.style.transform = 'scale(1)';
          e.currentTarget.style.background = 'transparent';
        }}
      >
        <Upload size={18} /> Import CSV
      </button>

      <div style={{ flex: 1 }} />
      <div style={{ fontSize: 12, color: theme.textMuted }}>Theme adapts to Dark/Light</div>
    </aside>
  );
};

export default Sidebar;


