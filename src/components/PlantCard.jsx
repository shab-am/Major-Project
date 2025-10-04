import React from 'react';

const PlantCard = ({ plantName, plant, theme, isDarkMode }) => {
  const styles = {
    card: {
      padding: '32px',
      borderRadius: '16px',
      cursor: 'pointer',
      transform: 'scale(1)',
      transition: 'all 0.3s ease',
      boxShadow: isDarkMode
        ? '0 25px 50px -12px rgba(0, 0, 0, 0.25)'
        : '0 10px 20px rgba(0, 0, 0, 0.1)',
      border: '1px solid ' + theme.border,
      textAlign: 'center',
      background: plant.color
    },
    name: {
      fontSize: '1.5rem',
      fontWeight: 'bold',
      color: theme.text,
      marginBottom: '8px'
    },
    description: {
      color: theme.textMuted,
      marginBottom: '16px'
    },
    stats: {
      background: isDarkMode ? 'rgba(255, 255, 255, 0.06)' : '#f5f5f5',
      borderRadius: '12px',
      padding: '16px',
      marginBottom: '16px'
    }
  };

  const isImagePath = (image) => typeof image === 'string' && /\.(jpg|jpeg|png|gif|webp)$/i.test(image);

  return (
    <div
      style={styles.card}
      onMouseEnter={(e) => {
        e.currentTarget.style.transform = 'scale(1.05)';
      }}
      onMouseLeave={(e) => {
        e.currentTarget.style.transform = 'scale(1)';
      }}
    >
      {isImagePath(plant.image) ? (
        <img
          src={plant.image}
          alt={plantName}
          style={{ width: 80, height: 80, objectFit: 'cover', borderRadius: 8, marginBottom: 16 }}
        />
      ) : (
        <div style={{ fontSize: '5rem', marginBottom: 16 }}>{plant.image}</div>
      )}
      <h2 style={styles.name}>{plantName}</h2>
      <p style={styles.description}>{plant.description}</p>
      <div style={styles.stats}>
        <div style={{ fontSize: '0.875rem', color: isDarkMode ? 'rgba(255, 255, 255, 0.9)' : '#333' }}>
          <p style={{ margin: '4px 0' }}><strong>Optimal pH:</strong> {plant.optimalPH}</p>
          <p style={{ margin: '4px 0' }}><strong>Optimal TDS:</strong> {plant.optimalTDS}</p>
          <p style={{ margin: '4px 0' }}><strong>Optimal Temperature:</strong> {plant.optimalTemperature}</p>
        </div>
      </div>
    </div>
  );
};

export default PlantCard;


