/**
 * HTTP 轮询服务
 * 替代 WebSocket 实现实时通信功能
 */

export interface PollingConfig {
  interval: number;
  maxRetries: number;
  onError?: (error: Error) => void;
}

export interface PollingTask {
  id: string;
  url: string;
  method?: 'GET' | 'POST';
  body?: any;
  onData: (data: any) => void;
  interval?: number;
}

export class PollingService {
  private tasks: Map<string, NodeJS.Timeout> = new Map();
  private apiBase: string;
  private defaultConfig: PollingConfig = {
    interval: 2000, // 默认2秒轮询一次
    maxRetries: 3
  };

  constructor() {
    this.apiBase = process.env.NEXT_PUBLIC_API_BASE || '';
  }

  /**
   * 开始轮询任务
   */
  startPolling(task: PollingTask): void {
    // 如果任务已存在，先停止
    this.stopPolling(task.id);

    const interval = task.interval || this.defaultConfig.interval;
    
    // 立即执行一次
    this.executePoll(task);

    // 设置定时轮询
    const timer = setInterval(() => {
      this.executePoll(task);
    }, interval);

    this.tasks.set(task.id, timer);
  }

  /**
   * 停止轮询任务
   */
  stopPolling(taskId: string): void {
    const timer = this.tasks.get(taskId);
    if (timer) {
      clearInterval(timer);
      this.tasks.delete(taskId);
    }
  }

  /**
   * 停止所有轮询任务
   */
  stopAll(): void {
    this.tasks.forEach((timer, id) => {
      clearInterval(timer);
    });
    this.tasks.clear();
  }

  /**
   * 执行单次轮询
   */
  private async executePoll(task: PollingTask): Promise<void> {
    try {
      const response = await fetch(`${this.apiBase}${task.url}`, {
        method: task.method || 'GET',
        headers: {
          'Content-Type': 'application/json',
        },
        body: task.body ? JSON.stringify(task.body) : undefined
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const data = await response.json();
      task.onData(data);
    } catch (error) {
      console.error(`Polling error for task ${task.id}:`, error);
      if (this.defaultConfig.onError) {
        this.defaultConfig.onError(error as Error);
      }
    }
  }

  /**
   * 一次性请求（不轮询）
   */
  async fetchOnce(url: string, options?: RequestInit): Promise<any> {
    const response = await fetch(`${this.apiBase}${url}`, {
      ...options,
      headers: {
        'Content-Type': 'application/json',
        ...options?.headers
      }
    });

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    return response.json();
  }
}

// 单例实例
export const pollingService = new PollingService();

/**
 * 设备状态轮询
 */
export function pollDeviceStatus(
  deviceId: string,
  onUpdate: (status: any) => void
): () => void {
  const task: PollingTask = {
    id: `device-status-${deviceId}`,
    url: `/api/v1/devices/${deviceId}/status`,
    onData: onUpdate,
    interval: 3000 // 3秒更新一次设备状态
  };

  pollingService.startPolling(task);

  // 返回停止函数
  return () => pollingService.stopPolling(task.id);
}

/**
 * 比赛进度轮询
 */
export function pollMatchProgress(
  matchId: string,
  onUpdate: (progress: any) => void
): () => void {
  const task: PollingTask = {
    id: `match-progress-${matchId}`,
    url: `/api/v1/matches/${matchId}/progress`,
    onData: onUpdate,
    interval: 1000 // 1秒更新一次进度
  };

  pollingService.startPolling(task);

  return () => pollingService.stopPolling(task.id);
}

/**
 * 实时跟踪数据轮询
 */
export function pollTrackingData(
  matchId: string,
  onUpdate: (data: any) => void
): () => void {
  const task: PollingTask = {
    id: `tracking-${matchId}`,
    url: `/api/v1/matches/${matchId}/tracking/latest`,
    onData: onUpdate,
    interval: 500 // 500ms更新一次跟踪数据
  };

  pollingService.startPolling(task);

  return () => pollingService.stopPolling(task.id);
}

/**
 * 球员统计数据轮询
 */
export function pollPlayerStats(
  matchId: string,
  playerId: number,
  onUpdate: (stats: any) => void
): () => void {
  const task: PollingTask = {
    id: `player-stats-${matchId}-${playerId}`,
    url: `/api/v1/matches/${matchId}/players/${playerId}/stats`,
    onData: onUpdate,
    interval: 5000 // 5秒更新一次统计数据
  };

  pollingService.startPolling(task);

  return () => pollingService.stopPolling(task.id);
}

/**
 * 照片处理进度轮询
 */
export function pollPhotoProcessing(
  sessionId: string,
  onUpdate: (progress: any) => void
): () => void {
  const task: PollingTask = {
    id: `photo-processing-${sessionId}`,
    url: `/api/v1/sessions/${sessionId}/photo-progress`,
    onData: onUpdate,
    interval: 2000 // 2秒更新一次
  };

  pollingService.startPolling(task);

  return () => pollingService.stopPolling(task.id);
}