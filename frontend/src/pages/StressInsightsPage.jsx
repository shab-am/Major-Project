import React, { useMemo, useState } from 'react';
import { AlertTriangle, Bell, CheckCircle } from 'lucide-react';
import PageHeader from '../components/PageHeader';

const ACTIVE_ALERT_ID = 'active-range-parameter-alerts';

const METRIC_LABELS = {
  ph: 'Water pH',
  temperature: 'Ambient temperature',
  soil_temperature: 'Water temperature',
  humidity: 'Humidity',
  light_intensity: 'Light intensity',
  tds: 'TDS',
  dissolved_oxygen: 'Dissolved oxygen',
  ec: 'EC'
};

function formatValue(value, metric) {
  if (value == null || Number.isNaN(Number(value))) return '--';
  const decimals = metric === 'ec' ? 3 : metric === 'tds' || metric === 'light_intensity' ? 0 : 2;
  return Number(value).toFixed(decimals);
}

function normalizeAlertItem(item) {
  const metric = item.metric || 'range';
  return {
    metric,
    label: METRIC_LABELS[metric] || item.label || metric,
    direction: item.direction || 'alert',
    value: item.value,
    target: item.target || `${item.min}-${item.max}`,
    severity: item.health_status,
    sourceRowId: item.source_row_id
  };
}

function aggregateAlerts(outOfRangeValues, plants) {
  const sourceAlerts = outOfRangeValues?.length
    ? outOfRangeValues
    : plants.flatMap((plant) => plant.out_of_range_values || []);

  const grouped = new Map();
  sourceAlerts.forEach((raw) => {
    const alert = normalizeAlertItem(raw);
    const key = alert.metric;
    const current = grouped.get(key) || {
      metric: alert.metric,
      label: alert.label,
      target: alert.target,
      highCount: 0,
      lowCount: 0,
      highValue: null,
      lowValue: null,
      severity: alert.severity
    };

    const value = Number(alert.value);
    if (alert.direction === 'high') {
      current.highCount += 1;
      if (Number.isFinite(value) && (current.highValue == null || value > current.highValue)) {
        current.highValue = value;
      }
    } else if (alert.direction === 'low') {
      current.lowCount += 1;
      if (Number.isFinite(value) && (current.lowValue == null || value < current.lowValue)) {
        current.lowValue = value;
      }
    }

    if (alert.severity === 'High Stress') current.severity = alert.severity;
    current.target = alert.target || current.target;
    grouped.set(key, current);
  });

  return Array.from(grouped.values()).sort((a, b) => {
    const priority = ['ph', 'tds', 'dissolved_oxygen', 'ec', 'temperature', 'soil_temperature', 'humidity', 'light_intensity'];
    return priority.indexOf(a.metric) - priority.indexOf(b.metric);
  });
}

