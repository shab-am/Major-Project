import React from 'react';
import { Leaf, X } from 'lucide-react';

const statusText = (status) => {
  if (status === 'Moderate Stress') return 'Moderate';
  if (status === 'High Stress') return 'Stressed';
  return status;
};

const RecentPlantsPopup = ({ isOpen, onClose, theme, isDarkMode, plants = [] }) => {
  if (!isOpen) return null;

  const recentPlants = plants.map((plant) => ({
    name: plant.display_name,
    status: statusText(plant.health_status),
    ph: plant.metrics?.ph != null ? Number(plant.metrics.ph).toFixed(2) : '—',
    temp: plant.metrics?.temperature != null ? Number(plant.metrics.temperature).toFixed(1) : '—',
    humidity: plant.metrics?.humidity != null ? Number(plant.metrics.humidity).toFixed(0) : '—',
    tds: plant.metrics?.tds != null ? Number(plant.metrics.tds).toFixed(0) : '—',
    avatarBg: plant.species === 'Green Lettuce' ? 'rgba(34,197,94,0.18)' : plant.species === 'Red Lettuce' ? 'rgba(244,63,94,0.18)' : 'rgba(250,204,21,0.18)',
    avatarColor: plant.species === 'Green Lettuce' ? '#4ade80' : plant.species === 'Red Lettuce' ? '#fb7185' : '#facc15'
  }));

  const popupOverlayStyle = {
    position: 'fixed',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    background: 'rgba(0, 0, 0, 0.7)',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    zIndex: 1000,
    padding: '20px'
  };

  const popupContentStyle = {
    background: theme.card,
    borderRadius: '20px',
    border: `1px solid ${theme.border}`,
    boxShadow: isDarkMode ? '0 25px 50px -12px rgba(0, 0, 0, 0.5)' : '0 20px 25px -5px rgba(0, 0, 0, 0.1)',
    maxWidth: '90vw',
    maxHeight: '90vh',
    width: '1000px',
    overflow: 'hidden',
    display: 'flex',
    flexDirection: 'column'
  };

  const headerStyle = {
    padding: '24px 32px',
    borderBottom: `1px solid ${theme.border}`,
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    background: theme.surface
  };

  const titleStyle = {
    fontSize: '24px',
    fontWeight: 'bold',
    color: theme.text,
    margin: 0
  };

  const closeButtonStyle = {
    background: 'transparent',
    border: 'none',
    color: theme.textMuted,
    cursor: 'pointer',
    padding: '8px',
    borderRadius: '8px',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    transition: 'all 0.2s ease'
  };

  const contentStyle = {
    padding: '24px 32px',
    overflowY: 'auto',
    flex: 1
  };

  const gridStyle = {
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))',
    gap: '20px'
  };

  const plantCardStyle = {
    background: isDarkMode ? 'rgba(255, 255, 255, 0.02)' : 'rgba(0, 0, 0, 0.02)',
    border: `1px solid ${theme.border}`,
    borderRadius: '16px',
    padding: '20px',
    transition: 'all 0.2s ease',
    cursor: 'pointer'
  };

  const plantHeaderStyle = {
    display: 'flex',
    alignItems: 'center',
    gap: '12px',
    marginBottom: '16px'
  };

  const avatarStyle = {
    fontSize: '32px',
    width: '48px',
    height: '48px',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    background: isDarkMode ? 'rgba(255, 255, 255, 0.05)' : 'rgba(0, 0, 0, 0.05)',
    borderRadius: '12px'
  };

  const plantNameStyle = {
    fontSize: '18px',
    fontWeight: '600',
    color: theme.text,
    margin: 0
  };

  const statusBadgeStyle = (status) => ({
    padding: '4px 12px',
    borderRadius: '20px',
    fontSize: '12px',
    fontWeight: '500',
    background:
      status === 'Healthy'
        ? 'rgba(211, 255, 92, 0.2)'
        : status === 'Moderate'
          ? 'rgba(255, 165, 0, 0.2)'
          : 'rgba(255, 107, 107, 0.2)',
    color:
      status === 'Healthy'
        ? '#d3ff5c'
        : status === 'Moderate'
          ? '#ffa500'
          : '#ff6b6b',
    border: `1px solid ${
      status === 'Healthy'
        ? 'rgba(211, 255, 92, 0.3)'
        : status === 'Moderate'
          ? 'rgba(255, 165, 0, 0.3)'
          : 'rgba(255, 107, 107, 0.3)'
    }`
  });

  const metricsStyle = {
    display: 'grid',
    gridTemplateColumns: 'repeat(2, 1fr)',
    gap: '12px',
    marginBottom: '12px'
  };

  const metricStyle = {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: '8px 12px',
    background: isDarkMode ? 'rgba(255, 255, 255, 0.03)' : 'rgba(0, 0, 0, 0.03)',
    borderRadius: '8px'
  };

  const metricLabelStyle = {
    fontSize: '12px',
    color: theme.textMuted,
    fontWeight: '500'
  };

  const metricValueStyle = {
    fontSize: '14px',
    color: theme.text,
    fontWeight: '600'
  };

  return (
    <div style={popupOverlayStyle} onClick={onClose}>
      <div style={popupContentStyle} onClick={(e) => e.stopPropagation()}>
        <div style={headerStyle}>
          <h2 style={titleStyle}>Recent Plant Entries</h2>
          <button 
            style={closeButtonStyle}
            onClick={onClose}
            onMouseEnter={(e) => {
              e.currentTarget.style.background = isDarkMode ? 'rgba(255, 255, 255, 0.1)' : 'rgba(0, 0, 0, 0.1)';
              e.currentTarget.style.color = theme.text;
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.background = 'transparent';
              e.currentTarget.style.color = theme.textMuted;
            }}
          >
            <X size={20} />
          </button>
        </div>
        <div style={contentStyle}>
          <div style={gridStyle}>
            {recentPlants.map((plant, index) => (
              <div 
                key={plant.name + index} 
                style={plantCardStyle}
                onMouseEnter={(e) => {
                  e.currentTarget.style.transform = 'translateY(-2px)';
                  e.currentTarget.style.boxShadow = isDarkMode 
                    ? '0 8px 25px rgba(0, 0, 0, 0.3)' 
                    : '0 8px 25px rgba(0, 0, 0, 0.1)';
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.transform = 'translateY(0)';
                  e.currentTarget.style.boxShadow = 'none';
                }}
              >
                <div style={plantHeaderStyle}>
                  <div style={{ ...avatarStyle, background: plant.avatarBg, color: plant.avatarColor, border: `1px solid ${plant.avatarColor}40` }}>
                    <Leaf size={20} />
                  </div>
                  <div style={{ flex: 1 }}>
                    <h3 style={plantNameStyle}>{plant.name}</h3>
                    <div style={statusBadgeStyle(plant.status)}>{plant.status}</div>
                  </div>
                </div>
                
                <div style={metricsStyle}>
                  <div style={metricStyle}>
                    <span style={metricLabelStyle}>pH</span>
                    <span style={metricValueStyle}>{plant.ph}</span>
                  </div>
                  <div style={metricStyle}>
                    <span style={metricLabelStyle}>Temp</span>
                    <span style={metricValueStyle}>{plant.temp}°C</span>
                  </div>
                  <div style={metricStyle}>
                    <span style={metricLabelStyle}>Humidity</span>
                    <span style={metricValueStyle}>{plant.humidity}%</span>
                  </div>
                  <div style={metricStyle}>
                    <span style={metricLabelStyle}>TDS</span>
                    <span style={metricValueStyle}>{plant.tds}</span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

export default RecentPlantsPopup;
