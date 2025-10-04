import React from 'react';
import { Droplets, TrendingUp } from 'lucide-react';
import { ResponsiveContainer, LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend } from 'recharts';

const ChartCard = ({ title, icon, color, data, dataKey, isDarkMode, theme, yDomain }) => (
  <div style={{ background: isDarkMode ? 'rgba(255,255,255,0.04)' : '#fafafa', borderRadius: 16, padding: 24 }}>
    <h2 style={{ fontSize: '1.5rem', fontWeight: 'bold', color: theme.text, marginBottom: 24, display: 'flex', alignItems: 'center', gap: 12 }}>
      {icon}
      {title}
    </h2>
    <ResponsiveContainer width="100%" height={300}>
      <LineChart data={data}>
        <CartesianGrid strokeDasharray="3 3" stroke={isDarkMode ? 'rgba(255,255,255,0.1)' : 'rgba(0,0,0,0.08)'} />
        <XAxis dataKey="timestamp" stroke={isDarkMode ? '#94a3b8' : '#555'} angle={-45} textAnchor="end" height={70} />
        <YAxis stroke={isDarkMode ? '#94a3b8' : '#555'} domain={yDomain || [0, 'auto']} />
        <Tooltip contentStyle={{ backgroundColor: isDarkMode ? 'rgba(0,0,0,0.8)' : '#fff', border: 'none', borderRadius: 8, color: theme.text }} />
        <Legend />
        <Line type="monotone" dataKey={dataKey} stroke={color} strokeWidth={3} dot={{ r: 6 }} />
      </LineChart>
    </ResponsiveContainer>
  </div>
);

const AnalyticsPage = ({ styles, getChartData, getTrendAnalysis, pastDays, setPastDays, isDarkMode, theme, plantInfo, plantData }) => {
  return (
    <div style={styles.container}>
      <div style={styles.card}>
        <div style={{ display: 'flex', justifyContent: 'center', marginBottom: 8 }}>
          <h1 style={{ ...styles.pageTitle, textAlign: 'center' }}>Analytics Dashboard</h1>
        </div>
        <div style={{ marginBottom: 24 }}>
          <label style={styles.label}>
            Analyze trends over the past
            <input type="number" min="1" value={pastDays} onChange={(e) => setPastDays(Math.max(1, parseInt(e.target.value) || 7))} style={{ ...styles.input, width: 80, marginLeft: 8, marginRight: 8 }} />
            days
          </label>
        </div>

        {getChartData('ph').length === 0 ? (
          <div style={{ color: theme.accent, textAlign: 'center' }}>No data available for analytics. Please add entries from the dashboard.</div>
        ) : (
          <div style={{ display: 'grid', gap: 24, gridTemplateColumns: 'repeat(auto-fill, minmax(360px, 1fr))', alignItems: 'stretch' }}>
            <ChartCard
              title="pH Trends"
              icon={<Droplets size={24} color={isDarkMode ? theme.accent : theme.accent} />}
              color={isDarkMode ? '#10b981' : '#2e7c7c'}
              data={getChartData('ph')}
              dataKey="ph"
              isDarkMode={isDarkMode}
              theme={theme}
              yDomain={[0, 14]}
            />

            <ChartCard
              title="TDS Trends"
              icon={<TrendingUp size={24} color={isDarkMode ? '#34d399' : theme.accent} />}
              color={isDarkMode ? '#f59e0b' : '#5a8a8a'}
              data={getChartData('tds')}
              dataKey="tds"
              isDarkMode={isDarkMode}
              theme={theme}
            />

            <ChartCard
              title="Temperature Trends"
              icon={<TrendingUp size={24} color={isDarkMode ? '#f59e0b' : theme.accent} />}
              color={isDarkMode ? '#8b5cf6' : '#6cc3c3'}
              data={getChartData('temperature')}
              dataKey="temperature"
              isDarkMode={isDarkMode}
              theme={theme}
            />

            <ChartCard
              title="Humidity Trends"
              icon={<Droplets size={24} color={isDarkMode ? '#34d399' : theme.accent} />}
              color={isDarkMode ? '#10b981' : '#2e7c7c'}
              data={getChartData('humidity')}
              dataKey="humidity"
              isDarkMode={isDarkMode}
              theme={theme}
              yDomain={[0, 100]}
            />

            <ChartCard
              title="Dissolved Oxygen Trends"
              icon={<Droplets size={24} color={isDarkMode ? '#8b5cf6' : theme.accent} />}
              color={isDarkMode ? '#8b5cf6' : '#6cc3c3'}
              data={getChartData('dissolvedOxy')}
              dataKey="dissolvedOxy"
              isDarkMode={isDarkMode}
              theme={theme}
            />
          </div>
        )}

        <div style={{ display: 'grid', gap: 24, gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))', marginTop: 24, alignItems: 'stretch' }}>
          {Object.keys(plantInfo).map((plantName) => {
            const entries = plantData.filter((entry) => new Date(entry.timestamp) >= new Date().setDate(new Date().getDate() - pastDays));
            return (
              <div key={plantName} style={{ padding: 24, borderRadius: 16, color: theme.text, textAlign: 'center', background: plantInfo[plantName].color }}>
                <div style={{ fontSize: '1.25rem', fontWeight: 'bold', marginBottom: 16 }}>{plantName}</div>
                <div>
                  <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 8 }}><span>Entries:</span><span style={{ fontWeight: 600 }}>{entries.length}</span></div>
                  <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 8 }}><span>Avg pH:</span><span style={{ fontWeight: 600 }}>{plantInfo[plantName].optimalPH}</span></div>
                  <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 8 }}><span>Avg TDS:</span><span style={{ fontWeight: 600 }}>{plantInfo[plantName].optimalTDS}</span></div>
                  <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 8 }}><span>Avg Temperature:</span><span style={{ fontWeight: 600 }}>{plantInfo[plantName].optimalTemperature}</span></div>
                  <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 8 }}><span>Avg Humidity:</span><span style={{ fontWeight: 600 }}>{plantInfo[plantName].optimalHumidity}</span></div>
                  <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 8 }}><span>Avg Dissolved Oxygen:</span><span style={{ fontWeight: 600 }}>{plantInfo[plantName].optimalDissolvedOxy}</span></div>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};

export default AnalyticsPage;


