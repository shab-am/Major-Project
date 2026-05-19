import React, { useMemo, useRef, useState } from 'react';
import Navbar from './components/Navbar';
import Dashboard from './components/Dashboard';
import AnalyticsPage from './pages/AnalyticsPage';
import StressInsightsPage from './pages/StressInsightsPage';
import SystemsPage from './pages/SystemsPage';
import MLAnalysisPage from './pages/MLAnalysisPage';
import { getTheme } from './theme';
import { useLiveSensor } from './context/LiveSensorContext';
import './components/Navbar.css';

const PAGE_COMPONENTS = {
  dashboard: Dashboard,
  stress: StressInsightsPage,
  analytics: AnalyticsPage,
  systems: SystemsPage,
  mlAnalysis: MLAnalysisPage
};

export default function App() {
  const [currentPage, setCurrentPage] = useState('dashboard');
  const [isDarkMode, setIsDarkMode] = useState(true);
  const [showNotifications, setShowNotifications] = useState(false);
  const mainContentRef = useRef(null);

  const theme = getTheme(isDarkMode);
  const {
    plants,
    setupSummary,
    latestSnapshot,
    analyticsLiveRows,
    sensorSeries,
    dataQuality,
    hasData,
    hasLiveDb,
    pollIntervalMs,
    dashboardTrend,
    payload,
    outOfRangeValues
  } = useLiveSensor();

  const CurrentPage = PAGE_COMPONENTS[currentPage] || Dashboard;

  const notifications = useMemo(
    () => {
      if (outOfRangeValues.length > 0) {
        const grouped = new Map();
        outOfRangeValues.forEach((item) => {
          const plantCode = item.plant_code || item.plant_name || 'active-alert';
          const entry = grouped.get(plantCode) || {
            id: plantCode,
            plantCode,
            plantName: item.plant_name || 'Plant',
            severity: item.health_status,
            issue: item.issue,
            metrics: [],
            sourceRowId: item.source_row_id
          };
          entry.metrics.push({
            label: item.label || item.metric,
            value: item.value,
            target: item.target || `${item.min}-${item.max}`,
            direction: item.direction
          });
          grouped.set(plantCode, entry);
        });

        return Array.from(grouped.values())
          .map((entry) => ({
            ...entry,
            title: `${entry.plantName}: ${entry.metrics.length} range alert${entry.metrics.length === 1 ? '' : 's'}`,
            body: entry.metrics
              .map((metric) => `${metric.label} ${metric.direction} (${metric.value} / ${metric.target})`)
              .join(', ')
          }))
          .slice(0, 1);
      }

      return plants
        .filter((plant) => Array.isArray(plant.issues) && plant.issues.length > 0)
        .map((plant) => ({
          id: plant.plant_code,
          plantCode: plant.plant_code,
          plantName: plant.display_name,
          title: `${plant.display_name}: ${plant.issues.length} stress flag${plant.issues.length === 1 ? '' : 's'}`,
          body: plant.issues.map((issue) => issue.replace(/_/g, ' ')).join(', '),
          severity: plant.health_status,
          issue: plant.issues[0],
          issues: plant.issues
        }))
        .slice(0, 1);
    },
    [outOfRangeValues, plants]
  );

  const goToPage = (page) => {
    setCurrentPage(page);
    setShowNotifications(false);
    try {
      mainContentRef.current?.scrollTo({ top: 0, behavior: 'auto' });
      window.scrollTo({ top: 0, behavior: 'auto' });
    } catch (_) {}
  };

  const sharedPageProps = useMemo(
    () => ({
      theme,
      isDarkMode,
      onToggleTheme: () => setIsDarkMode((v) => !v),
      plants,
      setupSummary,
      latestSnapshot,
      analyticsLiveRows,
      sensorSeries,
      dataQuality,
      hasData,
      hasLiveDb,
      livePollMs: pollIntervalMs,
      dashboardTrend,
      payload,
      outOfRangeValues,
      notifications,
      isNotificationsOpen: showNotifications,
      onOpenNotifications: () => setShowNotifications((v) => !v),
      onOpenStressInsights: () => goToPage('stress')
    }),
    [
      theme,
      isDarkMode,
      plants,
      setupSummary,
      latestSnapshot,
      analyticsLiveRows,
      sensorSeries,
      dataQuality,
      hasData,
      hasLiveDb,
      pollIntervalMs,
      dashboardTrend,
      payload,
      outOfRangeValues,
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
      <Navbar
        currentPage={currentPage}
        setCurrentPage={goToPage}
        theme={theme}
        isDarkMode={isDarkMode}
        onToggleTheme={() => setIsDarkMode((v) => !v)}
        notifications={notifications}
        isNotificationsOpen={showNotifications}
        onOpenNotifications={() => setShowNotifications((v) => !v)}
        onOpenStressInsights={() => goToPage('stress')}
        onOpenMLAnalysis={() => goToPage('mlAnalysis')}
      />

      <main ref={mainContentRef} className="app-main">
        <CurrentPage {...sharedPageProps} />
      </main>
    </div>
  );
}
