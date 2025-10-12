import React from 'react';
import { ResponsiveContainer, BarChart, Bar, XAxis, YAxis, Tooltip, CartesianGrid } from 'recharts';
import PageHeader from '../components/PageHeader';

const StressInsightsPage = ({ styles, theme, isDarkMode, onToggleTheme }) => {
  return (
    <div style={{ marginBottom: '40px' }}>
      <PageHeader 
        title="Stress Insights" 
        subtitle="Plant stress analysis and monitoring"
        theme={theme} 
        isDarkMode={isDarkMode} 
        onToggleTheme={onToggleTheme}
      />
      
      <div style={{ 
        display: 'grid', 
        gap: '24px', 
        gridTemplateColumns: 'repeat(auto-fill, minmax(400px, 1fr))' 
      }}>
        <div style={{ 
          background: theme.card,
          borderRadius: '16px', 
          padding: '24px',
          border: `1px solid ${theme.border}`,
          boxShadow: isDarkMode ? '0 4px 20px rgba(0, 0, 0, 0.3)' : '0 2px 10px rgba(0, 0, 0, 0.1)',
          transition: 'all 0.2s ease'
        }}
        onMouseEnter={(e) => {
          e.currentTarget.style.transform = 'translateY(-2px)';
          e.currentTarget.style.boxShadow = isDarkMode 
            ? '0 8px 25px rgba(0, 0, 0, 0.4)' 
            : '0 8px 25px rgba(0, 0, 0, 0.15)';
        }}
        onMouseLeave={(e) => {
          e.currentTarget.style.transform = 'translateY(0)';
          e.currentTarget.style.boxShadow = isDarkMode ? '0 4px 20px rgba(0, 0, 0, 0.3)' : '0 2px 10px rgba(0, 0, 0, 0.1)';
        }}
        >
          <h2 style={{ 
            fontSize: '20px', 
            fontWeight: 'bold', 
            color: theme.text, 
            marginBottom: '20px',
            display: 'flex',
            alignItems: 'center',
            gap: '12px'
          }}>
            <div style={{
              width: '8px',
              height: '8px',
              borderRadius: '50%',
              background: '#ef4444',
              boxShadow: '0 0 10px #ef444440'
            }} />
            Episodes Timeline
          </h2>
          <div style={{ height: 280, borderRadius: '12px' }}>
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={[
                {t:'10:00',s:2},
                {t:'10:30',s:4},
                {t:'11:00',s:3},
                {t:'11:30',s:5},
                {t:'12:00',s:1},
                {t:'12:30',s:3}
              ]}> 
                <CartesianGrid strokeDasharray="3 3" stroke={theme.border} />
                <XAxis dataKey="t" stroke={theme.textMuted} fontSize={12} />
                <YAxis stroke={theme.textMuted} fontSize={12} />
                <Tooltip 
                  contentStyle={{ 
                    backgroundColor: theme.card, 
                    border: `1px solid ${theme.border}`, 
                    borderRadius: '8px', 
                    color: theme.text,
                    boxShadow: isDarkMode ? '0 4px 20px rgba(0, 0, 0, 0.3)' : '0 2px 10px rgba(0, 0, 0, 0.1)'
                  }} 
                />
                <Bar dataKey="s" fill="#ef4444" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        <div style={{ 
          background: theme.card,
          borderRadius: '16px', 
          padding: '24px',
          border: `1px solid ${theme.border}`,
          boxShadow: isDarkMode ? '0 4px 20px rgba(0, 0, 0, 0.3)' : '0 2px 10px rgba(0, 0, 0, 0.1)',
          transition: 'all 0.2s ease'
        }}
        onMouseEnter={(e) => {
          e.currentTarget.style.transform = 'translateY(-2px)';
          e.currentTarget.style.boxShadow = isDarkMode 
            ? '0 8px 25px rgba(0, 0, 0, 0.4)' 
            : '0 8px 25px rgba(0, 0, 0, 0.15)';
        }}
        onMouseLeave={(e) => {
          e.currentTarget.style.transform = 'translateY(0)';
          e.currentTarget.style.boxShadow = isDarkMode ? '0 4px 20px rgba(0, 0, 0, 0.3)' : '0 2px 10px rgba(0, 0, 0, 0.1)';
        }}
        >
          <h2 style={{ 
            fontSize: '20px', 
            fontWeight: 'bold', 
            color: theme.text, 
            marginBottom: '20px',
            display: 'flex',
            alignItems: 'center',
            gap: '12px'
          }}>
            <div style={{
              width: '8px',
              height: '8px',
              borderRadius: '50%',
              background: '#60a5fa',
              boxShadow: '0 0 10px #60a5fa40'
            }} />
            Stress Score Distribution
          </h2>
          <div style={{ height: 280, borderRadius: '12px' }}>
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={[
                {bin:'0-0.2',n:5},
                {bin:'0.2-0.4',n:12},
                {bin:'0.4-0.6',n:8},
                {bin:'0.6-0.8',n:3},
                {bin:'0.8-1.0',n:1}
              ]}> 
                <CartesianGrid strokeDasharray="3 3" stroke={theme.border} />
                <XAxis dataKey="bin" stroke={theme.textMuted} fontSize={12} />
                <YAxis stroke={theme.textMuted} fontSize={12} />
                <Tooltip 
                  contentStyle={{ 
                    backgroundColor: theme.card, 
                    border: `1px solid ${theme.border}`, 
                    borderRadius: '8px', 
                    color: theme.text,
                    boxShadow: isDarkMode ? '0 4px 20px rgba(0, 0, 0, 0.3)' : '0 2px 10px rgba(0, 0, 0, 0.1)'
                  }} 
                />
                <Bar dataKey="n" fill="#60a5fa" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>
    </div>
  );
};

export default StressInsightsPage;


