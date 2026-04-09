import React, { useEffect, useMemo, useRef, useState } from 'react';
import PageHeader from '../components/PageHeader';
import { useLiveSensor } from '../context/LiveSensorContext';
import { omitTimeKeys, isTimeLikeKey } from '../utils/hideTimeFields';

const getRowsFromPayload = (incomingPayload, incomingPrimarySource) => {
  const activePrimarySource =
    incomingPrimarySource || incomingPayload?.primary_source || 'project_readings';
  const rows =
    activePrimarySource === 'project_readings'
      ? incomingPayload?.project_readings || []
      : incomingPayload?.plant_readings || [];
  return [...rows].sort((a, b) => (b.id ?? 0) - (a.id ?? 0));
};

const formatSensorLabel = (key) =>
  key
    .replace(/_/g, ' ')
    .replace(/\b\w/g, (char) => char.toUpperCase());

const formatSensorValue = (value) => {
  if (value === null || value === undefined) return '—';
  if (typeof value === 'number' && Number.isFinite(value)) return value.toFixed(2);
  return String(value);
};

export default function HardwareInterfacePage({
  theme,
  isDarkMode,
  onToggleTheme,
  notifications,
  isNotificationsOpen,
  onOpenNotifications,
  onOpenStressInsights
}) {
  const [manualRefreshAt, setManualRefreshAt] = useState(null);
  const [manualRefreshing, setManualRefreshing] = useState(false);
  const [highlightedRowIds, setHighlightedRowIds] = useState([]);
  const [tablePulse, setTablePulse] = useState(false);
  const [displayPayload, setDisplayPayload] = useState(null);
  const previousTopRowIdsRef = useRef([]);
  const {
    payload,
    loading,
    error,
    refetch,
    pollIntervalMs,
    hasLiveDb,
    primarySource
  } = useLiveSensor();

  useEffect(() => {
    setDisplayPayload(payload);
  }, [payload]);

  const activePayload = displayPayload || payload;
  const latest = activePayload?.latest || null;
  const sourceRows = useMemo(
    () => getRowsFromPayload(activePayload, primarySource),
    [activePayload, primarySource]
  );

  useEffect(() => {
    const nextTopRowIds = sourceRows
      .slice(0, 12)
      .map((row, index) => row.id ?? `row-${index}`);
    const previousTopRowIds = previousTopRowIdsRef.current;
    const insertedRowIds = nextTopRowIds.filter((id) => !previousTopRowIds.includes(id));

    if (insertedRowIds.length > 0) {
      setHighlightedRowIds(insertedRowIds);
      setTablePulse(true);

      const clearHighlights = window.setTimeout(() => {
        setHighlightedRowIds([]);
        setTablePulse(false);
      }, 2200);

      previousTopRowIdsRef.current = nextTopRowIds;
      return () => window.clearTimeout(clearHighlights);
    }

    previousTopRowIdsRef.current = nextTopRowIds;
    return undefined;
  }, [sourceRows]);

  const handleManualRefresh = async () => {
    setManualRefreshing(true);
    setTablePulse(true);
    const freshPayload = await refetch();
    if (freshPayload) {
      setDisplayPayload(freshPayload);
    }
    setManualRefreshAt(new Date());
    window.setTimeout(() => {
      setManualRefreshing(false);
      setTablePulse(false);
    }, 350);
  };

  return (
    <div style={{ marginBottom: '40px' }}>
      <PageHeader
        title="Hardware Interface"
        subtitle="Database-backed hardware monitoring for the running collector"
        theme={theme}
        isDarkMode={isDarkMode}
        onToggleTheme={onToggleTheme}
        notifications={notifications}
        isNotificationsOpen={isNotificationsOpen}
        onOpenNotifications={onOpenNotifications}
        onOpenStressInsights={onOpenStressInsights}
      />

      <div
        style={{
          background: theme.card,
          borderRadius: '16px',
          padding: '24px',
          border: `1px solid ${theme.border}`,
          boxShadow: isDarkMode ? '0 4px 20px rgba(0, 0, 0, 0.3)' : '0 2px 10px rgba(0, 0, 0, 0.1)',
          marginBottom: '24px'
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '12px', marginBottom: '16px' }}>
          <div>
            <h3 style={{ color: theme.text, fontSize: '20px', fontWeight: 'bold', margin: 0, marginBottom: '6px' }}>
              Live sensor data (database)
            </h3>
            <p style={{ color: theme.textMuted, fontSize: '13px', margin: 0, maxWidth: '680px', lineHeight: 1.6 }}>
              This page reads the same live API used across the app. The expected runtime flow is
              <code style={{ background: theme.bg, padding: '2px 6px', borderRadius: '4px', marginLeft: 6 }}>data_collector.py</code>
              to Flask API to MariaDB to frontend.
            </p>
          </div>
          <button
            type="button"
            onClick={handleManualRefresh}
            style={{
              padding: '8px 16px',
              borderRadius: '8px',
              border: `1px solid ${theme.border}`,
              background: theme.surface,
              color: theme.text,
              fontSize: '13px',
              fontWeight: '600',
              cursor: 'pointer'
            }}
          >
            {loading || manualRefreshing ? 'Refreshing...' : 'Refresh now'}
          </button>
        </div>

        {error && (
          <div
            style={{
              background: isDarkMode ? 'rgba(248, 113, 113, 0.12)' : 'rgba(224, 102, 102, 0.12)',
              border: `1px solid ${isDarkMode ? 'rgba(248, 113, 113, 0.35)' : 'rgba(224, 102, 102, 0.4)'}`,
              borderRadius: '10px',
              padding: '12px 14px',
              marginBottom: '16px'
            }}
          >
            <strong style={{ color: theme.text }}>API / database: </strong>
            <span style={{ color: theme.textMuted }}>{error}</span>
          </div>
        )}

        <div style={{ color: theme.textMuted, fontSize: '12px', marginBottom: '12px' }}>
          Source: <strong style={{ color: theme.text }}>{primarySource || 'none'}</strong>
          {' · '}
          Auto-refresh every {Math.round(pollIntervalMs / 1000)}s
          {' · '}
          Status: <strong style={{ color: hasLiveDb ? '#4ade80' : theme.text }}>{hasLiveDb ? 'Receiving readings' : 'Waiting for readings'}</strong>
          {manualRefreshAt ? (
            <>
              {' · '}
              Last manual refresh: <strong style={{ color: theme.text }}>{manualRefreshAt.toLocaleTimeString()}</strong>
            </>
          ) : null}
        </div>

        {manualRefreshing ? (
          <div
            style={{
              marginBottom: '12px',
              padding: '10px 12px',
              borderRadius: '10px',
              background: isDarkMode ? 'rgba(96, 165, 250, 0.14)' : 'rgba(59, 130, 246, 0.10)',
              border: `1px solid ${isDarkMode ? 'rgba(96, 165, 250, 0.35)' : 'rgba(59, 130, 246, 0.22)'}`,
              color: theme.text,
              fontSize: '12px'
            }}
          >
            Pulling the newest database rows into the table...
          </div>
        ) : null}

        {latest ? (
          <div
            style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fit, minmax(160px, 1fr))',
              gap: '12px',
              marginBottom: '20px'
            }}
          >
            {Object.entries(omitTimeKeys(latest))
              .filter(([key]) => !isTimeLikeKey(key))
              .map(([key, value]) => (
                <div
                  key={key}
                  style={{
                    background: theme.surface,
                    padding: '14px',
                    borderRadius: '10px',
                    border: `1px solid ${theme.border}`
                  }}
                >
                  <div style={{ color: theme.textMuted, fontSize: '11px', marginBottom: '4px' }}>
                    {formatSensorLabel(key)}
                  </div>
                  <div style={{ color: theme.text, fontSize: '18px', fontWeight: 'bold' }}>
                    {formatSensorValue(value)}
                  </div>
                </div>
              ))}
          </div>
        ) : (
          <p style={{ color: theme.textMuted, fontSize: '14px', margin: 0 }}>
            No readings available yet. Start the collector and wait for rows to be written.
          </p>
        )}

        {sourceRows.length > 0 && (
          <div style={{ marginTop: '8px' }}>
            <h4 style={{ color: theme.text, fontSize: '14px', fontWeight: '600', marginBottom: '10px' }}>
              Recent rows
            </h4>
            <div
              style={{
                overflowX: 'auto',
                borderRadius: '10px',
                border: `1px solid ${theme.border}`,
                transition: 'box-shadow 0.25s ease, border-color 0.25s ease',
                boxShadow: tablePulse
                  ? isDarkMode
                    ? '0 0 0 3px rgba(96, 165, 250, 0.16)'
                    : '0 0 0 3px rgba(59, 130, 246, 0.12)'
                  : 'none'
              }}
            >
              <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '12px', color: theme.text }}>
                <thead>
                  <tr style={{ background: theme.surface, textAlign: 'left' }}>
                    {Object.keys(sourceRows[0])
                      .filter((column) => !isTimeLikeKey(column))
                      .slice(0, 12)
                      .map((column) => (
                        <th key={column} style={{ padding: '8px 10px', borderBottom: `1px solid ${theme.border}`, whiteSpace: 'nowrap' }}>
                          {formatSensorLabel(column)}
                        </th>
                      ))}
                  </tr>
                </thead>
                <tbody>
                  {sourceRows.slice(0, 12).map((row, index) => (
                    <tr
                      key={row.id ?? index}
                      style={{
                        borderBottom: `1px solid ${theme.border}`,
                        background: highlightedRowIds.includes(row.id ?? `row-${index}`)
                          ? isDarkMode
                            ? 'rgba(74, 222, 128, 0.12)'
                            : 'rgba(34, 197, 94, 0.08)'
                          : 'transparent',
                        transition: 'background 0.35s ease'
                      }}
                    >
                      {Object.keys(sourceRows[0])
                        .filter((column) => !isTimeLikeKey(column))
                        .slice(0, 12)
                        .map((column) => (
                          <td key={column} style={{ padding: '8px 10px' }}>
                            {formatSensorValue(row[column])}
                          </td>
                        ))}
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}
      </div>

      <div
        style={{
          background: theme.surface,
          borderRadius: '16px',
          padding: '24px',
          border: `1px solid ${theme.border}`
        }}
      >
        <h3 style={{ color: theme.text, fontSize: '18px', fontWeight: 'bold', marginBottom: '16px' }}>
          Setup Instructions
        </h3>
        <div style={{ display: 'grid', gap: '12px' }}>
          <div>
            <h4 style={{ color: theme.text, fontSize: '14px', fontWeight: '600', marginBottom: '8px' }}>
              1. Start the backend
            </h4>
            <p style={{ color: theme.textMuted, fontSize: '13px', lineHeight: '1.6', margin: 0 }}>
              Run the Flask server so the frontend can poll
              <code style={{ background: theme.bg, padding: '2px 6px', borderRadius: '4px', marginLeft: 6 }}>/api/sensor/live</code>.
            </p>
          </div>
          <div>
            <h4 style={{ color: theme.text, fontSize: '14px', fontWeight: '600', marginBottom: '8px' }}>
              2. Start the collector
            </h4>
            <p style={{ color: theme.textMuted, fontSize: '13px', lineHeight: '1.6', margin: 0 }}>
              Run
              <code style={{ background: theme.bg, padding: '2px 6px', borderRadius: '4px', marginLeft: 6 }}>backend/scripts/data_collector.py</code>
              to read serial data or generate simulation values and write them into MariaDB.
            </p>
          </div>
          <div>
            <h4 style={{ color: theme.text, fontSize: '14px', fontWeight: '600', marginBottom: '8px' }}>
              3. Serial data format
            </h4>
            <p style={{ color: theme.textMuted, fontSize: '13px', lineHeight: '1.6', margin: 0 }}>
              The collector expects 9 comma-separated values in this exact order:
              <code style={{ background: theme.bg, padding: '2px 6px', borderRadius: '4px', marginLeft: 6 }}>
                ambient_temperature,humidity,soil_temperature,light_intensity,ph,dissolved_oxygen,ec,tds,electrochemical_signal
              </code>
            </p>
          </div>
          <div>
            <h4 style={{ color: theme.text, fontSize: '14px', fontWeight: '600', marginBottom: '8px' }}>
              4. Environment variables
            </h4>
            <p style={{ color: theme.textMuted, fontSize: '13px', lineHeight: '1.6', margin: 0 }}>
              Configure
              <code style={{ background: theme.bg, padding: '2px 6px', borderRadius: '4px', marginLeft: 6 }}>SERIAL_PORT</code>,
              <code style={{ background: theme.bg, padding: '2px 6px', borderRadius: '4px', marginLeft: 6 }}>BAUD_RATE</code>,
              <code style={{ background: theme.bg, padding: '2px 6px', borderRadius: '4px', marginLeft: 6 }}>SIMULATION_MODE</code>,
              and your MariaDB credentials in the backend env file.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
