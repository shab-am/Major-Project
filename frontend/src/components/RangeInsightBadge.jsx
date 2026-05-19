import React, { useState } from 'react';
import { AlertTriangle } from 'lucide-react';
import { getRangeInsight } from '../utils/metricInsights';

const METRIC_KEYS = {
  ph: 'ph',
  temperature: 'temperature',
  humidity: 'humidity',
  tds: 'tds',
  dissolvedOxy: 'dissolved_oxygen'
};

export default function RangeInsightBadge({ type, metricKey, theme }) {
  const [open, setOpen] = useState(false);
  const insightKey = METRIC_KEYS[metricKey] || metricKey;
  const insight = getRangeInsight(insightKey, type === 'low' ? 'low' : 'high');
  const label = type === 'low' ? 'Below range' : 'Above range';
  const color = '#ff6b6b';

  return (
    <span
      style={{ position: 'relative', display: 'inline-flex' }}
      onMouseEnter={() => setOpen(true)}
      onMouseLeave={() => setOpen(false)}
      onFocus={() => setOpen(true)}
      onBlur={() => setOpen(false)}
    >
      <span
        tabIndex={0}
        style={{
          padding: '3px 8px',
          borderRadius: 8,
          background: `${color}22`,
          border: `1px solid ${color}44`,
          color,
          fontSize: 11,
          fontWeight: 600,
          display: 'inline-flex',
          alignItems: 'center',
          gap: 4,
          cursor: 'help'
        }}
      >
        <AlertTriangle size={12} />
        {label}
      </span>
      {open && (
        <span
          role="tooltip"
          style={{
            position: 'absolute',
            top: 'calc(100% + 6px)',
            right: 0,
            width: 260,
            zIndex: 40,
            background: theme.card,
            border: `1px solid ${theme.border}`,
            borderRadius: 10,
            padding: 10,
            boxShadow: '0 8px 24px rgba(0,0,0,0.25)',
            fontSize: 11,
            lineHeight: 1.45,
            color: theme.text
          }}
        >
          <strong style={{ display: 'block', marginBottom: 4 }}>Likely cause</strong>
          {insight.cause}
          <strong style={{ display: 'block', margin: '8px 0 4px' }}>Plant effect</strong>
          {insight.effect}
          <span style={{ display: 'block', marginTop: 8, color: theme.textMuted }}>{insight.duration}</span>
        </span>
      )}
    </span>
  );
}
