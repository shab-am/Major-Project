import { useState, useCallback } from 'react';
import pythonService from '../services/pythonService';

/**
 * Custom hook for plant health predictions
 * Provides easy access to ML model predictions across the app
 */
export const usePlantHealthPrediction = () => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [modelInfo, setModelInfo] = useState(null);

  /**
   * Predict plant health from sensor data
   * @param {object} sensorData - Plant sensor readings
   * @returns {Promise} Prediction result
   */
  const predict = useCallback(async (sensorData) => {
    setLoading(true);
    setError(null);
    
    try {
      // Map common field names to model expected names
      const mappedData = {
        Timestamp: sensorData.timestamp || sensorData.date || new Date().toISOString(),
        Plant_ID: sensorData.plantId || sensorData.plant_id || 1,
        Soil_Moisture: sensorData.soilMoisture || sensorData.soil_moisture || sensorData.moisture || 0,
        Ambient_Temperature: sensorData.temperature || sensorData.ambient_temperature || 0,
        Soil_Temperature: sensorData.soilTemperature || sensorData.soil_temperature || sensorData.temperature || 0,
        Humidity: sensorData.humidity || 0,
        Light_Intensity: sensorData.lightIntensity || sensorData.light_intensity || 500,
        Soil_pH: sensorData.ph || sensorData.soil_pH || sensorData.soilPh || 6.5,
        Nitrogen_Level: sensorData.nitrogenLevel || sensorData.nitrogen_level || 30,
        Phosphorus_Level: sensorData.phosphorusLevel || sensorData.phosphorus_level || 30,
        Potassium_Level: sensorData.potassiumLevel || sensorData.potassium_level || 30,
        Chlorophyll_Content: sensorData.chlorophyllContent || sensorData.chlorophyll_content || 35,
        Electrochemical_Signal: sensorData.electrochemicalSignal || sensorData.electrochemical_signal || 1.0,
      };

      const result = await pythonService.predictPlantHealth(mappedData);
      return result;
    } catch (err) {
      setError(err.message);
      throw err;
    } finally {
      setLoading(false);
    }
  }, []);

  /**
   * Predict health for multiple plants (batch prediction)
   * @param {array} sensorDataArray - Array of plant sensor readings
   * @returns {Promise} Batch prediction results
   */
  const predictBatch = useCallback(async (sensorDataArray) => {
    setLoading(true);
    setError(null);
    
    try {
      const mappedData = sensorDataArray.map(sensorData => ({
        Timestamp: sensorData.timestamp || sensorData.date || new Date().toISOString(),
        Plant_ID: sensorData.plantId || sensorData.plant_id || 1,
        Soil_Moisture: sensorData.soilMoisture || sensorData.soil_moisture || sensorData.moisture || 0,
        Ambient_Temperature: sensorData.temperature || sensorData.ambient_temperature || 0,
        Soil_Temperature: sensorData.soilTemperature || sensorData.soil_temperature || sensorData.temperature || 0,
        Humidity: sensorData.humidity || 0,
        Light_Intensity: sensorData.lightIntensity || sensorData.light_intensity || 500,
        Soil_pH: sensorData.ph || sensorData.soil_pH || sensorData.soilPh || 6.5,
        Nitrogen_Level: sensorData.nitrogenLevel || sensorData.nitrogen_level || 30,
        Phosphorus_Level: sensorData.phosphorusLevel || sensorData.phosphorus_level || 30,
        Potassium_Level: sensorData.potassiumLevel || sensorData.potassium_level || 30,
        Chlorophyll_Content: sensorData.chlorophyllContent || sensorData.chlorophyll_content || 35,
        Electrochemical_Signal: sensorData.electrochemicalSignal || sensorData.electrochemical_signal || 1.0,
      }));

      const result = await pythonService.predictPlantHealth(mappedData);
      return result;
    } catch (err) {
      setError(err.message);
      throw err;
    } finally {
      setLoading(false);
    }
  }, []);

  /**
   * Load model information
   */
  const loadModelInfo = useCallback(async () => {
    try {
      const info = await pythonService.getModelInfo();
      setModelInfo(info);
      return info;
    } catch (err) {
      setError(err.message);
      return null;
    }
  }, []);

  /**
   * Get health status color based on prediction
   * @param {string} healthStatus - Health status string
   * @returns {object} Color and styling info
   */
  const getHealthStatusStyle = useCallback((healthStatus) => {
    const status = healthStatus?.toLowerCase() || '';
    
    if (status.includes('healthy') || status.includes('low stress')) {
      return {
        color: '#d3ff5c',
        bgColor: 'rgba(211, 255, 92, 0.2)',
        label: 'Healthy'
      };
    } else if (status.includes('moderate') || status.includes('medium')) {
      return {
        color: '#ffa500',
        bgColor: 'rgba(255, 165, 0, 0.2)',
        label: 'Moderate'
      };
    } else if (status.includes('stress') || status.includes('high')) {
      return {
        color: '#ff6b6b',
        bgColor: 'rgba(255, 107, 107, 0.2)',
        label: 'Stressed'
      };
    }
    
    return {
      color: '#9ca3af',
      bgColor: 'rgba(156, 163, 175, 0.2)',
      label: 'Unknown'
    };
  }, []);

  return {
    predict,
    predictBatch,
    loadModelInfo,
    getHealthStatusStyle,
    loading,
    error,
    modelInfo
  };
};

export default usePlantHealthPrediction;

