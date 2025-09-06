/**
 * React Hook for HTTP Polling
 * 替代 useWebSocket 实现实时数据更新
 */

import { useEffect, useRef, useState, useCallback } from 'react';
import { pollingService, PollingTask } from '@/services/polling-service';

export interface UsePollingOptions {
  url: string;
  interval?: number;
  enabled?: boolean;
  onData?: (data: any) => void;
  onError?: (error: Error) => void;
  method?: 'GET' | 'POST';
  body?: any;
}

export interface UsePollingReturn {
  data: any;
  loading: boolean;
  error: Error | null;
  refetch: () => void;
  stop: () => void;
  start: () => void;
}

export function usePolling(options: UsePollingOptions): UsePollingReturn {
  const [data, setData] = useState<any>(null);
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<Error | null>(null);
  const taskIdRef = useRef<string>(`polling-${Date.now()}`);
  const isPollingRef = useRef<boolean>(false);

  const {
    url,
    interval = 2000,
    enabled = true,
    onData,
    onError,
    method = 'GET',
    body
  } = options;

  // 单次获取数据
  const fetchData = useCallback(async () => {
    setLoading(true);
    setError(null);
    
    try {
      const response = await pollingService.fetchOnce(url, {
        method,
        body: body ? JSON.stringify(body) : undefined
      });
      
      setData(response);
      onData?.(response);
    } catch (err) {
      const error = err as Error;
      setError(error);
      onError?.(error);
    } finally {
      setLoading(false);
    }
  }, [url, method, body, onData, onError]);

  // 开始轮询
  const start = useCallback(() => {
    if (isPollingRef.current) return;
    
    const task: PollingTask = {
      id: taskIdRef.current,
      url,
      method,
      body,
      onData: (responseData) => {
        setData(responseData);
        setError(null);
        onData?.(responseData);
      },
      interval
    };

    pollingService.startPolling(task);
    isPollingRef.current = true;
  }, [url, method, body, interval, onData]);

  // 停止轮询
  const stop = useCallback(() => {
    if (!isPollingRef.current) return;
    
    pollingService.stopPolling(taskIdRef.current);
    isPollingRef.current = false;
  }, []);

  // 手动刷新
  const refetch = useCallback(() => {
    fetchData();
  }, [fetchData]);

  useEffect(() => {
    if (enabled) {
      start();
    } else {
      stop();
    }

    return () => {
      stop();
    };
  }, [enabled, start, stop]);

  return {
    data,
    loading,
    error,
    refetch,
    stop,
    start
  };
}

/**
 * Hook for device status polling
 */
export function useDeviceStatus(deviceId: string | undefined) {
  return usePolling({
    url: `/api/v1/devices/${deviceId}/status`,
    interval: 3000,
    enabled: !!deviceId
  });
}

/**
 * Hook for match progress polling
 */
export function useMatchProgress(matchId: string | undefined) {
  return usePolling({
    url: `/api/v1/matches/${matchId}/progress`,
    interval: 1000,
    enabled: !!matchId
  });
}

/**
 * Hook for tracking data polling
 */
export function useTrackingData(matchId: string | undefined) {
  return usePolling({
    url: `/api/v1/matches/${matchId}/tracking/latest`,
    interval: 500,
    enabled: !!matchId
  });
}

/**
 * Hook for player stats polling
 */
export function usePlayerStatsPolling(matchId: string | undefined, playerId: number | undefined) {
  return usePolling({
    url: `/api/v1/matches/${matchId}/players/${playerId}/stats`,
    interval: 5000,
    enabled: !!(matchId && playerId)
  });
}