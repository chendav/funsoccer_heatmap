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
  
  // 优先使用环境变量
  if (process.env.NEXT_PUBLIC_WS_URL) {
    const wsUrl = process.env.NEXT_PUBLIC_WS_URL;
    const isWss = wsUrl.startsWith('wss');
    
    return {
      url: wsUrl,
      protocol: isWss ? 'wss' : 'ws',
      canConnect: true // 环境变量配置的 URL 应该总是可以连接
    };
  }
  
  // 回退配置：现在我们支持 WSS，所以 HTTPS 页面可以连接到 WSS
  if (isSecure) {
    return {
      url: 'wss://api.funsoccer.app/ws/detection',
      protocol: 'wss',
      canConnect: true // 恢复WebSocket连接
    };
  }
  
  // HTTP页面回退到不安全的 WebSocket
  return {
    url: 'ws://47.239.73.57:8000/ws/detection',
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
  
  const protocolText = config.protocol === 'wss' ? '🔒 安全的 WSS' : '🔌 WebSocket';
  return `${protocolText} 连接已准备就绪`;
}