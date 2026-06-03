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

const ALERT_LABELS = {
  ph: 'Water pH',
  temperature: 'Ambient temperature',
  soil_temperature: 'Water temperature',
  humidity: 'Humidity',
  light_intensity: 'Light intensity',
  tds: 'TDS',
  dissolved_oxygen: 'Dissolved oxygen',
  ec: 'EC'
};

function formatAlertValue(value) {
  return Number.isFinite(Number(value)) ? Number(value).toFixed(2) : value;
}

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
          const metricKey = item.metric || item.label || 'range';
          const direction = item.direction || 'alert';
          const key = `${metricKey}-${direction}`;
          const value = Number(item.value);
          const entry = grouped.get(key) || {
            id: key,
            severity: item.health_status,
            issue: item.issue,
            label: ALERT_LABELS[metricKey] || item.label || metricKey,
            direction,
            value: item.value,
            target: item.target || `${item.min}-${item.max}`,
            sourceRowId: item.source_row_id
          };

          const previousValue = Number(entry.value);
          const shouldReplace =
            Number.isFinite(value) &&
            (!Number.isFinite(previousValue) ||
              (direction === 'high' ? value > previousValue : value < previousValue));
          if (shouldReplace) {
            entry.value = item.value;
            entry.target = item.target || `${item.min}-${item.max}`;
            entry.sourceRowId = item.source_row_id;
          }

          grouped.set(key, entry);
        });

        const metrics = Array.from(grouped.values());
        return [
          {
            id: 'combined-range-alerts',
            severity: metrics.some((metric) => metric.severity === 'High Stress') ? 'High Stress' : 'Moderate Stress',
            issue: metrics[0]?.issue || 'range alert',
            metrics,
            title: 'Parameters need attention',
            body: metrics
              .map((metric) => `${metric.label} ${metric.direction} (${formatAlertValue(metric.value)} / ${metric.target})`)
              .join(', ')
          }
        ];
      }

      const issueMetrics = plants
        .filter((plant) => Array.isArray(plant.issues) && plant.issues.length > 0)
        .flatMap((plant) => plant.issues.map((issue) => issue.replace(/_/g, ' ')));

      return issueMetrics.length
        ? [
            {
              id: 'combined-stress-flags',
              title: 'Parameters need attention',
              body: Array.from(new Set(issueMetrics)).join(', '),
              severity: 'High Stress',
              issue: issueMetrics[0],
              issues: issueMetrics
            }
          ]
        : [];
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
