/**
 * 球员统计数据API服务
 * 封装与后端球员统计API的交互
 */

// 统一API前缀
const API_BASE = process.env.NEXT_PUBLIC_API_BASE || "";

// 类型定义
export interface PlayerStats {
  global_id: number;
  total_distance: number;
  average_speed: number;
  max_speed: number;
  active_time: number;
  data_points: number;
  last_updated?: string;
}

export interface MatchPlayerStatsResponse {
  success: boolean;
  data: PlayerStats[];
  match_id: string;
  total_players: number;
  timestamp: string;
}

export interface SinglePlayerStatsResponse {
  success: boolean;
  data: PlayerStats & {
    match_id: string;
    is_realtime?: boolean;
  };
}

export interface MatchStatsSummary {
  match_id: string;
  total_players: number;
  total_distance: number;
  average_distance: number;
  max_distance: number;
  average_speed: number;
  max_speed: number;
  last_updated?: string;
}

export interface MatchStatsSummaryResponse {
  success: boolean;
  data: MatchStatsSummary;
}

export interface RealtimeStatsSummary {
  latest_data_time: string;
  realtime_distance: Record<string, number>;
  database_stats: PlayerStats[];
  stats_count: number;
}

export interface RealtimeStatsSummaryResponse {
  success: boolean;
  data: RealtimeStatsSummary;
  match_id: string;
  timestamp: string;
}

// API错误处理
export class PlayerStatsApiError extends Error {
  constructor(
    message: string,
    public status?: number,
    public response?: unknown
  ) {
    super(message);
    this.name = 'PlayerStatsApiError';
  }
}

// HTTP客户端封装
const apiRequest = async <T>(url: string, options?: RequestInit): Promise<T> => {
  try {
    const response = await fetch(`${API_BASE}${url}`, {
      headers: {
        'Content-Type': 'application/json',
        ...options?.headers,
      },
      ...options,
    });

    if (!response.ok) {
      const errorText = await response.text();
      throw new PlayerStatsApiError(
        `API请求失败: ${response.status} ${response.statusText}`,
        response.status,
        errorText
      );
    }

    const data = await response.json();
    return data;
  } catch (error) {
    if (error instanceof PlayerStatsApiError) {
      throw error;
    }
    throw new PlayerStatsApiError(
      `网络请求失败: ${error instanceof Error ? error.message : '未知错误'}`
    );
  }
};

// API服务类
export class PlayerStatsApiService {
  /**
   * 获取比赛中所有球员的统计数据
   */
  static async getMatchPlayerStats(matchId: string): Promise<MatchPlayerStatsResponse> {
    return apiRequest<MatchPlayerStatsResponse>(`/api/v1/matches/${matchId}/player-stats`);
  }

  /**
   * 获取单个球员的统计数据
   */
  static async getPlayerStats(matchId: string, globalId: number): Promise<SinglePlayerStatsResponse> {
    return apiRequest<SinglePlayerStatsResponse>(`/api/v1/matches/${matchId}/players/${globalId}/stats`);
  }

  /**
   * 获取比赛统计数据摘要
   */
  static async getMatchStatsSummary(matchId: string): Promise<MatchStatsSummaryResponse> {
    return apiRequest<MatchStatsSummaryResponse>(`/api/v1/matches/${matchId}/player-stats/summary`);
  }

  /**
   * 获取实时统计数据摘要
   */
  static async getRealtimeStatsSummary(matchId: string): Promise<RealtimeStatsSummaryResponse> {
    return apiRequest<RealtimeStatsSummaryResponse>(`/api/v1/matches/${matchId}/stats/realtime-summary`);
  }

  /**
   * 刷新比赛中所有球员的统计数据
   */
  static async refreshMatchPlayerStats(matchId: string): Promise<{ success: boolean; message: string }> {
    return apiRequest(`/api/v1/matches/${matchId}/player-stats/refresh`, {
      method: 'POST',
    });
  }

  /**
   * 刷新单个球员的统计数据
   */
  static async refreshPlayerStats(matchId: string, globalId: number): Promise<SinglePlayerStatsResponse> {
    return apiRequest<SinglePlayerStatsResponse>(`/api/v1/matches/${matchId}/players/${globalId}/stats/refresh`, {
      method: 'POST',
    });
  }

  /**
   * 同步轨迹数据
   */
  static async syncTrajectoryData(matchId: string): Promise<{ success: boolean; message: string }> {
    return apiRequest(`/api/v1/matches/${matchId}/trajectory/sync`, {
      method: 'POST',
    });
  }
}

// 工具函数
export const formatDistance = (distance: number): string => {
  if (distance >= 1000) {
    return `${(distance / 1000).toFixed(2)}km`;
  }
  return `${distance.toFixed(0)}m`;
};

export const formatSpeed = (speed: number): string => {
  return `${speed.toFixed(1)} km/h`;
};

export const formatTime = (seconds: number): string => {
  const minutes = Math.floor(seconds / 60);
  const remainingSeconds = seconds % 60;
  return `${minutes}:${remainingSeconds.toString().padStart(2, '0')}`;
};

export const formatActiveTime = (seconds: number): string => {
  const minutes = Math.floor(seconds / 60);
  if (minutes >= 60) {
    const hours = Math.floor(minutes / 60);
    const remainingMinutes = minutes % 60;
    return `${hours}小时${remainingMinutes}分钟`;
  }
  return `${minutes}分钟`;
};

// 数据排序工具
export const sortPlayersByDistance = (players: PlayerStats[]): PlayerStats[] => {
  return [...players].sort((a, b) => b.total_distance - a.total_distance);
};

export const sortPlayersBySpeed = (players: PlayerStats[]): PlayerStats[] => {
  return [...players].sort((a, b) => b.max_speed - a.max_speed);
};

export const sortPlayersByAverageSpeed = (players: PlayerStats[]): PlayerStats[] => {
  return [...players].sort((a, b) => b.average_speed - a.average_speed);
};