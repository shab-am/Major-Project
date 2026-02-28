import React, { useState, useEffect, useMemo } from 'react';
import { Droplets, TrendingUp, AlertTriangle, Filter, BarChart3 } from 'lucide-react';
import { ResponsiveContainer, LineChart, Line, AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ReferenceLine } from 'recharts';
import PageHeader from '../components/PageHeader';
import pythonService from '../services/pythonService';

const ChartCard = ({ title, icon, color, data, dataKey, isDarkMode, theme, yDomain, optimalRange, anomalies, showAlerts }) => {
  const [animatedData, setAnimatedData] = React.useState([]);

  React.useEffect(() => {
    if (data.length > 0) {
      setAnimatedData([]);
      let currentIndex = 0;
      const interval = setInterval(() => {
        if (currentIndex < data.length) {
          setAnimatedData(prev => [...prev, data[currentIndex]]);
          currentIndex++;
        } else {
          clearInterval(interval);
        }
      }, 150);
      return () => clearInterval(interval);
    }
  }, [data]);

  // Get alert status for current value
  const getAlertStatus = (value) => {
    if (!optimalRange) return null;
    if (value < optimalRange.min) return { type: 'low', color: '#ff6b6b' };
    if (value > optimalRange.max) return { type: 'high', color: '#ff6b6b' };
    return { type: 'normal', color: '#4ade80' };
  };

  const currentValue = data.length > 0 ? data[data.length - 1]?.[dataKey] : null;
  const alertStatus = currentValue ? getAlertStatus(currentValue) : null;
  const hasAnomalies = anomalies && anomalies.length > 0;

  return (
    <div style={{ 
      background: isDarkMode ? 'rgba(255,255,255,0.04)' : '#fafafa', 
      borderRadius: 16, 
      padding: 24,
      boxShadow: isDarkMode ? '0 4px 20px rgba(0, 0, 0, 0.3)' : '0 2px 10px rgba(0, 0, 0, 0.1)',
      border: `1px solid ${theme.border}`,
      position: 'relative'
    }}>
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 24 }}>
        <h2 style={{ fontSize: '1.5rem', fontWeight: 'bold', color: theme.text, margin: 0, display: 'flex', alignItems: 'center', gap: 12 }}>
          {icon}
          {title}
        </h2>
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          {hasAnomalies && (
            <div style={{
              padding: '4px 10px',
              borderRadius: '8px',
              background: '#ff6b6b20',
              border: '1px solid #ff6b6b40',
              display: 'flex',
              alignItems: 'center',
              gap: '6px'
            }}>
              <AlertTriangle size={14} color="#ff6b6b" />
              <span style={{ color: '#ff6b6b', fontSize: '12px', fontWeight: '600' }}>
                {anomalies.length} Anomaly{anomalies.length > 1 ? 'ies' : ''}
              </span>
            </div>
          )}
          {showAlerts && alertStatus && alertStatus.type !== 'normal' && (
            <div style={{
              padding: '4px 10px',
              borderRadius: '8px',
              background: `${alertStatus.color}20`,
              border: `1px solid ${alertStatus.color}40`,
              display: 'flex',
              alignItems: 'center',
              gap: '6px'
            }}>
              <AlertTriangle size={14} color={alertStatus.color} />
              <span style={{ color: alertStatus.color, fontSize: '12px', fontWeight: '600' }}>
                {alertStatus.type === 'low' ? 'Below Range' : 'Above Range'}
              </span>
            </div>
          )}
        </div>
      </div>
      <ResponsiveContainer width="100%" height={300}>
        <LineChart data={animatedData.length > 0 ? animatedData : data}>
          <CartesianGrid strokeDasharray="3 3" stroke={isDarkMode ? 'rgba(255,255,255,0.1)' : 'rgba(0,0,0,0.08)'} />
          <XAxis dataKey="timestamp" stroke={isDarkMode ? '#94a3b8' : '#555'} angle={-45} textAnchor="end" height={70} />
          <YAxis stroke={isDarkMode ? '#94a3b8' : '#555'} domain={yDomain || [0, 'auto']} />
          <Tooltip contentStyle={{ backgroundColor: isDarkMode ? 'rgba(0,0,0,0.8)' : '#fff', border: 'none', borderRadius: 8, color: theme.text }} />
          <Legend />
          {optimalRange && showAlerts && (
            <>
              <ReferenceLine y={optimalRange.min} stroke="#ffa500" strokeDasharray="5 5" label={{ value: 'Min', position: 'insideRight' }} />
              <ReferenceLine y={optimalRange.max} stroke="#ffa500" strokeDasharray="5 5" label={{ value: 'Max', position: 'insideRight' }} />
            </>
          )}
          <Line 
            type="monotone" 
            dataKey={dataKey} 
            stroke={color} 
            strokeWidth={3} 
            dot={(props) => {
              const isAnomaly = anomalies?.some(a => a.index === props.index);
              return (
                <circle 
                  {...props} 
                  r={isAnomaly ? 8 : 6} 
                  fill={isAnomaly ? '#ff6b6b' : color}
                  stroke={isAnomaly ? '#fff' : 'none'}
                  strokeWidth={isAnomaly ? 2 : 0}
                />
              );
            }}
            animationDuration={800}
            animationEasing="ease-out"
          />
        </LineChart>
      </ResponsiveContainer>
      {optimalRange && (
        <div style={{ marginTop: '12px', fontSize: '12px', color: theme.textMuted }}>
          Optimal Range: {optimalRange.min} - {optimalRange.max} {optimalRange.unit || ''}
        </div>
      )}
    </div>
  );
};

