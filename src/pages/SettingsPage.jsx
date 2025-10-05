import React from 'react';

const SettingsPage = ({ styles, theme, isDarkMode }) => {
  const card = { background: isDarkMode ? 'rgba(255,255,255,0.04)' : '#fafafa', borderRadius: 16, padding: 24 };
  const label = { display: 'block', marginBottom: 8, color: theme.text };
  const input = { width: '100%', padding: '8px 12px', borderRadius: 8, border: '1px solid '+theme.border, background: isDarkMode ? '#252525' : '#f7f7f7', color: theme.text };
  return (
    <div style={styles.container}>
      <div style={styles.card}>
        <div style={{ display: 'flex', justifyContent: 'center', marginBottom: 8 }}>
          <h1 style={{ ...styles.pageTitle, textAlign: 'center' }}>Settings</h1>
        </div>
        <div style={{ display: 'grid', gap: 24, gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))' }}>
          <div style={card}>
            <label style={label}>WebSocket URL</label>
            <input style={input} defaultValue="ws://localhost:5000/signals" />
          </div>
          <div style={card}>
            <label style={label}>Buffer Size (points)</label>
            <input type="number" style={input} defaultValue={1800} />
          </div>
          <div style={card}>
            <label style={label}>Smoothing (EMA)</label>
            <input type="number" style={input} defaultValue={0.2} step="0.05" />
          </div>
        </div>
      </div>
    </div>
  );
};

export default SettingsPage;


