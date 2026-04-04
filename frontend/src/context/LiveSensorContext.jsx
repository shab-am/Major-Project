import React, {
  createContext,
  useContext,
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState
} from 'react';
import apiService from '../services/apiService';

const POLL_MS = 3000;

const LiveSensorContext = createContext(null);

function isProjectSource(payload) {
  const n = payload?.project_readings?.length ?? 0;
  return n > 0;
}

function rowToAnalyticsLive(row, projectMode) {
  const id = row.id ?? 0;
  if (projectMode) {
    return {
      _live: true,
      _sortKey: id,
      Soil_pH: row.ph_value ?? null,
      Ambient_Temperature: row.ambient_temperature ?? null,
      Humidity: row.humidity ?? null,
      TDS: row.tds_value ?? null,
      Dissolved_Oxygen: row.dissolved_oxygen ?? null,
      Soil_Temperature: row.soil_temperature ?? null,
      Light_Intensity: row.light_intensity ?? null,
      EC_Value: row.ec_value ?? null,
      Electrochemical_Signal: row.electrochemical_signal ?? null
    };
  }
  return {
    _live: true,
    _sortKey: id,
    Soil_pH: row.soil_ph ?? row.ph ?? null,
    Ambient_Temperature: row.ambient_temperature ?? row.temperature ?? null,
    Humidity: row.humidity ?? null,
    TDS: row.tds ?? null,
    Dissolved_Oxygen: row.dissolved_oxygen ?? row.dissolvedOxy ?? null,
    Soil_Temperature: row.soil_temperature ?? null,
    Light_Intensity: row.light_intensity ?? null,
    Nitrogen_Level: row.nitrogen_level ?? null,
    Phosphorus_Level: row.phosphorus_level ?? null,
    Potassium_Level: row.potassium_level ?? null,
    Chlorophyll_Content: row.chlorophyll_content ?? null,
    Electrochemical_Signal: row.electrochemical_signal ?? null
  };
}

function latestToSnapshot(latest, projectMode) {
  if (!latest) return null;
  if (projectMode) {
    return {
      ph: latest.ph_value ?? null,
      temperature: latest.ambient_temperature ?? null,
      humidity: latest.humidity ?? null,
      tds: latest.tds_value ?? null,
      dissolvedOxy: latest.dissolved_oxygen ?? null,
      ec: latest.ec_value ?? null,
      electrochemical: latest.electrochemical_signal ?? null,
      soilTemp: latest.soil_temperature ?? null,
      light: latest.light_intensity ?? null
    };
  }
  return {
    ph: latest.soil_ph ?? latest.ph ?? null,
    temperature: latest.ambient_temperature ?? latest.temperature ?? null,
    humidity: latest.humidity ?? null,
    tds: latest.tds ?? null,
    dissolvedOxy: latest.dissolved_oxygen ?? latest.dissolvedOxy ?? null,
    electrochemical: latest.electrochemical_signal ?? null
  };
}

export function LiveSensorProvider({ children }) {
  const [payload, setPayload] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const mounted = useRef(true);

  const refetch = useCallback(async () => {
    try {
      const data = await apiService.fetchSensorLive(200);
      if (!mounted.current) return;
      if (!data._ok) {
        setError(data.message || `Server returned ${data._status}`);
        setPayload(data);
        return;
      }
      setError(null);
      setPayload(data);
    } catch (e) {
      if (!mounted.current) return;
      setError(e.message || 'Network error');
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
    const project = payload?.project_readings || [];
    const plant = payload?.plant_readings || [];
    const projectMode = isProjectSource(payload);
    const primary = projectMode ? project : plant;
    const chronological = [...primary].sort(
      (a, b) => (a.id ?? 0) - (b.id ?? 0)
    );
    const analyticsLiveRows = chronological.map((row) =>
      rowToAnalyticsLive(row, projectMode)
    );
    const latest = payload?.latest
      ? latestToSnapshot(payload.latest, projectMode)
      : null;

    const bioSeriesElectrochemical = chronological
      .map((row, i) => ({
        readingLabel: `#${i + 1}`,
        value:
          row.electrochemical_signal != null
            ? Number(row.electrochemical_signal)
            : null
      }))
      .filter((p) => p.value != null && !Number.isNaN(p.value));

    const bioSeriesPh = chronological
      .map((row, i) => ({
        readingLabel: `#${i + 1}`,
        value:
          (projectMode ? row.ph_value : row.soil_ph) != null
            ? Number(projectMode ? row.ph_value : row.soil_ph)
            : null
      }))
      .filter((p) => p.value != null && !Number.isNaN(p.value));

    const slice = chronological.slice(-14);
    const offset = chronological.length - slice.length;
    const dashboardTrend = slice.map((row, idx) => {
      const tempRaw = projectMode
        ? row.ambient_temperature
        : row.ambient_temperature ?? row.temperature;
      const phRaw = projectMode ? row.ph_value : row.soil_ph;
      return {
        label: `#${offset + idx + 1}`,
        temp: tempRaw != null ? Number(tempRaw) : null,
        ph: phRaw != null ? Number(phRaw) : null
      };
    });

    return {
      payload,
      loading,
      error,
      refetch,
      pollIntervalMs: POLL_MS,
      hasLiveDb: Boolean(payload?.success && primary.length > 0),
      primarySource: payload?.primary_source || null,
      analyticsLiveRows,
      latestSnapshot: latest,
      bioSeriesElectrochemical,
      bioSeriesPh,
      dashboardTrend
    };
  }, [payload, loading, error, refetch]);

  return (
    <LiveSensorContext.Provider value={value}>
      {children}
    </LiveSensorContext.Provider>
  );
}

export function useLiveSensor() {
  const ctx = useContext(LiveSensorContext);
  if (!ctx) {
    throw new Error('useLiveSensor must be used within LiveSensorProvider');
  }
  return ctx;
}
