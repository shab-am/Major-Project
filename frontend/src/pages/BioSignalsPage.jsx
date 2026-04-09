import React, { useMemo } from 'react';
import {
  CartesianGrid,
  Line,
  LineChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis
} from 'recharts';
import PageHeader from '../components/PageHeader';
import { useLiveSensor } from '../context/LiveSensorContext';

function amplitude(points) {
  if (!points.length) return null;
  const values = points.map((point) => point.value).filter((value) => value != null);
  if (!values.length) return null;
  return Math.max(...values) - Math.min(...values);
}

export default function BioSignalsPage({
  theme,
  isDarkMode,
  onToggleTheme,
  notifications,
  isNotificationsOpen,
  onOpenNotifications,
  onOpenStressInsights
}) {
  const { bioSeriesElectrochemical, hasLiveDb, pollIntervalMs } = useLiveSensor();

  const stats = useMemo(() => {
    const electroAmp = amplitude(bioSeriesElectrochemical);
    return [
      ['Signal samples', bioSeriesElectrochemical.length || 0],
      ['Refresh interval', `${Math.round(pollIntervalMs / 1000)}s`],
      ['Electrochemical amplitude', electroAmp == null ? '—' : electroAmp.toFixed(3)],
      ['Interpretation', electroAmp == null ? 'Waiting for signal' : electroAmp > 0.4 ? 'High response activity' : 'Stable baseline']
    ];
  }, [bioSeriesElectrochemical, pollIntervalMs]);

  const renderChart = (title, data, color, emptyLabel) => (
    <div
      style={{
        background: theme.card,
        border: `1px solid ${theme.border}`,
        borderRadius: 16,
        padding: 20
      }}
    >
      <div style={{ color: theme.text, fontWeight: 700, marginBottom: 14 }}>{title}</div>
      {data.length === 0 ? (
        <div style={{ color: theme.textMuted, fontSize: 14 }}>{emptyLabel}</div>
      ) : (
        <ResponsiveContainer width="100%" height={280}>
          <LineChart data={data}>
            <CartesianGrid strokeDasharray="3 3" stroke={theme.border} />
            <XAxis dataKey="readingLabel" stroke={theme.textMuted} />
            <YAxis stroke={theme.textMuted} />
            <Tooltip />
            <Line type="monotone" dataKey="value" stroke={color} strokeWidth={3} dot={false} />
          </LineChart>
        </ResponsiveContainer>
      )}
    </div>
  );

  return (
    <div style={{ marginBottom: 40 }}>
      <PageHeader
        title="Bio-Signals"
        subtitle="Electrochemical signal monitoring from stored sensor readings"
        theme={theme}
        isDarkMode={isDarkMode}
        onToggleTheme={onToggleTheme}
        notifications={notifications}
        isNotificationsOpen={isNotificationsOpen}
        onOpenNotifications={onOpenNotifications}
        onOpenStressInsights={onOpenStressInsights}
      />

      <div
        style={{
          background: theme.card,
          border: `1px solid ${theme.border}`,
          borderRadius: 16,
          padding: 20,
          marginBottom: 24,
          color: theme.textMuted,
          fontSize: 14
        }}
      >
        {hasLiveDb
          ? 'This chart is fully database-backed and updates from the collector readings.'
          : 'Waiting for electrochemical readings from the database.'}
      </div>

      <div style={{ display: 'grid', gap: 24 }}>
        {renderChart(
          'Electrochemical signal',
          bioSeriesElectrochemical,
          '#d3ff5c',
          'No electrochemical samples are available yet.'
        )}
        <div
          style={{
            background: theme.card,
            border: `1px solid ${theme.border}`,
            borderRadius: 16,
            padding: 20,
            color: theme.textMuted,
            fontSize: 14,
            lineHeight: 1.7
          }}
        >
          Electrochemical signal reflects changes in the plant bioelectrical response captured by your setup. Spikes or wider swings usually mean the plant is reacting more strongly to its environment, while flatter regions suggest a steadier physiological state.
        </div>
      </div>

      <div
        style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
          gap: 16,
          marginTop: 24
        }}
      >
        {stats.map(([label, value]) => (
          <div
            key={label}
            style={{
              background: theme.card,
              border: `1px solid ${theme.border}`,
              borderRadius: 16,
              padding: 18
            }}
          >
            <div style={{ color: theme.textMuted, fontSize: 13, marginBottom: 10 }}>{label}</div>
            <div style={{ color: theme.text, fontSize: 24, fontWeight: 800 }}>{value}</div>
          </div>
        ))}
      </div>
    </div>
  );
}
