import React, { useState, useEffect, useRef } from 'react';
import { getTheme } from './theme';
import RecentEntriesTable from './components/RecentEntriesTable';
import Sidebar from './components/Sidebar';
import AnalyticsPage from './pages/AnalyticsPage';
import MLModelPage from './pages/MLModelPage';
import BioSignalsPage from './pages/BioSignalsPage';
import StressInsightsPage from './pages/StressInsightsPage';
import HardwareInterfacePage from './pages/HardwareInterfacePage';
import SettingsPage from './pages/SettingsPage';
import Dashboard from './components/Dashboard';
import RecentPlantsPopup from './components/RecentPlantsPopup';
import './components/Sidebar.css';

const HydroMonitor = () => {
  const [currentPage, setCurrentPage] = useState('dashboard');
  const [plantData, setPlantData] = useState([]);
  
  const [pastDays, setPastDays] = useState(7);
  const [isDarkMode, setIsDarkMode] = useState(true);
  const [showRecentPlantsPopup, setShowRecentPlantsPopup] = useState(false);

  const theme = getTheme(isDarkMode);

  const csvInputRef = useRef(null);
  const mainContentRef = useRef(null);

  const plantInfo = {
    'Bok choy': {
      image: '/assets/water-spinach.png',
      color: isDarkMode ? '#1f2937' : 'rgba(0, 0, 0, 0.04)',
      description: 'Nutrient-rich leafy green',
      optimalPH: '5.5-6.5',
      optimalTDS: '900-1200',
      optimalTemperature: '18-24',
      optimalHumidity: '50-70',
      optimalDissolvedOxy: '5-8'
    },
    'Chili': {
      image: '/assets/chili-plant.png',
      color: isDarkMode ? '#23262b' : 'rgba(17, 24, 39, 0.05)',
      description: 'Spicy pepper variety',
      optimalPH: '6.0-6.8',
      optimalTDS: '1000-1750',
      optimalTemperature: '21-29',
      optimalHumidity: '60-80',
      optimalDissolvedOxy: '5-8'
    },
    'Purple basil': {
      image: '/assets/purple-basil.png',
      color: isDarkMode ? '#1e1f24' : 'rgba(31, 41, 55, 0.05)',
      description: 'Aromatic purple-leafed herb',
      optimalPH: '5.5-6.5',
      optimalTDS: '500-800',
      optimalTemperature: '20-26',
      optimalHumidity: '50-70',
      optimalDissolvedOxy: '5-8'
    },
    'Thai basil': {
      image: '/assets/thai-basil.png',
      color: isDarkMode ? '#242428' : 'rgba(55, 65, 81, 0.05)',
      description: 'Sweet and spicy Asian herb',
      optimalPH: '6.0-7.0',
      optimalTDS: '600-900',
      optimalTemperature: '20-26',
      optimalHumidity: '50-70',
      optimalDissolvedOxy: '5-8'
    },
    'Lemon basil': {
      image: '/assets/lemon-basil.png',
      color: isDarkMode ? '#26262a' : 'rgba(75, 85, 99, 0.05)',
      description: 'Citrusy aromatic herb',
      optimalPH: '5.8-6.8',
      optimalTDS: '500-750',
      optimalTemperature: '20-26',
      optimalHumidity: '50-70',
      optimalDissolvedOxy: '5-8'
    },
    'Brinjal': {
      image: '/assets/brinjal.png',
      color: isDarkMode ? '#1b1b1f' : 'rgba(107, 114, 128, 0.06)',
      description: 'Eggplant variety rich in fiber and antioxidants',
      optimalPH: '5.5-6.6',
      optimalTDS: '1400-1750',
      optimalTemperature: '20-30',
      optimalHumidity: '60-70',
      optimalDissolvedOxy: '5-8'
    }
  };

  const styles = {
    pageContainer: {
      minHeight: '100vh',
      background: theme.bg,
      fontFamily: 'system-ui, -apple-system, sans-serif',
      position: 'relative',
      transition: 'all 0.3s ease',
      '@media (max-width: 768px)': {
        padding: '16px 8px',
      },
    },
    container: {
      maxWidth: '1200px',
      margin: '0 auto',
      padding: '4px 12px',
    },
    card: {
      background: theme.card,
      backdropFilter: isDarkMode ? 'blur(8px)' : 'none',
      borderRadius: '24px',
      boxShadow: isDarkMode 
        ? '0 20px 40px -16px rgba(0, 0, 0, 0.5)' 
        : '0 10px 20px rgba(0, 0, 0, 0.08)',
      border: '1px solid ' + theme.border,
      padding: '32px',
    },
    title: {
      fontSize: '2.75rem',
      fontWeight: 800,
      marginBottom: '8px',
      lineHeight: 1.1,
      textAlign: 'center',
      color: theme.accent,
      display: 'inline-block',
      textShadow: isDarkMode ? '0 0 8px rgba(211, 255, 92, 0.45)' : '0 0 6px rgba(0, 229, 255, 0.45)'
    },
    subtitle: {
      fontSize: '1.25rem',
      color: theme.textMuted,
      textAlign: 'center',
      marginBottom: '48px',
    },
    button: {
      padding: '12px 24px',
      borderRadius: '12px',
      fontWeight: '600',
      border: 'none',
      cursor: 'pointer',
      transition: 'all 0.3s ease',
      display: 'flex',
      alignItems: 'center',
      gap: '8px',
    },
    primaryButton: {
      background: theme.accent,
      color: 'white',
      '&:hover': {
        opacity: 0.9,
      },
    },
    activeButton: {
      background: theme.accent,
      color: 'white',
    },
    greenButton: {
      background: theme.accent,
      color: 'white',
      '&:hover': { opacity: 0.9 },
    },
    purpleButton: {
      background: theme.accent,
      color: 'white',
      '&:hover': { opacity: 0.9 },
    },
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
      transform: 'scale(0.7)', // Reduce size to 70%
      '&:hover': {
        transform: 'scale(0.77)', // Adjusted hover scale
        background: isDarkMode ? '#222222' : '#f2f2f2',
      },
    },
    themeIcon: {
      color: theme.accent,
      transition: 'all 0.3s ease',
    },
    plantCard: {
      padding: '32px',
      borderRadius: '16px',
      cursor: 'pointer',
      transform: 'scale(1)',
      transition: 'all 0.3s ease',
      boxShadow: isDarkMode 
        ? '0 25px 50px -12px rgba(0, 0, 0, 0.25)' 
        : '0 10px 20px rgba(0, 0, 0, 0.1)',
      border: '1px solid ' + theme.border,
      textAlign: 'center',
    },
    plantEmoji: {
      fontSize: '5rem',
      marginBottom: '16px',
    },
    plantName: {
      fontSize: '1.5rem',
      fontWeight: 'bold',
      color: theme.accent,
      marginBottom: '8px',
    },
    plantDescription: {
      color: theme.textMuted,
      marginBottom: '16px',
    },
    plantStats: {
      background: isDarkMode ? 'rgba(255, 255, 255, 0.06)' : '#f2f2f3',
      borderRadius: '12px',
      padding: '16px',
      marginBottom: '16px',
    },
    input: {
      width: '100%',
      background: theme.inputBg,
      border: '1px solid ' + theme.border,
      borderRadius: '12px',
      padding: '12px 16px',
      color: theme.text,
      fontSize: '16px',
      '&::placeholder': {
        color: theme.textMuted,
      },
      '&:focus': {
        outline: 'none',
        border: '2px solid ' + theme.accent,
      },
    },
    label: {
      color: theme.text,
      fontWeight: '600',
      display: 'flex',
      alignItems: 'center',
      gap: '8px',
      marginBottom: '8px',
    },
    grid: {
      display: 'grid',
      gap: '32px',
    },
    gridCols3: {
      gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))',
    },
    gridCols2: {
      gridTemplateColumns: 'repeat(auto-fit, minmax(400px, 1fr))',
    },
    flexBetween: {
      display: 'flex',
      justifyContent: 'space-between',
      alignItems: 'center',
      marginBottom: '32px',
    },
    flexCenter: {
      display: 'flex',
      justifyContent: 'center',
      alignItems: 'center',
      gap: '16px',
      flexWrap: 'wrap',
      marginBottom: '32px',
    },
    table: {
      width: '100%',
      borderCollapse: 'collapse',
      color: theme.text,
    },
    th: {
      textAlign: 'left',
      padding: '12px 16px',
      borderBottom: '1px solid ' + theme.border,
      fontWeight: '600',
    },
    td: {
      padding: '12px 16px',
      borderBottom: '1px solid ' + theme.border,
    },
    chartContainer: {
      background: isDarkMode ? 'rgba(255, 255, 255, 0.04)' : '#f5f6f8',
      borderRadius: '16px',
      padding: '24px',
    },
    chartTitle: {
      fontSize: '1.5rem',
      fontWeight: 'bold',
      color: theme.accent,
      marginBottom: '24px',
      display: 'flex',
      alignItems: 'center',
      gap: '12px',
      textShadow: isDarkMode ? '0 0 4px rgba(211, 255, 92, 0.35)' : '0 0 3px rgba(0, 229, 255, 0.35)'
    },
    pageTitle: {
      fontSize: '2.5rem',
      fontWeight: 'bold',
      color: theme.accent,
      display: 'flex',
      alignItems: 'center',
      gap: '16px',
      marginTop: '8px',
      marginBottom: '8px',
      textShadow: isDarkMode ? '0 0 6px rgba(211, 255, 92, 0.4)' : '0 0 5px rgba(0, 229, 255, 0.45)'
    },
    submitButton: {
      width: '100%',
      background: theme.surface,
      color: theme.textMuted,
      padding: '16px',
      borderRadius: '12px',
      fontSize: '1.125rem',
      fontWeight: 'bold',
      border: 'none',
      cursor: 'pointer',
      transition: 'all 0.3s ease',
      '&:hover': {
        transform: 'scale(1.02)',
      },
    },
    resetButton: {
      width: '100%',
      background: theme.surface,
      color: theme.text,
      padding: '16px',
      borderRadius: '12px',
      fontSize: '1.125rem',
      fontWeight: 'bold',
      border: 'none',
      cursor: 'pointer',
      transition: 'all 0.3s ease',
      '&:hover': {
        transform: 'scale(1.02)',
      },
    },
    statsCard: {
      padding: '24px',
      borderRadius: '16px',
      color: theme.text,
      textAlign: 'center',
    },
    statsIcon: {
      fontSize: '2rem',
      marginRight: '12px',
    },
    statsTitle: {
      fontSize: '1.25rem',
      fontWeight: 'bold',
      marginBottom: '16px',
      display: 'flex',
      alignItems: 'center',
    },
    statItem: {
      display: 'flex',
      justifyContent: 'space-between',
      marginBottom: '8px',
    },
    error: {
      color: isDarkMode ? '#f87171' : '#e06666',
      fontSize: '1rem',
      marginBottom: '16px',
      textAlign: 'center',
    },
    videoContainer: {
      position: 'fixed',
      zIndex: 1000,
      transition: 'all 0.3s ease',
      borderRadius: '12px',
      overflow: 'hidden',
      background: theme.surface,
      border: '1px solid ' + theme.border,
      cursor: 'pointer',
    },
    videoMinimized: {
      bottom: '17px',
      left: '17px',
      width: '170px',
      height: '100px',
    },
    videoMaximized: {
      top: '50%',
      left: '50%',
      transform: 'translate(-50%, -50%)',
      width: '50vw',
      height: '50vh',
      zIndex: 2000,
      boxShadow: '0 0 20px 8px rgba(0, 0, 0, 0.5)',
      border: '2px solid ' + theme.accent,
    },
    video: {
      width: '100%',
      height: '100%',
      objectFit: 'cover',
    }
  };

  // Load plant data from localStorage on mount
  useEffect(() => {
    try {
      const savedData = localStorage.getItem('plantData');
      if (savedData) {
        const parsed = JSON.parse(savedData);
        setPlantData(Array.isArray(parsed) ? parsed : []);
        console.log('Loaded', parsed.length, 'plant entries from localStorage');
      } else {
        console.log('No saved plant data found');
        setPlantData([]);
      }
    } catch (error) {
      console.error('Error loading plant data from localStorage:', error);
      setPlantData([]);
    }
  }, []);

  // Save plant data to localStorage whenever it changes
  useEffect(() => {
    if (plantData.length > 0) {
      try {
        localStorage.setItem('plantData', JSON.stringify(plantData));
        console.log('Saved', plantData.length, 'plant entries to localStorage');
      } catch (error) {
        console.error('Error saving plant data to localStorage:', error);
      }
    }
  }, [plantData]);

  useEffect(() => {
    try {
      if (mainContentRef.current && typeof mainContentRef.current.scrollTo === 'function') {
        mainContentRef.current.scrollTo({ top: 0, behavior: 'auto' });
      }
      window.scrollTo({ top: 0, behavior: 'auto' });
    } catch (_) {}
  }, [currentPage]);


  // Update exportToCSV to include new columns
  const exportToCSV = () => {
    const csvData = [['id', 'timestamp', 'temperature', 'ph', 'tds', 'humidity', 'dissolvedOxy']];
    plantData.forEach(row => {
      csvData.push([row.id, row.timestamp, row.temperature, row.ph, row.tds, row.humidity, row.dissolvedOxy]);
    });
    const csv = csvData.map(row => row.join(',')).join('\n');
    const blob = new Blob([csv], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `hydro_monitor_data_${new Date().toISOString().split('T')[0]}.csv`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const importFromCSV = (e) => {
    const file = e.target.files[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      try {
        const csv = event.target.result;
        const lines = csv.split('\n').filter(line => line.trim());
        if (lines.length < 2) {
          console.error('Invalid CSV file: No data found.');
          alert('Invalid CSV file: No data found.');
          return;
        }
        const headers = lines[0].split(',').map(header => header.trim());
        if (!headers.includes('id') || !headers.includes('timestamp') || !headers.includes('temperature') || !headers.includes('ph') || !headers.includes('tds')) {
          console.error('Invalid CSV file: Required headers (id, timestamp, temperature, ph, tds) missing.');
          alert('Invalid CSV file: Required headers (id, timestamp, temperature, ph, tds) missing.');
          return;
        }

        const importedData = lines.slice(1).map(line => {
          const values = line.split(',').map(val => val.trim());
          return {
            id: values[0] || Date.now() + Math.random(),
            timestamp: values[1] || new Date().toISOString(),
            temperature: parseFloat(values[2]) || 0,
            ph: parseFloat(values[3]) || 0,
            tds: parseFloat(values[4]) || 0
          };
        });

        // Save imported data to localStorage
        try {
          setPlantData(prev => {
            const updated = [...prev, ...importedData];
            localStorage.setItem('plantData', JSON.stringify(updated));
            return updated;
          });
          alert('CSV imported successfully!');
          if (csvInputRef.current) csvInputRef.current.value = '';
          console.log('Imported', importedData.length, 'entries from CSV');
        } catch (error) {
          console.error('Error importing CSV:', error);
          alert('Error importing CSV: Please ensure the file is valid.');
        }
      } catch (err) {
        console.error('Error importing CSV:', err);
        alert('Error importing CSV: Please ensure the file is valid.');
      }
    };
    reader.readAsText(file);
  };

  const getChartData = (dataType) => {
    const cutoffDate = new Date();
    cutoffDate.setDate(cutoffDate.getDate() - pastDays);
    return plantData
      .filter(entry => new Date(entry.timestamp) >= cutoffDate)
      .map(entry => ({
        timestamp: new Date(entry.timestamp).toLocaleDateString(), // Readable date
        [dataType]: entry[dataType]
      }))
      .sort((a, b) => new Date(a.timestamp) - new Date(b.timestamp));
  };

  const getTrendAnalysis = (dataType, days) => {
    const cutoffDate = new Date();
    cutoffDate.setDate(cutoffDate.getDate() - days);
    const recentData = plantData
      .filter(entry => new Date(entry.timestamp) >= cutoffDate)
      .sort((a, b) => new Date(a.timestamp) - new Date(b.timestamp));

    if (recentData.length < 2) {
      return { trend: 'Insufficient data', slope: 0, rangeStatus: '' };
    }

    const values = recentData.map(entry => entry[dataType]);
    const avgValue = values.reduce((sum, val) => sum + val, 0) / values.length;
    const firstHalf = values.slice(0, Math.ceil(values.length / 2));
    const secondHalf = values.slice(Math.floor(values.length / 2));
    const firstAvg = firstHalf.reduce((sum, val) => sum + val, 0) / firstHalf.length;
    const secondAvg = secondHalf.reduce((sum, val) => sum + val, 0) / secondHalf.length;

    const slope = secondAvg - firstAvg;
    let trend = 'Stable';
    if (slope > 0.1) trend = 'Increasing';
    else if (slope < -0.1) trend = 'Decreasing';

    let rangeStatus = '';
    Object.keys(plantInfo).forEach(plantName => {
      const optimalRange = dataType === 'ph' ? plantInfo[plantName].optimalPH :
                          dataType === 'tds' ? plantInfo[plantName].optimalTDS :
                          plantInfo[plantName].optimalTemperature;
      const [min, max] = optimalRange.split('-').map(Number);
      if (avgValue < min) rangeStatus += `${plantName}: Below optimal (${optimalRange}). `;
      else if (avgValue > max) rangeStatus += `${plantName}: Above optimal (${optimalRange}). `;
      else rangeStatus += `${plantName}: Within optimal (${optimalRange}). `;
    });

    return { trend, slope: slope.toFixed(2), rangeStatus };
  };

    return (
      <div style={styles.pageContainer}>
      <Sidebar
        currentPage={currentPage}
        setCurrentPage={setCurrentPage}
        exportToCSV={exportToCSV}
        onImportClick={() => csvInputRef.current?.click()}
        theme={theme}
        isDarkMode={isDarkMode}
      />
      <div 
        ref={mainContentRef} 
        className="main-content"
              style={{
          ...styles.container, 
          marginLeft: 280, 
          padding: '4px 12px',
          '--main-bg': theme.bg,
          '--accent-color': `${theme.accent}40`,
          '--accent-color-hover': `${theme.accent}60`
        }}
      >

        {currentPage === 'dashboard' ? (
          <Dashboard 
            theme={theme} 
            isDarkMode={isDarkMode} 
            plantData={plantData} 
            onViewAllPlants={() => setShowRecentPlantsPopup(true)}
            onToggleTheme={() => setIsDarkMode(!isDarkMode)}
                  />
                ) : (
                <div>
            <input ref={csvInputRef} type="file" accept=".csv" onChange={importFromCSV} style={{ display: 'none' }} />
          {currentPage === 'biosignals' && (
            <BioSignalsPage 
              styles={styles} 
              theme={theme} 
              isDarkMode={isDarkMode}
              onToggleTheme={() => setIsDarkMode(!isDarkMode)}
            />
          )}
          {currentPage === 'analytics' && (
            <AnalyticsPage
              styles={styles}
              getChartData={getChartData}
              getTrendAnalysis={getTrendAnalysis}
              pastDays={pastDays}
              setPastDays={setPastDays}
              isDarkMode={isDarkMode}
              theme={theme}
              plantInfo={plantInfo}
              plantData={plantData}
              onToggleTheme={() => setIsDarkMode(!isDarkMode)}
            />
          )}
              {currentPage === 'stress' && (
                <StressInsightsPage 
                  styles={styles} 
                  theme={theme} 
                  isDarkMode={isDarkMode} 
                  plantData={plantData}
                  onToggleTheme={() => setIsDarkMode(!isDarkMode)} 
                />
              )}
              {currentPage === 'mlModel' && (
                <MLModelPage
                  styles={styles}
                  theme={theme}
                  isDarkMode={isDarkMode}
                  plantData={plantData}
                  onToggleTheme={() => setIsDarkMode(!isDarkMode)}
                />
              )}
              {currentPage === 'hardware' && (
                <HardwareInterfacePage styles={styles} theme={theme} isDarkMode={isDarkMode} onToggleTheme={() => setIsDarkMode(!isDarkMode)} />
              )}
              {currentPage === 'settings' && (
                <SettingsPage styles={styles} theme={theme} isDarkMode={isDarkMode} onToggleTheme={() => setIsDarkMode(!isDarkMode)} />
              )}
              </div>
            )}

                    </div>
      
      {/* Recent Plants Popup */}
      <RecentPlantsPopup 
        isOpen={showRecentPlantsPopup}
        onClose={() => setShowRecentPlantsPopup(false)}
        theme={theme}
        isDarkMode={isDarkMode}
        plantData={plantData}
      />
    </div>
  );
};

export default HydroMonitor;
