import React, { useMemo } from 'react';
import {
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Line,
  LineChart,
  ReferenceLine
} from 'recharts';
import {
  Activity,
  Droplets,
  Gauge,
  Lightbulb,
  Radio,
  Thermometer,
  Waves,
  Zap
} from 'lucide-react';
import HardwareInterfacePage from '../pages/HardwareInterfacePage';
import { compareRowsChronological } from '../utils/sensorAnalytics';

const METRICS = [
  {
    key: 'ph',
    label: 'Water pH',
    unit: '',
    icon: Droplets,
    color: '#14b8a6',
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
    color: '#dc2626',
    fields: ['soil_temperature', 'water_temperature'],
    decimals: 1,
    range: [18, 26],
    dash: '5 4'
  },
  {
    key: 'humidity',
    label: 'Humidity',
    unit: '%',
    icon: Waves,
    color: '#2563eb',
    fields: ['humidity'],
    decimals: 1,
    range: [55, 72]
  },
  {
    key: 'light_intensity',
    label: 'Light',
    unit: '',
    icon: Lightbulb,
    color: '#eab308',
    fields: ['light_intensity'],
    decimals: 0,
    range: [350, 650],
    dash: '2 5'
  },
  {
    key: 'dissolved_oxygen',
    label: 'Dissolved O2',
    unit: 'mg/L',
    icon: Activity,
    color: '#16a34a',
    fields: ['dissolved_oxygen', 'dissolvedOxy'],
    decimals: 2,
    range: [5, 9],
    dash: '8 4'
  },
  {
    key: 'ec',
    label: 'EC',
    unit: 'mS/cm',
    icon: Zap,
    color: '#7c3aed',
    fields: ['ec_value', 'ec'],
    decimals: 3,
    range: [0.85, 2.1],
    dash: '10 5 2 5'
  },
  {
    key: 'tds',
    label: 'TDS',
    unit: 'ppm',
    icon: Gauge,
    color: '#db2777',
    fields: ['tds_value', 'tds'],
    decimals: 0,
    range: [560, 840],
    dash: '3 4'
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

const TREND_METRIC_KEYS = [
  'ph',
  'ambient_temperature',
  'water_temperature',
  'humidity',
  'light_intensity',
  'dissolved_oxygen',
  'ec',
  'tds'
];
const TREND_METRICS = METRICS.filter((metric) => TREND_METRIC_KEYS.includes(metric.key));

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
  payload,
  livePollMs = 3000
}) => {
  const sourceRows = useMemo(() => {
    const rows =
      payload?.primary_source === 'plant_readings'
        ? payload?.plant_readings || []
        : payload?.project_readings || [];
    return [...rows].sort(compareRowsChronological);
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
      TREND_METRICS.forEach((metric) => {
        point[metric.key] = normalizeForTrend(row.raw[metric.key], metric);
      });
      return point;
    });
  }, [sourceRows]);

  const summaryCards = metricAverages
    .filter((metric) => ['ph', 'ambient_temperature', 'humidity', 'tds'].includes(metric.key))
    .map(({ label, unit, icon, color, decimals, average: avg, status }) => ({
      label,
      value: formatValue(avg, decimals, unit),
      subtext: `${status.label} range`,
      icon,
      color: status.color || color
    }));

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

      <div style={{ display: 'grid', gridTemplateColumns: '1fr', gap: 18, marginBottom: 22 }}>
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

          <ResponsiveContainer width="100%" height={460}>
            <LineChart data={trendData} margin={{ left: 4, right: 28, top: 16, bottom: 12 }}>
              <CartesianGrid strokeDasharray="4 8" stroke={theme.border} vertical={false} />
              <XAxis
                dataKey="label"
                stroke={theme.textMuted}
                tick={{ fontSize: 11 }}
                minTickGap={34}
                tickMargin={10}
                tickLine={false}
                axisLine={false}
              />
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
              {TREND_METRICS.map((metric) => (
                <Line
                  key={metric.key}
                  yAxisId="main"
                  type="linear"
                  dataKey={metric.key}
                  name={metric.label}
                  stroke={metric.color}
                  strokeWidth={2.6}
                  strokeOpacity={0.9}
                  strokeDasharray={metric.dash}
                  dot={false}
                  activeDot={{ r: 4, strokeWidth: 0 }}
                  connectNulls
                  isAnimationActive={false}
                />
              ))}
            </LineChart>
          </ResponsiveContainer>

          <div style={{ display: 'flex', alignItems: 'center', gap: '9px 18px', flexWrap: 'wrap', marginTop: 12 }}>
            {TREND_METRICS.map((metric) => (
              <div key={metric.key} style={{ display: 'inline-flex', alignItems: 'center', gap: 7, color: theme.textMuted, fontSize: 12, fontWeight: 700 }}>
                <span
                  style={{
                    width: 26,
                    height: 0,
                    borderTop: `3px ${metric.dash ? 'dashed' : 'solid'} ${metric.color}`,
                    display: 'inline-block'
                  }}
                />
                {metric.label}
              </div>
            ))}
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
