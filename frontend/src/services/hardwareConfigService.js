/**
 * Hardware Configuration Service
 * Manages hardware device configuration and calibration
 */

import apiService from './apiService';

class HardwareConfigService {
  constructor() {
    this.configCache = new Map();
    this.calibrationCache = new Map();
  }

  // Device Configuration Methods
  async getDeviceConfig(deviceId) {
    try {
      // Check cache first
      if (this.configCache.has(deviceId)) {
        const cached = this.configCache.get(deviceId);
        // Return cached if less than 5 minutes old
        if (Date.now() - cached.timestamp < 300000) {
          return cached.config;
        }
      }

      const response = await fetch(`/api/hardware/config/${deviceId}`);
      if (!response.ok) throw new Error(`HTTP error! status: ${response.status}`);
      
      const config = await response.json();
      
      // Cache the config
      this.configCache.set(deviceId, {
        config,
        timestamp: Date.now()
      });

      return config;
    } catch (error) {
      console.error('Error fetching device config:', error);
      throw error;
    }
  }

  async updateDeviceConfig(deviceId, config) {
    try {
      const response = await fetch(`/api/hardware/config/${deviceId}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(config)
      });

      if (!response.ok) throw new Error(`HTTP error! status: ${response.status}`);
      
      const updatedConfig = await response.json();
      
      // Update cache
      this.configCache.set(deviceId, {
        config: updatedConfig,
        timestamp: Date.now()
      });

      return updatedConfig;
    } catch (error) {
      console.error('Error updating device config:', error);
      throw error;
    }
  }

  // Sensor Calibration Methods
  async calibrateSensor(deviceId, sensorId, calibrationData) {
    try {
      const response = await fetch(`/api/hardware/calibrate/${deviceId}/${sensorId}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(calibrationData)
      });

      if (!response.ok) throw new Error(`HTTP error! status: ${response.status}`);
      
      const result = await response.json();
      
      // Cache calibration result
      this.calibrationCache.set(`${deviceId}_${sensorId}`, {
        result,
        timestamp: Date.now()
      });

      return result;
    } catch (error) {
      console.error('Error calibrating sensor:', error);
      throw error;
    }
  }

  async getCalibrationData(deviceId, sensorId) {
    try {
      // Check cache first
      const cacheKey = `${deviceId}_${sensorId}`;
      if (this.calibrationCache.has(cacheKey)) {
        const cached = this.calibrationCache.get(cacheKey);
        // Return cached if less than 10 minutes old
        if (Date.now() - cached.timestamp < 600000) {
          return cached.result;
        }
      }

      const response = await fetch(`/api/hardware/calibrate/${deviceId}/${sensorId}`);
      if (!response.ok) throw new Error(`HTTP error! status: ${response.status}`);
      
      const result = await response.json();
      
      // Cache the result
      this.calibrationCache.set(cacheKey, {
        result,
        timestamp: Date.now()
      });

      return result;
    } catch (error) {
      console.error('Error fetching calibration data:', error);
      throw error;
    }
  }

  // Device Management Methods
  async getDeviceList() {
    try {
      const response = await fetch('/api/hardware/devices');
      if (!response.ok) throw new Error(`HTTP error! status: ${response.status}`);
      return await response.json();
    } catch (error) {
      console.error('Error fetching device list:', error);
      throw error;
    }
  }

  async addDevice(deviceData) {
    try {
      const response = await fetch('/api/hardware/devices', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(deviceData)
      });

      if (!response.ok) throw new Error(`HTTP error! status: ${response.status}`);
      return await response.json();
    } catch (error) {
      console.error('Error adding device:', error);
      throw error;
    }
  }

  async removeDevice(deviceId) {
    try {
      const response = await fetch(`/api/hardware/devices/${deviceId}`, {
        method: 'DELETE'
      });

      if (!response.ok) throw new Error(`HTTP error! status: ${response.status}`);
      
      // Clear caches for this device
      this.configCache.delete(deviceId);
      for (const key of this.calibrationCache.keys()) {
        if (key.startsWith(`${deviceId}_`)) {
          this.calibrationCache.delete(key);
        }
      }

      return await response.json();
    } catch (error) {
      console.error('Error removing device:', error);
      throw error;
    }
  }

  // Sensor Management Methods
  async getSensorList(deviceId) {
    try {
      const response = await fetch(`/api/hardware/devices/${deviceId}/sensors`);
      if (!response.ok) throw new Error(`HTTP error! status: ${response.status}`);
      return await response.json();
    } catch (error) {
      console.error('Error fetching sensor list:', error);
      throw error;
    }
  }

  async addSensor(deviceId, sensorData) {
    try {
      const response = await fetch(`/api/hardware/devices/${deviceId}/sensors`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(sensorData)
      });

      if (!response.ok) throw new Error(`HTTP error! status: ${response.status}`);
      return await response.json();
    } catch (error) {
      console.error('Error adding sensor:', error);
      throw error;
    }
  }

  async updateSensor(deviceId, sensorId, sensorData) {
    try {
      const response = await fetch(`/api/hardware/devices/${deviceId}/sensors/${sensorId}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(sensorData)
      });

      if (!response.ok) throw new Error(`HTTP error! status: ${response.status}`);
      return await response.json();
    } catch (error) {
      console.error('Error updating sensor:', error);
      throw error;
    }
  }

  async removeSensor(deviceId, sensorId) {
    try {
      const response = await fetch(`/api/hardware/devices/${deviceId}/sensors/${sensorId}`, {
        method: 'DELETE'
      });

      if (!response.ok) throw new Error(`HTTP error! status: ${response.status}`);
      
      // Clear calibration cache for this sensor
      this.calibrationCache.delete(`${deviceId}_${sensorId}`);

      return await response.json();
    } catch (error) {
      console.error('Error removing sensor:', error);
      throw error;
    }
  }

  // Utility Methods
  clearCache() {
    this.configCache.clear();
    this.calibrationCache.clear();
  }

  clearDeviceCache(deviceId) {
    this.configCache.delete(deviceId);
    for (const key of this.calibrationCache.keys()) {
      if (key.startsWith(`${deviceId}_`)) {
        this.calibrationCache.delete(key);
      }
    }
  }

  getCacheStats() {
    return {
      configCacheSize: this.configCache.size,
      calibrationCacheSize: this.calibrationCache.size,
      configCacheKeys: Array.from(this.configCache.keys()),
      calibrationCacheKeys: Array.from(this.calibrationCache.keys())
    };
  }
}

export default new HardwareConfigService();
