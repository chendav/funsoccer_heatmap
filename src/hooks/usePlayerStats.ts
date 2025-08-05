/**
 * 球员统计数据管理的React Hooks
 * 提供数据获取、状态管理、实时更新等功能
 */

import { useState, useEffect, useCallback, useRef } from 'react';
import {
  PlayerStatsApiService,
  PlayerStats,
  MatchStatsSummary,
  RealtimeStatsSummary,
  PlayerStatsApiError,
  // type MatchPlayerStatsResponse, // TODO: 需要类型时导入
} from '@/lib/playerStatsApi';

// Hook状态类型定义
interface UsePlayerStatsState {
  stats: PlayerStats[];
  loading: boolean;
  error: string | null;
  lastUpdated: Date | null;
}

interface UseMatchStatsSummaryState {
  summary: MatchStatsSummary | null;
  loading: boolean;
  error: string | null;
}

interface UseSinglePlayerStatsState {
  stats: PlayerStats | null;
  loading: boolean;
  error: string | null;
  isRealtime: boolean;
}

// 配置选项
interface UsePlayerStatsOptions {
  autoRefresh?: boolean;
  refreshInterval?: number; // 毫秒
  enabled?: boolean;
}

/**
 * 获取比赛中所有球员的统计数据
 */
export const usePlayerStats = (
  matchId: string | undefined,
  options: UsePlayerStatsOptions = {}
) => {
  const {
    autoRefresh = true,
    refreshInterval = 30000, // 30秒
    enabled = true,
  } = options;

  const [state, setState] = useState<UsePlayerStatsState>({
    stats: [],
    loading: false,
    error: null,
    lastUpdated: null,
  });

  const intervalRef = useRef<NodeJS.Timeout | null>(null);
  const abortControllerRef = useRef<AbortController | null>(null);

  const fetchStats = useCallback(async () => {
    if (!matchId || !enabled) return;

    // 取消之前的请求
    if (abortControllerRef.current) {
      abortControllerRef.current.abort();
    }

    abortControllerRef.current = new AbortController();

    setState(prev => ({ ...prev, loading: true, error: null }));

    try {
      const response = await PlayerStatsApiService.getMatchPlayerStats(matchId);
      
      if (response.success) {
        setState(prev => ({
          ...prev,
          stats: response.data,
          loading: false,
          lastUpdated: new Date(),
        }));
      } else {
        throw new Error('获取统计数据失败');
      }
    } catch (error) {
      if (error instanceof PlayerStatsApiError) {
        setState(prev => ({
          ...prev,
          loading: false,
          error: error.message,
        }));
      } else if (error instanceof Error && error.name !== 'AbortError') {
        setState(prev => ({
          ...prev,
          loading: false,
          error: error.message,
        }));
      }
    }
  }, [matchId, enabled]);

  const refresh = useCallback(() => {
    fetchStats();
  }, [fetchStats]);

  const refreshPlayerStats = useCallback(async () => {
    if (!matchId) return false;

    try {
      const response = await PlayerStatsApiService.refreshMatchPlayerStats(matchId);
      if (response.success) {
        // 刷新后重新获取数据
        setTimeout(() => fetchStats(), 1000);
        return true;
      }
      return false;
    } catch (error) {
      console.error('刷新统计数据失败:', error);
      return false;
    }
  }, [matchId, fetchStats]);

  // 初始数据获取
  useEffect(() => {
    fetchStats();
  }, [fetchStats]);

  // 自动刷新
  useEffect(() => {
    if (autoRefresh && matchId && enabled) {
      intervalRef.current = setInterval(fetchStats, refreshInterval);
      return () => {
        if (intervalRef.current) {
          clearInterval(intervalRef.current);
        }
      };
    }
  }, [autoRefresh, fetchStats, refreshInterval, matchId, enabled]);

  // 清理
  useEffect(() => {
    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
      }
      if (abortControllerRef.current) {
        abortControllerRef.current.abort();
      }
    };
  }, []);

  return {
    ...state,
    refresh,
    refreshPlayerStats,
  };
};

/**
 * 获取单个球员的统计数据
 */
export const useSinglePlayerStats = (
  matchId: string | undefined,
  globalId: number | undefined,
  options: UsePlayerStatsOptions = {}
) => {
  const {
    autoRefresh = true,
    refreshInterval = 30000,
    enabled = true,
  } = options;

  const [state, setState] = useState<UseSinglePlayerStatsState>({
    stats: null,
    loading: false,
    error: null,
    isRealtime: false,
  });

  const intervalRef = useRef<NodeJS.Timeout | null>(null);

  const fetchStats = useCallback(async () => {
    if (!matchId || globalId === undefined || !enabled) return;

    setState(prev => ({ ...prev, loading: true, error: null }));

    try {
      const response = await PlayerStatsApiService.getPlayerStats(matchId, globalId);
      
      if (response.success) {
        setState(prev => ({
          ...prev,
          stats: response.data,
          loading: false,
          isRealtime: response.data.is_realtime || false,
        }));
      } else {
        throw new Error('获取球员统计数据失败');
      }
    } catch (error) {
      if (error instanceof PlayerStatsApiError) {
        setState(prev => ({
          ...prev,
          loading: false,
          error: error.message,
        }));
      } else if (error instanceof Error) {
        setState(prev => ({
          ...prev,
          loading: false,
          error: error.message,
        }));
      }
    }
  }, [matchId, globalId, enabled]);

  const refresh = useCallback(() => {
    fetchStats();
  }, [fetchStats]);

  // 初始数据获取
  useEffect(() => {
    fetchStats();
  }, [fetchStats]);

  // 自动刷新
  useEffect(() => {
    if (autoRefresh && matchId && globalId !== undefined && enabled) {
      intervalRef.current = setInterval(fetchStats, refreshInterval);
      return () => {
        if (intervalRef.current) {
          clearInterval(intervalRef.current);
        }
      };
    }
  }, [autoRefresh, fetchStats, refreshInterval, matchId, globalId, enabled]);

  // 清理
  useEffect(() => {
    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
      }
    };
  }, []);

  return {
    ...state,
    refresh,
  };
};

