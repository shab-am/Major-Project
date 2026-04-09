import React from 'react';
import { Bell } from 'lucide-react';

const PageHeader = ({
  title,
  subtitle,
  theme,
  isDarkMode,
  onToggleTheme,
  notifications = [],
  isNotificationsOpen = false,
  onOpenNotifications,
  onOpenStressInsights
}) => {
  return (
    <div style={{ 
      display: 'flex', 
      justifyContent: 'space-between', 
      alignItems: 'center', 
      position: 'relative',
      marginTop: '34px',
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
        <button
          onClick={onOpenNotifications}
          style={{
          background: theme.surface,
          border: `1px solid ${theme.border}`,
          borderRadius: '8px',
          padding: '8px 12px',
          display: 'flex',
          alignItems: 'center',
          gap: '8px',
          color: theme.textMuted,
          fontSize: '14px',
          position: 'relative',
          cursor: 'pointer'
        }}
        >
          <Bell size={16} strokeWidth={2.2} />
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
          }}>{notifications.length}</div>
        </button>
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
      {isNotificationsOpen && (
        <div
          style={{
            position: 'absolute',
            top: '88px',
            right: '24px',
            width: '320px',
            background: theme.card,
            border: `1px solid ${theme.border}`,
            borderRadius: '14px',
            padding: '16px',
            boxShadow: isDarkMode ? '0 20px 40px rgba(0,0,0,0.45)' : '0 16px 30px rgba(0,0,0,0.12)',
            zIndex: 30,
            display: 'block'
          }}
        >
          <div style={{ color: theme.text, fontWeight: '700', marginBottom: '8px' }}>
            You have {notifications.length} alert{notifications.length === 1 ? '' : 's'}
          </div>
          {notifications.length > 0 ? (
            <div style={{ display: 'grid', gap: '10px', marginBottom: '12px' }}>
              {notifications.slice(0, 3).map((notification) => (
                <div
                  key={notification.id}
                  style={{
                    background: theme.surface,
                    border: `1px solid ${theme.border}`,
                    borderRadius: '10px',
                    padding: '10px 12px'
                  }}
                >
                  <div style={{ color: theme.text, fontSize: '13px', fontWeight: '600' }}>{notification.title}</div>
                  <div style={{ color: theme.textMuted, fontSize: '12px', marginTop: '4px' }}>{notification.body}</div>
                </div>
              ))}
            </div>
          ) : (
            <div style={{ color: theme.textMuted, fontSize: '13px', marginBottom: '12px' }}>
              No active alerts right now.
            </div>
          )}
          <button
            onClick={onOpenStressInsights}
            style={{
              width: '100%',
              background: isDarkMode ? '#2563eb' : '#1d4ed8',
              border: `1px solid ${isDarkMode ? '#3b82f6' : '#1d4ed8'}`,
              borderRadius: '10px',
              color: '#ffffff',
              padding: '10px 12px',
              cursor: 'pointer',
              fontWeight: '700'
            }}
          >
            Read full notifications in Stress Insights
          </button>
        </div>
      )}
    </div>
  );
};

export default PageHeader;
