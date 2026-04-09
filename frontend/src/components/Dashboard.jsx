import React, { useMemo } from 'react';
import { XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell, Line, LineChart, Legend } from 'recharts';
import { Leaf, Activity, TrendingUp, AlertTriangle, CheckCircle, Droplets, Thermometer, Sun } from 'lucide-react';
import PageHeader from '../components/PageHeader';

const HEALTH_COLORS = {
  Healthy: '#d3ff5c',
  'Moderate Stress': '#ffa500',
  'High Stress': '#ff6b6b'
};

const getStressLevel = (status) => {
  if (status === 'Healthy') return 'Low';
  if (status === 'Moderate Stress') return 'Medium';
  return 'High';
};

const numberOrDash = (value, digits = 1) =>
  value != null && Number.isFinite(Number(value)) ? Number(value).toFixed(digits) : '—';

const Dashboard = ({
  theme,
  isDarkMode,
  plants = [],
  latestSnapshot,
  dashboardTrend = [],
  payload,
  hasLiveDb,
  livePollMs = 3000,
  onViewAllPlants,
  onToggleTheme,
  notifications,
  isNotificationsOpen,
  onOpenNotifications,
  onOpenStressInsights
}) => {
  const trendAverages = useMemo(() => {
    if (!dashboardTrend?.length) return null;
    const phs = dashboardTrend.map((t) => t.ph).filter((v) => v != null && !Number.isNaN(v));
    const temps = dashboardTrend.map((t) => t.temp).filter((v) => v != null && !Number.isNaN(v));
    if (!phs.length && !temps.length) return null;
    return {
      avgPH: phs.length
        ? (phs.reduce((a, b) => a + b, 0) / phs.length).toFixed(2)
        : null,
      avgTemp: temps.length
        ? (temps.reduce((a, b) => a + b, 0) / temps.length).toFixed(1)
        : null
    };
  }, [dashboardTrend]);

  const stats = useMemo(() => {
    const total = plants.length || 0;
    const healthy = plants.filter((p) => p.health_status === 'Healthy').length;
    const moderate = plants.filter((p) => p.health_status === 'Moderate Stress').length;
    const stressed = plants.filter((p) => p.health_status === 'High Stress').length;

    const avgPH = total
      ? (plants.reduce((sum, p) => sum + (Number(p.metrics?.ph) || 0), 0) / total).toFixed(2)
      : '—';
    const avgTemp = total
      ? (plants.reduce((sum, p) => sum + (Number(p.metrics?.temperature) || 0), 0) / total).toFixed(1)
      : '—';
    const avgHumidity = total
      ? (plants.reduce((sum, p) => sum + (Number(p.metrics?.humidity) || 0), 0) / total).toFixed(1)
      : '—';

    return {
      totalPlants: total,
      activeMonitoring: total,
      healthyPlants: healthy,
      avgGrowthRate: total ? Math.round((healthy / total) * 100) : 0,
      moderateStress: moderate,
      highStress: stressed,
      avgPH,
      avgTemp,
      avgHumidity
    };
  }, [plants]);

  const plantHealthData = useMemo(() => {
    const healthy = plants.filter((p) => p.health_status === 'Healthy').length;
    const moderate = plants.filter((p) => p.health_status === 'Moderate Stress').length;
    const stressed = plants.filter((p) => p.health_status === 'High Stress').length;
    
    return [
      { name: 'Healthy', value: healthy, color: '#d3ff5c' },
      { name: 'Moderate Stress', value: moderate, color: '#ffa500' },
      { name: 'High Stress', value: stressed, color: '#ff6b6b' }
    ].filter(item => item.value > 0);
  }, [plants]);

  const recentPlants = useMemo(() => {
    return plants.map((plant) => ({
      name: plant.display_name,
      status: plant.health_status,
      ph: numberOrDash(plant.metrics?.ph, 1),
      temp: numberOrDash(plant.metrics?.temperature, 1),
      avatarLabel: plant.species === 'Green Lettuce' ? 'GL' : plant.species === 'Red Lettuce' ? 'RL' : 'BH',
      avatarBg: plant.species === 'Green Lettuce' ? 'rgba(34,197,94,0.18)' : plant.species === 'Red Lettuce' ? 'rgba(244,63,94,0.18)' : 'rgba(250,204,21,0.18)',
      avatarColor: plant.species === 'Green Lettuce' ? '#4ade80' : plant.species === 'Red Lettuce' ? '#fb7185' : '#facc15',
      stressLevel: getStressLevel(plant.health_status),
      stressColor: HEALTH_COLORS[plant.health_status] || '#9ca3af'
    }));
  }, [plants]);

  const liveSensorTrend = useMemo(() => {
    const sourceRows =
      payload?.primary_source === 'project_readings'
        ? payload?.project_readings || []
        : payload?.plant_readings || [];

    return [...sourceRows]
      .sort((a, b) => (a.id ?? 0) - (b.id ?? 0))
      .map((row, index) => ({
        label: `#${index + 1}`,
        ambient_temperature: Number(row.ambient_temperature ?? row.temperature),
        humidity: Number(row.humidity),
        soil_temperature: Number(row.soil_temperature),
        light_intensity: Number(row.light_intensity),
        ph: Number(row.ph_value ?? row.soil_ph ?? row.ph),
        dissolved_oxygen: Number(row.dissolved_oxygen ?? row.dissolvedOxy),
        ec: Number(row.ec_value ?? row.ec),
        tds: Number(row.tds_value ?? row.tds),
        electrochemical_signal: Number(row.electrochemical_signal)
      }))
      .filter((row) =>
        Object.keys(row).some((key) => key !== 'label' && Number.isFinite(row[key]))
      );
  }, [payload]);

  return (
    <div style={{ marginBottom: '40px' }}>
      <PageHeader 
        title="Dashboard" 
        subtitle="Plant monitoring overview"
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
            marginBottom: '20px',
            border: `1px solid ${theme.border}`,
            color: theme.textMuted,
            fontSize: '13px'
          }}
        >
          Live database readings update the metrics and trend chart about every {Math.round(livePollMs / 1000)}s.
          {latestSnapshot?.ph != null && (
            <span style={{ color: theme.text, marginLeft: 8 }}>
              Latest pH: <strong>{Number(latestSnapshot.ph).toFixed(2)}</strong>
            </span>
          )}
        </div>
      )}

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '20px', marginBottom: '32px' }}>
        <div style={{ background: `linear-gradient(135deg, ${theme.card} 0%, ${theme.surface} 100%)`, borderRadius: '16px', padding: '24px', border: `1px solid ${theme.border}`, boxShadow: isDarkMode ? '0 4px 20px rgba(0, 0, 0, 0.3)' : '0 2px 10px rgba(0, 0, 0, 0.1)', position: 'relative', overflow: 'hidden' }}>
          <div style={{ position: 'absolute', top: '10px', right: '10px', opacity: 0.1 }}><Leaf size={60} color={theme.accent} /></div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '12px' }}>
            <div style={{ padding: '10px', borderRadius: '12px', background: `${theme.accent}20`, display: 'flex', alignItems: 'center', justifyContent: 'center' }}><Leaf size={20} color={theme.accent} /></div>
            <div style={{ color: theme.textMuted, fontSize: '14px' }}>Total Plants</div>
          </div>
          <div style={{ color: theme.text, fontSize: '32px', fontWeight: 'bold' }}>{stats.totalPlants}</div>
        </div>

        <div style={{ background: `linear-gradient(135deg, ${theme.card} 0%, ${theme.surface} 100%)`, borderRadius: '16px', padding: '24px', border: `1px solid ${theme.border}`, boxShadow: isDarkMode ? '0 4px 20px rgba(0, 0, 0, 0.3)' : '0 2px 10px rgba(0, 0, 0, 0.1)', position: 'relative', overflow: 'hidden' }}>
          <div style={{ position: 'absolute', top: '10px', right: '10px', opacity: 0.1 }}><Activity size={60} color="#4ade80" /></div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '12px' }}>
            <div style={{ padding: '10px', borderRadius: '12px', background: '#4ade8020', display: 'flex', alignItems: 'center', justifyContent: 'center' }}><Activity size={20} color="#4ade80" /></div>
            <div style={{ color: theme.textMuted, fontSize: '14px' }}>Active Monitoring</div>
          </div>
          <div style={{ color: theme.text, fontSize: '32px', fontWeight: 'bold' }}>{stats.activeMonitoring}</div>
        </div>

        <div style={{ background: `linear-gradient(135deg, ${theme.card} 0%, ${theme.surface} 100%)`, borderRadius: '16px', padding: '24px', border: `1px solid ${theme.border}`, boxShadow: isDarkMode ? '0 4px 20px rgba(0, 0, 0, 0.3)' : '0 2px 10px rgba(0, 0, 0, 0.1)', position: 'relative', overflow: 'hidden' }}>
          <div style={{ position: 'absolute', top: '10px', right: '10px', opacity: 0.1 }}><CheckCircle size={60} color="#d3ff5c" /></div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '12px' }}>
            <div style={{ padding: '10px', borderRadius: '12px', background: '#d3ff5c20', display: 'flex', alignItems: 'center', justifyContent: 'center' }}><CheckCircle size={20} color="#d3ff5c" /></div>
            <div style={{ color: theme.textMuted, fontSize: '14px' }}>Healthy Plants</div>
          </div>
          <div style={{ color: '#d3ff5c', fontSize: '32px', fontWeight: 'bold' }}>{stats.healthyPlants}</div>
        </div>

        <div style={{ background: `linear-gradient(135deg, ${theme.card} 0%, ${theme.surface} 100%)`, borderRadius: '16px', padding: '24px', border: `1px solid ${theme.border}`, boxShadow: isDarkMode ? '0 4px 20px rgba(0, 0, 0, 0.3)' : '0 2px 10px rgba(0, 0, 0, 0.1)', position: 'relative', overflow: 'hidden' }}>
          <div style={{ position: 'absolute', top: '10px', right: '10px', opacity: 0.1 }}><TrendingUp size={60} color={theme.accent} /></div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '12px' }}>
            <div style={{ padding: '10px', borderRadius: '12px', background: `${theme.accent}20`, display: 'flex', alignItems: 'center', justifyContent: 'center' }}><TrendingUp size={20} color={theme.accent} /></div>
            <div style={{ color: theme.textMuted, fontSize: '14px' }}>Health Rate</div>
          </div>
          <div style={{ color: theme.accent, fontSize: '32px', fontWeight: 'bold' }}>{stats.avgGrowthRate}%</div>
        </div>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '20px', marginBottom: '32px' }}>
        <div style={{ background: theme.card, borderRadius: '16px', padding: '20px', border: `1px solid ${theme.border}`, boxShadow: isDarkMode ? '0 4px 20px rgba(0, 0, 0, 0.3)' : '0 2px 10px rgba(0, 0, 0, 0.1)', display: 'flex', alignItems: 'center', gap: '16px' }}>
          <div style={{ padding: '12px', borderRadius: '12px', background: '#ff6b6b20', display: 'flex', alignItems: 'center', justifyContent: 'center' }}><AlertTriangle size={24} color="#ff6b6b" /></div>
          <div><div style={{ color: theme.textMuted, fontSize: '12px', marginBottom: '4px' }}>High Stress</div><div style={{ color: '#ff6b6b', fontSize: '24px', fontWeight: 'bold' }}>{stats.highStress}</div></div>
        </div>

        <div style={{ background: theme.card, borderRadius: '16px', padding: '20px', border: `1px solid ${theme.border}`, boxShadow: isDarkMode ? '0 4px 20px rgba(0, 0, 0, 0.3)' : '0 2px 10px rgba(0, 0, 0, 0.1)', display: 'flex', alignItems: 'center', gap: '16px' }}>
          <div style={{ padding: '12px', borderRadius: '12px', background: '#ffa50020', display: 'flex', alignItems: 'center', justifyContent: 'center' }}><AlertTriangle size={24} color="#ffa500" /></div>
          <div><div style={{ color: theme.textMuted, fontSize: '12px', marginBottom: '4px' }}>Moderate Stress</div><div style={{ color: '#ffa500', fontSize: '24px', fontWeight: 'bold' }}>{stats.moderateStress}</div></div>
        </div>

        <div style={{ background: theme.card, borderRadius: '16px', padding: '20px', border: `1px solid ${theme.border}`, boxShadow: isDarkMode ? '0 4px 20px rgba(0, 0, 0, 0.3)' : '0 2px 10px rgba(0, 0, 0, 0.1)', display: 'flex', alignItems: 'center', gap: '16px' }}>
          <div style={{ padding: '12px', borderRadius: '12px', background: `${theme.accent}20`, display: 'flex', alignItems: 'center', justifyContent: 'center' }}><Droplets size={24} color={theme.accent} /></div>
          <div><div style={{ color: theme.textMuted, fontSize: '12px', marginBottom: '4px' }}>Avg pH{trendAverages?.avgPH ? ' (live window)' : ''}</div><div style={{ color: theme.text, fontSize: '24px', fontWeight: 'bold' }}>{trendAverages?.avgPH ?? stats.avgPH}</div></div>
        </div>

        <div style={{ background: theme.card, borderRadius: '16px', padding: '20px', border: `1px solid ${theme.border}`, boxShadow: isDarkMode ? '0 4px 20px rgba(0, 0, 0, 0.3)' : '0 2px 10px rgba(0, 0, 0, 0.1)', display: 'flex', alignItems: 'center', gap: '16px' }}>
          <div style={{ padding: '12px', borderRadius: '12px', background: '#ff6b6b20', display: 'flex', alignItems: 'center', justifyContent: 'center' }}><Thermometer size={24} color="#ff6b6b" /></div>
          <div><div style={{ color: theme.textMuted, fontSize: '12px', marginBottom: '4px' }}>Avg Temperature{trendAverages?.avgTemp ? ' (live window)' : ''}</div><div style={{ color: theme.text, fontSize: '24px', fontWeight: 'bold' }}>{(trendAverages?.avgTemp ?? stats.avgTemp)}°C</div></div>
        </div>

        <div style={{ background: theme.card, borderRadius: '16px', padding: '20px', border: `1px solid ${theme.border}`, boxShadow: isDarkMode ? '0 4px 20px rgba(0, 0, 0, 0.3)' : '0 2px 10px rgba(0, 0, 0, 0.1)', display: 'flex', alignItems: 'center', gap: '16px' }}>
          <div style={{ padding: '12px', borderRadius: '12px', background: `${theme.accent}20`, display: 'flex', alignItems: 'center', justifyContent: 'center' }}><Sun size={24} color={theme.accent} /></div>
          <div><div style={{ color: theme.textMuted, fontSize: '12px', marginBottom: '4px' }}>Avg Humidity{latestSnapshot?.humidity != null ? ' (latest live)' : ''}</div><div style={{ color: theme.text, fontSize: '24px', fontWeight: 'bold' }}>{latestSnapshot?.humidity != null ? Number(latestSnapshot.humidity).toFixed(1) : stats.avgHumidity}%</div></div>
        </div>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(400px, 1fr))', gap: '24px', marginBottom: '32px' }}>
        <div style={{ background: theme.card, borderRadius: '16px', padding: '24px', border: `1px solid ${theme.border}`, boxShadow: isDarkMode ? '0 4px 20px rgba(0, 0, 0, 0.3)' : '0 2px 10px rgba(0, 0, 0, 0.1)' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '20px' }}>
            <TrendingUp size={20} color={theme.accent} />
            <h3 style={{ color: theme.text, fontSize: '18px', fontWeight: 'bold', margin: 0 }}>{liveSensorTrend.length ? 'Live sensor trend (database readings)' : 'Weekly Trends'}</h3>
          </div>
          <ResponsiveContainer width="100%" height={250}>
            <LineChart data={liveSensorTrend}>
              <CartesianGrid strokeDasharray="3 3" stroke={theme.border} />
              <XAxis dataKey="label" stroke={theme.textMuted} tick={{ fontSize: 10 }} />
              <YAxis stroke={theme.textMuted} />
              <Tooltip contentStyle={{ backgroundColor: theme.card, border: `1px solid ${theme.border}`, borderRadius: '8px', color: theme.text }} />
              <Legend wrapperStyle={{ fontSize: 11 }} />
              <Line type="monotone" dataKey="ambient_temperature" name="Ambient Temp" stroke="#22c55e" strokeWidth={2} dot={false} isAnimationActive={false} />
              <Line type="monotone" dataKey="humidity" name="Humidity" stroke="#3b82f6" strokeWidth={2} dot={false} isAnimationActive={false} />
              <Line type="monotone" dataKey="soil_temperature" name="Soil Temp" stroke="#ef4444" strokeWidth={2} dot={false} isAnimationActive={false} />
              <Line type="monotone" dataKey="light_intensity" name="Light" stroke="#f59e0b" strokeWidth={2} dot={false} isAnimationActive={false} />
              <Line type="monotone" dataKey="ph" name="pH" stroke="#d3ff5c" strokeWidth={2} dot={false} isAnimationActive={false} />
              <Line type="monotone" dataKey="dissolved_oxygen" name="DO" stroke="#a855f7" strokeWidth={2} dot={false} isAnimationActive={false} />
              <Line type="monotone" dataKey="ec" name="EC" stroke="#14b8a6" strokeWidth={2} dot={false} isAnimationActive={false} />
              <Line type="monotone" dataKey="tds" name="TDS" stroke="#f97316" strokeWidth={2} dot={false} isAnimationActive={false} />
              <Line type="monotone" dataKey="electrochemical_signal" name="Electrochemical" stroke="#ec4899" strokeWidth={2} dot={false} isAnimationActive={false} />
            </LineChart>
          </ResponsiveContainer>
        </div>

        <div style={{ background: theme.card, borderRadius: '16px', padding: '24px', border: `1px solid ${theme.border}`, boxShadow: isDarkMode ? '0 4px 20px rgba(0, 0, 0, 0.3)' : '0 2px 10px rgba(0, 0, 0, 0.1)' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '20px' }}>
            <Activity size={20} color={theme.accent} />
            <h3 style={{ color: theme.text, fontSize: '18px', fontWeight: 'bold', margin: 0 }}>Plant Status Distribution</h3>
          </div>
          <ResponsiveContainer width="100%" height={250}>
            <PieChart>
              <Pie data={plantHealthData} cx="50%" cy="50%" labelLine={false} label={({ name, percent }) => `${name}: ${(percent * 100).toFixed(0)}%`} outerRadius={80} dataKey="value">
                {plantHealthData.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={entry.color} />
                ))}
              </Pie>
              <Tooltip contentStyle={{ backgroundColor: theme.card, border: `1px solid ${theme.border}`, borderRadius: '8px', color: theme.text }} />
            </PieChart>
          </ResponsiveContainer>
        </div>
      </div>

      <div style={{ background: theme.card, borderRadius: '16px', padding: '24px', border: `1px solid ${theme.border}`, boxShadow: isDarkMode ? '0 4px 20px rgba(0, 0, 0, 0.3)' : '0 2px 10px rgba(0, 0, 0, 0.1)' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
            <Leaf size={20} color={theme.accent} />
            <h3 style={{ color: theme.text, fontSize: '18px', fontWeight: 'bold', margin: 0 }}>Recent Plant Entries</h3>
          </div>
          <button
            onClick={onViewAllPlants}
            style={{ padding: '8px 16px', borderRadius: '8px', border: `1px solid ${theme.border}`, background: 'transparent', color: theme.text, fontSize: '14px', cursor: 'pointer', transition: 'all 0.2s ease' }}
            onMouseEnter={(e) => { e.target.style.background = theme.surface; }}
            onMouseLeave={(e) => { e.target.style.background = 'transparent'; }}
          >
            View All
          </button>
        </div>

        <div style={{ display: 'grid', gap: '12px' }}>
          {recentPlants.map((plant, index) => (
            <div
              key={index}
              style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '16px', background: theme.surface, borderRadius: '12px', border: `1px solid ${theme.border}`, transition: 'all 0.2s ease' }}
              onMouseEnter={(e) => {
                e.currentTarget.style.transform = 'translateX(4px)';
                e.currentTarget.style.borderColor = plant.stressColor;
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.transform = 'translateX(0)';
                e.currentTarget.style.borderColor = theme.border;
              }}
            >
              <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                <div
                  style={{
                    width: '44px',
                    height: '44px',
                    borderRadius: '12px',
                    background: plant.avatarBg,
                    color: plant.avatarColor,
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    fontWeight: '700',
                    fontSize: '13px',
                    border: `1px solid ${plant.avatarColor}40`
                  }}
                >
                  <Leaf size={16} />
                </div>
                <div>
                  <div style={{ color: theme.text, fontWeight: '600', marginBottom: '4px' }}>{plant.name}</div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                    <div style={{ width: '8px', height: '8px', borderRadius: '50%', backgroundColor: plant.stressColor }} />
                    <span style={{ color: theme.textMuted, fontSize: '12px' }}>{plant.stressLevel} Stress</span>
                  </div>
                </div>
              </div>
              <div style={{ display: 'flex', gap: '24px', alignItems: 'center' }}>
                <div style={{ textAlign: 'right' }}><div style={{ color: theme.textMuted, fontSize: '12px' }}>pH</div><div style={{ color: theme.text, fontWeight: '600' }}>{plant.ph}</div></div>
                <div style={{ textAlign: 'right' }}><div style={{ color: theme.textMuted, fontSize: '12px' }}>Temp</div><div style={{ color: theme.text, fontWeight: '600' }}>{plant.temp}°C</div></div>
                <div style={{ padding: '6px 12px', borderRadius: '8px', background: `${plant.stressColor}20`, border: `1px solid ${plant.stressColor}40` }}>
                  <span style={{ color: plant.stressColor, fontSize: '12px', fontWeight: '600' }}>{plant.status}</span>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
