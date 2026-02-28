import React, { useState, useEffect } from 'react';
import { Calendar, TrendingUp, Droplets } from 'lucide-react';
import PageHeader from '../components/PageHeader';
import usePlantHealthPrediction from '../hooks/usePlantHealthPrediction';

const EntryPage = ({ styles, formData, setFormData, handleSubmit, handleResetForm, error, theme, isDarkMode, onToggleTheme }) => {
  const { predict, getHealthStatusStyle, loadModelInfo, modelInfo, loading: predicting } = usePlantHealthPrediction();
  const [livePrediction, setLivePrediction] = useState(null);

  // Load model info on mount
  useEffect(() => {
    loadModelInfo();
  }, [loadModelInfo]);

  // Auto-predict when form data changes (debounced)
  useEffect(() => {
    const timer = setTimeout(async () => {
      // Only predict if all required fields are filled
      if (formData.ph && formData.temperature && formData.humidity && 
          modelInfo?.model_exists && 
          !isNaN(formData.ph) && !isNaN(formData.temperature) && !isNaN(formData.humidity)) {
        try {
          const sensorData = {
            timestamp: new Date().toISOString(),
            temperature: parseFloat(formData.temperature),
            ph: parseFloat(formData.ph),
            humidity: parseFloat(formData.humidity),
            soilMoisture: 25,
            soilTemperature: parseFloat(formData.temperature),
            lightIntensity: 600,
            nitrogenLevel: 30,
            phosphorusLevel: 30,
            potassiumLevel: 30,
            chlorophyllContent: 35,
            electrochemicalSignal: 1.0,
          };

          const result = await predict(sensorData);
          if (result && result.predictions && result.predictions.length > 0) {
            const prediction = result.predictions[0];
            const probabilities = result.probabilities[0];
            const maxProbIndex = probabilities.indexOf(Math.max(...probabilities));
            
            setLivePrediction({
              healthStatus: prediction,
              confidence: (probabilities[maxProbIndex] * 100).toFixed(1),
              probabilities: result.probabilities[0],
              classes: result.classes
            });
          }
        } catch (err) {
          console.warn('Live prediction failed:', err);
          setLivePrediction(null);
        }
      } else {
        setLivePrediction(null);
      }
    }, 1000); // Debounce 1 second

    return () => clearTimeout(timer);
  }, [formData.ph, formData.temperature, formData.humidity, modelInfo, predict]);
  return (
    <div style={{ marginBottom: '40px' }}>
      <PageHeader 
        title="Add New Entry" 
        subtitle="Record plant monitoring data"
        theme={theme} 
        isDarkMode={isDarkMode} 
        onToggleTheme={onToggleTheme}
      />

      {error && <div style={{ 
        color: '#ff6b6b', 
        fontSize: '16px', 
        marginBottom: '24px', 
        textAlign: 'center',
        padding: '12px',
        background: isDarkMode ? 'rgba(255, 107, 107, 0.1)' : 'rgba(255, 107, 107, 0.05)',
        borderRadius: '8px',
        border: `1px solid ${isDarkMode ? 'rgba(255, 107, 107, 0.3)' : 'rgba(255, 107, 107, 0.2)'}`
      }}>{error}</div>}

      {/* Live Health Prediction */}
      {modelInfo?.model_exists && (formData.ph || formData.temperature || formData.humidity) && (
        <div style={{
          background: theme.card,
          borderRadius: '16px',
          padding: '24px',
          border: `1px solid ${theme.border}`,
          boxShadow: isDarkMode ? '0 4px 20px rgba(0, 0, 0, 0.3)' : '0 2px 10px rgba(0, 0, 0, 0.1)',
          marginBottom: '24px'
        }}>
          <h3 style={{ 
            color: theme.text, 
            fontSize: '18px', 
            fontWeight: 'bold',
            marginBottom: '16px',
            display: 'flex',
            alignItems: 'center',
            gap: '8px'
          }}>
            <span>🔮</span> Live Health Prediction
          </h3>
          
          {predicting && (
            <p style={{ color: theme.textMuted, fontSize: '14px' }}>Analyzing data...</p>
          )}

          {!predicting && livePrediction && (
            <div>
              <div style={{
                background: getHealthStatusStyle(livePrediction.healthStatus).bgColor,
                padding: '16px',
                borderRadius: '12px',
                border: `2px solid ${getHealthStatusStyle(livePrediction.healthStatus).color}40`,
                marginBottom: '12px'
              }}>
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                  <div>
                    <p style={{ color: theme.textMuted, fontSize: '12px', margin: 0, marginBottom: '4px' }}>
                      Predicted Status
                    </p>
                    <p style={{ 
                      color: getHealthStatusStyle(livePrediction.healthStatus).color,
                      fontSize: '24px',
                      fontWeight: 'bold',
                      margin: 0
                    }}>
                      {livePrediction.healthStatus}
                    </p>
                  </div>
                  <div>
                    <p style={{ color: theme.textMuted, fontSize: '12px', margin: 0, marginBottom: '4px' }}>
                      Confidence
                    </p>
                    <p style={{ color: theme.text, fontSize: '20px', fontWeight: 'bold', margin: 0 }}>
                      {livePrediction.confidence}%
                    </p>
                  </div>
                </div>
              </div>
              <p style={{ color: theme.textMuted, fontSize: '12px', margin: 0, fontStyle: 'italic' }}>
                Prediction updates automatically as you fill the form. Submit to save this entry.
              </p>
            </div>
          )}

          {!predicting && !livePrediction && formData.ph && formData.temperature && formData.humidity && (
            <p style={{ color: theme.textMuted, fontSize: '14px' }}>
              Fill in pH, Temperature, and Humidity to see live prediction
            </p>
          )}
        </div>
      )}

      <div style={{ 
        background: theme.card,
        borderRadius: '16px',
        padding: '32px',
        border: `1px solid ${theme.border}`,
        boxShadow: isDarkMode ? '0 4px 20px rgba(0, 0, 0, 0.3)' : '0 2px 10px rgba(0, 0, 0, 0.1)'
      }}>
        <div style={{ display: 'grid', gap: '32px', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', marginBottom: '40px' }}>
          <div>
            <label style={{ ...styles.label, fontSize: '16px', marginBottom: '12px' }}>
              <Calendar size={20} style={{ marginRight: '8px', color: theme.accent }} />
              Date
            </label>
            <input 
              type="date" 
              value={formData.date} 
              onChange={(e) => setFormData((prev) => ({ ...prev, date: e.target.value }))} 
              style={{ ...styles.input, width: '90%', fontSize: '16px', padding: '12px 16px' }} 
              placeholder="Select date"
              required 
            />
          </div>

          <div>
            <label style={{ ...styles.label, fontSize: '16px', marginBottom: '12px' }}>
              <Droplets size={20} style={{ marginRight: '8px', color: theme.accent }} />
              pH Level
            </label>
            <input 
              type="number" 
              step="0.1" 
              value={formData.ph} 
              onChange={(e) => setFormData((prev) => ({ ...prev, ph: e.target.value }))} 
              style={{ ...styles.input, width: '90%', fontSize: '16px', padding: '12px 16px' }} 
              placeholder="Enter pH value (0-14)"
              required 
            />
          </div>

          <div>
            <label style={{ ...styles.label, fontSize: '16px', marginBottom: '12px' }}>
              <TrendingUp size={20} style={{ marginRight: '8px', color: theme.accent }} />
              TDS (ppm)
            </label>
            <input 
              type="number" 
              step="0.1" 
              value={formData.tds} 
              onChange={(e) => setFormData((prev) => ({ ...prev, tds: e.target.value }))} 
              style={{ ...styles.input, width: '90%', fontSize: '16px', padding: '12px 16px' }} 
              placeholder="Enter TDS value in ppm"
              required 
            />
          </div>

          <div>
            <label style={{ ...styles.label, fontSize: '16px', marginBottom: '12px' }}>
              <TrendingUp size={20} style={{ marginRight: '8px', color: theme.accent }} />
              Temperature (°C)
            </label>
            <input 
              type="number" 
              step="0.1" 
              value={formData.temperature} 
              onChange={(e) => setFormData((prev) => ({ ...prev, temperature: e.target.value }))} 
              style={{ ...styles.input, width: '90%', fontSize: '16px', padding: '12px 16px' }} 
              placeholder="Enter temperature in °C"
              required 
            />
          </div>

          <div>
            <label style={{ ...styles.label, fontSize: '16px', marginBottom: '12px' }}>
              <Droplets size={20} style={{ marginRight: '8px', color: theme.accent }} />
              Humidity (%)
            </label>
            <input 
              type="number" 
              step="0.1" 
              value={formData.humidity} 
              onChange={(e) => setFormData((prev) => ({ ...prev, humidity: e.target.value }))} 
              style={{ ...styles.input, width: '90%', fontSize: '16px', padding: '12px 16px' }} 
              placeholder="Enter humidity percentage (0-100)"
              required 
            />
          </div>

          <div>
            <label style={{ ...styles.label, fontSize: '16px', marginBottom: '12px' }}>
              <Droplets size={20} style={{ marginRight: '8px', color: theme.accent }} />
              Dissolved Oxygen (mg/L)
            </label>
            <input 
              type="number" 
              step="0.1" 
              value={formData.dissolvedOxy} 
              onChange={(e) => setFormData((prev) => ({ ...prev, dissolvedOxy: e.target.value }))} 
              style={{ ...styles.input, width: '90%', fontSize: '16px', padding: '12px 16px' }} 
              placeholder="Enter dissolved oxygen in mg/L"
              required 
            />
          </div>
        </div>

        <div style={{ display: 'flex', gap: '16px', justifyContent: 'center' }}>
          <button 
            type="button" 
            onClick={handleSubmit} 
            style={{ 
              ...styles.submitButton, 
              fontSize: '16px', 
              padding: '14px 32px',
              background: theme.accent,
              opacity: 0.7,
              color: 'black',
              minWidth: '150px'
            }}
          >
            Save Entry
          </button>
          <button 
            type="button" 
            onClick={handleResetForm} 
            style={{ 
              ...styles.resetButton, 
              fontSize: '16px', 
              padding: '14px 32px',
              minWidth: '150px'
            }}
          >
            Reset Form
          </button>
        </div>
      </div>
    </div>
  );
};

export default EntryPage;


