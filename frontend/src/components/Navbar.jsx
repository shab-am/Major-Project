import React from 'react';
import { Home, LineChart, AlertTriangle, Cpu, FlaskConical, Bell } from 'lucide-react';
import './Navbar.css';

const NAV_ITEMS = [
  { id: 'dashboard', label: 'Overview', icon: Home },
  { id: 'stress', label: 'Stress insights', icon: AlertTriangle },
  { id: 'analytics', label: 'Trends', icon: LineChart },
  { id: 'systems', label: 'Sensors', icon: Cpu }
];

const Navbar = ({
  currentPage,
  setCurrentPage,
  theme,
  isDarkMode,
  onToggleTheme,
  notifications = [],
  isNotificationsOpen,
  onOpenNotifications,
  onOpenStressInsights,
  onOpenMLAnalysis
}) => {
  const itemStyle = (active) => ({
    display: 'flex',
    alignItems: 'center',
    gap: 8,
    padding: '8px 12px',
    borderRadius: 10,
    border: 'none',
    cursor: 'pointer',
    fontSize: 13,
    fontWeight: active ? 600 : 500,
    background: active ? `${theme.accent}28` : 'transparent',
    color: active ? theme.text : theme.textMuted,
    transition: 'background 0.15s ease, color 0.15s ease'
  });

  const pill = {
    display: 'flex',
    alignItems: 'center',
    gap: 8,
    padding: '6px 12px',
    borderRadius: 999,
    border: `1px solid ${theme.border}`,
    background: theme.surface,
    fontSize: 12,
    color: theme.textMuted,
    cursor: 'pointer'
  };

  return (
    <header className="app-navbar-wrap" style={{ borderBottom: `1px solid ${theme.border}`, background: theme.bg }}>
      <div className="app-navbar">
        <button
          type="button"
          className="navbar-brand"
          onClick={() => setCurrentPage('dashboard')}
          style={{ color: theme.accent }}
        >
          HydroMonitor
        </button>

        <nav className="navbar-links">
          {NAV_ITEMS.map(({ id, label, icon: Icon }) => (
            <button key={id} type="button" onClick={() => setCurrentPage(id)} style={itemStyle(currentPage === id)}>
              <Icon size={16} />
              {label}
            </button>
          ))}
        </nav>

        <div className="navbar-actions">
          <div style={{ position: 'relative' }}>
            <button type="button" onClick={onOpenNotifications} style={{ ...pill, color: theme.text }}>
              <Bell size={15} />
              Alerts
              {notifications.length > 0 && (
                <span
                  style={{
                    background: '#ff6b6b',
                    color: '#fff',
                    borderRadius: 999,
                    minWidth: 18,
                    height: 18,
                    fontSize: 10,
                    fontWeight: 700,
                    display: 'inline-flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    padding: '0 5px'
                  }}
                >
                  {notifications.length}
                </span>
              )}
            </button>
            {isNotificationsOpen && (
              <div
                className="navbar-notifications-panel"
                style={{
                  position: 'absolute',
                  top: 'calc(100% + 8px)',
                  right: 0,
                  width: 300,
                  background: theme.card,
                  border: `1px solid ${theme.border}`,
                  borderRadius: 12,
                  padding: 14,
                  boxShadow: isDarkMode ? '0 16px 40px rgba(0,0,0,0.45)' : '0 12px 28px rgba(0,0,0,0.12)',
                  zIndex: 120
                }}
              >
                <div style={{ color: theme.text, fontWeight: 700, fontSize: 13, marginBottom: 8 }}>
                  {notifications.length} active alert{notifications.length === 1 ? '' : 's'}
                </div>
                {notifications.length === 0 ? (
                  <p style={{ color: theme.textMuted, fontSize: 12, margin: 0 }}>All clear right now.</p>
                ) : (
                  <div
                    style={{
                      display: 'grid',
                      gap: 8,
                      marginBottom: 10,
                      maxHeight: 360,
                      overflowY: 'auto'
                    }}
                  >
                    {notifications.map((n) => (
                      <div
                        key={n.id}
                        style={{
                          background: theme.surface,
                          border: `1px solid ${theme.border}`,
                          borderRadius: 8,
                          padding: '8px 10px'
                        }}
                      >
                        <div style={{ color: theme.text, fontSize: 12, fontWeight: 600 }}>{n.title}</div>
                        <div style={{ color: theme.textMuted, fontSize: 11, marginTop: 2 }}>{n.body}</div>
                      </div>
                    ))}
                  </div>
                )}
                <button
                  type="button"
                  onClick={onOpenStressInsights}
                  style={{
                    width: '100%',
                    padding: '8px 10px',
                    borderRadius: 8,
                    border: 'none',
                    background: theme.accent,
                    color: isDarkMode ? '#0a0e14' : '#fff',
                    fontWeight: 700,
                    fontSize: 12,
                    cursor: 'pointer'
                  }}
                >
                  Open stress insights
                </button>
              </div>
            )}
          </div>

          <button type="button" onClick={onToggleTheme} style={{ ...pill, color: theme.text }}>
            {isDarkMode ? '☀️ Light' : '🌙 Dark'}
          </button>

          <button type="button" onClick={onOpenMLAnalysis} style={{ ...pill, color: theme.text, fontWeight: 600 }}>
            <FlaskConical size={15} color={theme.accent} />
            ML
          </button>
        </div>
      </div>
    </header>
  );
};

export default Navbar;
