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
        Ambient_Temperature: sensorData.temperature || sensorData.ambient_temperature || sensorData.Ambient_Temperature || 0,
        Water_Temperature: sensorData.waterTemperature || sensorData.water_temperature || sensorData.soilTemperature || sensorData.soil_temperature || sensorData.Water_Temperature || sensorData.temperature || 0,
        Humidity: sensorData.humidity || sensorData.Humidity || 0,
        Light_Intensity: sensorData.lightIntensity || sensorData.light_intensity || sensorData.Light_Intensity || 500,
        Water_pH: sensorData.ph || sensorData.water_ph || sensorData.soil_pH || sensorData.soilPh || sensorData.Water_pH || 6.5,
        Dissolved_Oxygen_mg_L: sensorData.dissolvedOxy || sensorData.dissolved_oxygen || sensorData.dissolved_oxygen_mg_l || sensorData.Dissolved_Oxygen_mg_L || 5.5,
        EC_mS_cm: sensorData.ec || sensorData.ec_value || sensorData.ec_ms_cm || sensorData.EC_mS_cm || 1.2,
        TDS_ppm: sensorData.tds || sensorData.tds_value || sensorData.TDS_ppm || 650,
        Electrochemical_Signal: sensorData.electrochemicalSignal || sensorData.electrochemical_signal || sensorData.Electrochemical_Signal || 1.0,
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
        Ambient_Temperature: sensorData.temperature || sensorData.ambient_temperature || sensorData.Ambient_Temperature || 0,
        Water_Temperature: sensorData.waterTemperature || sensorData.water_temperature || sensorData.soilTemperature || sensorData.soil_temperature || sensorData.Water_Temperature || sensorData.temperature || 0,
        Humidity: sensorData.humidity || sensorData.Humidity || 0,
        Light_Intensity: sensorData.lightIntensity || sensorData.light_intensity || sensorData.Light_Intensity || 500,
        Water_pH: sensorData.ph || sensorData.water_ph || sensorData.soil_pH || sensorData.soilPh || sensorData.Water_pH || 6.5,
        Dissolved_Oxygen_mg_L: sensorData.dissolvedOxy || sensorData.dissolved_oxygen || sensorData.dissolved_oxygen_mg_l || sensorData.Dissolved_Oxygen_mg_L || 5.5,
        EC_mS_cm: sensorData.ec || sensorData.ec_value || sensorData.ec_ms_cm || sensorData.EC_mS_cm || 1.2,
        TDS_ppm: sensorData.tds || sensorData.tds_value || sensorData.TDS_ppm || 650,
        Electrochemical_Signal: sensorData.electrochemicalSignal || sensorData.electrochemical_signal || sensorData.Electrochemical_Signal || 1.0,
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
