import React from 'react';
import { ResponsiveContainer, BarChart, Bar, XAxis, YAxis, Tooltip, CartesianGrid } from 'recharts';

const RecommendationsPage = ({ styles, theme, isDarkMode }) => {
  const card = { background: isDarkMode ? 'rgba(255,255,255,0.04)' : '#fafafa', borderRadius: 16, padding: 24 };
  return (
    <div style={styles.container}>
      <div style={styles.card}>
        <div style={{ display: 'flex', justifyContent: 'center', marginBottom: 8 }}>
          <h1 style={{ ...styles.pageTitle, textAlign: 'center' }}>Recommendations</h1>
        </div>
        <div style={{ display: 'grid', gap: 16 }}>
          {[1,2,3].map((i) => (
            <div key={i} style={card}>
              <div style={{ fontWeight: 'bold', color: theme.text }}>Action #{i}: Adjust pH</div>
              <div style={{ color: theme.textMuted, marginTop: 8 }}>Rationale and expected impact details go here.</div>
              <div style={{ marginTop: 12, display: 'flex', gap: 8 }}>
                <button style={{ padding: '8px 12px', borderRadius: 8, border: 'none', background: theme.accent, color: '#fff' }}>Mark Applied</button>
                <button style={{ padding: '8px 12px', borderRadius: 8, border: '1px solid '+theme.border, background: 'transparent', color: theme.text }}>Dismiss</button>
              </div>
              <div style={{ height: 180, marginTop: 12 }}>
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={[{k:'pH',v:0.3},{k:'TDS',v:120},{k:'Temp',v:-1}]}> 
                    <CartesianGrid strokeDasharray="3 3" stroke={isDarkMode ? 'rgba(255,255,255,0.1)' : 'rgba(0,0,0,0.08)'} />
                    <XAxis dataKey="k" stroke={isDarkMode ? '#94a3b8' : '#555'} />
                    <YAxis stroke={isDarkMode ? '#94a3b8' : '#555'} />
                    <Tooltip contentStyle={{ backgroundColor: isDarkMode ? 'rgba(0,0,0,0.8)' : '#fff', border: 'none', borderRadius: 8, color: theme.text }} />
                    <Bar dataKey="v" fill={isDarkMode ? '#10b981' : '#059669'} />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default RecommendationsPage;


