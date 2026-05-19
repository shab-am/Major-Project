import React, { useMemo } from 'react';
import { Activity, Droplets, Gauge, Zap } from 'lucide-react';
import { ResponsiveContainer, LineChart, Line, XAxis, YAxis, Tooltip } from 'recharts';
import ChartTooltipThemed from './ChartTooltipThemed';
import { getBioSignalInsight } from '../utils/metricInsights';

const PROBES = [
  { key: 'ph', label: 'pH probe', icon: Droplets, emoji: '💧', fields: ['ph_value', 'soil_ph', 'ph'] },
  { key: 'ec', label: 'EC / TDS', icon: Gauge, emoji: '⚡', fields: ['ec_value', 'ec', 'tds_value', 'tds'] },
  { key: 'do', label: 'Dissolved O₂', icon: Activity, emoji: '🫧', fields: ['dissolved_oxygen', 'dissolvedOxy'] },
  { key: 'bio', label: 'Bio electrode', icon: Zap, emoji: '🧬', fields: ['electrochemical_signal'] }
];

function pickField(row, fields) {
  if (!row) return null;
  for (const f of fields) {
    const v = row[f];
    if (v != null && v !== '' && !Number.isNaN(Number(v))) return Number(v);
  }
  return null;
}

export default function SensorElectrodePanel({ theme, isDarkMode, latestSnapshot, bioSeries = [], pollIntervalMs = 3000 }) {
  const latestRow = useMemo(
    () =>
      latestSnapshot
        ? {
            ph_value: latestSnapshot.ph,
            ambient_temperature: latestSnapshot.temperature,
            humidity: latestSnapshot.humidity,
            tds_value: latestSnapshot.tds,
            dissolved_oxygen: latestSnapshot.dissolvedOxy,
            ec_value: latestSnapshot.ec,
            electrochemical_signal: latestSnapshot.electrochemical
          }
        : null,
    [latestSnapshot]
  );

  const bioDelta = useMemo(() => {
    if (bioSeries.length < 2) return null;
    const prev = bioSeries[bioSeries.length - 2]?.value;
    const cur = bioSeries[bioSeries.length - 1]?.value;
    return getBioSignalInsight(prev, cur);
  }, [bioSeries]);

  return (
    <section
      style={{
        background: theme.card,
        border: `1px solid ${theme.border}`,
        borderRadius: 14,
        padding: 18,
        marginBottom: 20
      }}
    >
      <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 14 }}>
        <Zap size={20} color={theme.accent} />
        <div>
          <h3 style={{ margin: 0, color: theme.text, fontSize: 16, fontWeight: 700 }}>Sensor & electrode stack</h3>
          <p style={{ margin: '4px 0 0', color: theme.textMuted, fontSize: 12 }}>
            What each probe measures · refresh ~{Math.round(pollIntervalMs / 1000)}s
          </p>
        </div>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(140px, 1fr))', gap: 10, marginBottom: 16 }}>
        {PROBES.map(({ key, label, icon: Icon, emoji, fields }) => {
          const val = pickField(latestRow, fields);
          const live = val != null;
          return (
            <div
              key={key}
              style={{
                background: theme.surface,
                border: `1px solid ${live ? `${theme.accent}44` : theme.border}`,
                borderRadius: 10,
                padding: 12
              }}
            >
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 6 }}>
                <Icon size={16} color={live ? theme.accent : theme.textMuted} />
                <span style={{ fontSize: 14, opacity: 0.7 }}>{emoji}</span>
              </div>
              <div style={{ color: theme.textMuted, fontSize: 11 }}>{label}</div>
              <div style={{ color: theme.text, fontSize: 18, fontWeight: 800, marginTop: 4 }}>
                {live ? (key === 'bio' ? val.toFixed(3) : val.toFixed(2)) : '—'}
              </div>
              <div style={{ fontSize: 10, color: live ? theme.success : theme.warning, marginTop: 4, fontWeight: 600 }}>
                {live ? '● Live' : '○ Waiting'}
              </div>
            </div>
          );
        })}
      </div>

      <div
        style={{
          display: 'grid',
          gridTemplateColumns: 'minmax(0, 1.2fr) minmax(0, 1fr)',
          gap: 14,
          alignItems: 'start'
        }}
      >
        <div style={{ background: theme.surface, borderRadius: 10, padding: 12, border: `1px solid ${theme.border}` }}>
          <div style={{ color: theme.text, fontWeight: 600, fontSize: 13, marginBottom: 8 }}>🧬 Bio-electrode trace</div>
          {bioSeries.length > 1 ? (
            <ResponsiveContainer width="100%" height={120}>
              <LineChart data={bioSeries}>
                <XAxis dataKey="readingLabel" hide />
                <YAxis stroke={theme.textMuted} tick={{ fontSize: 9 }} width={32} />
                <Tooltip content={<ChartTooltipThemed theme={theme} isDarkMode={isDarkMode} />} />
                <Line
                  type="monotone"
                  dataKey="value"
                  stroke="#f472b6"
                  strokeWidth={2}
                  dot={false}
                  isAnimationActive={false}
                />
              </LineChart>
            </ResponsiveContainer>
          ) : (
            <p style={{ color: theme.textMuted, fontSize: 12, margin: 0 }}>Need more samples for electrode trace.</p>
          )}
        </div>
        <div style={{ background: theme.surface, borderRadius: 10, padding: 12, border: `1px solid ${theme.border}` }}>
          <div style={{ color: theme.text, fontWeight: 600, fontSize: 13, marginBottom: 8 }}>How to read the signal</div>
          <p style={{ color: theme.textMuted, fontSize: 12, lineHeight: 1.55, margin: '0 0 8px' }}>
            The electrochemical electrode picks up ion flow at the root surface. Stable readings mean steady tissue
            response; sharp jumps often track with pH or temperature shifts.
          </p>
          {bioDelta && (
            <p
              style={{
                margin: 0,
                fontSize: 12,
                color: theme.text,
                lineHeight: 1.5,
                padding: 10,
                borderRadius: 8,
                background: isDarkMode ? 'rgba(45,212,191,0.08)' : theme.accentMuted
              }}
            >
              <strong>Latest change:</strong> {bioDelta}
            </p>
          )}
        </div>
      </div>
    </section>
  );
}
