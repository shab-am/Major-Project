/**
 * Hardware Data Processing Utilities
 * Functions for processing and analyzing hardware sensor data
 */

// Data validation functions
export const validateSensorData = (data) => {
  const errors = [];
  
  if (typeof data.temperature !== 'number' || data.temperature < -50 || data.temperature > 100) {
    errors.push('Invalid temperature value');
  }
  
  if (typeof data.ph !== 'number' || data.ph < 0 || data.ph > 14) {
    errors.push('Invalid pH value');
  }
  
  if (typeof data.tds !== 'number' || data.tds < 0 || data.tds > 5000) {
    errors.push('Invalid TDS value');
  }
  
  if (typeof data.humidity !== 'number' || data.humidity < 0 || data.humidity > 100) {
    errors.push('Invalid humidity value');
  }
  
  if (typeof data.dissolvedOxy !== 'number' || data.dissolvedOxy < 0 || data.dissolvedOxy > 20) {
    errors.push('Invalid dissolved oxygen value');
  }
  
  return {
    isValid: errors.length === 0,
    errors
  };
};

// Data smoothing and filtering
export const smoothData = (data, windowSize = 5) => {
  if (data.length < windowSize) return data;
  
  return data.map((point, index) => {
    const start = Math.max(0, index - Math.floor(windowSize / 2));
    const end = Math.min(data.length, start + windowSize);
    const window = data.slice(start, end);
    
    const avgValue = window.reduce((sum, p) => sum + p.value, 0) / window.length;
    
    return {
      ...point,
      value: avgValue
    };
  });
};

// Outlier detection
export const detectOutliers = (data, threshold = 2) => {
  if (data.length < 3) return [];
  
  const values = data.map(d => d.value);
  const mean = values.reduce((sum, val) => sum + val, 0) / values.length;
  const variance = values.reduce((sum, val) => sum + Math.pow(val - mean, 2), 0) / values.length;
  const stdDev = Math.sqrt(variance);
  
  return data.filter(point => Math.abs(point.value - mean) > threshold * stdDev);
};

// Data aggregation functions
export const aggregateData = (data, interval = 'hour') => {
  const grouped = {};
  
  data.forEach(point => {
    const timestamp = new Date(point.timestamp);
    let key;
    
    switch (interval) {
      case 'minute':
        key = `${timestamp.getFullYear()}-${timestamp.getMonth()}-${timestamp.getDate()}-${timestamp.getHours()}-${timestamp.getMinutes()}`;
        break;
      case 'hour':
        key = `${timestamp.getFullYear()}-${timestamp.getMonth()}-${timestamp.getDate()}-${timestamp.getHours()}`;
        break;
      case 'day':
        key = `${timestamp.getFullYear()}-${timestamp.getMonth()}-${timestamp.getDate()}`;
        break;
      default:
        key = timestamp.toISOString().split('T')[0];
    }
    
    if (!grouped[key]) {
      grouped[key] = [];
    }
    grouped[key].push(point);
  });
  
  return Object.entries(grouped).map(([key, points]) => ({
    timestamp: key,
    avgValue: points.reduce((sum, p) => sum + p.value, 0) / points.length,
    minValue: Math.min(...points.map(p => p.value)),
    maxValue: Math.max(...points.map(p => p.value)),
    count: points.length
  }));
};

// Signal processing for bioelectrical data
export const processBioSignal = (rawSignal, sampleRate = 1000) => {
  // Apply bandpass filter (0.5-100 Hz for plant signals)
  const filteredSignal = applyBandpassFilter(rawSignal, 0.5, 100, sampleRate);
  
  // Calculate power spectral density
  const psd = calculatePSD(filteredSignal, sampleRate);
  
  // Extract features
  const features = {
    meanAmplitude: filteredSignal.reduce((sum, val) => sum + Math.abs(val), 0) / filteredSignal.length,
    rmsAmplitude: Math.sqrt(filteredSignal.reduce((sum, val) => sum + val * val, 0) / filteredSignal.length),
    dominantFrequency: findDominantFrequency(psd),
    signalQuality: calculateSignalQuality(filteredSignal)
  };
  
  return {
    filteredSignal,
    psd,
    features
  };
};

// Helper functions for signal processing
const applyBandpassFilter = (signal, lowFreq, highFreq, sampleRate) => {
  // Simple moving average filter implementation
  // In production, use proper digital filter libraries
  const windowSize = Math.floor(sampleRate / (highFreq * 2));
  const filtered = [];
  
  for (let i = 0; i < signal.length; i++) {
    const start = Math.max(0, i - windowSize);
    const end = Math.min(signal.length, i + windowSize);
    const window = signal.slice(start, end);
    filtered.push(window.reduce((sum, val) => sum + val, 0) / window.length);
  }
  
  return filtered;
};

const calculatePSD = (signal, sampleRate) => {
  // Simple PSD calculation using periodogram
  const n = signal.length;
  const psd = [];
  
  for (let k = 0; k < n / 2; k++) {
    const freq = (k * sampleRate) / n;
    let real = 0;
    let imag = 0;
    
    for (let i = 0; i < n; i++) {
      const angle = -2 * Math.PI * k * i / n;
      real += signal[i] * Math.cos(angle);
      imag += signal[i] * Math.sin(angle);
    }
    
    psd.push({
      frequency: freq,
      power: (real * real + imag * imag) / n
    });
  }
  
  return psd;
};

const findDominantFrequency = (psd) => {
  const maxPower = Math.max(...psd.map(p => p.power));
  const dominantPeak = psd.find(p => p.power === maxPower);
  return dominantPeak ? dominantPeak.frequency : 0;
};

const calculateSignalQuality = (signal) => {
  const noiseThreshold = 0.1;
  const signalVariance = calculateVariance(signal);
  const signalMean = signal.reduce((sum, val) => sum + val, 0) / signal.length;
  
  // Simple signal quality metric based on SNR
  const snr = Math.abs(signalMean) / Math.sqrt(signalVariance);
  
  if (snr > 10) return 'Excellent';
  if (snr > 5) return 'Good';
  if (snr > 2) return 'Fair';
  return 'Poor';
};

const calculateVariance = (data) => {
  const mean = data.reduce((sum, val) => sum + val, 0) / data.length;
  return data.reduce((sum, val) => sum + Math.pow(val - mean, 2), 0) / data.length;
};

// Export utility functions
export const formatTimestamp = (timestamp) => {
  return new Date(timestamp).toLocaleString();
};

export const formatValue = (value, unit = '', decimals = 2) => {
  return `${value.toFixed(decimals)}${unit}`;
};

export const calculateTrend = (data) => {
  if (data.length < 2) return 'stable';
  
  const firstHalf = data.slice(0, Math.floor(data.length / 2));
  const secondHalf = data.slice(Math.floor(data.length / 2));
  
  const firstAvg = firstHalf.reduce((sum, p) => sum + p.value, 0) / firstHalf.length;
  const secondAvg = secondHalf.reduce((sum, p) => sum + p.value, 0) / secondHalf.length;
  
  const change = ((secondAvg - firstAvg) / firstAvg) * 100;
  
  if (change > 5) return 'increasing';
  if (change < -5) return 'decreasing';
  return 'stable';
};