/**
 * 获取比赛统计摘要数据
 */
export const useMatchStatsSummary = (
  matchId: string | undefined,
  options: UsePlayerStatsOptions = {}
) => {
  const {
    autoRefresh = true,
    refreshInterval = 60000, // 1分钟
    enabled = true,
  } = options;

  const [state, setState] = useState<UseMatchStatsSummaryState>({
    summary: null,
    loading: false,
    error: null,
  });

  const intervalRef = useRef<NodeJS.Timeout | null>(null);

  const fetchSummary = useCallback(async () => {
    if (!matchId || !enabled) return;

    setState(prev => ({ ...prev, loading: true, error: null }));

    try {
      const response = await PlayerStatsApiService.getMatchStatsSummary(matchId);
      
      if (response.success) {
        setState(prev => ({
          ...prev,
          summary: response.data,
          loading: false,
        }));
      } else {
        throw new Error('获取比赛统计摘要失败');
      }
    } catch (error) {
      if (error instanceof PlayerStatsApiError) {
        setState(prev => ({
          ...prev,
          loading: false,
          error: error.message,
        }));
      } else if (error instanceof Error) {
        setState(prev => ({
          ...prev,
          loading: false,
          error: error.message,
        }));
      }
    }
  }, [matchId, enabled]);

  const refresh = useCallback(() => {
    fetchSummary();
  }, [fetchSummary]);

  // 初始数据获取
  useEffect(() => {
    fetchSummary();
  }, [fetchSummary]);

  // 自动刷新
  useEffect(() => {
    if (autoRefresh && matchId && enabled) {
      intervalRef.current = setInterval(fetchSummary, refreshInterval);
      return () => {
        if (intervalRef.current) {
          clearInterval(intervalRef.current);
        }
      };
    }
  }, [autoRefresh, fetchSummary, refreshInterval, matchId, enabled]);

  // 清理
  useEffect(() => {
    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
      }
    };
  }, []);

  return {
    ...state,
    refresh,
  };
};

/**
 * 实时统计数据摘要Hook
 */
export const useRealtimeStatsSummary = (
  matchId: string | undefined,
  options: UsePlayerStatsOptions = {}
) => {
  const {
    autoRefresh = true,
    refreshInterval = 15000, // 15秒
    enabled = true,
  } = options;

  const [summary, setSummary] = useState<RealtimeStatsSummary | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const intervalRef = useRef<NodeJS.Timeout | null>(null);

  const fetchRealtimeSummary = useCallback(async () => {
    if (!matchId || !enabled) return;

    setLoading(true);
    setError(null);

    try {
      const response = await PlayerStatsApiService.getRealtimeStatsSummary(matchId);
      
      if (response.success) {
        setSummary(response.data);
      } else {
        throw new Error('获取实时统计摘要失败');
      }
    } catch (error) {
      if (error instanceof PlayerStatsApiError) {
        setError(error.message);
      } else if (error instanceof Error) {
        setError(error.message);
      }
    } finally {
      setLoading(false);
    }
  }, [matchId, enabled]);

  const refresh = useCallback(() => {
    fetchRealtimeSummary();
  }, [fetchRealtimeSummary]);

  // 初始数据获取
  useEffect(() => {
    fetchRealtimeSummary();
  }, [fetchRealtimeSummary]);

  // 自动刷新
  useEffect(() => {
    if (autoRefresh && matchId && enabled) {
      intervalRef.current = setInterval(fetchRealtimeSummary, refreshInterval);
      return () => {
        if (intervalRef.current) {
          clearInterval(intervalRef.current);
        }
      };
    }
  }, [autoRefresh, fetchRealtimeSummary, refreshInterval, matchId, enabled]);

  // 清理
  useEffect(() => {
    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
      }
    };
  }, []);

  return {
    summary,
    loading,
    error,
    refresh,
  };
};

/**
 * 数据同步Hook
 */
export const useDataSync = (matchId: string | undefined) => {
  const [syncing, setSyncing] = useState(false);
  const [syncError, setSyncError] = useState<string | null>(null);

  const syncTrajectoryData = useCallback(async () => {
    if (!matchId) return false;

    setSyncing(true);
    setSyncError(null);

    try {
      const response = await PlayerStatsApiService.syncTrajectoryData(matchId);
      return response.success;
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : '同步失败';
      setSyncError(errorMessage);
      return false;
    } finally {
      setSyncing(false);
    }
  }, [matchId]);

  return {
    syncing,
    syncError,
    syncTrajectoryData,
  };
};