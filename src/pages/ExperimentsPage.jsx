import React from 'react';
import PageHeader from '../components/PageHeader';

const ExperimentsPage = ({ styles, theme, isDarkMode, onToggleTheme }) => {
  return (
    <div style={{ marginBottom: '40px' }}>
      <PageHeader 
        title="Experiments" 
        subtitle="Plant growth experiments and trials"
        theme={theme} 
        isDarkMode={isDarkMode} 
        onToggleTheme={onToggleTheme}
      />
      
      <div style={{ display: 'grid', gap: '20px' }}>
        {[1,2].map((i) => (
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
                background: '#8b5cf6',
                boxShadow: '0 0 10px #8b5cf640'
              }} />
              <div style={{ 
                fontWeight: 'bold', 
                color: theme.text,
                fontSize: '18px'
              }}>Experiment #{i}: Nutrient Solution Change</div>
            </div>
            <div style={{ 
              marginBottom: '20px', 
              color: theme.textMuted,
              lineHeight: '1.5'
            }}>
              <div style={{ marginBottom: '8px' }}>
                <strong style={{ color: theme.text }}>Start Time:</strong> 10:00 AM
              </div>
              <div style={{ marginBottom: '8px' }}>
                <strong style={{ color: theme.text }}>End Time:</strong> 12:00 PM
              </div>
              <div style={{ marginBottom: '8px' }}>
                <strong style={{ color: theme.text }}>Target:</strong> Reduce stress score
              </div>
              <div>
                <strong style={{ color: theme.text }}>Status:</strong> 
                <span style={{ 
                  color: i === 1 ? '#10b981' : '#f59e0b',
                  marginLeft: '8px',
                  fontWeight: '600'
                }}>
                  {i === 1 ? 'Completed' : 'In Progress'}
                </span>
              </div>
            </div>
            <div style={{ 
              height: 200, 
              borderRadius: '12px',
              background: theme.surface,
              border: `1px solid ${theme.border}`,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              color: theme.textMuted,
              fontSize: '14px'
            }}>
              <div style={{ textAlign: 'center' }}>
                <div style={{ fontSize: '32px', marginBottom: '8px' }}>📊</div>
                <div>Experiment data visualization</div>
                <div style={{ fontSize: '12px', marginTop: '4px' }}>
                  {i === 1 ? 'Results: 15% stress reduction achieved' : 'Live monitoring in progress...'}
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default ExperimentsPage;


