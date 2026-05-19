/** Hydroponic monitoring palette — teal accent, clear status colors */
export const getTheme = (isDarkMode) =>
  isDarkMode
    ? {
        bg: '#0a0e14',
        bgAlt: '#0f1419',
        surface: '#141c27',
        card: '#1a2433',
        text: '#eef2f7',
        textMuted: '#8b9cb3',
        border: 'rgba(139, 156, 179, 0.18)',
        accent: '#2dd4bf',
        accentMuted: 'rgba(45, 212, 191, 0.15)',
        success: '#4ade80',
        warning: '#fbbf24',
        danger: '#f87171',
        chartPh: '#2dd4bf',
        chartTemp: '#a78bfa',
        chartHumidity: '#60a5fa',
        chartTds: '#fb923c',
        chartDo: '#34d399',
        inputBg: '#141c27'
      }
    : {
        bg: '#f0f4f8',
        bgAlt: '#ffffff',
        surface: '#ffffff',
        card: '#ffffff',
        text: '#0f172a',
        textMuted: '#64748b',
        border: 'rgba(15, 23, 42, 0.12)',
        accent: '#0d9488',
        accentMuted: 'rgba(13, 148, 136, 0.12)',
        success: '#16a34a',
        warning: '#d97706',
        danger: '#dc2626',
        chartPh: '#0d9488',
        chartTemp: '#7c3aed',
        chartHumidity: '#2563eb',
        chartTds: '#ea580c',
        chartDo: '#059669',
        inputBg: '#f1f5f9'
      };
