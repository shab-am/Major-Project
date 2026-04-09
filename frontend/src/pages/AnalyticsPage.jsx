import React, { useState, useMemo } from 'react';
import { Droplets, TrendingUp, AlertTriangle, Filter, BarChart3 } from 'lucide-react';
import { ResponsiveContainer, LineChart, Line, AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ReferenceLine } from 'recharts';
import PageHeader from '../components/PageHeader';

const ChartTooltip = ({ active, payload, label, theme, isDarkMode }) => {
  if (!active || !payload?.length) return null;
  return (
    <div
      style={{
        backgroundColor: isDarkMode ? 'rgba(0,0,0,0.85)' : '#fff',
        border: 'none',
        borderRadius: 8,
        padding: '8px 12px',
        color: theme.text,
        fontSize: 13
      }}
    >
      <div style={{ fontWeight: 600, marginBottom: 4 }}>Reading {label}</div>
      {payload.map((p) => (
        <div key={p.dataKey}>
          {p.name}: {p.value != null && typeof p.value === 'number' ? p.value.toFixed(2) : p.value}
        </div>
      ))}
    </div>
  );
};

const ChartCard = ({ title, icon, color, data, dataKey, isDarkMode, theme, yDomain, optimalRange, anomalies, showAlerts, xDataKey = 'readingLabel' }) => {
  const getAlertStatus = (value) => {
    if (!optimalRange) return null;
    if (value < optimalRange.min) return { type: 'low', color: '#ff6b6b' };
    if (value > optimalRange.max) return { type: 'high', color: '#ff6b6b' };
    return { type: 'normal', color: '#4ade80' };
  };

  const currentValue = data.length > 0 ? data[data.length - 1]?.[dataKey] : null;
  const alertStatus = currentValue != null ? getAlertStatus(currentValue) : null;
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
            <div style={{ padding: '4px 10px', borderRadius: '8px', background: '#ff6b6b20', border: '1px solid #ff6b6b40', display: 'flex', alignItems: 'center', gap: '6px' }}>
              <AlertTriangle size={14} color="#ff6b6b" />
              <span style={{ color: '#ff6b6b', fontSize: '12px', fontWeight: '600' }}>
                {anomalies.length} Anomaly{anomalies.length > 1 ? 'ies' : ''}
              </span>
            </div>
          )}
          {showAlerts && alertStatus && alertStatus.type !== 'normal' && (
            <div style={{ padding: '4px 10px', borderRadius: '8px', background: `${alertStatus.color}20`, border: `1px solid ${alertStatus.color}40`, display: 'flex', alignItems: 'center', gap: '6px' }}>
              <AlertTriangle size={14} color={alertStatus.color} />
              <span style={{ color: alertStatus.color, fontSize: '12px', fontWeight: '600' }}>
                {alertStatus.type === 'low' ? 'Below Range' : 'Above Range'}
              </span>
            </div>
          )}
        </div>
      </div>
      <ResponsiveContainer width="100%" height={300}>
        <LineChart data={data}>
          <CartesianGrid strokeDasharray="3 3" stroke={isDarkMode ? 'rgba(255,255,255,0.1)' : 'rgba(0,0,0,0.08)'} />
          <XAxis dataKey={xDataKey} stroke={isDarkMode ? '#94a3b8' : '#555'} tick={{ fontSize: 11 }} height={36} />
          <YAxis stroke={isDarkMode ? '#94a3b8' : '#555'} domain={yDomain || [0, 'auto']} />
          <Tooltip content={(props) => <ChartTooltip {...props} theme={theme} isDarkMode={isDarkMode} />} />
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
            animationDuration={1800}
            animationEasing="ease-in-out"
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

const ComparisonChart = ({ title, icon, data, metrics, isDarkMode, theme, yDomain, xDataKey = 'readingLabel' }) => {
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
        <AreaChart data={data}>
          <CartesianGrid strokeDasharray="3 3" stroke={isDarkMode ? 'rgba(255,255,255,0.1)' : 'rgba(0,0,0,0.08)'} />
          <XAxis dataKey={xDataKey} stroke={isDarkMode ? '#94a3b8' : '#555'} tick={{ fontSize: 11 }} height={36} />
          <YAxis stroke={isDarkMode ? '#94a3b8' : '#555'} domain={yDomain || [0, 'auto']} />
          <Tooltip content={(props) => <ChartTooltip {...props} theme={theme} isDarkMode={isDarkMode} />} />
          <Legend />
          {metrics.map((metric) => (
            <Area key={metric.key} type="monotone" dataKey={metric.key} stackId={metric.stackId || '1'} stroke={metric.color} fill={metric.color} fillOpacity={0.3} strokeWidth={2} />
          ))}
        </AreaChart>
      </ResponsiveContainer>
    </div>
  );
};

