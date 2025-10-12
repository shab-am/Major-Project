export const getTheme = (isDarkMode) =>
  isDarkMode
    ? {
        // Dark theme from provided palette
        bg: 'rgb(9, 11, 15)',            // --body
        bgAlt: 'rgb(9, 11, 15)',
        surface: 'rgb(21, 26, 34)',      // --buttonclr
        card: 'rgb(32, 36, 37)',         // --black
        text: 'rgb(241, 242, 243)',      // --whitesmoke
        textMuted: 'rgb(201, 203, 205)', // --textfade
        border: 'rgba(241, 242, 243, 0.14)',
        accent: '#d3ff5c',               // --greenyellow
        inputBg: 'rgb(21, 26, 34)'
      }
    : {
        // Greyscale light theme
        bg: '#f4f5f7',
        bgAlt: '#ffffff',
        surface: '#ffffff',
        card: '#ffffff',
        text: '#1f2937',
        textMuted: '#6b7280',
        border: 'rgba(17, 24, 39, 0.3)',
        accent: '#00e5ff',
        inputBg: '#eef1f5'
      };


