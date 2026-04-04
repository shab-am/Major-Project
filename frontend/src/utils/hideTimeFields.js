/** Keys treated as clock/calendar time — hide from UI grids and tooltips. */
export const TIME_LIKE_KEYS = new Set([
  'timestamp',
  'Timestamp',
  'created_at',
  'updated_at',
  'last_reading',
  'fullTimestamp',
  'reading_time',
  'time',
  'date',
  'lastUpdate',
  'last_update'
]);

export function isTimeLikeKey(key) {
  if (!key || typeof key !== 'string') return false;
  if (TIME_LIKE_KEYS.has(key)) return true;
  const lower = key.toLowerCase();
  return (
    lower.includes('timestamp') ||
    lower.endsWith('_at') ||
    lower === 'reading_time' ||
    lower === 'last_reading'
  );
}

export function omitTimeKeys(obj) {
  if (!obj || typeof obj !== 'object') return obj;
  return Object.fromEntries(
    Object.entries(obj).filter(([k]) => !isTimeLikeKey(k))
  );
}
