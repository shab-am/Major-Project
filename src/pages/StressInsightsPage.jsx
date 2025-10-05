import React from 'react';
import { ResponsiveContainer, BarChart, Bar, XAxis, YAxis, Tooltip, CartesianGrid } from 'recharts';

const StressInsightsPage = ({ styles, theme, isDarkMode }) => {
  return (
    <div style={styles.container}>
      <div style={styles.card}>
        <div style={{ display: 'flex', justifyContent: 'center', marginBottom: 8 }}>
          <h1 style={{ ...styles.pageTitle, textAlign: 'center' }}>Stress Insights</h1>
        </div>
        <div style={{ display: 'grid', gap: 24, gridTemplateColumns: 'repeat(auto-fill, minmax(360px, 1fr))' }}>
          <div style={{ background: isDarkMode ? 'rgba(255,255,255,0.04)' : '#fafafa', borderRadius: 16, padding: 24 }}>
            <h2 style={{ fontSize: '1.25rem', fontWeight: 'bold', color: theme.text, marginBottom: 16 }}>Episodes Timeline</h2>
            <div style={{ height: 240, borderRadius: 8 }}>
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={[{t:'10:00',s:2},{t:'10:30',s:4},{t:'11:00',s:3},{t:'11:30',s:5}]}> 
                  <CartesianGrid strokeDasharray="3 3" stroke={isDarkMode ? 'rgba(255,255,255,0.1)' : 'rgba(0,0,0,0.08)'} />
                  <XAxis dataKey="t" stroke={isDarkMode ? '#94a3b8' : '#555'} />
                  <YAxis stroke={isDarkMode ? '#94a3b8' : '#555'} />
                  <Tooltip contentStyle={{ backgroundColor: isDarkMode ? 'rgba(0,0,0,0.8)' : '#fff', border: 'none', borderRadius: 8, color: theme.text }} />
                  <Bar dataKey="s" fill={isDarkMode ? '#ef4444' : '#b91c1c'} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>
          <div style={{ background: isDarkMode ? 'rgba(255,255,255,0.04)' : '#fafafa', borderRadius: 16, padding: 24 }}>
            <h2 style={{ fontSize: '1.25rem', fontWeight: 'bold', color: theme.text, marginBottom: 16 }}>Stress Score Distribution</h2>
            <div style={{ height: 240, borderRadius: 8 }}>
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={[{bin:'0-0.2',n:5},{bin:'0.2-0.4',n:12},{bin:'0.4-0.6',n:8},{bin:'0.6-0.8',n:3}]}> 
                  <CartesianGrid strokeDasharray="3 3" stroke={isDarkMode ? 'rgba(255,255,255,0.1)' : 'rgba(0,0,0,0.08)'} />
                  <XAxis dataKey="bin" stroke={isDarkMode ? '#94a3b8' : '#555'} />
                  <YAxis stroke={isDarkMode ? '#94a3b8' : '#555'} />
                  <Tooltip contentStyle={{ backgroundColor: isDarkMode ? 'rgba(0,0,0,0.8)' : '#fff', border: 'none', borderRadius: 8, color: theme.text }} />
                  <Bar dataKey="n" fill={isDarkMode ? '#60a5fa' : '#1d4ed8'} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default StressInsightsPage;