const AnalyticsPage = ({
  theme,
  isDarkMode,
  analyticsLiveRows = [],
  hasLiveDb = false,
  livePollMs = 3000,
  onToggleTheme,
  notifications,
  isNotificationsOpen,
  onOpenNotifications,
  onOpenStressInsights
}) => {
  const [timeRange, setTimeRange] = useState('7');
  const [selectedMetrics, setSelectedMetrics] = useState(['ph', 'temperature']);

  const optimalRanges = {
    ph: { min: 5.5, max: 6.5, unit: '' },
    temperature: { min: 18, max: 24, unit: '°C' },
    humidity: { min: 55, max: 72, unit: '%' },
    tds: { min: 560, max: 900, unit: 'ppm' },
    dissolvedOxy: { min: 5, max: 9, unit: 'mg/L' }
  };

  const timeRangeOptions = [
    { value: '7', label: 'Last 7 Readings' },
    { value: '14', label: 'Last 14 Readings' },
    { value: '30', label: 'Last 30 Readings' },
    { value: '60', label: 'Last 60 Readings' },
    { value: 'all', label: 'All Readings' }
  ];

  const chartRows = useMemo(() => {
    const rows = analyticsLiveRows || [];
    if (timeRange === 'all') return rows;
    const size = Number(timeRange);
    return rows.slice(-size);
  }, [analyticsLiveRows, timeRange]);

  const detectAnomalies = (data, dataKey) => {
    if (!data || data.length < 4) return [];
    const values = data.map(d => d[dataKey]).filter(v => v != null && !isNaN(v));
    if (values.length < 4) return [];
    const sorted = [...values].sort((a, b) => a - b);
    const q1 = sorted[Math.floor(sorted.length * 0.25)];
    const q3 = sorted[Math.floor(sorted.length * 0.75)];
    const iqr = q3 - q1;
    const lowerBound = q1 - 1.5 * iqr;
    const upperBound = q3 + 1.5 * iqr;
    return data
      .map((item, index) => ({ ...item, index, value: item[dataKey] }))
      .filter(item => item.value != null && (item.value < lowerBound || item.value > upperBound))
      .map(item => ({ index: item.index, value: item.value, readingLabel: item.readingLabel }));
  };

  const getChartDataFromDataset = (dataType) =>
    chartRows
      .map((entry, index) => ({
        readingLabel: entry.readingLabel || `#${index + 1}`,
        ph: entry.Soil_pH ?? null,
        tds: entry.TDS ?? null,
        temperature: entry.Ambient_Temperature ?? null,
        humidity: entry.Humidity ?? null,
        dissolvedOxy: entry.Dissolved_Oxygen ?? null
      }))
      .filter((entry) => entry[dataType] != null);

  const getComparisonData = () => {
    const data = getChartDataFromDataset('ph');
    return data.map((item) => ({
      readingLabel: item.readingLabel,
      ...(selectedMetrics.includes('ph') && { ph: item.ph }),
      ...(selectedMetrics.includes('temperature') && { temperature: item.temperature }),
      ...(selectedMetrics.includes('humidity') && { humidity: item.humidity }),
      ...(selectedMetrics.includes('tds') && { tds: item.tds })
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
        notifications={notifications}
        isNotificationsOpen={isNotificationsOpen}
        onOpenNotifications={onOpenNotifications}
        onOpenStressInsights={onOpenStressInsights}
      />

      {hasLiveDb && (
        <div
          style={{
            background: theme.surface,
            borderRadius: '12px',
            padding: '12px 16px',
            marginBottom: '16px',
            border: `1px solid ${theme.border}`,
            color: theme.textMuted,
            fontSize: '13px'
          }}
        >
          Live sensor data from the database is merged into these charts and refreshes about every {Math.round(livePollMs / 1000)}s.
        </div>
      )}
      
      <div style={{ background: theme.card, borderRadius: '16px', padding: '20px', border: `1px solid ${theme.border}`, marginBottom: '24px', display: 'flex', alignItems: 'center', gap: '20px', flexWrap: 'wrap' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          <Filter size={18} color={theme.accent} />
          <span style={{ color: theme.text, fontSize: '14px', fontWeight: '600' }}>Filters:</span>
        </div>
        
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          <label style={{ color: theme.textMuted, fontSize: '13px' }}>Time Range:</label>
          <select
            value={timeRange}
            onChange={(e) => setTimeRange(e.target.value)}
            style={{ padding: '8px 12px', borderRadius: '8px', border: `1px solid ${theme.border}`, background: theme.surface, color: theme.text, fontSize: '13px', cursor: 'pointer', minWidth: '150px' }}
          >
            {timeRangeOptions.map(option => (
              <option key={option.value} value={option.value}>{option.label}</option>
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
            style={{ padding: '8px 12px', borderRadius: '8px', border: `1px solid ${theme.border}`, background: theme.surface, color: theme.text, fontSize: '13px', cursor: 'pointer', minWidth: '200px', minHeight: '40px' }}
          >
            <option value="ph">pH</option>
            <option value="temperature">Temperature</option>
            <option value="humidity">Humidity</option>
            <option value="tds">TDS</option>
          </select>
        </div>
      </div>

      {chartRows.length === 0 ? (
        <div style={{ color: theme.accent, textAlign: 'center', padding: '40px' }}>
          No data available for analytics. Ensure live readings are being written to the database.
        </div>
      ) : (
        <>
          <div style={{ background: theme.surface, borderRadius: '12px', padding: '16px', marginBottom: '24px', border: `1px solid ${theme.border}`, display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '12px' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
              <BarChart3 size={20} color={theme.accent} />
              <span style={{ color: theme.text, fontSize: '14px', fontWeight: '600' }}>Data Source: Live DB</span>
            </div>
            <div style={{ color: theme.textMuted, fontSize: '13px' }}>
              Total Records: {analyticsLiveRows.length} | Showing: {chartRows.length} points
            </div>
          </div>

          {selectedMetrics.length > 1 && (
            <div style={{ marginBottom: '24px' }}>
              <ComparisonChart
                title="Metric Comparison"
                icon={<BarChart3 size={24} color={theme.accent} />}
                data={getComparisonData()}
                xDataKey="readingLabel"
                metrics={selectedMetrics.map(metric => ({
                  key: metric,
                  color: metric === 'ph' ? '#10b981' : metric === 'temperature' ? '#8b5cf6' : metric === 'humidity' ? '#34d399' : '#f59e0b',
                  name: metric.charAt(0).toUpperCase() + metric.slice(1)
                }))}
                isDarkMode={isDarkMode}
                theme={theme}
              />
            </div>
          )}

          <div style={{ display: 'grid', gap: 24, gridTemplateColumns: 'repeat(auto-fill, minmax(360px, 1fr))', alignItems: 'stretch' }}>
            <ChartCard title="pH" icon={<Droplets size={24} color={isDarkMode ? theme.accent : theme.accent} />} color={isDarkMode ? '#10b981' : '#2e7c7c'} data={getChartDataFromDataset('ph')} dataKey="ph" isDarkMode={isDarkMode} theme={theme} yDomain={[0, 14]} optimalRange={optimalRanges.ph} anomalies={detectAnomalies(getChartDataFromDataset('ph'), 'ph')} showAlerts={true} />
            <ChartCard title="TDS" icon={<TrendingUp size={24} color={isDarkMode ? '#34d399' : theme.accent} />} color={isDarkMode ? '#f59e0b' : '#5a8a8a'} data={getChartDataFromDataset('tds')} dataKey="tds" isDarkMode={isDarkMode} theme={theme} optimalRange={optimalRanges.tds} anomalies={detectAnomalies(getChartDataFromDataset('tds'), 'tds')} showAlerts={true} />
            <ChartCard title="Temperature" icon={<TrendingUp size={24} color={isDarkMode ? '#f59e0b' : theme.accent} />} color={isDarkMode ? '#8b5cf6' : '#6cc3c3'} data={getChartDataFromDataset('temperature')} dataKey="temperature" isDarkMode={isDarkMode} theme={theme} optimalRange={optimalRanges.temperature} anomalies={detectAnomalies(getChartDataFromDataset('temperature'), 'temperature')} showAlerts={true} />
            <ChartCard title="Humidity" icon={<Droplets size={24} color={isDarkMode ? '#34d399' : theme.accent} />} color={isDarkMode ? '#10b981' : '#2e7c7c'} data={getChartDataFromDataset('humidity')} dataKey="humidity" isDarkMode={isDarkMode} theme={theme} yDomain={[0, 100]} optimalRange={optimalRanges.humidity} anomalies={detectAnomalies(getChartDataFromDataset('humidity'), 'humidity')} showAlerts={true} />
            <ChartCard title="Dissolved Oxygen" icon={<Droplets size={24} color={isDarkMode ? '#8b5cf6' : theme.accent} />} color={isDarkMode ? '#8b5cf6' : '#6cc3c3'} data={getChartDataFromDataset('dissolvedOxy')} dataKey="dissolvedOxy" isDarkMode={isDarkMode} theme={theme} optimalRange={optimalRanges.dissolvedOxy} anomalies={detectAnomalies(getChartDataFromDataset('dissolvedOxy'), 'dissolvedOxy')} showAlerts={true} />
          </div>
        </>
      )}
    </div>
  );
};

export default AnalyticsPage;
