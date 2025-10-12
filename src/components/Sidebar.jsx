import React from 'react';
import { Home, BarChart3, Leaf, Upload, Download } from 'lucide-react';
import './Sidebar.css';

const Sidebar = ({ currentPage, setCurrentPage, exportToCSV, onImportClick, theme, isDarkMode }) => {
  const sidebarStyle = {
    position: 'fixed',
    top: 0,
    left: 0,
    height: '100vh',
    width: 240,
    background: theme.bg,
    borderRight: '1px solid ' + theme.border,
    padding: 12,
    display: 'flex',
    flexDirection: 'column',
    gap: 8,
    overflowY: 'auto',
    scrollbarWidth: 'thin',
    scrollbarColor: `${theme.accent}40 ${theme.bg}`
  };

  const brandStyle = {
    fontWeight: 800,
    fontSize: '1.1rem',
    color: theme.accent,
    marginBottom: 8
  };

  // section title removed per request

  const itemStyle = (active) => ({
    display: 'flex',
    alignItems: 'center',
    gap: 10,
    padding: '10px 12px',
    borderRadius: 12,
    background: active ? `${theme.accent}30` : 'transparent',
    color: active ? theme.textMuted : theme.text,
    border: '1px solid ' + (active ? `${theme.accent}50` : 'transparent'),
    cursor: 'pointer',
    transform: 'scale(1)',
    transition: 'all 0.2s ease'
  });

  return (
    <aside 
      className="sidebar-container"
      style={{
        ...sidebarStyle,
        '--sidebar-bg': theme.bg,
        '--accent-color': `${theme.accent}40`,
        '--accent-color-hover': `${theme.accent}60`
      }}
    >
      <div style={brandStyle}>HydroMonitor</div>
      {/* Removed "Pages" label to tighten spacing */}
      <button
        onClick={() => setCurrentPage('dashboard')}
        style={itemStyle(currentPage === 'dashboard')}
        onMouseEnter={(e) => {
          e.currentTarget.style.transform = 'scale(1.04)';
          if (! (currentPage === 'dashboard')) {
            e.currentTarget.style.background = `${theme.accent}20`;
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
        onClick={() => setCurrentPage('biosignals')}
        style={itemStyle(currentPage === 'biosignals')}
        onMouseEnter={(e) => {
          e.currentTarget.style.transform = 'scale(1.04)';
          if (! (currentPage === 'biosignals')) {
            e.currentTarget.style.background = `${theme.accent}20`;
          }
        }}
        onMouseLeave={(e) => {
          e.currentTarget.style.transform = 'scale(1)';
          if (! (currentPage === 'biosignals')) {
            e.currentTarget.style.background = 'transparent';
          }
        }}
      >
        <BarChart3 size={18} /> Bio-Signals
      </button>
      <button
        onClick={() => setCurrentPage('analytics')}
        style={itemStyle(currentPage === 'analytics')}
        onMouseEnter={(e) => {
          e.currentTarget.style.transform = 'scale(1.04)';
          if (! (currentPage === 'analytics')) {
            e.currentTarget.style.background = `${theme.accent}20`;
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
            e.currentTarget.style.background = `${theme.accent}20`;
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
            e.currentTarget.style.background = `${theme.accent}20`;
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

      <button
        onClick={() => setCurrentPage('stress')}
        style={itemStyle(currentPage === 'stress')}
        onMouseEnter={(e) => {
          e.currentTarget.style.transform = 'scale(1.04)';
          if (! (currentPage === 'stress')) {
            e.currentTarget.style.background = `${theme.accent}20`;
          }
        }}
        onMouseLeave={(e) => {
          e.currentTarget.style.transform = 'scale(1)';
          if (! (currentPage === 'stress')) {
            e.currentTarget.style.background = 'transparent';
          }
        }}
      >
        <BarChart3 size={18} /> Stress Insights
      </button>
      <button
        onClick={() => setCurrentPage('reco')}
        style={itemStyle(currentPage === 'reco')}
        onMouseEnter={(e) => {
          e.currentTarget.style.transform = 'scale(1.04)';
          if (! (currentPage === 'reco')) {
            e.currentTarget.style.background = `${theme.accent}20`;
          }
        }}
        onMouseLeave={(e) => {
          e.currentTarget.style.transform = 'scale(1)';
          if (! (currentPage === 'reco')) {
            e.currentTarget.style.background = 'transparent';
          }
        }}
      >
        <BarChart3 size={18} /> Recommendations
      </button>
      <button
        onClick={() => setCurrentPage('hardware')}
        style={itemStyle(currentPage === 'hardware')}
        onMouseEnter={(e) => {
          e.currentTarget.style.transform = 'scale(1.04)';
          if (! (currentPage === 'hardware')) {
            e.currentTarget.style.background = `${theme.accent}20`;
          }
        }}
        onMouseLeave={(e) => {
          e.currentTarget.style.transform = 'scale(1)';
          if (! (currentPage === 'hardware')) {
            e.currentTarget.style.background = 'transparent';
          }
        }}
      >
        <BarChart3 size={18} /> Hardware Status
      </button>
      <button
        onClick={() => setCurrentPage('experiments')}
        style={itemStyle(currentPage === 'experiments')}
        onMouseEnter={(e) => {
          e.currentTarget.style.transform = 'scale(1.04)';
          if (! (currentPage === 'experiments')) {
            e.currentTarget.style.background = `${theme.accent}20`;
          }
        }}
        onMouseLeave={(e) => {
          e.currentTarget.style.transform = 'scale(1)';
          if (! (currentPage === 'experiments')) {
            e.currentTarget.style.background = 'transparent';
          }
        }}
      >
        <BarChart3 size={18} /> Experiments
      </button>
      <button
        onClick={() => setCurrentPage('settings')}
        style={itemStyle(currentPage === 'settings')}
        onMouseEnter={(e) => {
          e.currentTarget.style.transform = 'scale(1.04)';
          if (! (currentPage === 'settings')) {
            e.currentTarget.style.background = `${theme.accent}20`;
          }
        }}
        onMouseLeave={(e) => {
          e.currentTarget.style.transform = 'scale(1)';
          if (! (currentPage === 'settings')) {
            e.currentTarget.style.background = 'transparent';
          }
        }}
      >
        <BarChart3 size={18} /> Settings
      </button>
      {/* Removed section title "Data" to reduce spacing */}
      <button
        onClick={exportToCSV}
        style={itemStyle(false)}
        onMouseEnter={(e) => {
          e.currentTarget.style.transform = 'scale(1.04)';
          e.currentTarget.style.background = isDarkMode ? 'rgba(125, 211, 252, 0.08)' : 'rgba(2, 132, 199, 0.08)';
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
          e.currentTarget.style.background = isDarkMode ? 'rgba(125, 211, 252, 0.08)' : 'rgba(2, 132, 199, 0.08)';
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


