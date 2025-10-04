export const getTheme = (isDarkMode) =>
  isDarkMode
    ? {
        bg: '#121212',
        bgAlt: '#181818',
        surface: '#1b1b1b',
        card: '#1f1f1f',
        text: '#e6e6e6',
        textMuted: '#b3b3b3',
        border: 'rgba(255, 255, 255, 0.12)',
        accent: '#8ab4f8',
        inputBg: '#252525'
      }
    : {
        bg: '#f7f7f7',
        bgAlt: '#ffffff',
        surface: '#ffffff',
        card: '#ffffff',
        text: '#1f1f1f',
        textMuted: '#4d4d4d',
        border: 'rgba(0, 0, 0, 0.12)',
        accent: '#1a73e8',
        inputBg: '#f0f0f0'
      };


