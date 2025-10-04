import React from 'react';

const RecentEntriesTable = ({ plantData, theme }) => {
  const styles = {
    table: {
      width: '100%',
      borderCollapse: 'collapse',
      color: theme.text
    },
    th: {
      textAlign: 'left',
      padding: '12px 16px',
      borderBottom: '1px solid ' + theme.border,
      fontWeight: 600
    },
    td: {
      padding: '12px 16px',
      borderBottom: '1px solid ' + theme.border
    }
  };

  if (!plantData || plantData.length === 0) return null;

  return (
    <div style={{ marginTop: '32px', background: theme.card, border: '1px solid ' + theme.border, borderRadius: 16, padding: 24 }}>
      <h2 style={{ fontSize: '1.5rem', fontWeight: 'bold', color: theme.text, textAlign: 'center', marginBottom: '24px' }}>Recent Entries</h2>
      <div style={{ overflowX: 'auto' }}>
        <table style={styles.table}>
          <thead>
            <tr>
              <th style={styles.th}>ID</th>
              <th style={styles.th}>Timestamp</th>
              <th style={styles.th}>Temperature</th>
              <th style={styles.th}>pH</th>
              <th style={styles.th}>TDS</th>
              <th style={styles.th}>Humidity</th>
              <th style={styles.th}>Dissolved Oxygen</th>
            </tr>
          </thead>
          <tbody>
            {plantData
              .sort((a, b) => new Date(b.timestamp) - new Date(a.timestamp))
              .slice(0, 5)
              .map((entry) => (
                <tr key={entry.id}>
                  <td style={styles.td}>{entry.id}</td>
                  <td style={styles.td}>{entry.timestamp}</td>
                  <td style={styles.td}>{entry.temperature}</td>
                  <td style={styles.td}>{entry.ph}</td>
                  <td style={styles.td}>{entry.tds}</td>
                  <td style={styles.td}>{entry.humidity}</td>
                  <td style={styles.td}>{entry.dissolvedOxy}</td>
                </tr>
              ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default RecentEntriesTable;


