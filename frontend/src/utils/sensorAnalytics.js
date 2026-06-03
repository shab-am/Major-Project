/**
 * Analytics helpers for live sensor time-series (project_readings shape).
 */

const METRIC_KEYS = [
  { key: 'ph', fields: ['ph_value', 'soil_ph', 'ph'], label: 'pH', unit: '' },
  { key: 'temperature', fields: ['ambient_temperature', 'temperature'], label: 'Temperature', unit: '°C' },
  { key: 'humidity', fields: ['humidity'], label: 'Humidity', unit: '%' },
  { key: 'tds', fields: ['tds_value', 'tds'], label: 'TDS', unit: 'ppm' },
  { key: 'dissolved_oxygen', fields: ['dissolved_oxygen', 'dissolvedOxy'], label: 'Dissolved O₂', unit: 'mg/L' },
  { key: 'ec', fields: ['ec_value', 'ec'], label: 'EC', unit: 'mS/cm' },
  { key: 'electrochemical_signal', fields: ['electrochemical_signal'], label: 'Electrochemical', unit: '' }
];

export const DEFAULT_OPTIMAL = {
  ph: { min: 5.6, max: 6.4, label: '5.6–6.4' },
  temperature: { min: 18, max: 24, label: '18–24 °C' },
  humidity: { min: 55, max: 72, label: '55–72 %' },
  tds: { min: 560, max: 840, label: '560–840 ppm' },
  dissolved_oxygen: { min: 5, max: 9, label: '5–9 mg/L' }
};

export function pickMetric(row, metricKey) {
  const def = METRIC_KEYS.find((m) => m.key === metricKey);
  if (!def || !row) return null;
  for (const field of def.fields) {
    const v = row[field];
    if (v != null && v !== '' && !Number.isNaN(Number(v))) return Number(v);
  }
  return null;
}

export function rowTimeValue(row) {
  const raw = row?.timestamp || row?.recorded_at || row?.created_at || row?.reading_time || null;
  if (!raw) return null;
  const time = new Date(raw).getTime();
  return Number.isNaN(time) ? null : time;
}

export function compareRowsChronological(a, b) {
  const aTime = rowTimeValue(a);
  const bTime = rowTimeValue(b);
  const idOrder = (a?.id ?? 0) - (b?.id ?? 0);
  if (aTime != null && bTime != null) return aTime - bTime || idOrder;
  return idOrder;
}

export function compareRowsNewestFirst(a, b) {
  return compareRowsChronological(b, a);
}

export function rowsToSeries(rows, projectMode = true) {
  const chronological = [...(rows || [])].sort(compareRowsChronological);
  return chronological.map((row, index) => {
    const point = { readingLabel: `#${index + 1}`, id: row.id ?? index };
    METRIC_KEYS.forEach(({ key }) => {
      point[key] = pickMetric(row, key);
    });
    point.recorded_at = row.recorded_at || row.timestamp || null;
    return point;
  });
}

export function timeInBand(series, metricKey, range) {
  if (!range || !series?.length) return { inBand: 0, outBand: 0, total: 0, pctInBand: null };
  let inBand = 0;
  let outBand = 0;
  series.forEach((point) => {
    const v = point[metricKey];
    if (v == null || Number.isNaN(v)) return;
    if (v >= range.min && v <= range.max) inBand += 1;
    else outBand += 1;
  });
  const total = inBand + outBand;
  return {
    inBand,
    outBand,
    total,
    pctInBand: total ? Math.round((inBand / total) * 100) : null
  };
}

export function rateOfChange(series, metricKey, sampleMinutes = 5) {
  const values = series
    .map((p) => p[metricKey])
    .filter((v) => v != null && !Number.isNaN(v));
  if (values.length < 2) return null;
  const first = values[0];
  const last = values[values.length - 1];
  const spanSamples = values.length - 1;
  const hours = (spanSamples * sampleMinutes) / 60;
  if (hours <= 0) return null;
  const perHour = (last - first) / hours;
  return { delta: last - first, perHour, last, first, hours };
}

export function assessDataQuality(rows, projectMode = true) {
  const series = rowsToSeries(rows, projectMode);
  const issues = [];
  const checks = [
    { key: 'ph', label: 'pH' },
    { key: 'dissolved_oxygen', label: 'Dissolved O₂' },
    { key: 'ec', label: 'EC' },
    { key: 'tds', label: 'TDS' }
  ];

  checks.forEach(({ key, label }) => {
    const present = series.filter((p) => p[key] != null).length;
    if (present === 0) issues.push({ severity: 'high', message: `${label} missing in all samples` });
    else if (present < series.length * 0.5)
      issues.push({ severity: 'medium', message: `${label} sparse (${present}/${series.length} samples)` });
  });

  METRIC_KEYS.forEach(({ key, label }) => {
    const vals = series.map((p) => p[key]).filter((v) => v != null);
    if (vals.length >= 6) {
      const spread = Math.max(...vals) - Math.min(...vals);
      if (spread < 0.001) {
        issues.push({ severity: 'medium', message: `${label} flatline — sensor may be stuck` });
      }
    }
  });

  const last = rows?.[0];
  const staleness = last?.recorded_at
    ? `Last sample: ${new Date(last.recorded_at).toLocaleString()}`
    : rows?.length
      ? 'Timestamps not available on rows'
      : 'No samples';

  return {
    issues,
    sampleCount: series.length,
    stalenessLabel: staleness,
    ok: issues.filter((i) => i.severity === 'high').length === 0
  };
}

export function metricBandSummary(series, optimalRanges = DEFAULT_OPTIMAL) {
  return Object.keys(optimalRanges).map((key) => {
    const band = timeInBand(series, key, optimalRanges[key]);
    const rate = rateOfChange(series, key);
    return {
      key,
      label: METRIC_KEYS.find((m) => m.key === key)?.label || key,
      ...band,
      rate,
      range: optimalRanges[key]
    };
  });
}

export function plantMetricDelta(value, range) {
  if (value == null || !range) return null;
  if (value < range.min) return { direction: 'low', delta: range.min - value, text: `${(range.min - value).toFixed(2)} below band` };
  if (value > range.max) return { direction: 'high', delta: value - range.max, text: `${(value - range.max).toFixed(2)} above band` };
  return { direction: 'ok', delta: 0, text: 'In band' };
}

export function sortPlantsByRisk(plants) {
  const order = { 'High Stress': 0, 'Moderate Stress': 1, Healthy: 2 };
  return [...plants].sort((a, b) => {
    const sa = order[a.health_status] ?? 3;
    const sb = order[b.health_status] ?? 3;
    if (sa !== sb) return sa - sb;
    return (b.issues?.length || 0) - (a.issues?.length || 0);
  });
}

export { METRIC_KEYS };
