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

const POLL_MS = 3000;
const LiveSensorContext = createContext(null);

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
    light: latest.light_intensity ?? null
  };
}

export function LiveSensorProvider({ children }) {
  const [payload, setPayload] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const mounted = useRef(true);

  const refetch = useCallback(async () => {
    if (mounted.current) {
      setLoading(true);
    }
    try {
      const data = await apiService.fetchSensorLive(200);
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
    const chronologicalRows = [...primaryRows].sort((a, b) => (a.id ?? 0) - (b.id ?? 0));
    const analyticsLiveRows = chronologicalRows.map((row) =>
      rowToAnalyticsLive(row, projectMode)
    );
    const latestSnapshot = latestToSnapshot(payload?.latest, projectMode);

    const plants = (payload?.plants || []).map((plant) => ({
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
    }));

    const bioSeriesElectrochemical = chronologicalRows
      .map((row, index) => ({
        readingLabel: `#${index + 1}`,
        value:
          row.electrochemical_signal != null
            ? Number(row.electrochemical_signal)
            : null
      }))
      .filter((point) => point.value != null && !Number.isNaN(point.value));

    const bioSeriesPh = chronologicalRows
      .map((row, index) => ({
        readingLabel: `#${index + 1}`,
        value: Number(projectMode ? row.ph_value : row.soil_ph ?? row.ph)
      }))
      .filter((point) => !Number.isNaN(point.value));

    const dashboardTrend = chronologicalRows.map((row, index) => ({
      label: `#${index + 1}`,
      temp: Number(projectMode ? row.ambient_temperature : row.ambient_temperature ?? row.temperature),
      ph: Number(projectMode ? row.ph_value : row.soil_ph ?? row.ph),
      readingId: row.id ?? index + 1
    }));

    return {
      payload,
      loading,
      error,
      refetch,
      pollIntervalMs: POLL_MS,
      hasLiveDb: Boolean(payload?.success && primaryRows.length > 0),
      primarySource: payload?.primary_source || null,
      latestSnapshot,
      analyticsLiveRows,
      bioSeriesElectrochemical,
      bioSeriesPh,
      dashboardTrend: dashboardTrend.filter(
        (row) => !Number.isNaN(row.temp) || !Number.isNaN(row.ph)
      ),
      plants,
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
