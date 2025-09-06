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
  
  // For HTTPS pages, we cannot use ws:// due to Mixed Content policy
  // Since Vercel doesn't support WebSocket proxying, we need to disable WebSocket for HTTPS
  if (isSecure && typeof window !== 'undefined') {
    // Check if we're on a production domain
    if (window.location.hostname === 'funsoccer.app' || window.location.hostname.includes('vercel.app')) {
      return {
        url: '',
        protocol: 'wss',
        canConnect: false,
        warningMessage: 'WebSocket暂时不可用于HTTPS连接。我们正在升级服务器以支持安全连接。'
      };
    }
  }
  
  // For local development or HTTP pages, use direct connection
  if (typeof window !== 'undefined') {
    return {
      url: 'ws://47.239.73.57:8000/ws/detection',
      protocol: 'ws',
      canConnect: !isSecure // Only allow connection on HTTP pages
    };
  }
  
  // 服务器端渲染时的默认值
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