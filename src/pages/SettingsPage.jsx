import React from 'react';
import PageHeader from '../components/PageHeader';

const SettingsPage = ({ styles, theme, isDarkMode, onToggleTheme }) => {
  return (
    <div style={{ marginBottom: '40px' }}>
      <PageHeader 
        title="Settings" 
        subtitle="System configuration and preferences"
        theme={theme} 
        isDarkMode={isDarkMode} 
        onToggleTheme={onToggleTheme}
      />
      
      <div style={{ 
        display: 'grid', 
        gap: '24px', 
        gridTemplateColumns: 'repeat(auto-fit, minmax(350px, 1fr))' 
      }}>
        <div style={{
          background: theme.card,
          borderRadius: '16px',
          padding: '24px',
          border: `1px solid ${theme.border}`,
          boxShadow: isDarkMode ? '0 4px 20px rgba(0, 0, 0, 0.3)' : '0 2px 10px rgba(0, 0, 0, 0.1)',
          transition: 'all 0.2s ease',
          height: 'fit-content'
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
            marginBottom: '20px'
          }}>
            <div style={{
              width: '8px',
              height: '8px',
              borderRadius: '50%',
              background: '#3b82f6',
              boxShadow: '0 0 10px #3b82f640'
            }} />
            <h3 style={{ 
              fontSize: '18px',
              fontWeight: 'bold', 
              color: theme.text,
              margin: 0
            }}>Connection Settings</h3>
          </div>
          <div style={{ marginBottom: '20px' }}>
            <label style={{ 
              display: 'block', 
              marginBottom: '8px', 
              color: theme.text,
              fontWeight: '600',
              fontSize: '14px'
            }}>
              WebSocket URL
            </label>
            <input 
              style={{ 
                width: '100%', 
                padding: '12px 16px', 
                borderRadius: '8px', 
                border: `1px solid ${theme.border}`, 
                background: theme.surface, 
                color: theme.text,
                fontSize: '14px',
                boxSizing: 'border-box'
              }} 
              defaultValue="ws://localhost:5000/signals" 
            />
          </div>
          <div>
            <label style={{ 
              display: 'block', 
              marginBottom: '8px', 
              color: theme.text,
              fontWeight: '600',
              fontSize: '14px'
            }}>
              Connection Timeout (ms)
            </label>
            <input 
              type="number"
              style={{ 
                width: '100%', 
                padding: '12px 16px', 
                borderRadius: '8px', 
                border: `1px solid ${theme.border}`, 
                background: theme.surface, 
                color: theme.text,
                fontSize: '14px',
                boxSizing: 'border-box'
              }} 
              defaultValue="5000" 
            />
          </div>
        </div>

        <div style={{
          background: theme.card,
          borderRadius: '16px',
          padding: '24px',
          border: `1px solid ${theme.border}`,
          boxShadow: isDarkMode ? '0 4px 20px rgba(0, 0, 0, 0.3)' : '0 2px 10px rgba(0, 0, 0, 0.1)',
          transition: 'all 0.2s ease',
          height: 'fit-content'
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
            marginBottom: '20px'
          }}>
            <div style={{
              width: '8px',
              height: '8px',
              borderRadius: '50%',
              background: '#10b981',
              boxShadow: '0 0 10px #10b98140'
            }} />
            <h3 style={{ 
              fontSize: '18px',
              fontWeight: 'bold', 
              color: theme.text,
              margin: 0
            }}>Data Processing</h3>
          </div>
          <div style={{ marginBottom: '20px' }}>
            <label style={{ 
              display: 'block', 
              marginBottom: '8px', 
              color: theme.text,
              fontWeight: '600',
              fontSize: '14px'
            }}>
              Buffer Size (points)
            </label>
            <input 
              type="number" 
              style={{ 
                width: '100%', 
                padding: '12px 16px', 
                borderRadius: '8px', 
                border: `1px solid ${theme.border}`, 
                background: theme.surface, 
                color: theme.text,
                fontSize: '14px',
                boxSizing: 'border-box'
              }} 
              defaultValue={1800} 
            />
          </div>
          <div>
            <label style={{ 
              display: 'block', 
              marginBottom: '8px', 
              color: theme.text,
              fontWeight: '600',
              fontSize: '14px'
            }}>
              Smoothing (EMA)
            </label>
            <input 
              type="number" 
              style={{ 
                width: '100%', 
                padding: '12px 16px', 
                borderRadius: '8px', 
                border: `1px solid ${theme.border}`, 
                background: theme.surface, 
                color: theme.text,
                fontSize: '14px',
                boxSizing: 'border-box'
              }} 
              defaultValue={0.2} 
              step="0.05" 
            />
          </div>
        </div>

        <div style={{
          background: theme.card,
          borderRadius: '16px',
          padding: '24px',
          border: `1px solid ${theme.border}`,
          boxShadow: isDarkMode ? '0 4px 20px rgba(0, 0, 0, 0.3)' : '0 2px 10px rgba(0, 0, 0, 0.1)',
          transition: 'all 0.2s ease',
          height: 'fit-content'
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
            marginBottom: '20px'
          }}>
            <div style={{
              width: '8px',
              height: '8px',
              borderRadius: '50%',
              background: '#f59e0b',
              boxShadow: '0 0 10px #f59e0b40'
            }} />
            <h3 style={{ 
              fontSize: '18px',
              fontWeight: 'bold', 
              color: theme.text,
              margin: 0
            }}>Display Settings</h3>
          </div>
          <div style={{ marginBottom: '20px' }}>
            <label style={{ 
              display: 'block', 
              marginBottom: '8px', 
              color: theme.text,
              fontWeight: '600',
              fontSize: '14px'
            }}>
              Chart Refresh Rate (ms)
            </label>
            <input 
              type="number" 
              style={{ 
                width: '100%', 
                padding: '12px 16px', 
                borderRadius: '8px', 
                border: `1px solid ${theme.border}`, 
                background: theme.surface, 
                color: theme.text,
                fontSize: '14px',
                boxSizing: 'border-box'
              }} 
              defaultValue={100} 
            />
          </div>
          <div>
            <label style={{ 
              display: 'block', 
              marginBottom: '8px', 
              color: theme.text,
              fontWeight: '600',
              fontSize: '14px'
            }}>
              Data Points Display
            </label>
            <input 
              type="number" 
              style={{ 
                width: '100%', 
                padding: '12px 16px', 
                borderRadius: '8px', 
                border: `1px solid ${theme.border}`, 
                background: theme.surface, 
                color: theme.text,
                fontSize: '14px',
                boxSizing: 'border-box'
              }} 
              defaultValue={1000} 
            />
          </div>
        </div>
      </div>
    </div>
  );
};

export default SettingsPage;


