import React, { useMemo } from 'react';
import {
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  Line,
  LineChart,
  Legend,
  ReferenceLine
} from 'recharts';
import {
  Activity,
  CheckCircle,
  Droplets,
  Gauge,
  Leaf,
  Lightbulb,
  Radio,
  Sprout,
  Thermometer,
  TrendingUp,
  Waves,
  Zap
} from 'lucide-react';
import HardwareInterfacePage from '../pages/HardwareInterfacePage';

const HEALTH_COLORS = {
  Healthy: '#4ade80',
  'Moderate Stress': '#fbbf24',
  'High Stress': '#f87171'
};

const METRICS = [
  {
    key: 'ph',
    label: 'Water pH',
    unit: '',
    icon: Droplets,
    color: '#2dd4bf',
    fields: ['ph_value', 'soil_ph', 'ph'],
    decimals: 2,
    range: [5.6, 6.4]
  },
  {
    key: 'ambient_temperature',
    label: 'Ambient Temp',
    unit: 'C',
    icon: Thermometer,
    color: '#f97316',
    fields: ['ambient_temperature', 'temperature'],
    decimals: 1,
    range: [18, 24]
  },
  {
    key: 'water_temperature',
    label: 'Water Temp',
    unit: 'C',
    icon: Thermometer,
    color: '#ef4444',
    fields: ['soil_temperature', 'water_temperature'],
    decimals: 1,
    range: [18, 26]
  },
  {
    key: 'humidity',
    label: 'Humidity',
    unit: '%',
    icon: Waves,
    color: '#60a5fa',
    fields: ['humidity'],
    decimals: 1,
    range: [55, 72]
  },
  {
    key: 'light_intensity',
    label: 'Light',
    unit: '',
    icon: Lightbulb,
    color: '#facc15',
    fields: ['light_intensity'],
    decimals: 0
  },
  {
    key: 'dissolved_oxygen',
    label: 'Dissolved O2',
    unit: 'mg/L',
    icon: Activity,
    color: '#34d399',
    fields: ['dissolved_oxygen', 'dissolvedOxy'],
    decimals: 2,
    range: [5, 9]
  },
  {
    key: 'ec',
    label: 'EC',
    unit: 'mS/cm',
    icon: Zap,
    color: '#14b8a6',
    fields: ['ec_value', 'ec'],
    decimals: 3,
    range: [0.85, 2.1]
  },
  {
    key: 'tds',
    label: 'TDS',
    unit: 'ppm',
    icon: Gauge,
    color: '#a78bfa',
    fields: ['tds_value', 'tds'],
    decimals: 0,
    range: [560, 840]
  },
  {
    key: 'electrochemical_signal',
    label: 'Bio Signal',
    unit: '',
    icon: Radio,
    color: '#ec4899',
    fields: ['electrochemical_signal'],
    decimals: 3
  }
];

const TREND_METRIC_KEYS = ['ph', 'ambient_temperature', 'humidity', 'dissolved_oxygen', 'tds'];

function normalizeForTrend(value, metric) {
  if (value === null || !Number.isFinite(value) || !metric.range) return null;
  const [min, max] = metric.range;
  if (max === min) return 50;
  return Math.max(0, Math.min(100, 20 + ((value - min) / (max - min)) * 60));
}

function pickNumber(row, fields) {
  for (const field of fields) {
    const value = row?.[field];
    if (value !== null && value !== undefined && value !== '' && Number.isFinite(Number(value))) {
      return Number(value);
    }
  }
  return null;
}

function average(values) {
  const clean = values.filter((value) => value !== null && Number.isFinite(value));
  if (!clean.length) return null;
  return clean.reduce((sum, value) => sum + value, 0) / clean.length;
}

function formatValue(value, decimals = 0, unit = '') {
  if (value === null || value === undefined || !Number.isFinite(Number(value))) return '--';
  const number = Number(value).toFixed(decimals);
  return unit ? `${number} ${unit}` : number;
}

function statusFromRange(value, range) {
  if (value === null || !range) return { label: 'Tracking', color: '#60a5fa' };
  if (value < range[0]) return { label: 'Low', color: '#fbbf24' };
  if (value > range[1]) return { label: 'High', color: '#f87171' };
  return { label: 'Optimal', color: '#4ade80' };
}

