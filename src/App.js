import React, { useState, useEffect, useRef } from 'react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import { Calendar, Upload, Download, TrendingUp, Droplets, Home, BarChart3, Leaf, Moon, Sun } from 'lucide-react';
import { getTheme } from './theme';
import ThemeToggle from './components/ThemeToggle';
import NavButtons from './components/NavButtons';
import PlantGrid from './components/PlantGrid';
import RecentEntriesTable from './components/RecentEntriesTable';
import VideoPlayer from './components/VideoPlayer';
import Sidebar from './components/Sidebar';
import EntryPage from './pages/EntryPage';
import AnalyticsPage from './pages/AnalyticsPage';
import MLModelPage from './pages/MLModelPage';

const HydroMonitor = () => {
  const [currentPage, setCurrentPage] = useState('dashboard');
  const [plantData, setPlantData] = useState([]);
  const [formData, setFormData] = useState({
    date: new Date().toISOString().split('T')[0],
    ph: '',
    tds: '',
    temperature: '',
    humidity: '',
    dissolvedOxy: ''
  });
  const [error, setError] = useState('');
  const [isVideoMaximized, setIsVideoMaximized] = useState(false);
  const [pastDays, setPastDays] = useState(7);
  const [isDarkMode, setIsDarkMode] = useState(true);
  const [dummyData, setDummyData] = useState({
    colors: [
      { hex: '#4CAF50', health: 'Healthy' },
      { hex: '#FF9800', health: 'Moderate' },
      { hex: '#F44336', health: 'Unhealthy' }
    ]
  });

  const theme = getTheme(isDarkMode);

  const csvInputRef = useRef(null);
  const mainContentRef = useRef(null);

  const plantInfo = {
    'Bok choy': {
      image: '/assets/water-spinach.png',
      color: isDarkMode ? 'linear-gradient(135deg, #1b1b1b 0%, #2a2a2a 100%)' : 'linear-gradient(135deg, #ffffff 0%, #f5f5f5 100%)',
      description: 'Nutrient-rich leafy green',
      optimalPH: '5.5-6.5',
      optimalTDS: '900-1200',
      optimalTemperature: '18-24',
      optimalHumidity: '50-70',
      optimalDissolvedOxy: '5-8'
    },
    'Chili': {
      image: '/assets/chili-plant.png',
      color: isDarkMode ? 'linear-gradient(135deg, #1b1b1b 0%, #2a2a2a 100%)' : 'linear-gradient(135deg, #ffffff 0%, #f5f5f5 100%)',
      description: 'Spicy pepper variety',
      optimalPH: '6.0-6.8',
      optimalTDS: '1000-1750',
      optimalTemperature: '21-29',
      optimalHumidity: '60-80',
      optimalDissolvedOxy: '5-8'
    },
    'Purple basil': {
      image: '/assets/purple-basil.png',
      color: isDarkMode ? 'linear-gradient(135deg, #1b1b1b 0%, #2a2a2a 100%)' : 'linear-gradient(135deg, #ffffff 0%, #f5f5f5 100%)',
      description: 'Aromatic purple-leafed herb',
      optimalPH: '5.5-6.5',
      optimalTDS: '500-800',
      optimalTemperature: '20-26',
      optimalHumidity: '50-70',
      optimalDissolvedOxy: '5-8'
    },
    'Thai basil': {
      image: '/assets/thai-basil.png',
      color: isDarkMode ? 'linear-gradient(135deg, #1b1b1b 0%, #2a2a2a 100%)' : 'linear-gradient(135deg, #ffffff 0%, #f5f5f5 100%)',
      description: 'Sweet and spicy Asian herb',
      optimalPH: '6.0-7.0',
      optimalTDS: '600-900',
      optimalTemperature: '20-26',
      optimalHumidity: '50-70',
      optimalDissolvedOxy: '5-8'
    },
    'Lemon basil': {
      image: '/assets/lemon-basil.png',
      color: isDarkMode ? 'linear-gradient(135deg, #1b1b1b 0%, #2a2a2a 100%)' : 'linear-gradient(135deg, #ffffff 0%, #f5f5f5 100%)',
      description: 'Citrusy aromatic herb',
      optimalPH: '5.8-6.8',
      optimalTDS: '500-750',
      optimalTemperature: '20-26',
      optimalHumidity: '50-70',
      optimalDissolvedOxy: '5-8'
    }
  };

  const isImagePath = (image) => typeof image === 'string' && /\.(jpg|jpeg|png|gif|webp)$/i.test(image);

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
      padding: '24px 16px',
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
      fontSize: '3.75rem',
      fontWeight: 'bold',
      marginBottom: '8px',
      textAlign: 'center',
      color: theme.accent,
      display: 'inline-block',
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
      color: theme.text,
      marginBottom: '8px',
    },
    plantDescription: {
      color: theme.textMuted,
      marginBottom: '16px',
    },
    plantStats: {
      background: isDarkMode ? 'rgba(255, 255, 255, 0.06)' : '#f5f5f5',
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
      background: isDarkMode ? 'rgba(255, 255, 255, 0.04)' : '#fafafa',
      borderRadius: '16px',
      padding: '24px',
    },
    chartTitle: {
      fontSize: '1.5rem',
      fontWeight: 'bold',
      color: theme.text,
      marginBottom: '24px',
      display: 'flex',
      alignItems: 'center',
      gap: '12px',
    },
    pageTitle: {
      fontSize: '2.5rem',
      fontWeight: 'bold',
      color: theme.text,
      display: 'flex',
      alignItems: 'center',
      gap: '16px',
    },
    submitButton: {
      width: '100%',
      background: theme.accent,
      color: '#ffffff',
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
    },
  };

  useEffect(() => {
    setIsLoading(true);
    fetch('http://localhost:5000/api/readings')
      .then(response => response.json())
      .then(data => {
        setPlantData(data);
      })
      .catch(error => setError('Failed to fetch data from server.'))
      .finally(() => setIsLoading(false));
  }, []);

  useEffect(() => {
    try {
      if (mainContentRef.current && typeof mainContentRef.current.scrollTo === 'function') {
        mainContentRef.current.scrollTo({ top: 0, behavior: 'auto' });
      }
      window.scrollTo({ top: 0, behavior: 'auto' });
    } catch (_) {}
  }, [currentPage]);

  const [isLoading, setIsLoading] = useState(false);

  const handleResetForm = () => {
    setFormData({
      date: new Date().toISOString().split('T')[0],
      ph: '',
      tds: '',
      temperature: '',
      humidity: '',
      dissolvedOxy: ''
    });
    setError('');
  };

  const handleSubmit = () => {
    if (!formData.date || !formData.ph || !formData.tds || !formData.temperature || !formData.humidity || !formData.dissolvedOxy) {
      setError('Please fill in all required fields (Date, pH, TDS, Temperature, Humidity, Dissolved Oxygen).');
      return;
    }
    if (isNaN(formData.ph) || formData.ph < 0 || formData.ph > 14) {
      setError('pH must be a number between 0 and 14.');
      return;
    }
    if (isNaN(formData.tds) || formData.tds < 0) {
      setError('TDS must be a positive number.');
      return;
    }
    if (isNaN(formData.temperature)) {
      setError('Temperature must be a number.');
      return;
    }
    if (isNaN(formData.humidity) || formData.humidity < 0 || formData.humidity > 100) {
      setError('Humidity must be a number between 0 and 100.');
      return;
    }
    if (isNaN(formData.dissolvedOxy) || formData.dissolvedOxy < 0) {
      setError('Dissolved Oxygen must be a positive number.');
      return;
    }

    const newEntry = {
      id: Date.now(),
      timestamp: new Date().toISOString(),
      temperature: parseFloat(formData.temperature),
      ph: parseFloat(formData.ph),
      tds: parseFloat(formData.tds),
      humidity: parseFloat(formData.humidity),
      dissolvedOxy: parseFloat(formData.dissolvedOxy),
    };

    fetch('http://localhost:5000/api/readings', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(newEntry),
    })
      .then((response) => response.json())
      .then(() => {
        setPlantData((prev) => [...prev, newEntry]);
        handleResetForm();
        setCurrentPage('dashboard');
        setError('');
      })
      .catch((error) => setError('Failed to save entry.'));
  };

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
          setError('Invalid CSV file: No data found.');
          return;
        }
        const headers = lines[0].split(',').map(header => header.trim());
        if (!headers.includes('id') || !headers.includes('timestamp') || !headers.includes('temperature') || !headers.includes('ph') || !headers.includes('tds')) {
          setError('Invalid CSV file: Required headers (id, timestamp, temperature, ph, tds) missing.');
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

        fetch('http://localhost:5000/api/readings', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(importedData)
        })
          .then(response => response.json())
          .then(() => {
            setPlantData(prev => [...prev, ...importedData]);
            setError('CSV imported successfully!');
            if (csvInputRef.current) csvInputRef.current.value = '';
          })
          .catch(error => setError('Error importing CSV: Please ensure the file is valid.'));
      } catch (err) {
        setError('Error importing CSV: Please ensure the file is valid.');
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

  const dummyPrediction = () => {
    const plants = ['Bok choy', 'Chili', 'Purple basil', 'Thai basil', 'Lemon basil'];
    return plants[Math.floor(Math.random() * plants.length)];
  };

  const generateDummyData = () => {
    const colors = [
      { hex: `#${Math.floor(Math.random()*16777215).toString(16)}`, health: ['Healthy', 'Moderate', 'Unhealthy'][Math.floor(Math.random() * 3)] },
      { hex: `#${Math.floor(Math.random()*16777215).toString(16)}`, health: ['Healthy', 'Moderate', 'Unhealthy'][Math.floor(Math.random() * 3)] },
      { hex: `#${Math.floor(Math.random()*16777215).toString(16)}`, health: ['Healthy', 'Moderate', 'Unhealthy'][Math.floor(Math.random() * 3)] }
    ];
    return { colors };
  };


  if (false && currentPage === 'entry') {
    return (
      <div style={styles.pageContainer}>
        <ThemeToggle isDarkMode={isDarkMode} onToggle={() => setIsDarkMode(!isDarkMode)} theme={theme} />
        <EntryPage
          styles={styles}
          formData={formData}
          setFormData={setFormData}
          handleSubmit={handleSubmit}
          handleResetForm={handleResetForm}
          setCurrentPage={setCurrentPage}
          error={error}
          theme={theme}
        />
      </div>
    );
  }

  if (false && currentPage === 'analytics') {
    return (
      <div style={styles.pageContainer}>
        <ThemeToggle isDarkMode={isDarkMode} onToggle={() => setIsDarkMode(!isDarkMode)} theme={theme} />
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
        />
      </div>
    );
  }

  if (false && currentPage === 'mlModel') {
    return (
      <div style={styles.pageContainer}>
        <ThemeToggle isDarkMode={isDarkMode} onToggle={() => setIsDarkMode(!isDarkMode)} theme={theme} />
        <MLModelPage
          styles={styles}
          theme={theme}
          isDarkMode={isDarkMode}
          dummyData={dummyData}
          setDummyData={setDummyData}
          generateDummyData={generateDummyData}
          dummyPrediction={dummyPrediction}
          setCurrentPage={setCurrentPage}
        />
      </div>
    );
  }


  return (
    <div style={styles.pageContainer}>
      <ThemeToggle isDarkMode={isDarkMode} onToggle={() => setIsDarkMode(!isDarkMode)} theme={theme} />
      <Sidebar
        currentPage={currentPage}
        setCurrentPage={setCurrentPage}
        exportToCSV={exportToCSV}
        onImportClick={() => csvInputRef.current?.click()}
        theme={theme}
        isDarkMode={isDarkMode}
      />
      <div ref={mainContentRef} style={{ ...styles.container, marginLeft: 280, paddingLeft: 16 }}>
        <div style={{ textAlign: 'center', marginBottom: '48px' }}>
          <h1 style={styles.title}>HydroMonitor</h1>
          <p style={styles.subtitle}>Advanced Hydroponic Plant Monitoring System</p>
        </div>

        <div style={styles.card}>
          {error && <div style={styles.error}>{error}</div>}
          {isLoading && <div style={{ ...styles.error, color: isDarkMode ? 'white' : '#2a6f6f' }}>Loading...</div>}
          <input ref={csvInputRef} type="file" accept=".csv" onChange={importFromCSV} style={{ display: 'none' }} />

          {currentPage === 'dashboard' && (
            <PlantGrid plantInfo={plantInfo} theme={theme} isDarkMode={isDarkMode} />
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
            />
          )}
          {currentPage === 'entry' && (
            <EntryPage
              styles={styles}
              formData={formData}
              setFormData={setFormData}
              handleSubmit={handleSubmit}
              handleResetForm={handleResetForm}
              setCurrentPage={setCurrentPage}
              error={error}
              theme={theme}
            />
          )}
          {currentPage === 'mlModel' && (
            <MLModelPage
              styles={styles}
              theme={theme}
              isDarkMode={isDarkMode}
              dummyData={dummyData}
              setDummyData={setDummyData}
              generateDummyData={generateDummyData}
              dummyPrediction={dummyPrediction}
              setCurrentPage={setCurrentPage}
            />
          )}
        </div>

        {plantData.length > 0 && (
          <RecentEntriesTable plantData={plantData} theme={theme} />
        )}

        <VideoPlayer isVideoMaximized={isVideoMaximized} setIsVideoMaximized={setIsVideoMaximized} theme={theme} />
      </div>
    </div>
  );
};

export default HydroMonitor;
