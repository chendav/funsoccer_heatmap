/**
 * FunSoccer Backend API Service
 * 统一的API服务层，对接后端API
 */

// API配置
const API_BASE = process.env.NEXT_PUBLIC_API_BASE || 
  (typeof window !== 'undefined' && window.location.hostname !== 'localhost' 
    ? 'http://47.239.73.57:8001'  // Production server
    : 'http://localhost:8000');   // Local development

// 认证相关
let authToken: string | null = null;

export const setAuthToken = (token: string | null) => {
  authToken = token;
};

export const getAuthToken = () => {
  return authToken;
};

// HTTP请求封装
const apiRequest = async <T>(
  url: string,
  options?: RequestInit
): Promise<T> => {
  const headers: HeadersInit = {
    'Content-Type': 'application/json',
    ...options?.headers,
  };

  // 添加认证token
  if (authToken) {
    headers['Authorization'] = `Bearer ${authToken}`;
  }

  const response = await fetch(`${API_BASE}${url}`, {
    ...options,
    headers,
  });

  if (!response.ok) {
    let errorMessage = '';
    try {
      const errorData = await response.json();
      errorMessage = errorData.detail || errorData.message || JSON.stringify(errorData);
    } catch {
      errorMessage = await response.text();
    }
    
    // Special handling for authentication errors
    if (response.status === 403 || response.status === 401) {
      throw new Error(`Authentication required. Please log in first.`);
    }
    
    throw new Error(`${errorMessage || response.statusText}`);
  }

  return response.json();
};

// ========== 认证相关API ==========
export interface AuthResponse {
  access_token: string;
  refresh_token: string;
  token_type: string;
  expires_in: number;
  user: {
    id: string;
    email: string;
    username?: string;
    nickname?: string;
  };
}

export const authAPI = {
  // Authing回调处理
  callback: async (code: string): Promise<AuthResponse> => {
    return apiRequest<AuthResponse>('/api/auth/callback', {
      method: 'POST',
      body: JSON.stringify({ code }),
    });
  },

  // 刷新token
  refreshToken: async (refreshToken: string): Promise<AuthResponse> => {
    return apiRequest<AuthResponse>('/api/auth/refresh', {
      method: 'POST',
      body: JSON.stringify({ refresh_token: refreshToken }),
    });
  },

  // 获取当前用户
  getCurrentUser: async () => {
    return apiRequest('/api/auth/me');
  },

  // 登出
  logout: async () => {
    return apiRequest('/api/auth/logout', {
      method: 'POST',
    });
  },
};

// ========== 比赛管理API ==========
export interface Match {
  id: string;
  device_id?: string;
  field_name: string;
  match_type: 'friendly' | 'tournament' | 'training' | 'test';
  team_a_name?: string;
  team_b_name?: string;
  scheduled_at?: string;
  created_at: string;
  created_by?: string;
  sessions_count: number;
}