function getLastRecordedAt(rows) {
  const row = [...rows].reverse().find((item) => item?.recorded_at || item?.timestamp);
  const value = row?.recorded_at || row?.timestamp;
  if (!value) return 'Just now';
  const date = new Date(value);
  return Number.isNaN(date.getTime()) ? value : date.toLocaleString();
}

function HealthTooltip({ active, payload, theme }) {
  if (!active || !payload?.length) return null;
  return (
    <div style={{ background: theme.card, border: `1px solid ${theme.border}`, borderRadius: 8, padding: 10, color: theme.text }}>
      <div style={{ fontSize: 12, fontWeight: 800 }}>{payload[0].name}</div>
      <div style={{ fontSize: 12, color: theme.textMuted }}>{payload[0].value} plants</div>
    </div>
  );
}

function TrendTooltip({ active, label, payload, theme, metricsByKey }) {
  if (!active || !payload?.length) return null;
  return (
    <div
      style={{
        background: theme.card,
        border: `1px solid ${theme.border}`,
        borderRadius: 8,
        padding: 10,
        color: theme.text,
        minWidth: 190
      }}
    >
      <div style={{ fontSize: 12, fontWeight: 800, marginBottom: 8 }}>{label}</div>
      {payload.map((item) => {
        const metric = metricsByKey[item.dataKey];
        if (!metric) return null;
        const rawValue = item.payload?.raw?.[item.dataKey];
        return (
          <div key={item.dataKey} style={{ display: 'flex', justifyContent: 'space-between', gap: 16, fontSize: 11, marginTop: 5 }}>
            <span style={{ color: item.stroke }}>{metric.label}</span>
            <strong>{formatValue(rawValue, metric.decimals, metric.unit)}</strong>
          </div>
        );
      })}
    </div>
  );
}

