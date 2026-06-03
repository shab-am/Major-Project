import React from 'react';
import { Leaf, AlertTriangle } from 'lucide-react';
import { plantMetricDelta, sortPlantsByRisk } from '../utils/sensorAnalytics';

const HEALTH_COLORS = { Healthy: '#4ade80', 'Moderate Stress': '#ffa500', 'High Stress': '#ff6b6b' };

export default function PlantRoster({ plants = [], theme, compact = false }) {
  const sorted = sortPlantsByRisk(plants);
  if (!sorted.length) return <p style={{ color: theme.textMuted, padding: 16, textAlign: 'center', margin: 0 }}>No plant data yet.</p>;

  return (
    <div style={{ display: 'grid', gap: compact ? 8 : 12 }}>
      {sorted.map((plant) => {
        const color = HEALTH_COLORS[plant.health_status] || '#9ca3af';
        const metrics = [
          { key: 'ph', label: 'pH', value: plant.metrics?.ph },
          { key: 'temperature', label: 'Temp', value: plant.metrics?.temperature },
          { key: 'humidity', label: 'Humidity', value: plant.metrics?.humidity },
          { key: 'tds', label: 'TDS', value: plant.metrics?.tds },
          { key: 'dissolved_oxygen', label: 'DO', value: plant.metrics?.dissolved_oxygen }
        ];
        return (
          <div key={plant.plant_code || plant.display_name} style={{ background: theme.card, border: `1px solid ${color}44`, borderRadius: compact ? 10 : 14, padding: compact ? 10 : 14 }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 8, gap: 8 }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                <Leaf size={16} color={color} />
                <div style={{ color: theme.text, fontWeight: 700, fontSize: compact ? 13 : 14 }}>{plant.display_name}</div>
              </div>
              <span style={{ padding: '3px 8px', borderRadius: 6, background: `${color}22`, color, fontSize: 11, fontWeight: 600 }}>{plant.health_status}</span>
            </div>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(100px, 1fr))', gap: 6 }}>
              {metrics.map(({ key, label, value }) => {
                const delta = plantMetricDelta(value, plant.optimal_ranges?.[key]);
                return (
                  <div key={key} style={{ background: theme.surface, borderRadius: 6, padding: 8, border: `1px solid ${theme.border}` }}>
                    <div style={{ color: theme.textMuted, fontSize: 10 }}>{label}</div>
                    <div style={{ color: theme.text, fontWeight: 600, fontSize: 12 }}>{value != null ? Number(value).toFixed(key === 'ph' ? 2 : 1) : '--'}</div>
                    {delta && <div style={{ fontSize: 10, marginTop: 2, color: delta.direction === 'ok' ? '#4ade80' : '#ff6b6b' }}>{delta.text}</div>}
                  </div>
                );
              })}
            </div>
            {plant.issues?.length > 0 && (
              <div style={{ marginTop: 8, fontSize: 11, color: theme.textMuted }}>
                <AlertTriangle size={11} style={{ verticalAlign: 'middle', marginRight: 4 }} color="#ff6b6b" />
                {plant.issues.join(' | ')}
              </div>
            )}
          </div>
        );
      })}
    </div>
  );
}
