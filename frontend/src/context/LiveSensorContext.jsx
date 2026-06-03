import React, {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useRef,
  useState
} from 'react';
import apiService from '../services/apiService';
import { withGenericPlantLabels } from '../utils/plantNames';
import {
  assessDataQuality,
  compareRowsChronological,
  metricBandSummary,
  rowsToSeries,
  DEFAULT_OPTIMAL
} from '../utils/sensorAnalytics';

const POLL_MS = 5000;
const LiveSensorContext = createContext(null);

function wantsStressDemoSensorStream() {
  if (typeof window === 'undefined') return false;
  if (process.env.REACT_APP_SENSOR_STRESS_DEMO === 'true') return true;
  try {
    return window.localStorage?.getItem('hydroStressDemo') === '1';
  } catch (_) {
    return false;
  }
}

function isProjectSource(payload) {
  return (payload?.project_readings?.length ?? 0) > 0;
}

function rowToAnalyticsLive(row, projectMode) {
  return {
    _live: true,
    _sortKey: row.id ?? 0,
    readingLabel: `#${row.id ?? 0}`,
    Soil_pH: projectMode ? row.ph_value ?? null : row.soil_ph ?? row.ph ?? null,
    Ambient_Temperature: projectMode
      ? row.ambient_temperature ?? null
      : row.ambient_temperature ?? row.temperature ?? null,
    Humidity: row.humidity ?? null,
    TDS: projectMode ? row.tds_value ?? null : row.tds ?? null,
    Dissolved_Oxygen: row.dissolved_oxygen ?? row.dissolvedOxy ?? null,
    Soil_Temperature: row.soil_temperature ?? null,
    Light_Intensity: row.light_intensity ?? null,
    EC_Value: projectMode ? row.ec_value ?? null : row.ec ?? null,
    Electrochemical_Signal: row.electrochemical_signal ?? null
  };
}

function latestToSnapshot(latest, projectMode) {
  if (!latest) return null;
  return {
    ph: projectMode ? latest.ph_value ?? null : latest.soil_ph ?? latest.ph ?? null,
    temperature: projectMode
      ? latest.ambient_temperature ?? null
      : latest.ambient_temperature ?? latest.temperature ?? null,
    humidity: latest.humidity ?? null,
    tds: projectMode ? latest.tds_value ?? null : latest.tds ?? null,
    dissolvedOxy: latest.dissolved_oxygen ?? latest.dissolvedOxy ?? null,
    ec: projectMode ? latest.ec_value ?? null : latest.ec ?? null,
    electrochemical: latest.electrochemical_signal ?? null,
    soilTemp: latest.soil_temperature ?? null,
    light: latest.light_intensity ?? null,
    recordedAt: latest.recorded_at ?? latest.timestamp ?? null
  };
}

export function LiveSensorProvider({ children }) {
  const [payload, setPayload] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const mounted = useRef(true);

  const refetch = useCallback(async (options = {}) => {
    const limit = options.limit ?? 200;
    if (mounted.current) setLoading(true);
    try {
      const data = await apiService.fetchSensorLive(limit, {
        ...options,
        stressDemo: options.stressDemo ?? wantsStressDemoSensorStream()
      });
      if (!mounted.current) return;
      setPayload(data);
      setError(data._ok ? null : data.message || `Server returned ${data._status}`);
      return data;
    } catch (err) {
      if (!mounted.current) return;
      setPayload(null);
      setError(err.message || 'Network error');
      return null;
    } finally {
      if (mounted.current) setLoading(false);
    }
  }, []);

  useEffect(() => {
    mounted.current = true;
    refetch();
    const id = setInterval(refetch, POLL_MS);
    return () => {
      mounted.current = false;
      clearInterval(id);
    };
  }, [refetch]);

  const value = useMemo(() => {
    const projectMode = isProjectSource(payload);
    const primaryRows = projectMode
      ? payload?.project_readings || []
      : payload?.plant_readings || [];
    const chronologicalRows = [...primaryRows].sort(compareRowsChronological);
    const analyticsLiveRows = chronologicalRows.map((row) =>
      rowToAnalyticsLive(row, projectMode)
    );
    const latestSnapshot = latestToSnapshot(payload?.latest, projectMode);
    const series = rowsToSeries(primaryRows, projectMode);
    const bandSummary = metricBandSummary(series, DEFAULT_OPTIMAL);
    const dataQuality = assessDataQuality(primaryRows, projectMode);

    const plants = withGenericPlantLabels(
      (payload?.plants || []).map((plant) => ({
        ...plant,
        metrics: {
          ...plant.metrics,
          ph: plant.metrics?.ph ?? null,
          temperature: plant.metrics?.temperature ?? null,
          humidity: plant.metrics?.humidity ?? null,
          tds: plant.metrics?.tds ?? null,
          dissolved_oxygen: plant.metrics?.dissolved_oxygen ?? null,
          electrochemical_signal: plant.metrics?.electrochemical_signal ?? null
        }
      }))
    );

    const bioSeriesElectrochemical = series
      .map((point) => ({
        readingLabel: point.readingLabel,
        value: point.electrochemical_signal
      }))
      .filter((point) => point.value != null && !Number.isNaN(point.value));

    const dashboardTrend = chronologicalRows.map((row, index) => ({
      label: `#${index + 1}`,
      temp: Number(projectMode ? row.ambient_temperature : row.ambient_temperature ?? row.temperature),
      ph: Number(projectMode ? row.ph_value : row.soil_ph ?? row.ph),
      readingId: row.id ?? index + 1
    })).filter((row) => !Number.isNaN(row.temp) || !Number.isNaN(row.ph));

    return {
      payload,
      loading,
      error,
      refetch,
      pollIntervalMs: POLL_MS,
      hasLiveDb: Boolean(payload?.success && primaryRows.length > 0 && !payload?.demo_mode),
      hasData: Boolean(payload?.success && primaryRows.length > 0),
      primarySource: payload?.primary_source || null,
      latestSnapshot,
      analyticsLiveRows,
      sensorSeries: series,
      dashboardTrend,
      bandSummary,
      dataQuality,
      bioSeriesElectrochemical,
      plants,
      outOfRangeValues: payload?.out_of_range_values || [],
      setupSummary: payload?.setup_summary || null,
      rawRows: primaryRows
    };
  }, [payload, loading, error, refetch]);

  return <LiveSensorContext.Provider value={value}>{children}</LiveSensorContext.Provider>;
}

export function useLiveSensor() {
  const context = useContext(LiveSensorContext);
  if (!context) {
    throw new Error('useLiveSensor must be used within LiveSensorProvider');
  }
  return context;
}
