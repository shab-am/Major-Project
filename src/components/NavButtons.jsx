import React from 'react';
import { Home, BarChart3, Leaf, Upload, Download } from 'lucide-react';

const NavButtons = ({ currentPage, setCurrentPage, exportToCSV, onImportClick, theme }) => {
  const baseButton = {
    padding: '12px 24px',
    borderRadius: '12px',
    fontWeight: 600,
    border: 'none',
    cursor: 'pointer',
    transition: 'all 0.3s ease',
    display: 'flex',
    alignItems: 'center',
    gap: '8px'
  };

  const primary = { background: theme.accent, color: 'white' };

  return (
    <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', gap: 16, flexWrap: 'wrap', marginBottom: 32 }}>
      <button onClick={() => setCurrentPage('dashboard')} style={{ ...baseButton, ...(currentPage === 'dashboard' ? primary : primary) }}>
        <Home size={16} />
        Dashboard
      </button>
      <button onClick={() => setCurrentPage('analytics')} style={{ ...baseButton, ...(currentPage === 'analytics' ? primary : primary) }}>
        <BarChart3 size={16} />
        Analytics
      </button>
      <button onClick={() => setCurrentPage('entry')} style={{ ...baseButton, ...(currentPage === 'entry' ? primary : primary) }}>
        <Leaf size={16} />
        Add Entry
      </button>
      <button onClick={exportToCSV} style={{ ...baseButton, ...primary }}>
        <Download size={16} />
        Export CSV
      </button>
      <button onClick={onImportClick} style={{ ...baseButton, ...primary }}>
        <Upload size={16} />
        Import CSV
      </button>
      <button onClick={() => setCurrentPage('mlModel')} style={{ ...baseButton, ...primary }}>
        <Leaf size={16} />
        ML Model
      </button>
    </div>
  );
};

export default NavButtons;


