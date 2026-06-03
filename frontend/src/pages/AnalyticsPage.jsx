import React, { useMemo, useState } from 'react';
import {
  Activity,
  AlertTriangle,
  Droplets,
  Filter,
  Gauge,
  Lightbulb,
  Thermometer,
  Waves,
  Zap
} from 'lucide-react';
import {
  ResponsiveContainer,
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ReferenceLine
} from 'recharts';
import PageHeader from '../components/PageHeader';
import ChartTooltipThemed from '../components/ChartTooltipThemed';
import RangeInsightBadge from '../components/RangeInsightBadge';
import MetricAnalysisPanel from '../components/MetricAnalysisPanel';
import { getSpikeInsight } from '../utils/metricInsights';

const FIELD_MAP = {
  ph: 'Soil_pH',
  temperature: 'Ambient_Temperature',
  waterTemperature: 'Soil_Temperature',
  humidity: 'Humidity',
  lightIntensity: 'Light_Intensity',
  dissolvedOxy: 'Dissolved_Oxygen',
  ec: 'EC_Value',
  tds: 'TDS'
};

const METRIC_CONFIG = {
  ph: { label: 'Water pH', colorKey: 'chartPh', icon: Droplets, yDomain: [0, 14], decimals: 2 },
  temperature: { label: 'Ambient temperature', colorKey: 'chartTemp', icon: Thermometer, decimals: 1 },
  waterTemperature: { label: 'Water temperature', color: '#dc2626', icon: Thermometer, decimals: 1 },
  humidity: { label: 'Humidity', colorKey: 'chartHumidity', icon: Waves, yDomain: [0, 100], decimals: 1 },
  lightIntensity: { label: 'Light intensity', color: '#eab308', icon: Lightbulb, decimals: 0 },
  dissolvedOxy: { label: 'Dissolved oxygen', colorKey: 'chartDo', icon: Activity, decimals: 2 },
  ec: { label: 'EC', color: '#7c3aed', icon: Zap, decimals: 3 },
  tds: { label: 'TDS', colorKey: 'chartTds', icon: Gauge, decimals: 0 }
};

const optimalRanges = {
  ph: { min: 5.5, max: 6.5, unit: '' },
  temperature: { min: 18, max: 24, unit: 'C' },
  waterTemperature: { min: 18, max: 26, unit: 'C' },
  humidity: { min: 55, max: 72, unit: '%' },
  lightIntensity: { min: 350, max: 650, unit: 'lux' },
  dissolvedOxy: { min: 5, max: 9, unit: 'mg/L' },
  ec: { min: 0.85, max: 2.1, unit: 'mS/cm' },
  tds: { min: 560, max: 900, unit: 'ppm' }
};

function formatMetricValue(value, metricId) {
  if (value == null || Number.isNaN(Number(value))) return '--';
  const cfg = METRIC_CONFIG[metricId] || {};
  const range = optimalRanges[metricId] || {};
  const decimals = cfg.decimals ?? 1;
  const formatted = Number(value).toFixed(decimals);
  return range.unit ? `${formatted} ${range.unit}` : formatted;
}

function rangeSummaryForMetric(metricId, data) {
  const range = optimalRanges[metricId];
  if (!range || !data.length) return null;

  const values = data
    .map((row) => row[metricId])
    .filter((value) => value != null && Number.isFinite(Number(value)))
    .map(Number);
  const highValues = values.filter((value) => value > range.max);
  const lowValues = values.filter((value) => value < range.min);
  if (!highValues.length && !lowValues.length) return null;

  return {
    metricId,
    label: METRIC_CONFIG[metricId]?.label || metricId,
    highCount: highValues.length,
    lowCount: lowValues.length,
    highPeak: highValues.length ? Math.max(...highValues) : null,
    lowDip: lowValues.length ? Math.min(...lowValues) : null
  };
}

function TrendTooltip({ active, payload, label, theme, isDarkMode, anomalies, metricId, optimalRange }) {
  if (!active || !payload?.length) return null;
  const value = payload[0]?.value;
  const anomaly = anomalies?.find((a) => a.readingLabel === label);
  const extra = anomaly ? getSpikeInsight(metricId, value, optimalRange) : null;

  return (
    <ChartTooltipThemed
      active={active}
      payload={payload}
      label={label}
      theme={theme}
      isDarkMode={isDarkMode}
      extra={extra}
    />
  );
}

function detectAnomalies(data, dataKey) {
  if (!data || data.length < 4) return [];
  const values = data.map((d) => d[dataKey]).filter((v) => v != null && !Number.isNaN(v));
  if (values.length < 4) return [];
  const sorted = [...values].sort((a, b) => a - b);
  const q1 = sorted[Math.floor(sorted.length * 0.25)];
  const q3 = sorted[Math.floor(sorted.length * 0.75)];
  const iqr = q3 - q1;
  const lowerBound = q1 - 1.5 * iqr;
  const upperBound = q3 + 1.5 * iqr;
  return data
    .map((item, index) => ({ ...item, index, value: item[dataKey] }))
    .filter((item) => item.value != null && (item.value < lowerBound || item.value > upperBound))
    .map((item) => ({ index: item.index, value: item.value, readingLabel: item.readingLabel }));
}

