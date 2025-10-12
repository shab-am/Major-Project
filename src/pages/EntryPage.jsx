import React from 'react';
import { Calendar, TrendingUp, Droplets } from 'lucide-react';
import PageHeader from '../components/PageHeader';

const EntryPage = ({ styles, formData, setFormData, handleSubmit, handleResetForm, error, theme, isDarkMode, onToggleTheme }) => {
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


