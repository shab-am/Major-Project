import React from 'react';

const ExperimentsPage = ({ styles, theme, isDarkMode }) => {
  const card = { background: isDarkMode ? 'rgba(255,255,255,0.04)' : '#fafafa', borderRadius: 16, padding: 24 };
  const grid = { display: 'grid', gap: 16 };
  return (
    <div style={styles.container}>
      <div style={styles.card}>
        <div style={{ display: 'flex', justifyContent: 'center', marginBottom: 8 }}>
          <h1 style={{ ...styles.pageTitle, textAlign: 'center' }}>Experiments</h1>
        </div>
        <div style={grid}>
          {[1,2].map((i) => (
            <div key={i} style={card}>
              <div style={{ fontWeight: 'bold', color: theme.text }}>Experiment #{i}: Nutrient Solution Change</div>
              <div style={{ marginTop: 8, color: theme.textMuted }}>Start: 10:00 • End: 12:00 • Target: Reduce stress score</div>
              <div style={{ height: 200, border: '1px dashed ' + theme.border, borderRadius: 8, marginTop: 12 }} />
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default ExperimentsPage;


