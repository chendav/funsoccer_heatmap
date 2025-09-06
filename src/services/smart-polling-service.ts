/**
 * 智能轮询服务 - 优化版本
 * 减少服务器负载，避免磁盘过度读取
 */

interface SmartPollingConfig {
  // 基础间隔（毫秒）
  baseInterval: number;
  // 最大间隔（毫秒）
  maxInterval: number;
  // 最小间隔（毫秒）
  minInterval: number;
  // 是否启用自适应间隔
  adaptive: boolean;
  // 是否启用数据变化检测
  changeDetection: boolean;
  // 最大并发请求数
  maxConcurrent: number;
  // 请求超时时间
  timeout: number;
}

interface PollingState {
  lastData: any;
  lastHash: string;
  noChangeCount: number;
  errorCount: number;
  currentInterval: number;
  isPolling: boolean;
  lastRequestTime: number;
}

export class SmartPollingService {
  private states: Map<string, PollingState> = new Map();
  private timers: Map<string, NodeJS.Timeout> = new Map();
  private concurrentRequests = 0;
  private requestQueue: Array<() => Promise<void>> = [];
  
  private defaultConfig: SmartPollingConfig = {
    baseInterval: 5000,      // 基础5秒
    maxInterval: 30000,      // 最大30秒
    minInterval: 2000,       // 最小2秒
    adaptive: true,          // 启用自适应
    changeDetection: true,   // 启用变化检测
    maxConcurrent: 3,        // 最多3个并发请求
    timeout: 10000          // 10秒超时
  };

  /**
   * 开始智能轮询
   */
  async startSmartPolling(
    id: string,
    url: string,
    onData: (data: any) => void,
    config?: Partial<SmartPollingConfig>
  ): Promise<void> {
    const finalConfig = { ...this.defaultConfig, ...config };
    
    // 初始化状态
    if (!this.states.has(id)) {
      this.states.set(id, {
        lastData: null,
        lastHash: '',
        noChangeCount: 0,
        errorCount: 0,
        currentInterval: finalConfig.baseInterval,
        isPolling: true,
        lastRequestTime: 0
      });
    }

    const state = this.states.get(id)!;
    state.isPolling = true;

    // 执行轮询逻辑
    const poll = async () => {
      if (!state.isPolling) return;

      // 检查并发限制
      if (this.concurrentRequests >= finalConfig.maxConcurrent) {
        // 加入队列等待
        await new Promise<void>(resolve => {
          this.requestQueue.push(resolve);
        });
      }

      try {
        // 增加并发计数
        this.concurrentRequests++;
        
        // 执行请求
        const data = await this.fetchWithTimeout(url, finalConfig.timeout);
        
        // 处理响应
        this.handleResponse(id, data, onData, finalConfig);
        
      } catch (error) {
        this.handleError(id, error as Error, finalConfig);
      } finally {
        // 减少并发计数
        this.concurrentRequests--;
        
        // 处理等待队列
        if (this.requestQueue.length > 0) {
          const resolve = this.requestQueue.shift()!;
          resolve();
        }

        // 计算下次轮询间隔
        const nextInterval = this.calculateNextInterval(id, finalConfig);
        
        // 设置下次轮询
        if (state.isPolling) {
          const timer = setTimeout(() => poll(), nextInterval);
          this.timers.set(id, timer);
        }
      }
    };

    // 立即开始第一次轮询
    poll();
  }

  /**
   * 停止轮询
   */
  stopPolling(id: string): void {
    const state = this.states.get(id);
    if (state) {
      state.isPolling = false;
    }

    const timer = this.timers.get(id);
    if (timer) {
      clearTimeout(timer);
      this.timers.delete(id);
    }
  }

  /**
   * 停止所有轮询
   */
  stopAll(): void {
    this.states.forEach((state, id) => {
      this.stopPolling(id);
    });
    this.states.clear();
    this.requestQueue = [];
    this.concurrentRequests = 0;
  }