const ComparisonChart = ({ title, icon, data, metrics, isDarkMode, theme, yDomain }) => {
  const [animatedData, setAnimatedData] = React.useState([]);

  React.useEffect(() => {
    if (data.length > 0) {
      setAnimatedData([]);
      let currentIndex = 0;
      const interval = setInterval(() => {
        if (currentIndex < data.length) {
          setAnimatedData(prev => [...prev, data[currentIndex]]);
          currentIndex++;
        } else {
          clearInterval(interval);
        }
      }, 150);
      return () => clearInterval(interval);
    }
  }, [data]);

  return (
    <div style={{ 
      background: isDarkMode ? 'rgba(255,255,255,0.04)' : '#fafafa', 
      borderRadius: 16, 
      padding: 24,
      boxShadow: isDarkMode ? '0 4px 20px rgba(0, 0, 0, 0.3)' : '0 2px 10px rgba(0, 0, 0, 0.1)',
      border: `1px solid ${theme.border}`
    }}>
    <h2 style={{ fontSize: '1.5rem', fontWeight: 'bold', color: theme.text, marginBottom: 24, display: 'flex', alignItems: 'center', gap: 12 }}>
      {icon}
      {title}
    </h2>
      <ResponsiveContainer width="100%" height={350}>
        <AreaChart data={animatedData.length > 0 ? animatedData : data}>
        <CartesianGrid strokeDasharray="3 3" stroke={isDarkMode ? 'rgba(255,255,255,0.1)' : 'rgba(0,0,0,0.08)'} />
        <XAxis dataKey="timestamp" stroke={isDarkMode ? '#94a3b8' : '#555'} angle={-45} textAnchor="end" height={70} />
        <YAxis stroke={isDarkMode ? '#94a3b8' : '#555'} domain={yDomain || [0, 'auto']} />
        <Tooltip contentStyle={{ backgroundColor: isDarkMode ? 'rgba(0,0,0,0.8)' : '#fff', border: 'none', borderRadius: 8, color: theme.text }} />
        <Legend />
          {metrics.map((metric, index) => (
            <Area
              key={metric.key}
              type="monotone"
              dataKey={metric.key}
              stackId={metric.stackId || "1"}
              stroke={metric.color}
              fill={metric.color}
              fillOpacity={0.3}
              strokeWidth={2}
            />
          ))}
        </AreaChart>
    </ResponsiveContainer>
  </div>
);
};

