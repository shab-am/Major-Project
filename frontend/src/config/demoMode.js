const STORAGE_KEY = 'hydromonitor_use_demo';

export function readDemoModePreference() {
  if (process.env.REACT_APP_USE_DEMO_DATA === 'true') return true;
  if (process.env.REACT_APP_USE_DEMO_DATA === 'false') return false;
  try {
    const stored = localStorage.getItem(STORAGE_KEY);
    if (stored === 'true') return true;
    if (stored === 'false') return false;
  } catch (_) {}
  return true;
}

export function writeDemoModePreference(enabled) {
  try {
    localStorage.setItem(STORAGE_KEY, enabled ? 'true' : 'false');
  } catch (_) {}
}
