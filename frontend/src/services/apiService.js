/**
 * API Service for Hardware Connectivity
 * Handles communication with backend services and hardware devices
 */

const API_BASE_URL = process.env.REACT_APP_API_URL || 'http://localhost:5000';
const WS_BASE_URL = process.env.REACT_APP_WS_URL || 'ws://localhost:5000';

class ApiService {
  constructor() {
    this.wsConnection = null;
    this.reconnectAttempts = 0;
    this.maxReconnectAttempts = 5;
    this.reconnectDelay = 1000;
  }

  // HTTP API Methods
  async fetchReadings() {
    try {
      const response = await fetch(`${API_BASE_URL}/api/readings`);
      if (!response.ok) throw new Error(`HTTP error! status: ${response.status}`);
      return await response.json();
    } catch (error) {
      console.error('Error fetching readings:', error);
      throw error;
    }
  }

  async postReading(data) {
    try {
      const response = await fetch(`${API_BASE_URL}/api/readings`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data)
      });
      if (!response.ok) throw new Error(`HTTP error! status: ${response.status}`);
      return await response.json();
    } catch (error) {
      console.error('Error posting reading:', error);
      throw error;
    }
  }

  async fetchHardwareStatus() {
    try {
      const response = await fetch(`${API_BASE_URL}/api/hardware/status`);
      if (!response.ok) throw new Error(`HTTP error! status: ${response.status}`);
      return await response.json();
    } catch (error) {
      console.error('Error fetching hardware status:', error);
      throw error;
    }
  }

  async calibrateSensor(sensorId) {
    try {
      const response = await fetch(`${API_BASE_URL}/api/hardware/calibrate/${sensorId}`, {
        method: 'POST'
      });
      if (!response.ok) throw new Error(`HTTP error! status: ${response.status}`);
      return await response.json();
    } catch (error) {
      console.error('Error calibrating sensor:', error);
      throw error;
    }
  }

  // WebSocket Methods for Real-time Data
  connectWebSocket(onMessage, onError, onOpen) {
    try {
      this.wsConnection = new WebSocket(`${WS_BASE_URL}/signals`);
      
      this.wsConnection.onopen = (event) => {
        console.log('WebSocket connected');
        this.reconnectAttempts = 0;
        if (onOpen) onOpen(event);
      };

      this.wsConnection.onmessage = (event) => {
        try {
          const data = JSON.parse(event.data);
          if (onMessage) onMessage(data);
        } catch (error) {
          console.error('Error parsing WebSocket message:', error);
        }
      };

      this.wsConnection.onerror = (error) => {
        console.error('WebSocket error:', error);
        if (onError) onError(error);
      };

      this.wsConnection.onclose = (event) => {
        console.log('WebSocket disconnected');
        this.handleReconnect(onMessage, onError, onOpen);
      };

    } catch (error) {
      console.error('Error creating WebSocket connection:', error);
      if (onError) onError(error);
    }
  }

  handleReconnect(onMessage, onError, onOpen) {
    if (this.reconnectAttempts < this.maxReconnectAttempts) {
      this.reconnectAttempts++;
      console.log(`Attempting to reconnect... (${this.reconnectAttempts}/${this.maxReconnectAttempts})`);
      
      setTimeout(() => {
        this.connectWebSocket(onMessage, onError, onOpen);
      }, this.reconnectDelay * this.reconnectAttempts);
    } else {
      console.error('Max reconnection attempts reached');
    }
  }

  disconnectWebSocket() {
    if (this.wsConnection) {
      this.wsConnection.close();
      this.wsConnection = null;
    }
  }

  sendWebSocketMessage(message) {
    if (this.wsConnection && this.wsConnection.readyState === WebSocket.OPEN) {
      this.wsConnection.send(JSON.stringify(message));
    } else {
      console.warn('WebSocket not connected');
    }
  }

  // Utility Methods
  isConnected() {
    return this.wsConnection && this.wsConnection.readyState === WebSocket.OPEN;
  }

  getConnectionState() {
    if (!this.wsConnection) return 'DISCONNECTED';
    
    switch (this.wsConnection.readyState) {
      case WebSocket.CONNECTING: return 'CONNECTING';
      case WebSocket.OPEN: return 'CONNECTED';
      case WebSocket.CLOSING: return 'CLOSING';
      case WebSocket.CLOSED: return 'DISCONNECTED';
      default: return 'UNKNOWN';
    }
  }
}

export default new ApiService();
