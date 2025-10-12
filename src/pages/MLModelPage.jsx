import React from 'react';
import PageHeader from '../components/PageHeader';

const MLModelPage = ({ styles, theme, isDarkMode, dummyData, setDummyData, generateDummyData, dummyPrediction, onToggleTheme }) => {
  return (
    <div style={{ marginBottom: '40px' }}>
      <PageHeader 
        title="ML Model" 
        subtitle="Leaves Predictor & Color Analysis"
        theme={theme} 
        isDarkMode={isDarkMode} 
        onToggleTheme={onToggleTheme}
      />

      <div style={{ 
        background: theme.card,
        borderRadius: '16px',
        padding: '32px',
        border: `1px solid ${theme.border}`,
        boxShadow: isDarkMode ? '0 4px 20px rgba(0, 0, 0, 0.3)' : '0 2px 10px rgba(0, 0, 0, 0.1)',
        marginBottom: '24px'
      }}>
        <div style={{ textAlign: 'center', marginBottom: '32px' }}>
          <h2 style={{ 
            fontSize: '24px', 
            fontWeight: 'bold', 
            color: theme.text, 
            marginBottom: '16px' 
          }}>Leaves Predictor</h2>
          <p style={{ 
            color: theme.textMuted, 
            fontSize: '18px',
            marginBottom: '24px'
          }}>
            Predicted Plant: <strong style={{ color: theme.accent }}>{dummyPrediction()}</strong>
          </p>
          <button 
            onClick={() => setDummyData(generateDummyData())} 
            style={{
              background: theme.accent,
              opacity: 0.7,
              color: 'black',
              padding: '12px 24px',
              borderRadius: '12px',
              border: 'none',
              fontSize: '16px',
              fontWeight: '600',
              cursor: 'pointer',
              transition: 'all 0.2s ease'
            }}
            onMouseEnter={(e) => {
              e.target.style.transform = 'translateY(-2px)';
              e.target.style.boxShadow = isDarkMode 
                ? '0 6px 20px rgba(211, 255, 92, 0.3)' 
                : '0 6px 20px rgba(0, 229, 255, 0.3)';
            }}
            onMouseLeave={(e) => {
              e.target.style.transform = 'translateY(0)';
              e.target.style.boxShadow = 'none';
            }}
          >
            Refresh Prediction
          </button>
        </div>
      </div>

      <div style={{ 
        background: theme.card,
        borderRadius: '16px',
        padding: '32px',
        border: `1px solid ${theme.border}`,
        boxShadow: isDarkMode ? '0 4px 20px rgba(0, 0, 0, 0.3)' : '0 2px 10px rgba(0, 0, 0, 0.1)'
      }}>
        <h2 style={{ 
          fontSize: '24px', 
          fontWeight: 'bold', 
          color: theme.text, 
          marginBottom: '24px',
          textAlign: 'center'
        }}>Color Detection & Analysis</h2>
        <div style={{ 
          display: 'grid', 
          gap: '24px', 
          gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
          justifyContent: 'center'
        }}>
          {dummyData.colors.map((color, index) => (
            <div key={index} style={{ 
              textAlign: 'center',
              padding: '20px',
              borderRadius: '12px',
              background: theme.surface,
              border: `1px solid ${theme.border}`,
              transition: 'all 0.2s ease'
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.transform = 'translateY(-4px)';
              e.currentTarget.style.boxShadow = isDarkMode 
                ? '0 8px 25px rgba(0, 0, 0, 0.4)' 
                : '0 8px 25px rgba(0, 0, 0, 0.15)';
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.transform = 'translateY(0)';
              e.currentTarget.style.boxShadow = 'none';
            }}
            >
              <div
                style={{
                  width: 80,
                  height: 80,
                  backgroundColor: color.hex,
                  borderRadius: '12px',
                  margin: '0 auto 16px',
                  border: `2px solid ${theme.border}`,
                  boxShadow: `0 0 20px ${color.hex}40`
                }}
              />
              <p style={{ 
                color: theme.text, 
                fontWeight: '600',
                marginBottom: '8px'
              }}>Hex: {color.hex}</p>
              <p style={{ 
                color: theme.textMuted,
                fontSize: '14px'
              }}>Health: {color.health}</p>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default MLModelPage;


