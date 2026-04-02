import React, { useState, useEffect } from 'react';
import PageHeader from '../components/PageHeader';

const HardwareInterfacePage = ({ styles, theme, isDarkMode, onToggleTheme }) => {
  const [connectionStatus, setConnectionStatus] = useState('disconnected');
  const [connectedDevice, setConnectedDevice] = useState(null);
  const [sensorData, setSensorData] = useState(null);
  const [isReading, setIsReading] = useState(false);
  const [port, setPort] = useState(null);
  const [baudRate, setBaudRate] = useState('9600');

  // Check for Web Serial API support
  const isSerialSupported = 'serial' in navigator;

  // Connect to Arduino/Raspberry Pi via Serial
  const connectDevice = async () => {
    if (!isSerialSupported) {
      alert('Web Serial API is not supported in this browser. Please use Chrome, Edge, or Opera.');
      return;
    }

    try {
      const serialPort = await navigator.serial.requestPort();
      await serialPort.open({ baudRate: parseInt(baudRate) });
      
      setPort(serialPort);
      setConnectionStatus('connected');
      setConnectedDevice(serialPort.getInfo());
      
      // Start reading data
      readSerialData(serialPort);
    } catch (err) {
      console.error('Error connecting to device:', err);
      if (err.name !== 'NotFoundError') {
        alert('Failed to connect to device: ' + err.message);
      }
    }
  };

  // Read data from serial port
  const readSerialData = async (serialPort) => {
    if (!serialPort) return;

    setIsReading(true);
    const reader = serialPort.readable.getReader();
    const decoder = new TextDecoder();

    try {
      while (true) {
        const { value, done } = await reader.read();
        if (done) break;

        const text = decoder.decode(value);
        const lines = text.split('\n').filter(line => line.trim());
        
        for (const line of lines) {
          try {
            // Try to parse JSON data
            const data = JSON.parse(line);
            setSensorData(data);
          } catch {
            // If not JSON, try CSV format: pH,temp,humidity,etc
            const values = line.split(',').map(v => parseFloat(v.trim()));
            if (values.length >= 3) {
              setSensorData({
                ph: values[0],
                temperature: values[1],
                humidity: values[2],
                timestamp: new Date().toISOString()
              });
            }
          }
        }
      }
    } catch (err) {
      console.error('Error reading serial data:', err);
    } finally {
      reader.releaseLock();
      setIsReading(false);
    }
  };

  // Disconnect device
  const disconnectDevice = async () => {
    if (port) {
      try {
        await port.close();
      } catch (err) {
        console.error('Error closing port:', err);
      }
    }
    setPort(null);
    setConnectionStatus('disconnected');
    setConnectedDevice(null);
    setSensorData(null);
    setIsReading(false);
  };

  return (
    <div style={{ marginBottom: '40px' }}>
      <PageHeader 
        title="Hardware Interface" 
        subtitle="Connect Arduino/Raspberry Pi for live sensor data"
        theme={theme} 
        isDarkMode={isDarkMode} 
        onToggleTheme={onToggleTheme}
      />

      {/* Connection Status */}
      <div style={{
        background: theme.card,
        borderRadius: '16px',
        padding: '24px',
        border: `1px solid ${theme.border}`,
        boxShadow: isDarkMode ? '0 4px 20px rgba(0, 0, 0, 0.3)' : '0 2px 10px rgba(0, 0, 0, 0.1)',
        marginBottom: '24px'
      }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '20px' }}>
          <div>
            <h3 style={{ color: theme.text, fontSize: '20px', fontWeight: 'bold', margin: 0, marginBottom: '8px' }}>
              Device Connection
            </h3>
            <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
              <div style={{
                width: '12px',
                height: '12px',
                borderRadius: '50%',
                backgroundColor: connectionStatus === 'connected' ? '#4ade80' : '#f87171',
                boxShadow: connectionStatus === 'connected' 
                  ? '0 0 12px rgba(74, 222, 128, 0.6)' 
                  : 'none'
              }} />
              <span style={{ color: theme.text, fontWeight: '600' }}>
                {connectionStatus === 'connected' ? 'Connected' : 'Not Connected'}
              </span>
            </div>
          </div>

          {connectionStatus === 'connected' ? (
            <button
              onClick={disconnectDevice}
              style={{
                padding: '10px 20px',
                borderRadius: '8px',
                border: 'none',
                background: '#f87171',
                color: 'white',
                fontSize: '14px',
                fontWeight: '600',
                cursor: 'pointer',
                transition: 'all 0.2s ease'
              }}
              onMouseEnter={(e) => {
                e.target.style.transform = 'translateY(-2px)';
                e.target.style.boxShadow = '0 4px 12px rgba(248, 113, 113, 0.4)';
              }}
              onMouseLeave={(e) => {
                e.target.style.transform = 'translateY(0)';
                e.target.style.boxShadow = 'none';
              }}
            >
              Disconnect
            </button>
          ) : (
            <button
              onClick={connectDevice}
              disabled={!isSerialSupported}
              style={{
                padding: '10px 20px',
                borderRadius: '8px',
                border: 'none',
                background: isSerialSupported ? theme.accent : theme.surface,
                color: isSerialSupported ? 'black' : theme.textMuted,
                fontSize: '14px',
                fontWeight: '600',
                cursor: isSerialSupported ? 'pointer' : 'not-allowed',
                opacity: isSerialSupported ? 1 : 0.6,
                transition: 'all 0.2s ease'
              }}
              onMouseEnter={(e) => {
                if (isSerialSupported) {
                  e.target.style.transform = 'translateY(-2px)';
                  e.target.style.boxShadow = `0 4px 12px ${theme.accent}40`;
                }
              }}
              onMouseLeave={(e) => {
                e.target.style.transform = 'translateY(0)';
                e.target.style.boxShadow = 'none';
              }}
            >
              Connect Device
            </button>
          )}
        </div>

        {!isSerialSupported && (
          <div style={{
            background: theme.surface,
            padding: '12px',
            borderRadius: '8px',
            border: `1px solid ${theme.border}`,
            marginTop: '12px'
          }}>
            <p style={{ color: theme.textMuted, fontSize: '12px', margin: 0 }}>
              ⚠️ Web Serial API requires Chrome, Edge, or Opera browser. 
              For other browsers, use the manual entry form.
            </p>
          </div>
        )}

        {connectionStatus === 'connected' && (
          <div style={{
            background: theme.surface,
            padding: '12px',
            borderRadius: '8px',
            border: `1px solid ${theme.border}`,
            marginTop: '12px'
          }}>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '8px', fontSize: '12px' }}>
              <div>
                <span style={{ color: theme.textMuted }}>Baud Rate: </span>
                <span style={{ color: theme.text, fontWeight: '600' }}>{baudRate}</span>
              </div>
              <div>
                <span style={{ color: theme.textMuted }}>Status: </span>
                <span style={{ color: isReading ? '#4ade80' : theme.textMuted, fontWeight: '600' }}>
                  {isReading ? 'Reading Data' : 'Idle'}
                </span>
              </div>
            </div>
          </div>
        )}

        {connectionStatus === 'disconnected' && (
          <div style={{
            background: theme.surface,
            padding: '12px',
            borderRadius: '8px',
            border: `1px solid ${theme.border}`,
            marginTop: '12px'
          }}>
            <label style={{ color: theme.text, fontSize: '12px', display: 'block', marginBottom: '8px' }}>
              Baud Rate:
            </label>
            <select
              value={baudRate}
              onChange={(e) => setBaudRate(e.target.value)}
              style={{
                padding: '8px',
                borderRadius: '6px',
                border: `1px solid ${theme.border}`,
                background: theme.bg,
                color: theme.text,
                fontSize: '14px',
                width: '100%'
              }}
            >
              <option value="9600">9600</option>
              <option value="115200">115200</option>
              <option value="57600">57600</option>
              <option value="38400">38400</option>
            </select>
          </div>
        )}
      </div>

      {/* Live Sensor Data */}
      {connectionStatus === 'connected' && (
        <div style={{
          background: theme.card,
          borderRadius: '16px',
          padding: '24px',
          border: `1px solid ${theme.border}`,
          boxShadow: isDarkMode ? '0 4px 20px rgba(0, 0, 0, 0.3)' : '0 2px 10px rgba(0, 0, 0, 0.1)',
          marginBottom: '24px'
        }}>
          <h3 style={{ color: theme.text, fontSize: '20px', fontWeight: 'bold', marginBottom: '20px' }}>
            Live Sensor Readings
          </h3>

          {sensorData ? (
            <div style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
              gap: '16px'
            }}>
              {Object.entries(sensorData).map(([key, value]) => {
                if (key === 'timestamp') return null;
                return (
                  <div key={key} style={{
                    background: theme.surface,
                    padding: '16px',
                    borderRadius: '12px',
                    border: `1px solid ${theme.border}`
                  }}>
                    <div style={{ color: theme.textMuted, fontSize: '12px', marginBottom: '4px' }}>
                      {key.charAt(0).toUpperCase() + key.slice(1).replace(/_/g, ' ')}
                    </div>
                    <div style={{ color: theme.text, fontSize: '20px', fontWeight: 'bold' }}>
                      {typeof value === 'number' ? value.toFixed(2) : value}
                    </div>
                  </div>
                );
              })}
            </div>
          ) : (
            <div style={{
              background: theme.surface,
              padding: '24px',
              borderRadius: '12px',
              textAlign: 'center',
              border: `1px solid ${theme.border}`
            }}>
              <p style={{ color: theme.textMuted, fontSize: '14px', margin: 0 }}>
                {isReading ? 'Waiting for sensor data...' : 'No data received yet'}
              </p>
            </div>
          )}
        </div>
      )}

      {/* Instructions */}
      <div style={{
        background: theme.surface,
        borderRadius: '16px',
        padding: '24px',
        border: `1px solid ${theme.border}`
      }}>
        <h3 style={{ color: theme.text, fontSize: '18px', fontWeight: 'bold', marginBottom: '16px' }}>
          Setup Instructions
        </h3>
        <div style={{ display: 'grid', gap: '12px' }}>
          <div>
            <h4 style={{ color: theme.text, fontSize: '14px', fontWeight: '600', marginBottom: '8px' }}>
              1. Arduino Setup
            </h4>
            <p style={{ color: theme.textMuted, fontSize: '13px', lineHeight: '1.6', margin: 0 }}>
              Upload code to Arduino that reads sensors and sends data via Serial in JSON or CSV format.
              Example: <code style={{ background: theme.bg, padding: '2px 6px', borderRadius: '4px' }}>
                {"{"}"pH":6.5,"temperature":23.2,"humidity":60{"}"}
              </code>
            </p>
          </div>
          <div>
            <h4 style={{ color: theme.text, fontSize: '14px', fontWeight: '600', marginBottom: '8px' }}>
              2. Raspberry Pi Setup
            </h4>
            <p style={{ color: theme.textMuted, fontSize: '13px', lineHeight: '1.6', margin: 0 }}>
              Run Python script that reads sensors and outputs to serial port. Ensure proper permissions for serial access.
            </p>
          </div>
          <div>
            <h4 style={{ color: theme.text, fontSize: '14px', fontWeight: '600', marginBottom: '8px' }}>
              3. Data Format
            </h4>
            <p style={{ color: theme.textMuted, fontSize: '13px', lineHeight: '1.6', margin: 0 }}>
              Send data as JSON: <code style={{ background: theme.bg, padding: '2px 6px', borderRadius: '4px' }}>
                {"{"}"ph":6.5,"temperature":23,"humidity":60{"}"}
              </code> or CSV: <code style={{ background: theme.bg, padding: '2px 6px', borderRadius: '4px' }}>
                6.5,23,60
              </code>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default HardwareInterfacePage;

