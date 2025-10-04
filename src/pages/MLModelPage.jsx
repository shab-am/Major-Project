import React from 'react';

const MLModelPage = ({ styles, theme, isDarkMode, dummyData, setDummyData, generateDummyData, dummyPrediction }) => {
  return (
    <div style={styles.container}>
      <div style={styles.card}>
        <div style={{ display: 'flex', justifyContent: 'center', marginBottom: 8 }}>
          <h1 style={{ ...styles.pageTitle, textAlign: 'center' }}>ML Model - Leaves Predictor & Color Analysis</h1>
        </div>

        <div style={{ marginTop: 32, textAlign: 'center' }}>
          <h2 style={{ ...styles.chartTitle, marginBottom: 24 }}>Leaves Predictor</h2>
          <p style={{ color: isDarkMode ? 'white' : '#2a6f6f', fontSize: '1.2rem' }}>
            Predicted Plant: <strong>{dummyPrediction()}</strong>
          </p>
          <button onClick={() => setDummyData(generateDummyData())} style={{ ...styles.button, ...styles.greenButton, marginTop: 16 }}>
            Refresh Prediction
          </button>

          <h2 style={{ ...styles.chartTitle, marginTop: 32, marginBottom: 24 }}>Color Detection & Analysis</h2>
          <div style={{ display: 'flex', justifyContent: 'center', gap: 20, flexWrap: 'wrap' }}>
            {dummyData.colors.map((color, index) => (
              <div key={index} style={{ textAlign: 'center' }}>
                <div
                  style={{
                    width: 100,
                    height: 100,
                    backgroundColor: color.hex,
                    borderRadius: 8,
                    marginBottom: 8,
                    border: '2px solid ' + (isDarkMode ? 'rgba(255, 255, 255, 0.2)' : theme.border)
                  }}
                />
                <p style={{ color: isDarkMode ? 'white' : '#2a6f6f' }}>Hex: {color.hex}</p>
                <p style={{ color: isDarkMode ? 'white' : '#2a6f6f' }}>Health: {color.health}</p>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

export default MLModelPage;


