/**
 * Python Backend Service
 * Handles communication with Python Flask backend
 */

const PYTHON_API_URL = process.env.REACT_APP_PYTHON_API_URL || 'http://localhost:5000';

class PythonService {
  /**
   * Check if Python backend is healthy
   */
  async healthCheck() {
    try {
      const response = await fetch(`${PYTHON_API_URL}/api/health`);
      if (!response.ok) throw new Error(`HTTP error! status: ${response.status}`);
      return await response.json();
    } catch (error) {
      console.error('Python backend health check failed:', error);
      throw error;
    }
  }

  /**
   * List available datasets
   */
  async listDatasets() {
    try {
      const response = await fetch(`${PYTHON_API_URL}/api/python/datasets`);
      if (!response.ok) throw new Error(`HTTP error! status: ${response.status}`);
      return await response.json();
    } catch (error) {
      console.error('Error listing datasets:', error);
      throw error;
    }
  }

  /**
   * List available Python scripts
   */
  async listScripts() {
    try {
      const response = await fetch(`${PYTHON_API_URL}/api/python/scripts`);
      if (!response.ok) throw new Error(`HTTP error! status: ${response.status}`);
      return await response.json();
    } catch (error) {
      console.error('Error listing scripts:', error);
      throw error;
    }
  }

  /**
   * Run a Python script
   * @param {string} scriptName - Name of the script (without .py)
   * @param {string} dataset - Dataset filename (optional)
   * @param {object} params - Additional parameters to pass to the script
   */
  async runScript(scriptName, dataset = null, params = {}) {
    try {
      const payload = {
        script_name: scriptName,
        ...params
      };

      if (dataset) {
        payload.dataset = dataset;
      }

      const response = await fetch(`${PYTHON_API_URL}/api/python/run`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(payload),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || `HTTP error! status: ${response.status}`);
      }

      return await response.json();
    } catch (error) {
      console.error('Error running Python script:', error);
      throw error;
    }
  }

  /**
   * Process data using Python script
   * @param {string} scriptName - Name of the script
   * @param {object} data - Data to process
   * @param {string} dataset - Dataset filename (optional)
   */
  async processData(scriptName, data = {}, dataset = null) {
    try {
      const payload = {
        script_name: scriptName,
        data: data,
      };

      if (dataset) {
        payload.dataset = dataset;
      }

      const response = await fetch(`${PYTHON_API_URL}/api/python/process`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(payload),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || `HTTP error! status: ${response.status}`);
      }

      return await response.json();
    } catch (error) {
      console.error('Error processing data:', error);
      throw error;
    }
  }

  /**
   * Predict plant health status using trained model
   * @param {object|array} plantData - Plant sensor data (single object or array of objects)
   * @returns {Promise} Prediction results with health status and probabilities
   */
  async predictPlantHealth(plantData) {
    try {
      const response = await fetch(`${PYTHON_API_URL}/api/python/predict`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(plantData),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || `HTTP error! status: ${response.status}`);
      }

      return await response.json();
    } catch (error) {
      console.error('Error predicting plant health:', error);
      throw error;
    }
  }

  /**
   * Get model information and metadata
   * @returns {Promise} Model metadata including accuracy, classes, features
   */
  async getModelInfo() {
    try {
      const response = await fetch(`${PYTHON_API_URL}/api/python/model/info`);
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || `HTTP error! status: ${response.status}`);
      }
      return await response.json();
    } catch (error) {
      console.error('Error getting model info:', error);
      throw error;
    }
  }

  /**
   * Get all data from the plant health dataset
   * @returns {Promise} Dataset data
   */
  async getDatasetData() {
    try {
      const response = await fetch(`${PYTHON_API_URL}/api/python/dataset/data`);
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || `HTTP error! status: ${response.status}`);
      }
      return await response.json();
    } catch (error) {
      console.error('Error getting dataset data:', error);
      throw error;
    }
  }

  /**
   * Automatically predict when new entry is added
   * @param {object} entryData - New plant entry data
   * @returns {Promise} Prediction result
   */
  async autoPredict(entryData) {
    try {
      const response = await fetch(`${PYTHON_API_URL}/api/python/auto-predict`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(entryData),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || `HTTP error! status: ${response.status}`);
      }

      return await response.json();
    } catch (error) {
      console.error('Error in auto-prediction:', error);
      throw error;
    }
  }
}

const pythonService = new PythonService();
export default pythonService;

