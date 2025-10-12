/**
 * TypeScript-style type definitions for hardware data
 * These can be used for documentation and future TypeScript migration
 */

// Sensor data types
export const SensorTypes = {
  TEMPERATURE: 'temperature',
  PH: 'ph',
  TDS: 'tds',
  HUMIDITY: 'humidity',
  DISSOLVED_OXYGEN: 'dissolvedOxy',
  BIOELECTRICAL: 'bioelectrical',
  LIGHT: 'light',
  PRESSURE: 'pressure'
};

// Hardware device types
export const DeviceTypes = {
  ARDUINO: 'arduino',
  RASPBERRY_PI: 'raspberry_pi',
  ESP32: 'esp32',
  SENSOR_MODULE: 'sensor_module'
};

// Connection states
export const ConnectionStates = {
  DISCONNECTED: 'DISCONNECTED',
  CONNECTING: 'CONNECTING',
  CONNECTED: 'CONNECTED',
  CLOSING: 'CLOSING',
  ERROR: 'ERROR'
};

// Data quality levels
export const DataQuality = {
  EXCELLENT: 'Excellent',
  GOOD: 'Good',
  FAIR: 'Fair',
  POOR: 'Poor'
};

// Plant stress levels
export const StressLevels = {
  LOW: 'low',
  MODERATE: 'moderate',
  HIGH: 'high',
  CRITICAL: 'critical'
};

// Alert types
export const AlertTypes = {
  INFO: 'info',
  WARNING: 'warning',
  ERROR: 'error',
  CRITICAL: 'critical'
};

// Data structure templates
export const DataStructures = {
  SensorReading: {
    id: 'string',
    timestamp: 'string',
    sensorType: 'string',
    value: 'number',
    unit: 'string',
    quality: 'string',
    deviceId: 'string'
  },
  
  HardwareStatus: {
    deviceId: 'string',
    deviceType: 'string',
    isConnected: 'boolean',
    lastSeen: 'string',
    batteryLevel: 'number',
    signalStrength: 'number',
    firmwareVersion: 'string',
    sensors: 'array'
  },
  
  BioSignalData: {
    timestamp: 'string',
    channel1: 'array',
    channel2: 'array',
    sampleRate: 'number',
    features: 'object',
    quality: 'string'
  },
  
  PlantData: {
    id: 'string',
    timestamp: 'string',
    temperature: 'number',
    ph: 'number',
    tds: 'number',
    humidity: 'number',
    dissolvedOxy: 'number',
    plantType: 'string',
    location: 'string'
  }
};

// Configuration templates
export const ConfigTemplates = {
  SensorConfig: {
    sensorId: 'string',
    sensorType: 'string',
    calibrationOffset: 'number',
    calibrationScale: 'number',
    samplingRate: 'number',
    enabled: 'boolean'
  },
  
  DeviceConfig: {
    deviceId: 'string',
    deviceType: 'string',
    connectionType: 'string',
    ipAddress: 'string',
    port: 'number',
    timeout: 'number',
    retryAttempts: 'number'
  },
  
  AlertConfig: {
    alertId: 'string',
    alertType: 'string',
    threshold: 'number',
    enabled: 'boolean',
    notificationMethods: 'array'
  }
};

// API endpoint definitions
export const ApiEndpoints = {
  READINGS: '/api/readings',
  HARDWARE_STATUS: '/api/hardware/status',
  CALIBRATE_SENSOR: '/api/hardware/calibrate',
  DEVICE_CONFIG: '/api/hardware/config',
  ALERTS: '/api/alerts',
  PLANTS: '/api/plants',
  ANALYTICS: '/api/analytics'
};

// WebSocket message types
export const WebSocketMessageTypes = {
  SENSOR_DATA: 'sensor_data',
  BIO_SIGNAL: 'bio_signal',
  DEVICE_STATUS: 'device_status',
  ALERT: 'alert',
  CALIBRATION_RESULT: 'calibration_result',
  HEARTBEAT: 'heartbeat'
};

export default {
  SensorTypes,
  DeviceTypes,
  ConnectionStates,
  DataQuality,
  StressLevels,
  AlertTypes,
  DataStructures,
  ConfigTemplates,
  ApiEndpoints,
  WebSocketMessageTypes
};
