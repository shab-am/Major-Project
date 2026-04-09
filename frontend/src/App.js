import React, { useMemo, useRef, useState } from 'react';
import Sidebar from './components/Sidebar';
import Dashboard from './components/Dashboard';
import RecentPlantsPopup from './components/RecentPlantsPopup';
import AnalyticsPage from './pages/AnalyticsPage';
import BioSignalsPage from './pages/BioSignalsPage';
import HardwareInterfacePage from './pages/HardwareInterfacePage';
import MLModelPage from './pages/MLModelPage';
import StressInsightsPage from './pages/StressInsightsPage';
import { getTheme } from './theme';
import { useLiveSensor } from './context/LiveSensorContext';
import './components/Sidebar.css';

const PAGE_COMPONENTS = {
  dashboard: Dashboard,
  biosignals: BioSignalsPage,
  analytics: AnalyticsPage,
  mlModel: MLModelPage,
  stress: StressInsightsPage,
  hardware: HardwareInterfacePage
};

function exportRowsToCsv(rows) {
  if (!rows.length) return;
  const headers = Array.from(
    rows.reduce((set, row) => {
      Object.keys(row).forEach((key) => set.add(key));
      return set;
    }, new Set())
  );
  const csvLines = [
    headers.join(','),
    ...rows.map((row) =>
      headers
        .map((header) => {
          const value = row[header];
          if (value === null || value === undefined) return '';
          const text = String(value).replace(/"/g, '""');
          return /[",\n]/.test(text) ? `"${text}"` : text;
        })
        .join(',')
    )
  ];
  const blob = new Blob([csvLines.join('\n')], { type: 'text/csv;charset=utf-8' });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.download = `hydromonitor-live-${new Date().toISOString().slice(0, 10)}.csv`;
  link.click();
  URL.revokeObjectURL(url);
}

export default function App() {
  const [currentPage, setCurrentPage] = useState('dashboard');
  const [isDarkMode, setIsDarkMode] = useState(true);
  const [showRecentPlantsPopup, setShowRecentPlantsPopup] = useState(false);
  const mainContentRef = useRef(null);
  const [showNotifications, setShowNotifications] = useState(false);

  const theme = getTheme(isDarkMode);
  const {
    plants,
    setupSummary,
    latestSnapshot,
    analyticsLiveRows,
    dashboardTrend,
    hasLiveDb,
    pollIntervalMs,
    rawRows,
    payload
  } = useLiveSensor();

  const CurrentPage = PAGE_COMPONENTS[currentPage] || Dashboard;

  const notifications = useMemo(() => {
    return plants
      .filter((plant) => Array.isArray(plant.issues) && plant.issues.length > 0)
      .map((plant) => ({
        id: plant.plant_code,
        title: `${plant.display_name} needs attention`,
        body: plant.issues.join(', '),
        severity: plant.health_status
      }));
  }, [plants]);

  const sharedPageProps = useMemo(
    () => ({
      theme,
      isDarkMode,
      onToggleTheme: () => setIsDarkMode((value) => !value),
      plants,
      setupSummary,
      latestSnapshot,
      analyticsLiveRows,
      dashboardTrend,
      hasLiveDb,
      livePollMs: pollIntervalMs,
      onViewAllPlants: () => setShowRecentPlantsPopup(true),
      payload,
      notifications,
      isNotificationsOpen: showNotifications,
      onOpenNotifications: () => setShowNotifications((value) => !value),
      onOpenStressInsights: () => {
        setCurrentPage('stress');
        setShowNotifications(false);
      }
    }),
    [
      theme,
      isDarkMode,
      plants,
      setupSummary,
      latestSnapshot,
      analyticsLiveRows,
      dashboardTrend,
      hasLiveDb,
      pollIntervalMs,
      payload,
      notifications,
      showNotifications
    ]
  );

  return (
    <div
      style={{
        minHeight: '100vh',
        background: theme.bg,
        color: theme.text,
        transition: 'background 0.2s ease, color 0.2s ease'
      }}
    >
      <Sidebar
        currentPage={currentPage}
        setCurrentPage={(page) => {
          setCurrentPage(page);
          try {
            mainContentRef.current?.scrollTo({ top: 0, behavior: 'auto' });
            window.scrollTo({ top: 0, behavior: 'auto' });
          } catch (_) {}
        }}
        exportToCSV={() => exportRowsToCsv(rawRows)}
        theme={theme}
        isDarkMode={isDarkMode}
      />

      <main
        ref={mainContentRef}
        className="main-content"
        style={{
          maxWidth: '1260px',
          marginLeft: 280,
          padding: '8px 16px 40px'
        }}
      >
        <CurrentPage {...sharedPageProps} />
      </main>

      <RecentPlantsPopup
        isOpen={showRecentPlantsPopup}
        onClose={() => setShowRecentPlantsPopup(false)}
        theme={theme}
        isDarkMode={isDarkMode}
        plants={plants}
        setupSummary={setupSummary}
      />
    </div>
  );
}