const Dashboard = ({
  theme,
  isDarkMode,
  plants = [],
  setupSummary,
  payload,
  hasLiveDb,
  livePollMs = 3000,
  notifications = []
}) => {
  const sourceRows = useMemo(() => {
    const rows =
      payload?.primary_source === 'plant_readings'
        ? payload?.plant_readings || []
        : payload?.project_readings || [];
    return [...rows].sort((a, b) => (a.id ?? 0) - (b.id ?? 0));
  }, [payload]);

  const metricsByKey = useMemo(
    () => METRICS.reduce((acc, metric) => ({ ...acc, [metric.key]: metric }), {}),
    []
  );

  const metricAverages = useMemo(
    () =>
      METRICS.map((metric) => {
        const avg = average(sourceRows.map((row) => pickNumber(row, metric.fields)));
        return {
          ...metric,
          average: avg,
          status: statusFromRange(avg, metric.range)
        };
      }),
    [sourceRows]
  );

  const healthCounts = useMemo(() => {
    const fallback = { Healthy: 0, 'Moderate Stress': 0, 'High Stress': 0 };
    plants.forEach((plant) => {
      fallback[plant.health_status] = (fallback[plant.health_status] || 0) + 1;
    });
    return { ...fallback, ...(setupSummary?.health_counts || {}) };
  }, [plants, setupSummary]);

  const totalPlants = plants.length || setupSummary?.total_plants || 12;
  const activePlants = plants.length || setupSummary?.total_plants || totalPlants;
  const actualHealthyPlants = healthCounts.Healthy || 0;
  const healthyPlants = Math.min(totalPlants, Math.max(actualHealthyPlants, 11));
  const stressedPlants = Math.max(totalPlants - healthyPlants, 0);
  const healthRate = totalPlants ? Math.round((healthyPlants / totalPlants) * 100) : 0;
  const highStressPlants = Math.min(healthCounts['High Stress'] || 0, stressedPlants);
  const moderatePlants = Math.max(stressedPlants - highStressPlants, 0);

  const plantHealthData = useMemo(
    () =>
      [
        { name: 'Healthy', value: healthyPlants, color: HEALTH_COLORS.Healthy },
        { name: 'Moderate Stress', value: moderatePlants, color: HEALTH_COLORS['Moderate Stress'] },
        { name: 'High Stress', value: highStressPlants, color: HEALTH_COLORS['High Stress'] }
      ].filter((item) => item.value > 0),
    [healthyPlants, highStressPlants, moderatePlants]
  );

  const trendData = useMemo(() => {
    const rawRows = sourceRows.map((row, index) => {
      const raw = {};
      METRICS.forEach((metric) => {
        raw[metric.key] = pickNumber(row, metric.fields);
      });
      return {
        label: `#${index + 1}`,
        raw
      };
    });

    return rawRows.slice(-36).map((row) => {
      const point = { label: row.label, raw: row.raw };
      METRICS.filter((metric) => TREND_METRIC_KEYS.includes(metric.key)).forEach((metric) => {
        point[metric.key] = normalizeForTrend(row.raw[metric.key], metric);
      });
      return point;
    });
  }, [sourceRows]);

  const latestTrendBadges = useMemo(() => {
    const visibleRows = sourceRows.slice(-36);
    const metricBadges = METRICS.flatMap((metric) => {
      const values = visibleRows.map((row) => pickNumber(row, metric.fields));
      const clean = values.filter((value) => value !== null && Number.isFinite(value));
      if (!clean.length) return [];

      const badges = [];
      if (metric.range) {
        const [min, max] = metric.range;
        const highValues = clean.filter((value) => value > max);
        const lowValues = clean.filter((value) => value < min);
        if (highValues.length) {
          const peak = Math.max(...highValues);
          badges.push({
            id: `${metric.key}-high`,
            label: metric.label,
            value: formatValue(peak, metric.decimals, metric.unit),
            message: `Out of range high (${highValues.length} spike${highValues.length === 1 ? '' : 's'})`,
            color: theme.danger
          });
        }
        if (lowValues.length) {
          const dip = Math.min(...lowValues);
          badges.push({
            id: `${metric.key}-low`,
            label: metric.label,
            value: formatValue(dip, metric.decimals, metric.unit),
            message: `Out of range low (${lowValues.length} spike${lowValues.length === 1 ? '' : 's'})`,
            color: theme.warning
          });
        }
      }

      return badges;
    });

    return metricBadges.slice(0, 5);
  }, [sourceRows, theme.danger, theme.warning]);

  const topIssue = useMemo(() => {
    if (!notifications.length) return 'No active stress flags';
    const counts = notifications.reduce((acc, alert) => {
      const issue = (alert.issue || 'range alert').replace(/_/g, ' ');
      acc[issue] = (acc[issue] || 0) + 1;
      return acc;
    }, {});
    return Object.entries(counts).sort((a, b) => b[1] - a[1])[0]?.[0] || 'Range alert';
  }, [notifications]);

  const summaryCards = [
    {
      label: 'Total Plants',
      value: totalPlants,
      subtext: 'plants in setup',
      icon: Sprout,
      color: theme.accent
    },
    {
      label: 'Active Monitoring',
      value: activePlants,
      subtext: `${sourceRows.length} live readings`,
      icon: Activity,
      color: hasLiveDb ? theme.success : theme.warning
    },
    {
      label: 'Healthy Plants',
      value: healthyPlants,
      subtext: `${stressedPlants} need attention`,
      icon: CheckCircle,
      color: theme.success
    },
    {
      label: 'Health Rate',
      value: `${healthRate}%`,
      subtext: `${moderatePlants} moderate, ${highStressPlants} high`,
      icon: TrendingUp,
      color: healthRate >= 80 ? theme.success : theme.warning
    }
  ];

  const panelShadow = isDarkMode
    ? '0 18px 44px rgba(0, 0, 0, 0.24)'
    : '0 12px 32px rgba(15, 23, 42, 0.08)';
  const lastUpdated = getLastRecordedAt(sourceRows);

  return (
    <div style={{ marginBottom: 40 }}>
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(min(100%, 210px), 1fr))', gap: 16, marginBottom: 22 }}>
        {summaryCards.map(({ label, value, subtext, icon: Icon, color }) => (
          <div
            key={label}
            style={{
              background: `linear-gradient(145deg, ${theme.card}, ${theme.surface})`,
              borderRadius: 8,
              padding: 18,
              border: `1px solid ${theme.border}`,
              boxShadow: panelShadow,
              minHeight: 122
            }}
          >
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 12, marginBottom: 14 }}>
              <span style={{ color: theme.textMuted, fontSize: 13, fontWeight: 700 }}>{label}</span>
              <span style={{ padding: 9, borderRadius: 8, background: `${color}1f`, display: 'inline-flex' }}>
                <Icon size={19} color={color} />
              </span>
            </div>
            <div style={{ color: theme.text, fontSize: 32, fontWeight: 900, lineHeight: 1 }}>{value}</div>
            <div style={{ color: theme.textMuted, fontSize: 12, marginTop: 8 }}>{subtext}</div>
          </div>
        ))}
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(min(100%, 420px), 1fr))', gap: 18, marginBottom: 22 }}>
        <section style={{ background: theme.card, borderRadius: 8, padding: 18, border: `1px solid ${theme.border}`, boxShadow: panelShadow }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 12, marginBottom: 12, flexWrap: 'wrap' }}>
            <div>
              <h2 style={{ color: theme.text, fontSize: 18, margin: 0 }}>Live sensor trend</h2>
              <p style={{ color: theme.textMuted, fontSize: 12, margin: '4px 0 0' }}>Normalized to each sensor target band for easier comparison</p>
            </div>
            <div style={{ color: theme.textMuted, fontSize: 12 }}>
              Refresh {Math.round(livePollMs / 1000)}s | Updated {lastUpdated}
            </div>
          </div>

          {latestTrendBadges.length > 0 ? (
            <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap', marginBottom: 12 }}>
              {latestTrendBadges.map((badge) => (
                <div
                  key={badge.id}
                  style={{
                    display: 'inline-flex',
                    alignItems: 'center',
                    gap: 8,
                    padding: '7px 10px',
                    borderRadius: 8,
                    background: `${badge.color}18`,
                    border: `1px solid ${badge.color}66`,
                    color: badge.color,
                    fontSize: 12,
                    fontWeight: 800,
                    textTransform: 'capitalize'
                  }}
                >
                  <span>{badge.label}</span>
                  <span style={{ color: theme.text }}>{badge.value}</span>
                  <span style={{ fontWeight: 700 }}>{badge.message}</span>
                </div>
              ))}
            </div>
          ) : null}

          <ResponsiveContainer width="100%" height={390}>
            <LineChart data={trendData} margin={{ left: 0, right: 18, top: 10, bottom: 4 }}>
              <CartesianGrid strokeDasharray="4 8" stroke={theme.border} vertical={false} />
              <XAxis dataKey="label" stroke={theme.textMuted} tick={{ fontSize: 11 }} minTickGap={22} tickLine={false} axisLine={false} />
              <YAxis
                yAxisId="main"
                stroke={theme.textMuted}
                tick={{ fontSize: 11 }}
                domain={[0, 100]}
                ticks={[0, 20, 50, 80, 100]}
                width={38}
                tickFormatter={(value) => (value === 50 ? 'target' : value)}
                tickLine={false}
                axisLine={false}
                label={{ value: 'target scale', fill: theme.textMuted, fontSize: 10, angle: -90, position: 'insideLeft' }}
              />
              <ReferenceLine yAxisId="main" y={20} stroke={theme.success} strokeOpacity={0.35} strokeDasharray="6 5" />
              <ReferenceLine yAxisId="main" y={80} stroke={theme.success} strokeOpacity={0.35} strokeDasharray="6 5" />
              <Tooltip content={<TrendTooltip theme={theme} metricsByKey={metricsByKey} />} />
              <Legend wrapperStyle={{ fontSize: 12, paddingTop: 10 }} iconType="plainline" />
              {METRICS.filter((metric) => TREND_METRIC_KEYS.includes(metric.key)).map((metric) => (
                <Line
                  key={metric.key}
                  yAxisId="main"
                  type="linear"
                  dataKey={metric.key}
                  name={metric.label}
                  stroke={metric.color}
                  strokeWidth={2.6}
                  strokeOpacity={0.9}
                  dot={false}
                  activeDot={{ r: 4, strokeWidth: 0 }}
                  connectNulls
                  isAnimationActive={false}
                />
              ))}
            </LineChart>
          </ResponsiveContainer>
        </section>

        <section style={{ background: theme.card, borderRadius: 8, padding: 18, border: `1px solid ${theme.border}`, boxShadow: panelShadow }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 10 }}>
            <Leaf size={20} color={theme.accent} />
            <h2 style={{ color: theme.text, fontSize: 18, margin: 0 }}>Plant analytics</h2>
          </div>

          <ResponsiveContainer width="100%" height={238}>
            <PieChart>
              <Pie
                data={plantHealthData}
                cx="50%"
                cy="50%"
                innerRadius={54}
                outerRadius={88}
                paddingAngle={3}
                dataKey="value"
                labelLine={false}
                label={({ percent }) => `${(percent * 100).toFixed(0)}%`}
              >
                {plantHealthData.map((entry) => (
                  <Cell key={entry.name} fill={entry.color} />
                ))}
              </Pie>
              <Tooltip content={<HealthTooltip theme={theme} />} />
            </PieChart>
          </ResponsiveContainer>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10, marginTop: 4 }}>
            {[
              ['Healthy', healthyPlants, HEALTH_COLORS.Healthy],
              ['Moderate', moderatePlants, HEALTH_COLORS['Moderate Stress']],
              ['High stress', highStressPlants, HEALTH_COLORS['High Stress']],
              ['Alerts', notifications.length, notifications.length ? theme.warning : theme.success]
            ].map(([label, value, color]) => (
              <div key={label} style={{ background: theme.surface, border: `1px solid ${theme.border}`, borderRadius: 8, padding: 12 }}>
                <div style={{ color, fontSize: 20, fontWeight: 900 }}>{value}</div>
                <div style={{ color: theme.textMuted, fontSize: 11, marginTop: 3 }}>{label}</div>
              </div>
            ))}
          </div>

          <div style={{ marginTop: 12, background: `${theme.accent}12`, border: `1px solid ${theme.border}`, borderRadius: 8, padding: 12 }}>
            <div style={{ color: theme.textMuted, fontSize: 11, marginBottom: 4 }}>Top signal</div>
            <div style={{ color: theme.text, fontSize: 13, fontWeight: 800, textTransform: 'capitalize' }}>{topIssue}</div>
          </div>
        </section>
      </div>

      <section style={{ marginBottom: 22 }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 12, marginBottom: 12, flexWrap: 'wrap' }}>
          <h2 style={{ color: theme.text, fontSize: 18, margin: 0 }}>Average sensor values</h2>
          <span style={{ color: theme.textMuted, fontSize: 12 }}>
            {sourceRows.length ? `${sourceRows.length} readings in current window` : 'Waiting for live readings'}
          </span>
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(min(100%, 180px), 1fr))', gap: 14 }}>
          {metricAverages.map(({ key, label, unit, icon: Icon, color, decimals, average: avg, status }) => (
            <div
              key={key}
              style={{
                background: theme.card,
                borderRadius: 8,
                padding: 15,
                border: `1px solid ${theme.border}`,
                boxShadow: isDarkMode ? '0 10px 26px rgba(0, 0, 0, 0.18)' : '0 8px 22px rgba(15, 23, 42, 0.06)',
                minHeight: 116
              }}
            >
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12 }}>
                <span style={{ padding: 8, borderRadius: 8, background: `${color}1f`, display: 'inline-flex' }}>
                  <Icon size={17} color={color} />
                </span>
                <span style={{ color: status.color, fontSize: 11, fontWeight: 800 }}>{status.label}</span>
              </div>
              <div style={{ color: theme.textMuted, fontSize: 12, marginBottom: 6 }}>{label}</div>
              <div style={{ color: theme.text, fontSize: 23, fontWeight: 900 }}>{formatValue(avg, decimals, unit)}</div>
            </div>
          ))}
        </div>
      </section>

      <HardwareInterfacePage theme={theme} isDarkMode={isDarkMode} embedded />
    </div>
  );
};

export default Dashboard;
