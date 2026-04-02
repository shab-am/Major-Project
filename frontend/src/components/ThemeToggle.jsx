import React from 'react';
import { Moon, Sun } from 'lucide-react';

const ThemeToggle = ({ isDarkMode, onToggle, theme }) => {
  const styles = {
    themeToggle: {
      position: 'absolute',
      top: '20px',
      right: '20px',
      padding: '12px 20px',
      borderRadius: '50px',
      background: theme.surface,
      border: '2px solid ' + theme.accent,
      cursor: 'pointer',
      display: 'flex',
      alignItems: 'center',
      gap: '8px',
      boxShadow: isDarkMode
        ? '0 4px 15px rgba(0, 0, 0, 0.5)'
        : '0 4px 15px rgba(0, 0, 0, 0.1)',
      transition: 'all 0.3s ease',
      transform: 'scale(0.7)'
    },
    themeIcon: {
      color: theme.accent,
      transition: 'all 0.3s ease'
    }
  };

  return (
    <button onClick={onToggle} style={styles.themeToggle}>
      {isDarkMode ? <Sun size={20} style={styles.themeIcon} /> : <Moon size={20} style={styles.themeIcon} />}
      <span>{isDarkMode ? 'Light Mode' : 'Dark Mode'}</span>
    </button>
  );
};

export default ThemeToggle;


