import React, { useEffect, useMemo, useRef, useState } from 'react';
import { Download, RefreshCw } from 'lucide-react';
import { useLiveSensor } from '../context/LiveSensorContext';
import { omitTimeKeys, isTimeLikeKey } from '../utils/hideTimeFields';
import { exportRowsToCsv } from '../utils/exportCsv';
import { compareRowsNewestFirst } from '../utils/sensorAnalytics';

const VISIBLE_ROW_LIMIT = 12;

const getRowsFromPayload = (incomingPayload, incomingPrimarySource) => {
  const activePrimarySource =
    incomingPrimarySource || incomingPayload?.primary_source || 'project_readings';
  const rows =
    activePrimarySource === 'project_readings'
      ? incomingPayload?.project_readings || []
      : incomingPayload?.plant_readings || [];
  return [...rows].sort(compareRowsNewestFirst);
};

const formatSensorLabel = (key) =>
  key
    .replace(/_/g, ' ')
    .replace(/\b\w/g, (char) => char.toUpperCase());

const formatSensorValue = (value) => {
  if (value === null || value === undefined) return '--';
  if (typeof value === 'number' && Number.isFinite(value)) return value.toFixed(2);
  return String(value);
};

const rowFingerprint = (row) => JSON.stringify(row);
const rowKeyFor = (row, fallback) =>
  row?.id ?? row?.timestamp ?? row?.recorded_at ?? fallback ?? rowFingerprint(row);

const keepExistingRowsStable = (rows, previousRows) =>
  rows.map((row, index) => {
    const key = rowKeyFor(row, `row-${index}`);
    return previousRows.get(key) || row;
  });

const formatTableValue = (value, key) => {
  if (value === null || value === undefined) return '--';
  if (isTimeLikeKey(key)) {
    const date = new Date(value);
    return Number.isNaN(date.getTime()) ? String(value) : date.toLocaleString();
  }
  return formatSensorValue(value);
};

const HIDDEN_PLANT_FIELDS = new Set([
  'plant_id',
  'plant_name',
  'plant_code',
  'display_name',
  'plant_index',
  'species'
]);

const TABLE_COLUMN_ORDER = [
  'id',
  'timestamp',
  'recorded_at',
  'ambient_temperature',
  'humidity',
  'soil_temperature',
  'light_intensity',
  'ph_value',
  'dissolved_oxygen',
  'ec_value',
  'tds_value',
  'electrochemical_signal'
];

const isVisibleSensorKey = (key) => !isTimeLikeKey(key) && !HIDDEN_PLANT_FIELDS.has(key);
const isVisibleTableKey = (key) => !HIDDEN_PLANT_FIELDS.has(key);

const orderTableColumns = (columns) => {
  const visible = columns.filter(isVisibleTableKey);
  const ordered = TABLE_COLUMN_ORDER.filter((column) => visible.includes(column));
  const rest = visible.filter((column) => !TABLE_COLUMN_ORDER.includes(column));
  return [...ordered, ...rest].slice(0, 12);
};