const AnalyticsPage = ({ styles, getChartData, getTrendAnalysis, pastDays, setPastDays, isDarkMode, theme, plantInfo, plantData, onToggleTheme }) => {
  const [datasetData, setDatasetData] = useState([]);
  const [loading, setLoading] = useState(false);
  const [timeRange, setTimeRange] = useState('7'); // Default to 7 days
  const [selectedMetrics, setSelectedMetrics] = useState(['ph', 'temperature']); // For comparison chart

  // Optimal ranges for alerts
  const optimalRanges = {
    ph: { min: 5.5, max: 6.5, unit: '' },
    temperature: { min: 20, max: 26, unit: '°C' },
    humidity: { min: 50, max: 70, unit: '%' },
    tds: { min: 800, max: 1200, unit: 'ppm' },
    dissolvedOxy: { min: 5, max: 8, unit: 'mg/L' }
  };

  // Time range options
  const timeRangeOptions = [
    { value: '1', label: 'Last 24 Hours' },
    { value: '7', label: 'Last 7 Days' },
    { value: '30', label: 'Last 30 Days' },
    { value: '90', label: 'Last 90 Days' },
    { value: 'all', label: 'All Time' }
  ];

  // Load dataset data
  useEffect(() => {
    const loadDataset = async () => {
      try {
        setLoading(true);
        const response = await pythonService.getDatasetData();
        if (response.success && response.data) {
          setDatasetData(response.data);
        }
      } catch (err) {
        console.error('Error loading dataset for analytics:', err);
      } finally {
        setLoading(false);
      }
    };
    loadDataset();
  }, []);

  // Update pastDays when timeRange changes
  useEffect(() => {
    if (timeRange === 'all') {
      setPastDays(365); // Large number for all time
    } else {
      setPastDays(parseInt(timeRange));
    }
  }, [timeRange, setPastDays]);

  // Combine dataset with new entries for chart data
  const allDataForCharts = useMemo(() => {
    const combined = [...(datasetData || [])];
    
    if (plantData && Array.isArray(plantData)) {
      const newEntries = plantData.map(entry => ({
        Timestamp: entry.timestamp,
        Plant_ID: entry.id,
        Plant_Name: entry.plantName || `Plant ${entry.id}`,
        Soil_pH: entry.ph,
        Ambient_Temperature: entry.temperature,
        Humidity: entry.humidity,
        TDS: entry.tds,
        Dissolved_Oxygen: entry.dissolvedOxy,
      }));
      combined.push(...newEntries);
    }
    
    return combined;
  }, [datasetData, plantData]);

  // Anomaly detection using IQR (Interquartile Range) method
  const detectAnomalies = (data, dataKey) => {
    if (!data || data.length < 4) return [];
    
    const values = data.map(d => d[dataKey]).filter(v => v != null && !isNaN(v));
    if (values.length < 4) return [];

    const sorted = [...values].sort((a, b) => a - b);
    const q1Index = Math.floor(sorted.length * 0.25);
    const q3Index = Math.floor(sorted.length * 0.75);
    const q1 = sorted[q1Index];
    const q3 = sorted[q3Index];
    const iqr = q3 - q1;
    const lowerBound = q1 - 1.5 * iqr;
    const upperBound = q3 + 1.5 * iqr;

    return data
      .map((item, index) => ({
        ...item,
        index,
        value: item[dataKey]
      }))
      .filter(item => item.value != null && (item.value < lowerBound || item.value > upperBound))
      .map(item => ({ index: item.index, value: item.value, timestamp: item.timestamp }));
  };

  // Generate sample data if dataset is empty (for demonstration)
  const generateSampleData = useMemo(() => {
    if (allDataForCharts && allDataForCharts.length > 0) return [];
    
    const sampleData = [];
    const now = new Date();
    const plantNames = ['Bok Choy', 'Thai Basil', 'Purple Basil', 'Chili', 'Lemon Basil'];
    
    // Generate data for last 30 days with multiple readings per day
    for (let day = 0; day < 30; day++) {
      const date = new Date(now);
      date.setDate(date.getDate() - day);
      
      // 3-4 readings per day
      const readingsPerDay = 3 + Math.floor(Math.random() * 2);
      
      for (let reading = 0; reading < readingsPerDay; reading++) {
        const hour = 6 + reading * 6; // Readings at 6am, 12pm, 6pm
        const timestamp = new Date(date);
        timestamp.setHours(hour, Math.floor(Math.random() * 60), 0);
        
        const plantId = Math.floor(Math.random() * 5) + 1;
        const basePh = 5.5 + Math.random() * 1.5; // 5.5-7.0
        const baseTemp = 20 + Math.random() * 6; // 20-26
        const baseHumidity = 50 + Math.random() * 20; // 50-70
        const baseTDS = 800 + Math.random() * 400; // 800-1200
        const baseO2 = 5 + Math.random() * 3; // 5-8
        
        sampleData.push({
          Timestamp: timestamp.toISOString(),
          Plant_ID: plantId,
          Plant_Name: plantNames[plantId - 1],
          Soil_pH: parseFloat(basePh.toFixed(2)),
          Ambient_Temperature: parseFloat(baseTemp.toFixed(2)),
          Soil_Temperature: parseFloat((baseTemp - 1).toFixed(2)),
          Humidity: parseFloat(baseHumidity.toFixed(2)),
          Light_Intensity: parseFloat((400 + Math.random() * 400).toFixed(2)),
          TDS: parseFloat(baseTDS.toFixed(0)),
          Dissolved_Oxygen: parseFloat(baseO2.toFixed(2)),
          Nitrogen_Level: parseFloat((20 + Math.random() * 20).toFixed(2)),
          Phosphorus_Level: parseFloat((20 + Math.random() * 20).toFixed(2)),
          Potassium_Level: parseFloat((20 + Math.random() * 20).toFixed(2)),
          Chlorophyll_Content: parseFloat((25 + Math.random() * 15).toFixed(2)),
          Electrochemical_Signal: parseFloat((0.5 + Math.random() * 1.0).toFixed(4)),
        });
      }
    }
    
    return sampleData.sort((a, b) => new Date(a.Timestamp) - new Date(b.Timestamp));
  }, [allDataForCharts]);

  // Combine dataset with sample data if needed
  const finalDataForCharts = useMemo(() => {
    if (allDataForCharts && allDataForCharts.length > 0) {
      return allDataForCharts;
    }
    return generateSampleData;
  }, [allDataForCharts, generateSampleData]);

  // Get total data count for display
  const totalDataCount = useMemo(() => {
    return finalDataForCharts.length;
  }, [finalDataForCharts]);

  // Get chart data from combined dataset
  const getChartDataFromDataset = (dataType) => {
    if (!finalDataForCharts || finalDataForCharts.length === 0) return [];
    
    let cutoffDate = new Date();
    if (timeRange === 'all') {
      cutoffDate = new Date(0); // Start from epoch
    } else {
      cutoffDate.setDate(cutoffDate.getDate() - parseInt(timeRange));
    }
    
    return finalDataForCharts
      .filter(entry => {
        const entryDate = new Date(entry.Timestamp || entry.timestamp);
        return entryDate >= cutoffDate;
      })
      .map(entry => {
        const timestamp = entry.Timestamp || entry.timestamp;
        // Format timestamp for display (show date and time)
        const date = new Date(timestamp);
        const formattedTimestamp = date.toLocaleDateString('en-US', { 
          month: 'short', 
          day: 'numeric',
          hour: '2-digit',
          minute: '2-digit'
        });
        
        return {
          timestamp: formattedTimestamp,
          fullTimestamp: timestamp,
          ph: entry.Soil_pH || entry.ph || null,
          tds: entry.TDS || entry.tds || null,
          temperature: entry.Ambient_Temperature || entry.temperature || null,
          humidity: entry.Humidity || entry.humidity || null,
          dissolvedOxy: entry.Dissolved_Oxygen || entry.dissolvedOxy || null,
          plantId: entry.Plant_ID || entry.plantId,
          plantName: entry.Plant_Name || entry.plantName,
        };
      })
      .filter(entry => entry[dataType] != null) // Filter out null values for the specific metric
      .sort((a, b) => new Date(a.fullTimestamp) - new Date(b.fullTimestamp));
  };

  // Get comparison chart data
  const getComparisonData = () => {
    const data = getChartDataFromDataset('ph');
    return data.map(item => ({
      timestamp: item.timestamp,
      ...(selectedMetrics.includes('ph') && { ph: item.ph }),
      ...(selectedMetrics.includes('temperature') && { temperature: item.temperature }),
      ...(selectedMetrics.includes('humidity') && { humidity: item.humidity }),
      ...(selectedMetrics.includes('tds') && { tds: item.tds }),
    }));
  };

  return (
    <div style={{ marginBottom: '40px' }}>
      <PageHeader 
        title="Analytics Dashboard" 
        subtitle="Plant monitoring trends and analysis"
        theme={theme} 
        isDarkMode={isDarkMode} 
        onToggleTheme={onToggleTheme}
      />
      
      {/* Filters Section */}
      <div style={{ 
        background: theme.card,
        borderRadius: '16px',
        padding: '20px',
        border: `1px solid ${theme.border}`,
        marginBottom: '24px',
        display: 'flex',
        alignItems: 'center',
        gap: '20px',
        flexWrap: 'wrap'
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          <Filter size={18} color={theme.accent} />
          <span style={{ color: theme.text, fontSize: '14px', fontWeight: '600' }}>Filters:</span>
        </div>
        
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          <label style={{ color: theme.textMuted, fontSize: '13px' }}>Time Range:</label>
          <select
            value={timeRange}
            onChange={(e) => setTimeRange(e.target.value)}
            style={{
              padding: '8px 12px',
              borderRadius: '8px',
              border: `1px solid ${theme.border}`,
              background: theme.surface,
              color: theme.text,
              fontSize: '13px',
              cursor: 'pointer',
              minWidth: '150px'
            }}
          >
            {timeRangeOptions.map(option => (
              <option key={option.value} value={option.value}>
                {option.label}
              </option>
            ))}
          </select>
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          <label style={{ color: theme.textMuted, fontSize: '13px' }}>Compare Metrics:</label>
          <select
            multiple
            value={selectedMetrics}
            onChange={(e) => {
              const values = Array.from(e.target.selectedOptions, option => option.value);
              setSelectedMetrics(values.length > 0 ? values : ['ph']);
            }}
            style={{
              padding: '8px 12px',
              borderRadius: '8px',
              border: `1px solid ${theme.border}`,
              background: theme.surface,
              color: theme.text,
              fontSize: '13px',
              cursor: 'pointer',
              minWidth: '200px',
              minHeight: '40px'
            }}
          >
            <option value="ph">pH</option>
            <option value="temperature">Temperature</option>
            <option value="humidity">Humidity</option>
            <option value="tds">TDS</option>
          </select>
        </div>
      </div>

      {loading ? (
        <div style={{ color: theme.textMuted, textAlign: 'center', padding: '40px' }}>
          Loading dataset for analytics...
        </div>
      ) : getChartDataFromDataset('ph').length === 0 ? (
        <div style={{ color: theme.accent, textAlign: 'center', padding: '40px' }}>
          No data available for analytics. Ensure dataset is loaded and entries are added.
        </div>
      ) : (
        <>
          {/* Data Info Banner */}
          <div style={{
            background: theme.surface,
            borderRadius: '12px',
            padding: '16px',
            marginBottom: '24px',
            border: `1px solid ${theme.border}`,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            flexWrap: 'wrap',
            gap: '12px'
          }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
              <BarChart3 size={20} color={theme.accent} />
              <span style={{ color: theme.text, fontSize: '14px', fontWeight: '600' }}>
                Data Source: {datasetData.length > 0 ? 'Dataset + Entries' : 'Sample Data (Demo)'}
              </span>
            </div>
            <div style={{ color: theme.textMuted, fontSize: '13px' }}>
              Total Records: {totalDataCount} | 
              Showing: {getChartDataFromDataset('ph').length} points
            </div>
          </div>

          {/* Comparison Chart */}
          {selectedMetrics.length > 1 && (
            <div style={{ marginBottom: '24px' }}>
              <ComparisonChart
                title="Metric Comparison"
                icon={<BarChart3 size={24} color={theme.accent} />}
                data={getComparisonData()}
                metrics={selectedMetrics.map(metric => ({
                  key: metric,
                  color: metric === 'ph' ? '#10b981' : 
                         metric === 'temperature' ? '#8b5cf6' : 
                         metric === 'humidity' ? '#34d399' : '#f59e0b',
                  name: metric.charAt(0).toUpperCase() + metric.slice(1)
                }))}
                isDarkMode={isDarkMode}
                theme={theme}
              />
            </div>
          )}

          {/* Individual Metric Charts */}
          <div style={{ display: 'grid', gap: 24, gridTemplateColumns: 'repeat(auto-fill, minmax(360px, 1fr))', alignItems: 'stretch' }}>
            <ChartCard
              title="pH"
              icon={<Droplets size={24} color={isDarkMode ? theme.accent : theme.accent} />}
              color={isDarkMode ? '#10b981' : '#2e7c7c'}
              data={getChartDataFromDataset('ph')}
              dataKey="ph"
              isDarkMode={isDarkMode}
              theme={theme}
              yDomain={[0, 14]}
              optimalRange={optimalRanges.ph}
              anomalies={detectAnomalies(getChartDataFromDataset('ph'), 'ph')}
              showAlerts={true}
            />

            <ChartCard
              title="TDS"
              icon={<TrendingUp size={24} color={isDarkMode ? '#34d399' : theme.accent} />}
              color={isDarkMode ? '#f59e0b' : '#5a8a8a'}
              data={getChartDataFromDataset('tds')}
              dataKey="tds"
              isDarkMode={isDarkMode}
              theme={theme}
              optimalRange={optimalRanges.tds}
              anomalies={detectAnomalies(getChartDataFromDataset('tds'), 'tds')}
              showAlerts={true}
            />

            <ChartCard
              title="Temperature"
              icon={<TrendingUp size={24} color={isDarkMode ? '#f59e0b' : theme.accent} />}
              color={isDarkMode ? '#8b5cf6' : '#6cc3c3'}
              data={getChartDataFromDataset('temperature')}
              dataKey="temperature"
              isDarkMode={isDarkMode}
              theme={theme}
              optimalRange={optimalRanges.temperature}
              anomalies={detectAnomalies(getChartDataFromDataset('temperature'), 'temperature')}
              showAlerts={true}
            />

            <ChartCard
              title="Humidity"
              icon={<Droplets size={24} color={isDarkMode ? '#34d399' : theme.accent} />}
              color={isDarkMode ? '#10b981' : '#2e7c7c'}
              data={getChartDataFromDataset('humidity')}
              dataKey="humidity"
              isDarkMode={isDarkMode}
              theme={theme}
              yDomain={[0, 100]}
              optimalRange={optimalRanges.humidity}
              anomalies={detectAnomalies(getChartDataFromDataset('humidity'), 'humidity')}
              showAlerts={true}
            />

            <ChartCard
              title="Dissolved Oxygen"
              icon={<Droplets size={24} color={isDarkMode ? '#8b5cf6' : theme.accent} />}
              color={isDarkMode ? '#8b5cf6' : '#6cc3c3'}
              data={getChartDataFromDataset('dissolvedOxy')}
              dataKey="dissolvedOxy"
              isDarkMode={isDarkMode}
              theme={theme}
              optimalRange={optimalRanges.dissolvedOxy}
              anomalies={detectAnomalies(getChartDataFromDataset('dissolvedOxy'), 'dissolvedOxy')}
              showAlerts={true}
            />
          </div>
        </>
        )}
    </div>
  );
};

export default AnalyticsPage;
