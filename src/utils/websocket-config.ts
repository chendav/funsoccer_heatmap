/**
 * WebSocket配置工具
 * 处理HTTPS混合内容安全问题
 */

export interface WebSocketConfig {
  url: string;
  fallbackUrl?: string;
  protocol: 'ws' | 'wss';
  canConnect: boolean;
  warningMessage?: string;
}

/**
 * 获取WebSocket配置
 * 根据当前页面协议和环境变量智能选择WebSocket URL
 */
export function getWebSocketConfig(): WebSocketConfig {
  const isSecure = typeof window !== 'undefined' && window.location.protocol === 'https:';
  const backendIP = '47.239.73.57';
  const backendPort = '8000';
  const wsPath = '/ws/detection';
  
  // 优先使用环境变量
  if (process.env.NEXT_PUBLIC_WS_URL) {
    return {
      url: process.env.NEXT_PUBLIC_WS_URL,
      protocol: process.env.NEXT_PUBLIC_WS_URL.startsWith('wss') ? 'wss' : 'ws',
      canConnect: true
    };
  }
  
  // HTTPS页面的情况
  if (isSecure) {
    return {
      url: `ws://${backendIP}:${backendPort}${wsPath}`,
      protocol: 'ws',
      canConnect: false, // 浏览器会阻止
      warningMessage: '由于Mixed Content安全限制，HTTPS页面无法连接到不安全的WebSocket。需要后端支持WSS或使用HTTP页面。',
      fallbackUrl: `http://www.funsoccer.app` // 建议用户使用HTTP版本
    };
  }
  
  // HTTP页面的情况
  return {
    url: `ws://${backendIP}:${backendPort}${wsPath}`,
    protocol: 'ws',
    canConnect: true
  };
}

/**
 * 检查WebSocket是否可以连接
 */
export function canConnectWebSocket(): boolean {
  const config = getWebSocketConfig();
  return config.canConnect;
}

/**
 * 获取用户友好的连接状态消息
 */
export function getConnectionStatusMessage(): string {
  const config = getWebSocketConfig();
  
  if (!config.canConnect) {
    return `🔒 WebSocket连接被浏览器安全策略阻止。${config.warningMessage || ''}`;
  }
  
  return '🔌 正在连接到WebSocket...';
}