export default function HardwareInterfacePage({ theme, isDarkMode, embedded = false }) {
  const [manualRefreshAt, setManualRefreshAt] = useState(null);
  const [manualRefreshing, setManualRefreshing] = useState(false);
  const [highlightedRowIds, setHighlightedRowIds] = useState([]);
  const [changedCells, setChangedCells] = useState({});
  const [tablePulse, setTablePulse] = useState(false);
  const [displayPayload, setDisplayPayload] = useState(null);
  const [refreshNote, setRefreshNote] = useState(null);
  const [tableVersion, setTableVersion] = useState(0);
  const previousTopRowIdsRef = useRef([]);
  const previousRowsRef = useRef(new Map());
  const {
    payload,
    loading,
    error,
    refetch,
    pollIntervalMs,
    hasLiveDb,
    primarySource,
    rawRows
  } = useLiveSensor();

  useEffect(() => {
    if (!manualRefreshing) {
      setDisplayPayload(payload);
    }
  }, [payload, manualRefreshing]);

  const activePayload = displayPayload || payload;
  const latest = activePayload?.latest || null;
  const sourceRows = useMemo(
    () => keepExistingRowsStable(getRowsFromPayload(activePayload, primarySource), previousRowsRef.current),
    // tableVersion forces re-read after manual refresh
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [activePayload, primarySource, tableVersion]
  );

  useEffect(() => {
    sourceRows.slice(0, VISIBLE_ROW_LIMIT).forEach((row) => {
      const key = rowKeyFor(row);
      if (!previousRowsRef.current.has(key)) {
        previousRowsRef.current.set(key, { ...row });
      }
    });
  }, [sourceRows]);

  const topRowId = sourceRows[0]?.id ?? null;
  const visibleColumns = useMemo(
    () => (sourceRows[0] ? orderTableColumns(Object.keys(sourceRows[0])) : []),
    [sourceRows]
  );

  useEffect(() => {
    const nextTopRowIds = sourceRows
      .slice(0, VISIBLE_ROW_LIMIT)
      .map((row, index) => rowKeyFor(row, `row-${index}`));
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
    setRefreshNote(null);
    const prevTopId = sourceRows[0]?.id ?? null;
    const prevMap = new Map(previousRowsRef.current);

    try {
      const freshPayload = await refetch({ limit: 200 });
      if (freshPayload) {
        const rawFreshRows = getRowsFromPayload(freshPayload, freshPayload.primary_source);
        const freshRows = keepExistingRowsStable(rawFreshRows, prevMap);
        const cellChanges = {};
        freshRows.slice(0, VISIBLE_ROW_LIMIT).forEach((row) => {
          const id = rowKeyFor(row);
          const prev = prevMap.get(id);
          if (!prev) return;
          const cols = visibleColumns;
          cols.forEach((col) => {
            if (formatTableValue(row[col], col) !== formatTableValue(prev[col], col)) {
              if (!cellChanges[id]) cellChanges[id] = new Set();
              cellChanges[id].add(col);
            }
          });
        });

        const nextMap = new Map(prevMap);
        rawFreshRows.slice(0, VISIBLE_ROW_LIMIT).forEach((row, index) => {
          const key = rowKeyFor(row, `row-${index}`);
          if (!nextMap.has(key)) nextMap.set(key, { ...row });
        });
        previousRowsRef.current = nextMap;

        setDisplayPayload({ ...freshPayload, _refreshedAt: Date.now() });
        setChangedCells(cellChanges);
        setTableVersion((v) => v + 1);
        setManualRefreshAt(new Date());
        previousTopRowIdsRef.current = [];

        const newTopId = freshRows[0]?.id ?? null;
        if (newTopId != null && newTopId === prevTopId) {
          const anyValueChange = Object.keys(cellChanges).length > 0;
          setRefreshNote(
            anyValueChange
              ? 'Top row ID unchanged; existing row values were kept stable.'
              : 'No newer rows yet - highest ID is still the same. New hardware writes will appear here.'
          );
        } else if (newTopId != null) {
          setRefreshNote(`Loaded newer data - top row ID is now ${newTopId}.`);
        }
      }
    } finally {
      window.setTimeout(() => {
        setManualRefreshing(false);
        setTablePulse(false);
        setChangedCells({});
      }, 2500);
    }
  };

  const handleExport = () => {
    const rows = rawRows?.length ? rawRows : sourceRows;
    if (!exportRowsToCsv(rows)) {
      window.alert('No rows available to export yet.');
    }
  };

  return (
    <div style={{ marginBottom: embedded ? 0 : '40px' }}>

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
            <h3 style={{ color: theme.text, fontSize: '18px', fontWeight: 'bold', margin: 0 }}>
              Recent readings
            </h3>
          </div>
          <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
            <button
              type="button"
              onClick={handleManualRefresh}
              disabled={loading || manualRefreshing}
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: 6,
                padding: '8px 16px',
                borderRadius: '8px',
                border: `1px solid ${theme.border}`,
                background: theme.surface,
                color: theme.text,
                fontSize: '13px',
                fontWeight: '600',
                cursor: loading || manualRefreshing ? 'wait' : 'pointer',
                opacity: loading || manualRefreshing ? 0.7 : 1
              }}
            >
              <RefreshCw size={15} className={manualRefreshing ? 'spin-icon' : ''} />
              {loading || manualRefreshing ? 'Refreshing...' : 'Refresh table'}
            </button>
            <button
              type="button"
              onClick={handleExport}
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: 6,
                padding: '8px 16px',
                borderRadius: '8px',
                border: `1px solid ${theme.accent}`,
                background: theme.accentMuted,
                color: theme.accent,
                fontSize: '13px',
                fontWeight: '600',
                cursor: 'pointer'
              }}
            >
              <Download size={15} />
              Export CSV
            </button>
          </div>
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
          {' | '}
          Auto-refresh every {Math.round(pollIntervalMs / 1000)}s
          {' | '}
          Status: <strong style={{ color: hasLiveDb ? '#4ade80' : theme.text }}>{hasLiveDb ? 'Receiving readings' : 'Waiting for readings'}</strong>
          {topRowId != null && (
            <>
              {' | '}
              Top row ID: <strong style={{ color: theme.text }}>{topRowId}</strong>
            </>
          )}
          {manualRefreshAt ? (
            <>
              {' | '}
              Last manual refresh: <strong style={{ color: theme.text }}>{manualRefreshAt.toLocaleTimeString()}</strong>
            </>
          ) : null}
        </div>

        {refreshNote && (
          <div
            style={{
              marginBottom: 12,
              padding: '10px 12px',
              borderRadius: 10,
              background: theme.surface,
              border: `1px solid ${theme.border}`,
              color: theme.text,
              fontSize: 12
            }}
          >
            {refreshNote}
          </div>
        )}

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
              .filter(([key]) => isVisibleSensorKey(key))
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
              Recent rows (newest {Math.min(sourceRows.length, VISIBLE_ROW_LIMIT)} first)
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
                    {visibleColumns.map((column) => (
                        <th key={column} style={{ padding: '8px 10px', borderBottom: `1px solid ${theme.border}`, whiteSpace: 'nowrap' }}>
                          {formatSensorLabel(column)}
                        </th>
                      ))}
                  </tr>
                </thead>
                <tbody key={`tbody-${tableVersion}`}>
                  {sourceRows.slice(0, VISIBLE_ROW_LIMIT).map((row, index) => {
                    const rowKey = rowKeyFor(row, `row-${index}`);
                    return (
                      <tr
                        key={`${rowKey}-${tableVersion}`}
                        style={{
                          borderBottom: `1px solid ${theme.border}`,
                          background: highlightedRowIds.includes(rowKey)
                            ? isDarkMode
                              ? 'rgba(74, 222, 128, 0.12)'
                              : 'rgba(34, 197, 94, 0.08)'
                            : 'transparent',
                          transition: 'background 0.35s ease'
                        }}
                      >
                        {visibleColumns.map((column) => {
                            const changed = changedCells[rowKey]?.has(column);
                            return (
                              <td
                                key={column}
                                style={{
                                  padding: '8px 10px',
                                  background: changed
                                    ? isDarkMode
                                      ? 'rgba(251, 191, 36, 0.15)'
                                      : 'rgba(251, 191, 36, 0.2)'
                                    : undefined,
                                  transition: 'background 0.3s ease'
                                }}
                              >
                                {formatTableValue(row[column], column)}
                              </td>
                            );
                          })}
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
