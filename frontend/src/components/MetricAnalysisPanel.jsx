import React, { useMemo } from 'react';
import { AlertTriangle, CheckCircle, Clock } from 'lucide-react';
import { analyzeMetricWindow } from '../utils/metricInsights';

export default function MetricAnalysisPanel({ metricId, data, dataKey, optimalRange, theme }) {
  const analysis = useMemo(
    () => analyzeMetricWindow(data, dataKey, optimalRange, metricId),
    [data, dataKey, optimalRange, metricId]
  );

  if (!analysis) return null;

  const { inRange, insight, durationLabel, outOfBandStreak } = analysis;
  const accent = inRange ? theme.success : theme.danger;
  const Icon = inRange ? CheckCircle : AlertTriangle;

  return (
    <div
      style={{
        marginTop: 16,
        padding: 14,
        borderRadius: 12,
        background: inRange ? `${theme.success}12` : `${theme.danger}10`,
        border: `1px solid ${inRange ? `${theme.success}33` : `${theme.danger}35`}`
      }}
    >
      <div style={{ display: 'flex', alignItems: 'flex-start', gap: 10 }}>
        <Icon size={18} color={accent} style={{ flexShrink: 0, marginTop: 2 }} />
        <div style={{ flex: 1, minWidth: 0 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 6, marginBottom: 6, flexWrap: 'wrap' }}>
            <span style={{ color: theme.text, fontWeight: 700, fontSize: 13 }}>
              {inRange ? '🌿 Plant impact — stable' : '⚠️ Plant impact — watch closely'}
            </span>
            {!inRange && outOfBandStreak > 1 && (
              <span
                style={{
                  fontSize: 11,
                  padding: '2px 8px',
                  borderRadius: 6,
                  background: `${theme.danger}22`,
                  color: theme.danger,
                  fontWeight: 600
                }}
              >
                {outOfBandStreak} readings off-band
              </span>
            )}
          </div>
          <div style={{ display: 'flex', gap: 6, alignItems: 'flex-start', marginBottom: 8 }}>
            <Clock size={13} color={theme.textMuted} style={{ marginTop: 2, flexShrink: 0 }} />
            <span style={{ color: theme.textMuted, fontSize: 12, lineHeight: 1.5 }}>{durationLabel}</span>
          </div>
          {insight ? (
            <>
              <p style={{ margin: '0 0 6px', fontSize: 12, color: theme.text, lineHeight: 1.5 }}>
                <strong>Likely cause:</strong> {insight.cause}
              </p>
              <p style={{ margin: 0, fontSize: 12, color: theme.text, lineHeight: 1.5 }}>
                <strong>Effect on plants:</strong> {insight.effect}
              </p>
              <p style={{ margin: '8px 0 0', fontSize: 11, color: theme.textMuted, lineHeight: 1.45 }}>
                {insight.duration}
              </p>
            </>
          ) : (
            <p style={{ margin: 0, fontSize: 12, color: theme.text, lineHeight: 1.5 }}>
              Readings sit inside the hydroponic target band. Keep monitoring — sudden spikes in Trends often
              precede visible stress by 1–2 hours.
            </p>
          )}
        </div>
      </div>
    </div>
  );
}
