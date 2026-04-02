/**
 * WebSocket Hook for Real-time Hardware Data
 * Provides real-time data streaming from hardware devices
 */

import { useState, useEffect, useRef, useCallback } from 'react';
import apiService from './apiService';

export const useWebSocket = (url = '/signals') => {
  const [isConnected, setIsConnected] = useState(false);
  const [connectionState, setConnectionState] = useState('DISCONNECTED');
  const [lastMessage, setLastMessage] = useState(null);
  const [error, setError] = useState(null);
  const [reconnectAttempts, setReconnectAttempts] = useState(0);
  
  const messageHandlers = useRef(new Set());
  const errorHandlers = useRef(new Set());

  const addMessageHandler = useCallback((handler) => {
    messageHandlers.current.add(handler);
    return () => messageHandlers.current.delete(handler);
  }, []);

  const addErrorHandler = useCallback((handler) => {
    errorHandlers.current.add(handler);
    return () => errorHandlers.current.delete(handler);
  }, []);

  const connect = useCallback(() => {
    const handleMessage = (data) => {
      setLastMessage(data);
      setError(null);
      
      // Call all registered message handlers
      messageHandlers.current.forEach(handler => {
        try {
          handler(data);
        } catch (error) {
          console.error('Error in message handler:', error);
        }
      });
    };

    const handleError = (error) => {
      setError(error);
      setReconnectAttempts(prev => prev + 1);
      
      // Call all registered error handlers
      errorHandlers.current.forEach(handler => {
        try {
          handler(error);
        } catch (err) {
          console.error('Error in error handler:', err);
        }
      });
    };

    const handleOpen = () => {
      setIsConnected(true);
      setConnectionState('CONNECTED');
      setReconnectAttempts(0);
    };

    apiService.connectWebSocket(handleMessage, handleError, handleOpen);
  }, []);

  const disconnect = useCallback(() => {
    apiService.disconnectWebSocket();
    setIsConnected(false);
    setConnectionState('DISCONNECTED');
  }, []);

  const sendMessage = useCallback((message) => {
    apiService.sendWebSocketMessage(message);
  }, []);

  useEffect(() => {
    // Update connection state periodically
    const interval = setInterval(() => {
      setConnectionState(apiService.getConnectionState());
      setIsConnected(apiService.isConnected());
    }, 1000);

    return () => clearInterval(interval);
  }, []);

  return {
    isConnected,
    connectionState,
    lastMessage,
    error,
    reconnectAttempts,
    connect,
    disconnect,
    sendMessage,
    addMessageHandler,
    addErrorHandler
  };
};

export default useWebSocket;
