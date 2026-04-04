/**
 * Polls backend /api/sensor/live for MariaDB-backed sensor rows.
 */

import { useState, useEffect, useCallback, useRef } from 'react';
import apiService from '../services/apiService';

export function useSensorReadings(pollIntervalMs = 3000) {
  const [payload, setPayload] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const mounted = useRef(true);

  const refetch = useCallback(async () => {
    try {
      const data = await apiService.fetchSensorLive(80);
      if (!mounted.current) return;
      if (!data._ok) {
        setError(data.message || `Server returned ${data._status}`);
        setPayload(data);
        setLoading(false);
        return;
      }
      setError(null);
      setPayload(data);
    } catch (e) {
      if (!mounted.current) return;
      setError(e.message || 'Network error');
      setPayload(null);
    } finally {
      if (mounted.current) setLoading(false);
    }
  }, []);

  useEffect(() => {
    mounted.current = true;
    refetch();
    const id = setInterval(refetch, pollIntervalMs);
    return () => {
      mounted.current = false;
      clearInterval(id);
    };
  }, [refetch, pollIntervalMs]);

  return { payload, loading, error, refetch };
}

export default useSensorReadings;
