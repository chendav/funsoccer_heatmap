/**
 * 智能轮询 React Hook
 * 自动调整轮询频率，减少服务器负载
 */

import { useEffect, useRef, useState, useCallback } from 'react';
import { smartPollingService, PollingProfiles } from '@/services/smart-polling-service';

export interface UseSmartPollingOptions {
  url: string;
  profile?: keyof typeof PollingProfiles;
  enabled?: boolean;
  onData?: (data: any) => void;
  onError?: (error: Error) => void;
  // 依赖项，变化时重新开始轮询
  dependencies?: any[];
}

export interface UseSmartPollingReturn {
  data: any;
  loading: boolean;
  error: Error | null;
  status: {
    isPolling: boolean;
    currentInterval: number;
    noChangeCount: number;
  };
  refetch: () => void;
  pause: () => void;
  resume: () => void;
}

export function useSmartPolling({
  url,
  profile = 'MONITORING',
  enabled = true,
  onData,
  onError,
  dependencies = []
}: UseSmartPollingOptions): UseSmartPollingReturn {
  const [data, setData] = useState<any>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<Error | null>(null);
  const [status, setStatus] = useState({
    isPolling: false,
    currentInterval: 5000,
    noChangeCount: 0
  });
  
  const pollingIdRef = useRef<string>(`smart-poll-${Date.now()}`);
  const isMountedRef = useRef(true);

  // 手动刷新
  const refetch = useCallback(async () => {
    setLoading(true);
    try {
      const response = await fetch(url);
      if (!response.ok) throw new Error(`HTTP ${response.status}`);
      const data = await response.json();
      
      if (isMountedRef.current) {
        setData(data);
        setError(null);
        onData?.(data);
      }
    } catch (err) {
      if (isMountedRef.current) {
        setError(err as Error);
        onError?.(err as Error);
      }
    } finally {
      if (isMountedRef.current) {
        setLoading(false);
      }
    }
  }, [url, onData, onError]);

  // 暂停轮询
  const pause = useCallback(() => {
    smartPollingService.stopPolling(pollingIdRef.current);
    setStatus(prev => ({ ...prev, isPolling: false }));
  }, []);

  // 恢复轮询
  const resume = useCallback(() => {
    if (!enabled) return;
    
    smartPollingService.startSmartPolling(
      pollingIdRef.current,
      url,
      (data) => {
        if (isMountedRef.current) {
          setData(data);
          setError(null);
          onData?.(data);
          
          // 更新状态
          const pollStatus = smartPollingService.getPollingStatus(pollingIdRef.current);
          if (pollStatus) {
            setStatus({
              isPolling: pollStatus.isPolling,
              currentInterval: pollStatus.currentInterval,
              noChangeCount: pollStatus.noChangeCount
            });
          }
        }
      },
      PollingProfiles[profile]
    );
    
    setStatus(prev => ({ ...prev, isPolling: true }));
  }, [url, profile, enabled, onData]);

  useEffect(() => {
    isMountedRef.current = true;
    
    if (enabled) {
      resume();
    } else {
      pause();
    }

    return () => {
      isMountedRef.current = false;
      smartPollingService.stopPolling(pollingIdRef.current);
    };
  }, [enabled, url, ...dependencies]); // eslint-disable-line react-hooks/exhaustive-deps

  return {
    data,
    loading,
    error,
    status,
    refetch,
    pause,
    resume
  };
}

/**
 * 页面可见性感知轮询
 * 页面隐藏时自动暂停，节省资源
 */
export function useVisibilityPolling(options: UseSmartPollingOptions) {
  const [isVisible, setIsVisible] = useState(!document.hidden);
  
  useEffect(() => {
    const handleVisibilityChange = () => {
      setIsVisible(!document.hidden);
    };
    
    document.addEventListener('visibilitychange', handleVisibilityChange);
    return () => {
      document.removeEventListener('visibilitychange', handleVisibilityChange);
    };
  }, []);

  return useSmartPolling({
    ...options,
    enabled: options.enabled !== false && isVisible
  });
}

/**
 * 活动感知轮询
 * 用户无操作时降低轮询频率
 */
export function useActivityPolling(
  options: UseSmartPollingOptions,
  inactiveTimeout = 60000 // 1分钟无操作
) {
  const [isActive, setIsActive] = useState(true);
  const timeoutRef = useRef<NodeJS.Timeout>();

  useEffect(() => {
    const resetTimer = () => {
      setIsActive(true);
      
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
      }
      
      timeoutRef.current = setTimeout(() => {
        setIsActive(false);
      }, inactiveTimeout);
    };

    // 监听用户活动
    const events = ['mousedown', 'mousemove', 'keypress', 'scroll', 'touchstart'];
    events.forEach(event => {
      document.addEventListener(event, resetTimer);
    });

    resetTimer(); // 初始化

    return () => {
      events.forEach(event => {
        document.removeEventListener(event, resetTimer);
      });
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
      }
    };
  }, [inactiveTimeout]);

  // 活动时使用正常配置，非活动时使用低优先级配置
  return useSmartPolling({
    ...options,
    profile: isActive ? options.profile : 'LOW_PRIORITY',
    enabled: options.enabled !== false
  });
}

/**
 * 条件轮询 Hook
 * 只在满足条件时轮询
 */
export function useConditionalPolling(
  options: UseSmartPollingOptions,
  condition: () => boolean
) {
  const [shouldPoll, setShouldPoll] = useState(condition());

  useEffect(() => {
    const interval = setInterval(() => {
      setShouldPoll(condition());
    }, 1000); // 每秒检查条件

    return () => clearInterval(interval);
  }, [condition]);

  return useSmartPolling({
    ...options,
    enabled: options.enabled !== false && shouldPoll
  });
}

/**
 * 批量轮询 Hook
 * 合并多个请求为一个，减少服务器负载
 */
export function useBatchPolling(
  urls: string[],
  interval = 5000,
  enabled = true
) {
  const [data, setData] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<Error | null>(null);

  useEffect(() => {
    if (!enabled || urls.length === 0) return;

    let isActive = true;
    
    const fetchBatch = async () => {
      if (!isActive) return;
      
      setLoading(true);
      try {
        const promises = urls.map(url => 
          fetch(url)
            .then(res => res.json())
            .catch(err => ({ error: err.message }))
        );
        
        const results = await Promise.all(promises);
        
        if (isActive) {
          setData(results);
          setError(null);
        }
      } catch (err) {
        if (isActive) {
          setError(err as Error);
        }
      } finally {
        if (isActive) {
          setLoading(false);
        }
      }
    };

    // 立即执行一次
    fetchBatch();
    
    // 设置定时轮询
    const timer = setInterval(fetchBatch, interval);

    return () => {
      isActive = false;
      clearInterval(timer);
    };
  }, [urls.join(','), interval, enabled]); // eslint-disable-line react-hooks/exhaustive-deps

  return { data, loading, error };
}