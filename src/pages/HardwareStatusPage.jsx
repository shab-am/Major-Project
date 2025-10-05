import React from 'react';

const HardwareStatusPage = ({ styles, theme, isDarkMode }) => {
  const card = { background: isDarkMode ? 'rgba(255,255,255,0.04)' : '#fafafa', borderRadius: 16, padding: 24 };
  const grid = { display: 'grid', gap: 24, gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))' };
  return (
    <div style={styles.container}>
      <div style={styles.card}>
        <div style={{ display: 'flex', justifyContent: 'center', marginBottom: 8 }}>
          <h1 style={{ ...styles.pageTitle, textAlign: 'center' }}>Hardware Status</h1>
        </div>
        <div style={grid}>
          {[1,2,3,4].map((i) => (
            <div key={i} style={card}>
              <div style={{ fontWeight: 'bold', color: theme.text }}>Sensor Channel {i}</div>
              <div style={{ marginTop: 8, color: theme.textMuted }}>Status: Online • Sample Rate: 200 Hz • Noise: Low</div>
              <div style={{ marginTop: 12, display: 'flex', gap: 8 }}>
                <button style={{ padding: '8px 12px', borderRadius: 8, border: 'none', background: theme.accent, color: '#fff' }}>Calibrate</button>
                <button style={{ padding: '8px 12px', borderRadius: 8, border: '1px solid '+theme.border, background: 'transparent', color: theme.text }}>Details</button>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default HardwareStatusPage;


