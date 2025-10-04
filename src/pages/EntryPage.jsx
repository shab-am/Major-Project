import React from 'react';
import { Calendar, TrendingUp, Droplets } from 'lucide-react';

const EntryPage = ({ styles, formData, setFormData, handleSubmit, handleResetForm, error, theme }) => {
  return (
    <div style={styles.container}>
      <div style={styles.card}>
        <div style={{ display: 'flex', justifyContent: 'center', marginBottom: 8 }}>
          <h1 style={{ ...styles.pageTitle, textAlign: 'center' }}>Add New Entry</h1>
        </div>

        {error && <div style={{ color: theme.accent, fontSize: '1rem', marginBottom: 16, textAlign: 'center' }}>{error}</div>}

        <div style={{ marginTop: 32 }}>
          <div style={{ display: 'grid', gap: 32, gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', marginBottom: 32 }}>
            <div>
              <label style={styles.label}><Calendar size={16} />Date</label>
              <input type="date" value={formData.date} onChange={(e) => setFormData((prev) => ({ ...prev, date: e.target.value }))} style={styles.input} required />
            </div>

            <div>
              <label style={styles.label}><Droplets size={16} />pH Level</label>
              <input type="number" step="0.1" value={formData.ph} onChange={(e) => setFormData((prev) => ({ ...prev, ph: e.target.value }))} style={styles.input} required />
            </div>

            <div>
              <label style={styles.label}><TrendingUp size={16} />TDS (ppm)</label>
              <input type="number" step="0.1" value={formData.tds} onChange={(e) => setFormData((prev) => ({ ...prev, tds: e.target.value }))} style={styles.input} required />
            </div>

            <div>
              <label style={styles.label}><TrendingUp size={16} />Temperature (°C)</label>
              <input type="number" step="0.1" value={formData.temperature} onChange={(e) => setFormData((prev) => ({ ...prev, temperature: e.target.value }))} style={styles.input} required />
            </div>

            <div>
              <label style={styles.label}><Droplets size={16} />Humidity (%)</label>
              <input type="number" step="0.1" value={formData.humidity} onChange={(e) => setFormData((prev) => ({ ...prev, humidity: e.target.value }))} style={styles.input} required />
            </div>

            <div>
              <label style={styles.label}><Droplets size={16} />Dissolved Oxygen (mg/L)</label>
              <input type="number" step="0.1" value={formData.dissolvedOxy} onChange={(e) => setFormData((prev) => ({ ...prev, dissolvedOxy: e.target.value }))} style={styles.input} required />
            </div>
          </div>

          <div style={{ display: 'flex', gap: 16 }}>
            <button type="button" onClick={handleSubmit} style={styles.submitButton}>Save Entry</button>
            <button type="button" onClick={handleResetForm} style={styles.resetButton}>Reset Form</button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default EntryPage;