function ChartCard({
  title,
  icon: Icon,
  color,
  data,
  dataKey,
  isDarkMode,
  theme,
  yDomain,
  optimalRange,
  anomalies,
  metricId
}) {
  const latest = data.length ? data[data.length - 1]?.[dataKey] : null;
  const summary = rangeSummaryForMetric(metricId, data);
  const alertType =
    latest != null && optimalRange
      ? latest < optimalRange.min
        ? 'low'
        : latest > optimalRange.max
          ? 'high'
          : null
      : null;

  const rangeParts = [];
  if (summary?.highCount) {
    rangeParts.push(`${summary.highCount} high, peak ${formatMetricValue(summary.highPeak, metricId)}`);
  }
  if (summary?.lowCount) {
    rangeParts.push(`${summary.lowCount} low, dip ${formatMetricValue(summary.lowDip, metricId)}`);
  }

  return (
    <div
      style={{
        background: isDarkMode ? 'rgba(255,255,255,0.04)' : theme.card,
        borderRadius: 16,
        padding: 24,
        border: `1px solid ${theme.border}`,
        boxShadow: isDarkMode ? '0 4px 20px rgba(0, 0, 0, 0.3)' : '0 2px 10px rgba(0, 0, 0, 0.08)'
      }}
    >
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 20, flexWrap: 'wrap', gap: 8 }}>
        <h2 style={{ fontSize: '1.25rem', fontWeight: 700, color: theme.text, margin: 0, display: 'flex', alignItems: 'center', gap: 10 }}>
          <Icon size={23} color={color} />
          {title}
        </h2>
        <div style={{ display: 'flex', alignItems: 'center', gap: 8, flexWrap: 'wrap' }}>
          {anomalies?.length > 0 && (
            <span style={{ padding: '4px 10px', borderRadius: 8, background: `${theme.danger}22`, border: `1px solid ${theme.danger}44`, fontSize: 12, color: theme.danger, display: 'inline-flex', alignItems: 'center', gap: 6 }}>
              <AlertTriangle size={14} /> {anomalies.length} spike{anomalies.length > 1 ? 's' : ''}
            </span>
          )}
          {alertType && <RangeInsightBadge type={alertType} metricKey={metricId} theme={theme} />}
          {!alertType && latest != null && optimalRange && (
            <span style={{ padding: '4px 10px', borderRadius: 8, background: `${theme.success}22`, fontSize: 12, color: theme.success }}>In range</span>
          )}
        </div>
      </div>

      <ResponsiveContainer width="100%" height={300}>
        <LineChart data={data}>
          <CartesianGrid strokeDasharray="3 3" stroke={isDarkMode ? 'rgba(255,255,255,0.1)' : theme.border} />
          <XAxis dataKey="readingLabel" stroke={theme.textMuted} tick={{ fontSize: 11 }} height={36} />
          <YAxis stroke={theme.textMuted} domain={yDomain || ['auto', 'auto']} />
          <Tooltip
            content={(props) => (
              <TrendTooltip
                {...props}
                theme={theme}
                isDarkMode={isDarkMode}
                anomalies={anomalies}
                metricId={metricId}
                optimalRange={optimalRange}
              />
            )}
          />
          <Legend wrapperStyle={{ fontSize: 12 }} />
          {optimalRange && (
            <>
              <ReferenceLine y={optimalRange.min} stroke={theme.warning} strokeDasharray="5 5" />
              <ReferenceLine y={optimalRange.max} stroke={theme.warning} strokeDasharray="5 5" />
            </>
          )}
          <Line
            type="monotone"
            dataKey={dataKey}
            name={title}
            stroke={color}
            strokeWidth={3}
            dot={(props) => {
              const isAnomaly = anomalies?.some((a) => a.index === props.index);
              return (
                <circle
                  {...props}
                  r={isAnomaly ? 7 : 5}
                  fill={isAnomaly ? theme.danger : color}
                  stroke={isAnomaly ? '#fff' : 'none'}
                  strokeWidth={isAnomaly ? 2 : 0}
                />
              );
            }}
            isAnimationActive={false}
          />
        </LineChart>
      </ResponsiveContainer>

      {optimalRange && (
        <p style={{ marginTop: 12, fontSize: 12, color: theme.textMuted }}>
          Target band: {optimalRange.min} - {optimalRange.max} {optimalRange.unit}
        </p>
      )}
      {rangeParts.length > 0 && (
        <p style={{ margin: '8px 0 0', fontSize: 12, color: theme.danger, fontWeight: 700 }}>
          Out-of-range window: {rangeParts.join(' | ')}.
        </p>
      )}
      <MetricAnalysisPanel
        metricId={metricId}
        data={data}
        dataKey={dataKey}
        optimalRange={optimalRange}
        theme={theme}
      />
    </div>
  );
}

