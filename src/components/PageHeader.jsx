import React from 'react';

const PageHeader = ({ title, subtitle, theme, isDarkMode, onToggleTheme }) => {
  return (
    <div style={{ 
      display: 'flex', 
      justifyContent: 'space-between', 
      alignItems: 'center', 
      marginTop: '24px',
      marginBottom: '32px',
      paddingBottom: '20px',
      borderBottom: `1px solid ${theme.border}`
    }}>
      <div>
        <h1 style={{ 
          fontSize: '28px', 
          fontWeight: 'bold', 
          color: theme.text, 
          margin: 0,
          marginBottom: '4px'
        }}>{title}</h1>
        {subtitle && (
          <p style={{ 
            color: theme.textMuted, 
            margin: 0, 
            fontSize: '14px' 
          }}>{subtitle}</p>
        )}
      </div>
      <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
        <div style={{
          background: theme.surface,
          border: `1px solid ${theme.border}`,
          borderRadius: '8px',
          padding: '8px 12px',
          display: 'flex',
          alignItems: 'center',
          gap: '8px',
          color: theme.textMuted,
          fontSize: '14px'
        }}>
          <span>🔍</span>
          <span>Search</span>
        </div>
        <div style={{
          background: theme.surface,
          border: `1px solid ${theme.border}`,
          borderRadius: '8px',
          padding: '8px 12px',
          display: 'flex',
          alignItems: 'center',
          gap: '8px',
          color: theme.textMuted,
          fontSize: '14px',
          position: 'relative'
        }}>
          <span>🔔</span>
          <span>Notifications</span>
          <div style={{
            position: 'absolute',
            top: '-4px',
            right: '-4px',
            background: '#ff6b6b',
            color: 'white',
            borderRadius: '50%',
            width: '16px',
            height: '16px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            fontSize: '10px',
            fontWeight: 'bold'
          }}>3</div>
        </div>
        <button
          onClick={onToggleTheme}
          style={{
            background: theme.surface,
            border: `1px solid ${theme.border}`,
            borderRadius: '20px',
            padding: '8px 16px',
            display: 'flex',
            alignItems: 'center',
            gap: '8px',
            color: theme.textMuted,
            fontSize: '14px',
            cursor: 'pointer',
            transition: 'all 0.2s ease'
          }}
          onMouseEnter={(e) => {
            e.currentTarget.style.background = `${theme.accent}20`;
            e.currentTarget.style.color = theme.text;
            e.currentTarget.style.borderColor = theme.accent;
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.background = theme.surface;
            e.currentTarget.style.color = theme.textMuted;
            e.currentTarget.style.borderColor = theme.border;
          }}
        >
          <span>{isDarkMode ? '☀️' : '🌙'}</span>
          <span>{isDarkMode ? 'Light' : 'Dark'}</span>
        </button>
      </div>
    </div>
  );
};

export default PageHeader;