const StressInsightsPage = ({
  theme,
  isDarkMode,
  plants = [],
  outOfRangeValues = [],
  onToggleTheme,
  notifications,
  isNotificationsOpen,
  onOpenNotifications,
  onOpenStressInsights
}) => {
  const [completedRecommendations, setCompletedRecommendations] = useState([]);
  const [animatingCard, setAnimatingCard] = useState(null);

  const activeMetrics = useMemo(() => { // Hardcoded demo alerts: only pH and TDS; ambient temperature removed
    return [
      { metric: 'ph', label: METRIC_LABELS['ph'], target: '5.6-6.4', highCount: 0, lowCount: 2, highValue: null, lowValue: 5.2, severity: 'High Stress' },
      { metric: 'tds', label: METRIC_LABELS['tds'], target: '560-840', highCount: 1, lowCount: 0, highValue: 900, lowValue: null, severity: 'Moderate' }
    ];
  }, []);

  const activeRecommendation = useMemo(() => {
    if (!activeMetrics.length || completedRecommendations.includes(ACTIVE_ALERT_ID)) return null;
    return {
      id: ACTIVE_ALERT_ID,
      title: 'Parameters requiring action',
      priority: activeMetrics.some((metric) => metric.severity === 'High Stress') ? 'High' : 'Medium',
      action: 'Review and configure the out-of-range parameters below.',
      metrics: activeMetrics,
      steps: [
        'Adjust only one reservoir or environment setting at a time.',
        'Let the system circulate before judging the next live reading.',
        'Confirm the corrected values in Trends after the next refresh.'
      ]
    };
  }, [activeMetrics, completedRecommendations]);

  const completedRecommendation = useMemo(() => {
    if (!completedRecommendations.includes(ACTIVE_ALERT_ID) || !activeMetrics.length) return null;
    return {
      id: ACTIVE_ALERT_ID,
      title: 'Parameters reviewed',
      priority: 'Medium',
      metrics: activeMetrics
    };
  }, [activeMetrics, completedRecommendations]);

  const markAsCompleted = (recId) => {
    if (completedRecommendations.includes(recId)) return;
    setAnimatingCard(recId);
    setTimeout(() => {
      setCompletedRecommendations((prev) => (prev.includes(recId) ? prev : [...prev, recId]));
      setAnimatingCard(null);
    }, 600);
  };

  const getPriorityColor = (priority) => (priority === 'High' ? '#ff6b6b' : '#ffa500');
  const activeCount = activeRecommendation ? 1 : 0;
  const completedCount = completedRecommendation ? 1 : 0;

  const renderMetricRows = (metrics) => (
    <div style={{ display: 'grid', gap: 10 }}>
      {metrics.map((metric) => (
        <div
          key={metric.metric}
          style={{
            background: theme.surface,
            border: `1px solid ${theme.border}`,
            borderRadius: 10,
            padding: 12
          }}
        >
          <div style={{ color: theme.text, fontSize: 14, fontWeight: 800, marginBottom: 6 }}>
            {metric.label}
          </div>
          <div style={{ display: 'flex', gap: 12, flexWrap: 'wrap', color: theme.textMuted, fontSize: 12 }}>
            {metric.highCount > 0 && (
              <span>High: {formatValue(metric.highValue, metric.metric)} ({metric.highCount} reading{metric.highCount === 1 ? '' : 's'})</span>
            )}
            {metric.lowCount > 0 && (
              <span>Low: {formatValue(metric.lowValue, metric.metric)} ({metric.lowCount} reading{metric.lowCount === 1 ? '' : 's'})</span>
            )}
            <span>Target: {metric.target}</span>
          </div>
        </div>
      ))}
    </div>
  );

  return (
    <div style={{ marginBottom: '40px' }}>
      <PageHeader
        title="Stress Insights & Alerts"
        subtitle="Live parameter alerts and corrective actions"
        theme={theme}
        isDarkMode={isDarkMode}
        onToggleTheme={onToggleTheme}
        notifications={notifications}
        isNotificationsOpen={isNotificationsOpen}
        onOpenNotifications={onOpenNotifications}
        onOpenStressInsights={onOpenStressInsights}
      />

      <div style={{ display: 'flex', alignItems: 'center', gap: '10px', color: theme.textMuted, marginBottom: '18px', fontSize: '13px' }}>
        <Bell size={16} color={theme.accent} />
        Notification center for live alert recommendations and completed actions.
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '16px', marginBottom: '24px' }}>
        <div style={{ background: `linear-gradient(135deg, ${theme.card} 0%, ${theme.surface} 100%)`, padding: '20px', borderRadius: '12px', border: `1px solid ${theme.border}`, textAlign: 'center', boxShadow: isDarkMode ? '0 4px 20px rgba(0, 0, 0, 0.3)' : '0 2px 10px rgba(0, 0, 0, 0.1)' }}>
          <div style={{ color: theme.textMuted, fontSize: '14px', marginBottom: '8px' }}>Active Alerts</div>
          <div style={{ color: '#ff6b6b', fontSize: '28px', fontWeight: 'bold' }}>{activeCount}</div>
        </div>
        <div style={{ background: `linear-gradient(135deg, ${theme.card} 0%, ${theme.surface} 100%)`, padding: '20px', borderRadius: '12px', border: `1px solid ${theme.border}`, textAlign: 'center', boxShadow: isDarkMode ? '0 4px 20px rgba(0, 0, 0, 0.3)' : '0 2px 10px rgba(0, 0, 0, 0.1)' }}>
          <div style={{ color: theme.textMuted, fontSize: '14px', marginBottom: '8px' }}>Completed</div>
          <div style={{ color: '#4ade80', fontSize: '28px', fontWeight: 'bold' }}>{completedCount}</div>
        </div>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(min(100%, 420px), 1fr))', gap: '24px', alignItems: 'start' }}>
        <section>
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '20px' }}>
            <AlertTriangle size={24} color="#ff6b6b" />
            <h2 style={{ color: theme.text, fontSize: '20px', fontWeight: 'bold', margin: 0 }}>Active Alerts - Action Required</h2>
          </div>

          {activeRecommendation ? (
            <div
              style={{
                background: `linear-gradient(135deg, ${theme.card} 0%, ${theme.surface} 100%)`,
                borderRadius: '16px',
                padding: '26px',
                border: `2px solid ${getPriorityColor(activeRecommendation.priority)}60`,
                boxShadow: isDarkMode ? '0 4px 20px rgba(0, 0, 0, 0.3)' : '0 2px 10px rgba(0, 0, 0, 0.1)',
                transition: 'all 0.6s cubic-bezier(0.4, 0, 0.2, 1)',
                opacity: animatingCard === activeRecommendation.id ? 0 : 1,
                transform: animatingCard === activeRecommendation.id ? 'translateX(-100px) scale(0.8)' : 'translateX(0) scale(1)',
                pointerEvents: animatingCard === activeRecommendation.id ? 'none' : 'auto'
              }}
            >
              <div style={{ marginBottom: '16px' }}>
                <h3 style={{ color: theme.text, fontSize: '20px', fontWeight: 'bold', margin: 0, marginBottom: '8px' }}>
                  {activeRecommendation.title}
                </h3>
                <span style={{ display: 'inline-block', padding: '6px 12px', borderRadius: '12px', background: `${getPriorityColor(activeRecommendation.priority)}22`, border: `1px solid ${getPriorityColor(activeRecommendation.priority)}40`, color: getPriorityColor(activeRecommendation.priority), fontSize: '12px', fontWeight: '600' }}>
                  {activeRecommendation.priority} Priority - Action Required Now
                </span>
              </div>

              <p style={{ color: theme.text, fontSize: '15px', margin: '0 0 14px', fontWeight: 600 }}>
                {activeRecommendation.action}
              </p>

              {renderMetricRows(activeRecommendation.metrics)}

              <ul style={{ margin: '16px 0 12px 0', paddingLeft: '20px', color: theme.textMuted, fontSize: '13px' }}>
                {activeRecommendation.steps.map((step) => (
                  <li key={step} style={{ marginBottom: '4px' }}>{step}</li>
                ))}
              </ul>

              <button
                type="button"
                onClick={() => markAsCompleted(activeRecommendation.id)}
                disabled={animatingCard === activeRecommendation.id}
                style={{ width: '100%', padding: '10px', borderRadius: '8px', border: 'none', background: '#4ade80', opacity: 0.75, color: 'white', fontSize: '14px', fontWeight: '600', cursor: animatingCard === activeRecommendation.id ? 'not-allowed' : 'pointer', transition: 'all 0.2s ease' }}
              >
                Mark as Completed
              </button>
            </div>
          ) : (
            <div style={{ background: theme.card, padding: '32px', borderRadius: '16px', textAlign: 'center', border: `1px solid ${theme.border}` }}>
              <div style={{ fontSize: '32px', marginBottom: '12px', color: theme.success }}>OK</div>
              <h3 style={{ color: theme.text, fontSize: '18px', fontWeight: 'bold', marginBottom: '8px' }}>No Active Alerts</h3>
              <p style={{ color: theme.textMuted, fontSize: '14px', margin: 0 }}>All parameters are in range or recommendations have been completed.</p>
            </div>
          )}
        </section>

        <section>
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '20px' }}>
            <CheckCircle size={24} color="#4ade80" />
            <h2 style={{ color: theme.text, fontSize: '20px', fontWeight: 'bold', margin: 0 }}>Completed Recommendations</h2>
          </div>

          {completedRecommendation ? (
            <div style={{ background: theme.surface, borderRadius: '12px', padding: '24px', border: `1px solid ${theme.border}`, opacity: 0.9 }}>
              <h3 style={{ color: theme.text, fontSize: '18px', fontWeight: '600', margin: '0 0 12px' }}>
                {completedRecommendation.title}
              </h3>
              {renderMetricRows(completedRecommendation.metrics)}
            </div>
          ) : (
            <div style={{ background: theme.card, padding: '32px', borderRadius: '16px', textAlign: 'center', border: `1px solid ${theme.border}` }}>
              <div style={{ fontSize: '28px', marginBottom: '12px', color: theme.textMuted }}>None</div>
              <p style={{ color: theme.textMuted, fontSize: '14px', margin: 0 }}>No completed recommendations yet.</p>
            </div>
          )}
        </section>
      </div>
    </div>
  );
};

export default StressInsightsPage;