const AnalyticsPage = ({ theme, isDarkMode, analyticsLiveRows = [], livePollMs = 3000 }) => {
  const [timeRange, setTimeRange] = useState('14');

  const chartRows = useMemo(() => {
    const rows = analyticsLiveRows || [];
    if (timeRange === 'all') return rows;
    return rows.slice(-Number(timeRange));
  }, [analyticsLiveRows, timeRange]);

  const chartDataByMetric = useMemo(() => {
    return Object.keys(METRIC_CONFIG).reduce((acc, metricId) => {
      const field = FIELD_MAP[metricId];
      acc[metricId] = chartRows
        .map((entry, index) => ({
          readingLabel: entry.readingLabel || `#${index + 1}`,
          [metricId]: entry[field] ?? null
        }))
        .filter((row) => row[metricId] != null);
      return acc;
    }, {});
  }, [chartRows]);

  const rangeSummaries = useMemo(
    () =>
      Object.keys(METRIC_CONFIG)
        .map((metricId) => rangeSummaryForMetric(metricId, chartDataByMetric[metricId] || []))
        .filter(Boolean),
    [chartDataByMetric]
  );

  return (
    <section style={{ marginBottom: 40 }}>
      <PageHeader
        title="Trends"
        subtitle="Per-sensor history with target bands and range alerts"
        theme={theme}
      />

      <div
        style={{
          background: theme.card,
          borderRadius: 14,
          padding: 16,
          border: `1px solid ${theme.border}`,
          marginBottom: 18,
          display: 'flex',
          alignItems: 'center',
          gap: 16,
          flexWrap: 'wrap'
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
          <Filter size={18} color={theme.accent} />
          <span style={{ color: theme.text, fontWeight: 600, fontSize: 14 }}>Window</span>
        </div>
        <select
          value={timeRange}
          onChange={(e) => setTimeRange(e.target.value)}
          style={{
            padding: '8px 14px',
            borderRadius: 8,
            border: `1px solid ${theme.border}`,
            background: theme.surface,
            color: theme.text,
            fontSize: 13,
            cursor: 'pointer',
            minWidth: 160
          }}
        >
          <option value="7">Last 7 readings</option>
          <option value="14">Last 14 readings</option>
          <option value="30">Last 30 readings</option>
          <option value="60">Last 60 readings</option>
          <option value="all">All readings</option>
        </select>
        <span style={{ color: theme.textMuted, fontSize: 13 }}>
          Showing {chartRows.length} of {analyticsLiveRows.length} | refresh ~{Math.round(livePollMs / 1000)}s
        </span>
      </div>

      {rangeSummaries.length > 0 && (
        <div
          style={{
            background: theme.card,
            borderRadius: 14,
            padding: 16,
            border: `1px solid ${theme.border}`,
            marginBottom: 24
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: 8, color: theme.text, fontWeight: 800, fontSize: 14, marginBottom: 12 }}>
            <AlertTriangle size={17} color={theme.warning} />
            Range summary
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(min(100%, 260px), 1fr))', gap: 10 }}>
            {rangeSummaries.map((summary) => (
              <div key={summary.metricId} style={{ background: theme.surface, border: `1px solid ${theme.border}`, borderRadius: 8, padding: 12 }}>
                <div style={{ color: theme.text, fontWeight: 800, fontSize: 13, marginBottom: 6 }}>{summary.label}</div>
                <div style={{ color: theme.textMuted, fontSize: 12, lineHeight: 1.6 }}>
                  {summary.highCount > 0 && (
                    <div>High: {formatMetricValue(summary.highPeak, summary.metricId)} across {summary.highCount} reading{summary.highCount === 1 ? '' : 's'}</div>
                  )}
                  {summary.lowCount > 0 && (
                    <div>Low: {formatMetricValue(summary.lowDip, summary.metricId)} across {summary.lowCount} reading{summary.lowCount === 1 ? '' : 's'}</div>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {chartRows.length === 0 ? (
        <p style={{ color: theme.textMuted, textAlign: 'center', padding: 40 }}>No readings to chart yet.</p>
      ) : (
        <div style={{ display: 'grid', gap: 24, gridTemplateColumns: 'repeat(auto-fill, minmax(360px, 1fr))' }}>
          {Object.entries(METRIC_CONFIG).map(([metricId, cfg]) => {
            const data = chartDataByMetric[metricId] || [];
            const Icon = cfg.icon;
            const color = cfg.color || theme[cfg.colorKey] || theme.accent;
            return (
              <ChartCard
                key={metricId}
                title={cfg.label}
                icon={Icon}
                color={color}
                data={data}
                dataKey={metricId}
                isDarkMode={isDarkMode}
                theme={theme}
                yDomain={cfg.yDomain}
                optimalRange={optimalRanges[metricId]}
                anomalies={detectAnomalies(data, metricId)}
                metricId={metricId}
              />
            );
          })}
        </div>
      )}
    </section>
  );
};

export default AnalyticsPage;
