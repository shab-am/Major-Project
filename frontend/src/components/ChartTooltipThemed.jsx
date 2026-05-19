import React from 'react';

export default function ChartTooltipThemed({ active, payload, label, theme, isDarkMode, formatter, extra }) {
  if (!active || !payload?.length) return null;
  const bg = isDarkMode ? 'rgba(15, 23, 42, 0.96)' : 'rgba(255, 255, 255, 0.98)';
  const text = theme.text;

  return (
    <div
      style={{
        background: bg,
        border: `1px solid ${theme.border}`,
        borderRadius: 8,
        padding: '10px 12px',
        boxShadow: isDarkMode ? '0 8px 24px rgba(0,0,0,0.45)' : '0 8px 20px rgba(0,0,0,0.12)',
        maxWidth: 300
      }}
    >
      <div style={{ fontWeight: 600, color: text, marginBottom: 6, fontSize: 12 }}>
        {label != null ? `Reading ${label}` : 'Reading'}
      </div>
      {payload.map((p) => (
        <div key={p.dataKey} style={{ color: text, fontSize: 12, lineHeight: 1.4 }}>
          <span style={{ color: p.color || theme.accent }}>{p.name}: </span>
          {formatter ? formatter(p.value, p.name) : p.value}
        </div>
      ))}
      {extra ? (
        <div style={{ color: theme.textMuted, fontSize: 11, marginTop: 8, lineHeight: 1.45 }}>
          {extra}
        </div>
      ) : null}
    </div>
  );
}
