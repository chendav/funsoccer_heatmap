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
    
    // 如果是相对路径，构建完整的 WebSocket URL
    if (wsUrl.startsWith('/')) {
      const protocol = isSecure ? 'wss' : 'ws';
      const host = typeof window !== 'undefined' ? window.location.host : 'localhost:3000';
      return {
        url: `${protocol}://${host}${wsUrl}`,
        protocol: protocol,
        canConnect: true
      };
    }
    
    const isWss = wsUrl.startsWith('wss');
    return {
      url: wsUrl,
      protocol: isWss ? 'wss' : 'ws',
      canConnect: true
    };
  }
  
  // 回退配置：使用相对路径通过代理
  if (typeof window !== 'undefined') {
    const protocol = isSecure ? 'wss' : 'ws';
    const host = window.location.host;
    return {
      url: `${protocol}://${host}/ws/detection`,
      protocol: protocol,
      canConnect: true
    };
  }
  
  // 服务器端渲染时的默认值
  return {
    url: 'ws://localhost:3000/ws/detection',
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