  /**
   * 带超时的请求
   */
  private async fetchWithTimeout(url: string, timeout: number): Promise<any> {
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), timeout);

    try {
      const response = await fetch(url, {
        signal: controller.signal,
        headers: {
          'Cache-Control': 'no-cache',
          'Pragma': 'no-cache'
        }
      });

      if (!response.ok) {
        throw new Error(`HTTP ${response.status}`);
      }

      return await response.json();
    } finally {
      clearTimeout(timeoutId);
    }
  }

  /**
   * 处理响应
   */
  private handleResponse(
    id: string,
    data: any,
    onData: (data: any) => void,
    config: SmartPollingConfig
  ): void {
    const state = this.states.get(id)!;
    
    // 重置错误计数
    state.errorCount = 0;
    
    // 计算数据哈希（简单实现）
    const dataHash = JSON.stringify(data);
    
    // 检测数据变化
    if (config.changeDetection) {
      if (dataHash === state.lastHash) {
        // 数据未变化
        state.noChangeCount++;
      } else {
        // 数据有变化
        state.noChangeCount = 0;
        state.lastHash = dataHash;
        state.lastData = data;
        onData(data);
      }
    } else {
      // 不检测变化，直接回调
      onData(data);
    }

    state.lastRequestTime = Date.now();
  }

  /**
   * 处理错误
   */
  private handleError(
    id: string,
    error: Error,
    config: SmartPollingConfig
  ): void {
    const state = this.states.get(id)!;
    state.errorCount++;
    
    console.error(`Polling error for ${id}:`, error.message);
    
    // 错误太多，增加间隔
    if (state.errorCount > 3) {
      state.currentInterval = Math.min(
        state.currentInterval * 2,
        config.maxInterval
      );
    }
  }

  /**
   * 计算下次轮询间隔（自适应算法）
   */
  private calculateNextInterval(
    id: string,
    config: SmartPollingConfig
  ): number {
    if (!config.adaptive) {
      return config.baseInterval;
    }

    const state = this.states.get(id)!;
    let interval = state.currentInterval;

    // 根据数据变化频率调整
    if (state.noChangeCount > 10) {
      // 很久没有变化，大幅增加间隔
      interval = Math.min(interval * 1.5, config.maxInterval);
    } else if (state.noChangeCount > 5) {
      // 较少变化，适度增加间隔
      interval = Math.min(interval * 1.2, config.maxInterval);
    } else if (state.noChangeCount === 0) {
      // 刚刚有变化，减少间隔
      interval = Math.max(interval * 0.8, config.minInterval);
    }

    // 根据错误情况调整
    if (state.errorCount > 0) {
      interval = Math.min(interval * 1.5, config.maxInterval);
    }

    state.currentInterval = interval;
    return interval;
  }

  /**
   * 获取轮询状态
   */
  getPollingStatus(id: string): PollingState | undefined {
    return this.states.get(id);
  }

  /**
   * 获取所有活跃的轮询任务
   */
  getActivePollings(): string[] {
    return Array.from(this.states.entries())
      .filter(([_, state]) => state.isPolling)
      .map(([id, _]) => id);
  }
}

// 单例
export const smartPollingService = new SmartPollingService();

/**
 * 场景化的轮询配置
 */
export const PollingProfiles = {
  // 关键实时数据（比赛进行中）
  REALTIME: {
    baseInterval: 1000,
    maxInterval: 5000,
    minInterval: 500,
    adaptive: true,
    changeDetection: true
  },
  
  // 常规监控（设备状态）
  MONITORING: {
    baseInterval: 5000,
    maxInterval: 30000,
    minInterval: 3000,
    adaptive: true,
    changeDetection: true
  },
  
  // 后台处理（数据分析）
  BACKGROUND: {
    baseInterval: 10000,
    maxInterval: 60000,
    minInterval: 5000,
    adaptive: true,
    changeDetection: true
  },
  
  // 低优先级（统计信息）
  LOW_PRIORITY: {
    baseInterval: 30000,
    maxInterval: 300000,  // 5分钟
    minInterval: 15000,
    adaptive: true,
    changeDetection: true
  }
};

/**
 * 批量数据获取（减少请求数）
 */
export async function batchFetch(
  urls: string[],
  onData: (results: any[]) => void
): Promise<void> {
  try {
    const promises = urls.map(url => 
      fetch(url).then(res => res.json()).catch(err => ({ error: err.message }))
    );
    
    const results = await Promise.all(promises);
    onData(results);
  } catch (error) {
    console.error('Batch fetch error:', error);
  }
}

/**
 * 条件轮询（只在满足条件时轮询）
 */
export class ConditionalPolling {
  private isActive = false;
  
  start(
    condition: () => boolean,
    pollFn: () => Promise<void>,
    interval: number = 5000
  ): void {
    this.isActive = true;
    
    const check = async () => {
      if (!this.isActive) return;
      
      if (condition()) {
        await pollFn();
      }
      
      if (this.isActive) {
        setTimeout(check, interval);
      }
    };
    
    check();
  }
  
  stop(): void {
    this.isActive = false;
  }
}