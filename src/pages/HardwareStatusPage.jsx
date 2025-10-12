import React from 'react';
import PageHeader from '../components/PageHeader';

const HardwareStatusPage = ({ styles, theme, isDarkMode, onToggleTheme }) => {
  return (
    <div style={{ marginBottom: '40px' }}>
      <PageHeader 
        title="Hardware Status" 
        subtitle="Sensor monitoring and calibration"
        theme={theme} 
        isDarkMode={isDarkMode} 
        onToggleTheme={onToggleTheme}
      />
      
      <div style={{ 
        display: 'grid', 
        gap: '24px', 
        gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))' 
      }}>
        {[1,2,3,4].map((i) => (
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
                background: '#10b981',
                boxShadow: '0 0 10px #10b98140'
              }} />
              <div style={{ 
                fontWeight: 'bold', 
                color: theme.text,
                fontSize: '18px'
              }}>Sensor Channel {i}</div>
            </div>
            <div style={{ 
              marginBottom: '20px', 
              color: theme.textMuted,
              lineHeight: '1.5'
            }}>
              <div style={{ marginBottom: '8px' }}>
                <strong style={{ color: theme.text }}>Status:</strong> Online
              </div>
              <div style={{ marginBottom: '8px' }}>
                <strong style={{ color: theme.text }}>Sample Rate:</strong> 200 Hz
              </div>
              <div style={{ marginBottom: '8px' }}>
                <strong style={{ color: theme.text }}>Noise Level:</strong> Low
              </div>
              <div>
                <strong style={{ color: theme.text }}>Last Calibration:</strong> 2 hours ago
              </div>
            </div>
            <div style={{ 
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
                transition: 'all 0.2s ease',
                flex: 1
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
                Calibrate
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
                transition: 'all 0.2s ease',
                flex: 1
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
                Details
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default HardwareStatusPage;


