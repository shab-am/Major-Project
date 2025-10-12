import React from 'react';
import { ResponsiveContainer, BarChart, Bar, XAxis, YAxis, Tooltip, CartesianGrid } from 'recharts';
import PageHeader from '../components/PageHeader';

const RecommendationsPage = ({ styles, theme, isDarkMode, onToggleTheme }) => {
  return (
    <div style={{ marginBottom: '40px' }}>
      <PageHeader 
        title="Recommendations" 
        subtitle="AI-powered plant care suggestions"
        theme={theme} 
        isDarkMode={isDarkMode} 
        onToggleTheme={onToggleTheme}
      />
      
      <div style={{ display: 'grid', gap: '20px' }}>
        {[1,2,3].map((i) => (
          <div key={i} style={{
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
            <div style={{ 
              display: 'flex',
              alignItems: 'center',
              gap: '12px',
              marginBottom: '16px'
            }}>
              <div style={{
                width: '8px',
                height: '8px',
                borderRadius: '50%',
                background: theme.accent,
                boxShadow: `0 0 10px ${theme.accent}40`
              }} />
              <div style={{ 
                fontWeight: 'bold', 
                color: theme.text,
                fontSize: '18px'
              }}>Action #{i}: Adjust pH</div>
            </div>
            <div style={{ 
              color: theme.textMuted, 
              marginBottom: '16px',
              lineHeight: '1.5'
            }}>
              Rationale and expected impact details go here. This recommendation is based on current plant stress levels and environmental conditions.
            </div>
            <div style={{ 
              marginBottom: '20px', 
              display: 'flex', 
              gap: '12px' 
            }}>
              <button style={{ 
                padding: '10px 16px', 
                borderRadius: '8px', 
                border: 'none', 
                background: theme.accent, 
                opacity: 0.7,
                color: 'black',
                fontSize: '14px',
                fontWeight: '600',
                cursor: 'pointer',
                transition: 'all 0.2s ease'
              }}
              onMouseEnter={(e) => {
                e.target.style.transform = 'translateY(-1px)';
                e.target.style.boxShadow = `0 4px 12px ${theme.accent}40`;
              }}
              onMouseLeave={(e) => {
                e.target.style.transform = 'translateY(0)';
                e.target.style.boxShadow = 'none';
              }}
              >
                Mark Applied
              </button>
              <button style={{ 
                padding: '10px 16px', 
                borderRadius: '8px', 
                border: `1px solid ${theme.border}`, 
                background: 'transparent', 
                color: theme.text,
                fontSize: '14px',
                fontWeight: '600',
                cursor: 'pointer',
                transition: 'all 0.2s ease'
              }}
              onMouseEnter={(e) => {
                e.target.style.background = theme.border;
                e.target.style.transform = 'translateY(-1px)';
              }}
              onMouseLeave={(e) => {
                e.target.style.background = 'transparent';
                e.target.style.transform = 'translateY(0)';
              }}
              >
                Dismiss
              </button>
            </div>
            <div style={{ 
              height: 200, 
              borderRadius: '12px',
              background: theme.surface,
              border: `1px solid ${theme.border}`
            }}>
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={[
                  {k:'pH',v:0.3},
                  {k:'TDS',v:120},
                  {k:'Temp',v:-1},
                  {k:'Humidity',v:15},
                  {k:'Oxygen',v:8}
                ]}> 
                  <CartesianGrid strokeDasharray="3 3" stroke={theme.border} />
                  <XAxis dataKey="k" stroke={theme.textMuted} fontSize={12} />
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
                  <Bar dataKey="v" fill="#10b981" radius={[4, 4, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default RecommendationsPage;