export const matchAPI = {
  // 创建比赛
  create: async (data: {
    field_name: string;
    match_type: string;
    team_a_name?: string;
    team_b_name?: string;
  }): Promise<Match> => {
    return apiRequest<Match>('/api/matches/', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  },

  // 获取比赛详情
  get: async (matchId: string): Promise<Match> => {
    return apiRequest<Match>(`/api/matches/${matchId}`);
  },

  // 获取比赛列表
  list: async (params?: {
    page?: number;
    page_size?: number;
    device_id?: string;
  }) => {
    const queryParams = new URLSearchParams();
    if (params?.page) queryParams.append('page', params.page.toString());
    if (params?.page_size) queryParams.append('page_size', params.page_size.toString());
    if (params?.device_id) queryParams.append('device_id', params.device_id);
    
    return apiRequest(`/api/matches/?${queryParams.toString()}`);
  },
};

// ========== 参与者管理API ==========
export interface Participant {
  id: string;
  match_id: string;
  user_id?: string;
  jersey_number?: number;
  position?: string;
  team?: string;
  is_active: boolean;
  session_id?: string;
  joined_at: string;
}

export const participantAPI = {
  // 加入比赛
  joinMatch: async (data: {
    join_code: string;
    jersey_number?: number;
    position?: string;
    team?: string;
  }): Promise<Participant> => {
    return apiRequest<Participant>('/api/participants/join', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  },

  // 开始个人运动
  startPersonalSession: async (participantId: string) => {
    return apiRequest(`/api/participants/${participantId}/start`, {
      method: 'POST',
    });
  },

  // 结束个人运动
  stopPersonalSession: async (participantId: string) => {
    return apiRequest(`/api/participants/${participantId}/stop`, {
      method: 'POST',
    });
  },

  // 获取参与者信息
  getInfo: async (participantId: string): Promise<Participant> => {
    return apiRequest<Participant>(`/api/participants/${participantId}`);
  },
};

// ========== 会话管理API ==========
export interface Session {
  id: string;
  match_id: string;
  status: 'preparing' | 'active' | 'paused' | 'stopped' | 'completed' | 'cancelled';
  player_count?: number;
  position_number?: number;
  start_time?: string;
  end_time?: string;
  duration_seconds?: number;
  created_at: string;
}

export const sessionAPI = {
  // 开始会话
  start: async (data: {
    match_id: string;
    player_count?: number;
    position_number?: number;
  }): Promise<Session> => {
    return apiRequest<Session>('/api/sessions/start', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  },

  // 停止会话
  stop: async (sessionId: string): Promise<Session> => {
    return apiRequest<Session>(`/api/sessions/${sessionId}/stop`, {
      method: 'POST',
    });
  },

  // 激活会话
  activate: async (sessionId: string): Promise<Session> => {
    return apiRequest<Session>(`/api/sessions/${sessionId}/activate`, {
      method: 'POST',
    });
  },

  // 上传身份照片
  uploadIdentityPhotos: async (sessionId: string, files: File[]) => {
    const formData = new FormData();
    files.forEach(file => {
      formData.append('files', file);
    });

    const response = await fetch(`${API_BASE}/api/sessions/${sessionId}/identity-photos`, {
      method: 'POST',
      headers: {
        'Authorization': authToken ? `Bearer ${authToken}` : '',
      },
      body: formData,
    });

    if (!response.ok) {
      throw new Error(`Upload failed: ${response.status}`);
    }

    return response.json();
  },

  // 获取会话列表
  list: async (params?: {
    match_id?: string;
    page?: number;
    page_size?: number;
  }) => {
    const queryParams = new URLSearchParams();
    if (params?.match_id) queryParams.append('match_id', params.match_id);
    if (params?.page) queryParams.append('page', params.page.toString());
    if (params?.page_size) queryParams.append('page_size', params.page_size.toString());
    
    // TODO: Add proper endpoint when backend implements it
    // For now, return mock data for development
    return {
      data: [],
      total: 0,
      page: 1,
      pages: 1
    };
  },
};

// ========== 数据处理API ==========
export interface ProcessingTask {
  id: string;
  session_id: string;
  status: 'pending' | 'processing' | 'completed' | 'failed' | 'retrying';
  progress: number;
  created_at: string;
  started_at?: string;
  completed_at?: string;
  error_message?: string;
  result_location?: string;
}

export const processingAPI = {
  // 触发处理
  trigger: async (sessionId: string): Promise<ProcessingTask> => {
    return apiRequest<ProcessingTask>(`/api/processing/sessions/${sessionId}/process`, {
      method: 'POST',
    });
  },

  // 获取任务状态
  getStatus: async (taskId: string): Promise<ProcessingTask> => {
    return apiRequest<ProcessingTask>(`/api/processing/tasks/${taskId}/status`);
  },

  // 获取处理结果
  getResults: async (sessionId: string) => {
    return apiRequest(`/api/processing/sessions/${sessionId}/results`);
  },

  // 重试失败任务
  retry: async (taskId: string): Promise<ProcessingTask> => {
    return apiRequest<ProcessingTask>(`/api/processing/tasks/${taskId}/retry`, {
      method: 'POST',
    });
  },
};

// ========== 数据显示API ==========
export interface HeatmapData {
  session_id: string;
  resolution: 'low' | 'medium' | 'high';
  grid_width: number;
  grid_height: number;
  data: number[][];
  field_dimensions: { width: number; height: number };
  timestamp: string;
}

export interface Statistics {
  session_id: string;
  total_distance: number;
  average_speed: number;
  max_speed: number;
  active_time_seconds: number;
  area_coverage: number;
  player_count: number;
  session_duration: number;
  data_points: number;
  processing_status: string;
  timestamp: string;
}

export const displayAPI = {
  // 获取热力图
  getHeatmap: async (
    sessionId: string,
    resolution: 'low' | 'medium' | 'high' = 'medium'
  ): Promise<HeatmapData> => {
    return apiRequest<HeatmapData>(
      `/api/display/sessions/${sessionId}/heatmap?resolution=${resolution}`
    );
  },

  // 获取统计数据
  getStatistics: async (sessionId: string): Promise<Statistics> => {
    return apiRequest<Statistics>(`/api/display/sessions/${sessionId}/statistics`);
  },

  // 获取历史数据
  getHistory: async (sessionId: string, params?: {
    start_time?: string;
    end_time?: string;
  }) => {
    const queryParams = new URLSearchParams();
    if (params?.start_time) queryParams.append('start_time', params.start_time);
    if (params?.end_time) queryParams.append('end_time', params.end_time);
    
    return apiRequest(
      `/api/display/sessions/${sessionId}/history?${queryParams.toString()}`
    );
  },

  // SSE流式数据
  streamUpdates: (sessionId: string): EventSource => {
    const eventSource = new EventSource(
      `${API_BASE}/api/display/sessions/${sessionId}/stream`,
      {
        withCredentials: true,
      }
    );
    return eventSource;
  },
};

// ========== 设备管理API (可选) ==========
export interface Device {
  id: string;
  mac_address: string;
  field_name: string;
  location?: string;
  cameras?: any;
  last_seen?: string;
  is_active: boolean;
}

export const deviceAPI = {
  // 注册设备
  register: async (data: {
    mac_address: string;
    field_name: string;
    location?: string;
    cameras?: any;
  }) => {
    return apiRequest('/api/devices/register', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  },

  // 设备心跳
  heartbeat: async (deviceId: string) => {
    return apiRequest(`/api/devices/${deviceId}/heartbeat`, {
      method: 'POST',
    });
  },
};

// ========== 数据上传API (边缘设备使用) ==========
export const dataAPI = {
  // 上传检测数据
  upload: async (data: {
    device_mac: string;
    timestamp: string;
    detection_data: any[];
  }) => {
    return apiRequest('/api/data/upload', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  },

  // 批量上传
  batchUpload: async (data: any[]) => {
    return apiRequest('/api/data/batch', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  },
};

// 导出所有API服务
export default {
  auth: authAPI,
  match: matchAPI,
  participant: participantAPI,
  session: sessionAPI,
  processing: processingAPI,
  display: displayAPI,
  device: deviceAPI,
  data: dataAPI,
  setAuthToken,
  getAuthToken,
};