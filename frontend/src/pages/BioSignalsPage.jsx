import React from 'react';
import { CartesianGrid, Line, LineChart, ResponsiveContainer, Tooltip, XAxis, YAxis } from 'recharts';
import PageHeader from '../components/PageHeader';
import ChartTooltipThemed from '../components/ChartTooltipThemed';
import { useLiveSensor } from '../context/LiveSensorContext';
import { getBioSignalInsight } from '../utils/metricInsights';

const BIO_HEALTHY_RANGE = [0.55, 0.95];
const BIO_MIN_VISIBLE_SPAN = 0.08;

function getBioDomain(series) {
  const values = (series || [])
    .map((point) => Number(point.value))
    .filter((value) => Number.isFinite(value));
  if (!values.length) return BIO_HEALTHY_RANGE;

  const min = Math.min(...values);
  const max = Math.max(...values);
  const center = (min + max) / 2;
  const span = Math.max(max - min, BIO_MIN_VISIBLE_SPAN);
  const low = Math.max(0, center - span / 2);
  const high = center + span / 2;
  return [Number(low.toFixed(3)), Number(high.toFixed(3))];
}

function BioTooltip({ active, payload, label, theme, isDarkMode, series }) {
  if (!active || !payload?.length) return null;
  const idx = series.findIndex((p) => p.readingLabel === label);
  const prev = idx > 0 ? series[idx - 1]?.value : null;
  const cur = payload[0]?.value;
  return (
    <ChartTooltipThemed
      active={active}
      payload={payload}
      label={label}
      theme={theme}
      isDarkMode={isDarkMode}
      extra={getBioSignalInsight(prev, cur)}
    />
  );
}

export default function BioSignalsPage({ theme, isDarkMode, embedded = false }) {
  const { bioSeriesElectrochemical } = useLiveSensor();
  const bioDomain = getBioDomain(bioSeriesElectrochemical);

  return (
    <section style={{ marginBottom: embedded ? 0 : 32 }}>
      {!embedded ? (
        <PageHeader
          title="Bio-signals"
          subtitle="Electrochemical response over recent readings — hover points for interpretation"
          theme={theme}
        />
      ) : (
        <h2 style={{ color: theme.text, fontSize: 16, fontWeight: 700, marginBottom: 12 }}>Bio-signals</h2>
      )}

      <div
        style={{
          background: theme.card,
          border: `1px solid ${theme.border}`,
          borderRadius: 12,
          padding: 14,
          marginBottom: 16
        }}
      >
        <div style={{ color: theme.text, fontWeight: 700, fontSize: 13, marginBottom: 10 }}>
          Electrochemical signal
        </div>
        {bioSeriesElectrochemical.length === 0 ? (
          <p style={{ color: theme.textMuted, fontSize: 13, margin: 0 }}>No samples yet.</p>
        ) : (
          <ResponsiveContainer width="100%" height={200}>
            <LineChart data={bioSeriesElectrochemical}>
              <CartesianGrid strokeDasharray="3 3" stroke={theme.border} />
              <XAxis dataKey="readingLabel" stroke={theme.textMuted} tick={{ fontSize: 9 }} />
              <YAxis
                stroke={theme.textMuted}
                tick={{ fontSize: 9 }}
                domain={bioDomain}
                tickFormatter={(value) => Number(value).toFixed(3)}
                width={46}
              />
              <Tooltip
                content={(props) => (
                  <BioTooltip {...props} theme={theme} isDarkMode={isDarkMode} series={bioSeriesElectrochemical} />
                )}
              />
              <Line type="monotone" dataKey="value" name="Signal" stroke="#d3ff5c" strokeWidth={2} dot={false} />
            </LineChart>
          </ResponsiveContainer>
        )}
      </div>
    </section>
  );
}
