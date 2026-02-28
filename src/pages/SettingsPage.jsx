import React, { useRef, useState } from 'react';
import PageHeader from '../components/PageHeader';

const SettingsPage = ({ styles, theme, isDarkMode, onToggleTheme, onImportCSV }) => {
  const fileInputRef = useRef(null);
  const [importStatus, setImportStatus] = useState(null);

  const handleCSVImport = (event) => {
    const file = event.target.files[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (e) => {
      try {
        const csv = e.target.result;
        const lines = csv.split('\n').filter(line => line.trim());
        
        if (lines.length < 2) {
          setImportStatus({ type: 'error', message: 'Invalid CSV file: No data found.' });
          return;
        }

        const headers = lines[0].split(',').map(header => header.trim().toLowerCase());
        
        // Check for required headers
        const requiredHeaders = ['id', 'timestamp', 'temperature', 'ph', 'tds', 'humidity'];
        const hasRequired = requiredHeaders.every(h => headers.includes(h));
        
        if (!hasRequired) {
          setImportStatus({ 
            type: 'error', 
            message: 'Invalid CSV file: Required headers missing. Need: id, timestamp, temperature, ph, tds, humidity' 
          });
          return;
        }

        // Parse CSV data
        const importedData = lines.slice(1).map((line, index) => {
          const values = line.split(',').map(val => val.trim());
          const entry = {};
          headers.forEach((header, idx) => {
            entry[header] = values[idx] || '';
          });
          
          return {
            id: entry.id || Date.now() + index,
            timestamp: entry.timestamp || new Date().toISOString(),
            temperature: parseFloat(entry.temperature) || 0,
            ph: parseFloat(entry.ph) || 0,
            tds: parseFloat(entry.tds) || 0,
            humidity: parseFloat(entry.humidity) || 0,
            dissolvedOxy: parseFloat(entry.dissolvedoxy || entry['dissolved oxygen'] || entry.dissolved_oxygen) || 0,
          };
        }).filter(entry => entry.id && entry.timestamp);

        if (importedData.length === 0) {
          setImportStatus({ type: 'error', message: 'No valid data found in CSV file.' });
          return;
        }

        // Call parent handler to add to database
        if (onImportCSV) {
          onImportCSV(importedData);
          setImportStatus({ 
            type: 'success', 
            message: `Successfully imported ${importedData.length} entries to database!` 
          });
          
          // Clear status after 3 seconds
          setTimeout(() => setImportStatus(null), 3000);
        }

        // Reset file input
        if (fileInputRef.current) {
          fileInputRef.current.value = '';
        }
      } catch (err) {
        setImportStatus({ type: 'error', message: `Error importing CSV: ${err.message}` });
      }
    };

    reader.onerror = () => {
      setImportStatus({ type: 'error', message: 'Error reading CSV file.' });
    };

    reader.readAsText(file);
  };
  return (
    <div style={{ marginBottom: '40px' }}>
      <PageHeader 
        title="Settings" 
        subtitle="System configuration and preferences"
        theme={theme} 
        isDarkMode={isDarkMode} 
        onToggleTheme={onToggleTheme}
      />
      
      <div style={{ 
        display: 'grid', 
        gap: '24px', 
        gridTemplateColumns: 'repeat(auto-fit, minmax(350px, 1fr))' 
      }}>
        <div style={{
          background: theme.card,
          borderRadius: '16px',
          padding: '24px',
          border: `1px solid ${theme.border}`,
          boxShadow: isDarkMode ? '0 4px 20px rgba(0, 0, 0, 0.3)' : '0 2px 10px rgba(0, 0, 0, 0.1)',
          transition: 'all 0.2s ease',
          height: 'fit-content'
        }}
        onMouseEnter={(e) => {
          e.currentTarget.style.transform = 'translateY(-2px)';
          e.currentTarget.style.boxShadow = isDarkMode 
            ? '0 8px 25px rgba(0, 0, 0, 0.4)' 
            : '0 8px 25px rgba(0, 0, 0, 0.15)';
        }}
        onMouseLeave={(e) => {
          e.currentTarget.style.transform = 'translateY(0)';
          e.currentTarget.style.boxShadow = isDarkMode ? '0 4px 20px rgba(0, 0, 0, 0.3)' : '0 2px 10px rgba(0, 0, 0, 0.1)';
        }}
        >
          <div style={{ 
            display: 'flex',
            alignItems: 'center',
            gap: '12px',
            marginBottom: '20px'
          }}>
            <div style={{
              width: '8px',
              height: '8px',
              borderRadius: '50%',
              background: '#3b82f6',
              boxShadow: '0 0 10px #3b82f640'
            }} />
            <h3 style={{ 
              fontSize: '18px',
              fontWeight: 'bold', 
              color: theme.text,
              margin: 0
            }}>Connection Settings</h3>
          </div>
          <div style={{ marginBottom: '20px' }}>
            <label style={{ 
              display: 'block', 
              marginBottom: '8px', 
              color: theme.text,
              fontWeight: '600',
              fontSize: '14px'
            }}>
              WebSocket URL
            </label>
            <input 
              style={{ 
                width: '100%', 
                padding: '12px 16px', 
                borderRadius: '8px', 
                border: `1px solid ${theme.border}`, 
                background: theme.surface, 
                color: theme.text,
                fontSize: '14px',
                boxSizing: 'border-box'
              }} 
              defaultValue="ws://localhost:5000/signals" 
            />
          </div>
          <div>
            <label style={{ 
              display: 'block', 
              marginBottom: '8px', 
              color: theme.text,
              fontWeight: '600',
              fontSize: '14px'
            }}>
              Connection Timeout (ms)
            </label>
            <input 
              type="number"
              style={{ 
                width: '100%', 
                padding: '12px 16px', 
                borderRadius: '8px', 
                border: `1px solid ${theme.border}`, 
                background: theme.surface, 
                color: theme.text,
                fontSize: '14px',
                boxSizing: 'border-box'
              }} 
              defaultValue="5000" 
            />
          </div>
        </div>

        <div style={{
          background: theme.card,
          borderRadius: '16px',
          padding: '24px',
          border: `1px solid ${theme.border}`,
          boxShadow: isDarkMode ? '0 4px 20px rgba(0, 0, 0, 0.3)' : '0 2px 10px rgba(0, 0, 0, 0.1)',
          transition: 'all 0.2s ease',
          height: 'fit-content'
        }}
        onMouseEnter={(e) => {
          e.currentTarget.style.transform = 'translateY(-2px)';
          e.currentTarget.style.boxShadow = isDarkMode 
            ? '0 8px 25px rgba(0, 0, 0, 0.4)' 
            : '0 8px 25px rgba(0, 0, 0, 0.15)';
        }}
        onMouseLeave={(e) => {
          e.currentTarget.style.transform = 'translateY(0)';
          e.currentTarget.style.boxShadow = isDarkMode ? '0 4px 20px rgba(0, 0, 0, 0.3)' : '0 2px 10px rgba(0, 0, 0, 0.1)';
        }}
        >
          <div style={{ 
            display: 'flex',
            alignItems: 'center',
            gap: '12px',
            marginBottom: '20px'
          }}>
            <div style={{
              width: '8px',
              height: '8px',
              borderRadius: '50%',
              background: '#10b981',
              boxShadow: '0 0 10px #10b98140'
            }} />
            <h3 style={{ 
              fontSize: '18px',
              fontWeight: 'bold', 
              color: theme.text,
              margin: 0
            }}>Data Processing</h3>
          </div>
          <div style={{ marginBottom: '20px' }}>
            <label style={{ 
              display: 'block', 
              marginBottom: '8px', 
              color: theme.text,
              fontWeight: '600',
              fontSize: '14px'
            }}>
              Buffer Size (points)
            </label>
            <input 
              type="number" 
              style={{ 
                width: '100%', 
                padding: '12px 16px', 
                borderRadius: '8px', 
                border: `1px solid ${theme.border}`, 
                background: theme.surface, 
                color: theme.text,
                fontSize: '14px',
                boxSizing: 'border-box'
              }} 
              defaultValue={1800} 
            />
          </div>
          <div>
            <label style={{ 
              display: 'block', 
              marginBottom: '8px', 
              color: theme.text,
              fontWeight: '600',
              fontSize: '14px'
            }}>
              Smoothing (EMA)
            </label>
            <input 
              type="number" 
              style={{ 
                width: '100%', 
                padding: '12px 16px', 
                borderRadius: '8px', 
                border: `1px solid ${theme.border}`, 
                background: theme.surface, 
                color: theme.text,
                fontSize: '14px',
                boxSizing: 'border-box'
              }} 
              defaultValue={0.2} 
              step="0.05" 
            />
          </div>
        </div>

        <div style={{
          background: theme.card,
          borderRadius: '16px',
          padding: '24px',
          border: `1px solid ${theme.border}`,
          boxShadow: isDarkMode ? '0 4px 20px rgba(0, 0, 0, 0.3)' : '0 2px 10px rgba(0, 0, 0, 0.1)',
          transition: 'all 0.2s ease',
          height: 'fit-content'
        }}
        onMouseEnter={(e) => {
          e.currentTarget.style.transform = 'translateY(-2px)';
          e.currentTarget.style.boxShadow = isDarkMode 
            ? '0 8px 25px rgba(0, 0, 0, 0.4)' 
            : '0 8px 25px rgba(0, 0, 0, 0.15)';
        }}
        onMouseLeave={(e) => {
          e.currentTarget.style.transform = 'translateY(0)';
          e.currentTarget.style.boxShadow = isDarkMode ? '0 4px 20px rgba(0, 0, 0, 0.3)' : '0 2px 10px rgba(0, 0, 0, 0.1)';
        }}
        >
          <div style={{ 
            display: 'flex',
            alignItems: 'center',
            gap: '12px',
            marginBottom: '20px'
          }}>
            <div style={{
              width: '8px',
              height: '8px',
              borderRadius: '50%',
              background: '#f59e0b',
              boxShadow: '0 0 10px #f59e0b40'
            }} />
            <h3 style={{ 
              fontSize: '18px',
              fontWeight: 'bold', 
              color: theme.text,
              margin: 0
            }}>CSV Import</h3>
          </div>
          
          {importStatus && (
            <div style={{
              padding: '12px',
              borderRadius: '8px',
              marginBottom: '16px',
              background: importStatus.type === 'success' 
                ? 'rgba(74, 222, 128, 0.2)' 
                : 'rgba(255, 107, 107, 0.2)',
              border: `1px solid ${importStatus.type === 'success' ? '#4ade80' : '#ff6b6b'}`,
              color: importStatus.type === 'success' ? '#4ade80' : '#ff6b6b',
              fontSize: '14px'
            }}>
              {importStatus.message}
            </div>
          )}

          <div style={{ marginBottom: '16px' }}>
            <p style={{ 
              color: theme.textMuted, 
              fontSize: '13px', 
              marginBottom: '12px',
              lineHeight: '1.5'
            }}>
              Import plant data from CSV file. Required columns: id, timestamp, temperature, ph, tds, humidity, dissolvedOxy
            </p>
            <input
              ref={fileInputRef}
              type="file"
              accept=".csv"
              onChange={handleCSVImport}
              style={{ display: 'none' }}
            />
            <button
              onClick={() => fileInputRef.current?.click()}
              style={{
                width: '100%',
                padding: '12px 16px',
                borderRadius: '8px',
                border: `2px dashed ${theme.border}`,
                background: theme.surface,
                color: theme.text,
                fontSize: '14px',
                fontWeight: '600',
                cursor: 'pointer',
                transition: 'all 0.2s ease',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: '8px'
              }}
              onMouseEnter={(e) => {
                e.target.style.borderColor = theme.accent;
                e.target.style.background = `${theme.accent}20`;
              }}
              onMouseLeave={(e) => {
                e.target.style.borderColor = theme.border;
                e.target.style.background = theme.surface;
              }}
            >
              <span>📁</span> Choose CSV File to Import
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default SettingsPage;


