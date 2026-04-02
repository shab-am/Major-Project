/**
 * Real-time Hardware Data Hook
 * Custom hook for managing real-time hardware sensor data
 */

import { useState, useEffect, useCallback, useRef } from 'react';
import { useWebSocket } from '../hooks/useWebSocket';
import { validateSensorData, smoothData, detectOutliers } from '../utils/dataProcessing';
import { SensorTypes, WebSocketMessageTypes } from '../types/hardwareTypes';

export const useHardwareData = (options = {}) => {
  const {
    autoConnect = true,
    smoothingWindow = 5,
    outlierThreshold = 2,
    maxDataPoints = 1000
  } = options;

  const [sensorData, setSensorData] = useState([]);
  const [bioSignalData, setBioSignalData] = useState([]);
  const [hardwareStatus, setHardwareStatus] = useState({});
  const [alerts, setAlerts] = useState([]);
  const [isProcessing, setIsProcessing] = useState(false);
  
  const dataBuffer = useRef([]);
  const lastProcessedTime = useRef(Date.now());

  const {
    isConnected,
    connectionState,
    lastMessage,
    error,
    connect,
    disconnect,
    sendMessage,
    addMessageHandler,
    addErrorHandler
  } = useWebSocket();

  // Process incoming sensor data
  const processSensorData = useCallback((data) => {
    setIsProcessing(true);
    
    try {
      // Validate data
      const validation = validateSensorData(data);
      if (!validation.isValid) {
        console.warn('Invalid sensor data:', validation.errors);
        return;
      }

      // Add timestamp if not present
      const processedData = {
        ...data,
        timestamp: data.timestamp || new Date().toISOString(),
        id: data.id || Date.now().toString()
      };

      // Add to buffer
      dataBuffer.current.push(processedData);
      
      // Keep only recent data points
      if (dataBuffer.current.length > maxDataPoints) {
        dataBuffer.current = dataBuffer.current.slice(-maxDataPoints);
      }

      // Apply smoothing if enabled
      const smoothedData = smoothingWindow > 1 
        ? smoothData(dataBuffer.current, smoothingWindow)
        : dataBuffer.current;

      // Detect outliers
      const outliers = detectOutliers(smoothedData, outlierThreshold);
      
      // Update state
      setSensorData(smoothedData);
      
      // Process alerts for outliers
      if (outliers.length > 0) {
        const newAlerts = outliers.map(outlier => ({
          id: `outlier_${outlier.timestamp}`,
          type: 'warning',
          message: `Outlier detected in sensor data at ${outlier.timestamp}`,
          timestamp: new Date().toISOString(),
          data: outlier
        }));
        
        setAlerts(prev => [...prev, ...newAlerts].slice(-50)); // Keep last 50 alerts
      }

    } catch (error) {
      console.error('Error processing sensor data:', error);
    } finally {
      setIsProcessing(false);
    }
  }, [smoothingWindow, outlierThreshold, maxDataPoints]);

  // Process bioelectrical signal data
  const processBioSignalData = useCallback((data) => {
    try {
      const processedData = {
        ...data,
        timestamp: data.timestamp || new Date().toISOString(),
        id: data.id || Date.now().toString()
      };

      setBioSignalData(prev => {
        const updated = [...prev, processedData];
        return updated.slice(-100); // Keep last 100 bio signal readings
      });
    } catch (error) {
      console.error('Error processing bio signal data:', error);
    }
  }, []);

  // Process hardware status updates
  const processHardwareStatus = useCallback((data) => {
    try {
      setHardwareStatus(prev => ({
        ...prev,
        [data.deviceId]: {
          ...data,
          lastUpdated: new Date().toISOString()
        }
      }));
    } catch (error) {
      console.error('Error processing hardware status:', error);
    }
  }, []);

  // Process alerts
  const processAlert = useCallback((data) => {
    try {
      const alert = {
        ...data,
        id: data.id || Date.now().toString(),
        timestamp: data.timestamp || new Date().toISOString()
      };

      setAlerts(prev => [alert, ...prev].slice(-50)); // Keep last 50 alerts
    } catch (error) {
      console.error('Error processing alert:', error);
    }
  }, []);

  // Message handler
  const handleMessage = useCallback((message) => {
    switch (message.type) {
      case WebSocketMessageTypes.SENSOR_DATA:
        processSensorData(message.data);
        break;
      case WebSocketMessageTypes.BIO_SIGNAL:
        processBioSignalData(message.data);
        break;
      case WebSocketMessageTypes.DEVICE_STATUS:
        processHardwareStatus(message.data);
        break;
      case WebSocketMessageTypes.ALERT:
        processAlert(message.data);
        break;
      default:
        console.log('Unknown message type:', message.type);
    }
  }, [processSensorData, processBioSignalData, processHardwareStatus, processAlert]);

  // Error handler
  const handleError = useCallback((error) => {
    console.error('Hardware data error:', error);
    
    const errorAlert = {
      id: `error_${Date.now()}`,
      type: 'error',
      message: `Hardware connection error: ${error.message || 'Unknown error'}`,
      timestamp: new Date().toISOString()
    };
    
    setAlerts(prev => [errorAlert, ...prev].slice(-50));
  }, []);

  // Register message and error handlers
  useEffect(() => {
    const removeMessageHandler = addMessageHandler(handleMessage);
    const removeErrorHandler = addErrorHandler(handleError);

    return () => {
      removeMessageHandler();
      removeErrorHandler();
    };
  }, [addMessageHandler, addErrorHandler, handleMessage, handleError]);

  // Auto-connect if enabled
  useEffect(() => {
    if (autoConnect && !isConnected) {
      connect();
    }
  }, [autoConnect, isConnected, connect]);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      disconnect();
    };
  }, [disconnect]);

  // Utility functions
  const clearAlerts = useCallback(() => {
    setAlerts([]);
  }, []);

  const clearData = useCallback(() => {
    setSensorData([]);
    setBioSignalData([]);
    dataBuffer.current = [];
  }, []);

  const getLatestReading = useCallback(() => {
    return sensorData[sensorData.length - 1] || null;
  }, [sensorData]);

  const getDataByType = useCallback((type) => {
    return sensorData.filter(data => data.sensorType === type);
  }, [sensorData]);

  const getActiveAlerts = useCallback(() => {
    return alerts.filter(alert => 
      alert.type === 'error' || alert.type === 'critical'
    );
  }, [alerts]);

  return {
    // Data
    sensorData,
    bioSignalData,
    hardwareStatus,
    alerts,
    
    // Connection state
    isConnected,
    connectionState,
    error,
    
    // Processing state
    isProcessing,
    
    // Actions
    connect,
    disconnect,
    sendMessage,
    clearAlerts,
    clearData,
    
    // Utilities
    getLatestReading,
    getDataByType,
    getActiveAlerts
  };
};

export default useHardwareData;
