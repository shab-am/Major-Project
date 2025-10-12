# Hardware Connectivity Setup Guide

This document outlines the setup and implementation of real-time hardware connectivity for the HydroMonitor application.

## 📁 Directory Structure

```
src/
├── services/           # Backend communication services
│   ├── apiService.js           # Main API service for HTTP/WebSocket communication
│   └── hardwareConfigService.js # Hardware configuration management
├── hooks/              # Custom React hooks
│   ├── useWebSocket.js         # WebSocket connection management
│   └── useHardwareData.js      # Real-time hardware data processing
├── utils/              # Utility functions
│   └── dataProcessing.js       # Data validation, smoothing, and analysis
└── types/              # Type definitions and constants
    └── hardwareTypes.js       # Hardware data types and configurations
```

## 🔧 Required Backend Setup

### 1. Node.js Backend Server

Create a backend server with the following endpoints:

```javascript
// Example Express.js server structure
const express = require('express');
const WebSocket = require('ws');
const cors = require('cors');

const app = express();
app.use(cors());
app.use(express.json());

// HTTP API Endpoints
app.get('/api/readings', (req, res) => {
  // Return sensor readings from database
});

app.post('/api/readings', (req, res) => {
  // Save new sensor reading
});

app.get('/api/hardware/status', (req, res) => {
  // Return hardware device status
});

app.post('/api/hardware/calibrate/:sensorId', (req, res) => {
  // Calibrate specific sensor
});

// WebSocket Server
const wss = new WebSocket.Server({ port: 5001 });

wss.on('connection', (ws) => {
  console.log('Hardware device connected');
  
  ws.on('message', (message) => {
    // Process incoming hardware data
    const data = JSON.parse(message);
    // Broadcast to all connected clients
    wss.clients.forEach(client => {
      if (client.readyState === WebSocket.OPEN) {
        client.send(JSON.stringify(data));
      }
    });
  });
});
```

### 2. Hardware Device Integration

#### Arduino/ESP32 Example
```cpp
#include <WiFi.h>
#include <WebSocketsClient.h>

const char* ssid = "YOUR_WIFI_SSID";
const char* password = "YOUR_WIFI_PASSWORD";
const char* websocket_server = "ws://YOUR_SERVER_IP:5001";

WebSocketsClient webSocket;

void setup() {
  Serial.begin(115200);
  
  // Connect to WiFi
  WiFi.begin(ssid, password);
  while (WiFi.status() != WL_CONNECTED) {
    delay(1000);
    Serial.println("Connecting to WiFi...");
  }
  
  // Connect to WebSocket server
  webSocket.begin(websocket_server);
  webSocket.onEvent(webSocketEvent);
}

void loop() {
  webSocket.loop();
  
  // Read sensor data
  float temperature = readTemperature();
  float ph = readPH();
  float tds = readTDS();
  float humidity = readHumidity();
  float dissolvedOxy = readDissolvedOxygen();
  
  // Send data every 5 seconds
  static unsigned long lastSend = 0;
  if (millis() - lastSend > 5000) {
    sendSensorData(temperature, ph, tds, humidity, dissolvedOxy);
    lastSend = millis();
  }
}

void sendSensorData(float temp, float ph, float tds, float hum, float oxy) {
  String json = "{";
  json += "\"type\":\"sensor_data\",";
  json += "\"data\":{";
  json += "\"temperature\":" + String(temp) + ",";
  json += "\"ph\":" + String(ph) + ",";
  json += "\"tds\":" + String(tds) + ",";
  json += "\"humidity\":" + String(hum) + ",";
  json += "\"dissolvedOxy\":" + String(oxy);
  json += "}}";
  
  webSocket.sendTXT(json);
}
```

## 🚀 Frontend Integration

### 1. Using the Hardware Data Hook

```javascript
import { useHardwareData } from './hooks/useHardwareData';

function BioSignalsPage() {
  const {
    sensorData,
    bioSignalData,
    hardwareStatus,
    alerts,
    isConnected,
    connectionState,
    getLatestReading,
    getActiveAlerts
  } = useHardwareData({
    autoConnect: true,
    smoothingWindow: 5,
    maxDataPoints: 1000
  });

  return (
    <div>
      <div>Connection Status: {connectionState}</div>
      <div>Latest Reading: {JSON.stringify(getLatestReading())}</div>
      <div>Active Alerts: {getActiveAlerts().length}</div>
      {/* Your charts and visualizations */}
    </div>
  );
}
```

### 2. Using the WebSocket Hook Directly

```javascript
import { useWebSocket } from './hooks/useWebSocket';

function RealTimeChart() {
  const { isConnected, lastMessage, connect, disconnect } = useWebSocket();
  
  useEffect(() => {
    connect();
    return () => disconnect();
  }, [connect, disconnect]);

  return (
    <div>
      <div>Connected: {isConnected ? 'Yes' : 'No'}</div>
      <div>Last Message: {JSON.stringify(lastMessage)}</div>
    </div>
  );
}
```

## 📊 Data Flow Architecture

```
Hardware Device (Arduino/ESP32)
    ↓ (WebSocket)
Backend Server (Node.js)
    ↓ (WebSocket)
Frontend Application (React)
    ↓ (useHardwareData Hook)
UI Components (Charts, Alerts, etc.)
```

## 🔧 Configuration

### Environment Variables

Create a `.env` file in your project root:

```env
REACT_APP_API_URL=http://localhost:5000
REACT_APP_WS_URL=ws://localhost:5001
REACT_APP_HARDWARE_TIMEOUT=5000
REACT_APP_MAX_RECONNECT_ATTEMPTS=5
```

### Hardware Configuration

```javascript
// Example hardware configuration
const hardwareConfig = {
  devices: [
    {
      id: 'device_001',
      type: 'arduino',
      ip: '192.168.1.100',
      sensors: [
        { id: 'temp_001', type: 'temperature', pin: 'A0' },
        { id: 'ph_001', type: 'ph', pin: 'A1' },
        { id: 'tds_001', type: 'tds', pin: 'A2' }
      ]
    }
  ]
};
```

## 🛠️ Installation & Setup

### 1. Install Dependencies

```bash
npm install ws cors express
```

### 2. Start Backend Server

```bash
node server.js
```

### 3. Start Frontend Application

```bash
npm start
```

### 4. Configure Hardware Device

1. Upload Arduino/ESP32 code to your device
2. Update WiFi credentials in the code
3. Update server IP address
4. Power on the device

## 📈 Features Implemented

- ✅ Real-time WebSocket communication
- ✅ Data validation and smoothing
- ✅ Outlier detection
- ✅ Automatic reconnection
- ✅ Hardware status monitoring
- ✅ Sensor calibration support
- ✅ Alert system
- ✅ Data caching and buffering
- ✅ Error handling and recovery

## 🔮 Future Enhancements

- [ ] MQTT protocol support
- [ ] OTA (Over-The-Air) updates
- [ ] Advanced signal processing
- [ ] Machine learning integration
- [ ] Multi-device support
- [ ] Data encryption
- [ ] Offline data storage
- [ ] Advanced analytics

## 🐛 Troubleshooting

### Common Issues

1. **WebSocket Connection Failed**
   - Check server is running
   - Verify IP address and port
   - Check firewall settings

2. **No Data Received**
   - Verify hardware device is connected
   - Check sensor wiring
   - Monitor serial output for errors

3. **Data Quality Issues**
   - Calibrate sensors
   - Check for electrical interference
   - Verify sensor placement

### Debug Mode

Enable debug logging by setting:

```javascript
localStorage.setItem('debug', 'true');
```

This will enable detailed console logging for all hardware communication.
