import { useEffect, useRef, useState, useCallback } from 'react';

interface WebSocketMessage {
  type: string;
  data?: {
    session_id?: string;
    message?: string;
    [key: string]: unknown;
  };
  session_id?: string;
  user_id?: string;
  timestamp?: string;
}

interface UseWebSocketOptions {
  url: string;
  userId?: string;
  sessionId?: string;
  onMessage?: (message: WebSocketMessage) => void;
  onError?: (error: Event) => void;
  onOpen?: () => void;
  onClose?: () => void;
  autoReconnect?: boolean;
  maxReconnectAttempts?: number;
}

export function useWebSocket(options: UseWebSocketOptions) {
  const {
    url,
    userId,
    sessionId,
    onMessage,
    onError,
    onOpen,
    onClose,
    autoReconnect = true,
    maxReconnectAttempts = 5
  } = options;

  const [isConnected, setIsConnected] = useState(false);
  const [connectionError, setConnectionError] = useState<string | null>(null);
  const wsRef = useRef<WebSocket | null>(null);
  const reconnectAttempts = useRef(0);
  const reconnectTimeout = useRef<NodeJS.Timeout | null>(null);

  const connect = useCallback(() => {
    try {
      if (!url) {
        console.log('🔌 WebSocket disabled (no URL provided)');
        return;
      }
      
      // 防止重复连接 - 检查所有活动状态
      if (wsRef.current?.readyState === WebSocket.OPEN || 
          wsRef.current?.readyState === WebSocket.CONNECTING) {
        console.log('🔌 WebSocket already connecting or connected, skipping...');
        return;
      }
      
      // 清理任何现有的连接
      if (wsRef.current) {
        wsRef.current.close();
        wsRef.current = null;
      }

      console.log(`🔌 Connecting to WebSocket: ${url}`);
      const ws = new WebSocket(url);
      wsRef.current = ws;

      ws.onopen = () => {
        console.log('✅ WebSocket connected');
        setIsConnected(true);
        setConnectionError(null);
        reconnectAttempts.current = 0;
        
        // 发送身份验证消息
        if (userId) {
          ws.send(JSON.stringify({
            type: 'auth',
            user_id: userId,
            session_id: sessionId,
            timestamp: new Date().toISOString()
          }));
        }
        
        onOpen?.();
      };

      ws.onmessage = (event) => {
        try {
          const message: WebSocketMessage = JSON.parse(event.data);
          console.log('📨 WebSocket message received:', message);
          onMessage?.(message);
        } catch {
          console.error('❌ Failed to parse WebSocket message:', event.data);
        }
      };

      ws.onerror = (error) => {
        console.error('❌ WebSocket error:', error);
        setConnectionError('WebSocket connection error');
        onError?.(error);
      };

      ws.onclose = (event) => {
        console.log(`🔌 WebSocket closed: ${event.code} ${event.reason}`);
        setIsConnected(false);
        wsRef.current = null;
        
        onClose?.();

        // 自动重连逻辑 - 只在非正常关闭时重连
        const shouldReconnect = autoReconnect && 
                               reconnectAttempts.current < maxReconnectAttempts &&
                               event.code !== 1000 && // 正常关闭
                               event.code !== 1001 && // 端点离开
                               event.code !== 1005;   // 无状态码（正常）
        
        if (shouldReconnect) {
          reconnectAttempts.current++;
          const delay = Math.min(1000 * Math.pow(2, reconnectAttempts.current - 1), 30000);
          
          console.log(`🔄 Attempting to reconnect in ${delay}ms (attempt ${reconnectAttempts.current}/${maxReconnectAttempts}) - Close code: ${event.code}`);
          
          reconnectTimeout.current = setTimeout(() => {
            connect();
          }, delay);
        } else if (event.code === 1000 || event.code === 1001 || event.code === 1005) {
          console.log('🔌 WebSocket closed normally - no reconnect needed');
        }
      };

    } catch (error) {
      console.error('❌ Failed to create WebSocket connection:', error);
      setConnectionError('Failed to create WebSocket connection');
    }
  }, [url, userId, sessionId, onMessage, onError, onOpen, onClose, autoReconnect, maxReconnectAttempts]);

  const disconnect = useCallback(() => {
    if (reconnectTimeout.current) {
      clearTimeout(reconnectTimeout.current);
      reconnectTimeout.current = null;
    }
    
    if (wsRef.current) {
      wsRef.current.close();
      wsRef.current = null;
    }
    
    setIsConnected(false);
  }, []);

  const sendMessage = useCallback((message: Record<string, unknown>) => {
    if (wsRef.current?.readyState === WebSocket.OPEN) {
      wsRef.current.send(JSON.stringify({
        ...message,
        user_id: userId,
        session_id: sessionId,
        timestamp: new Date().toISOString()
      }));
      return true;
    }
    console.warn('⚠️ WebSocket not connected, message not sent:', message);
    return false;
  }, [userId, sessionId]);

  const connectRef = useRef(connect);
  const disconnectRef = useRef(disconnect);
  connectRef.current = connect;
  disconnectRef.current = disconnect;

  useEffect(() => {
    connectRef.current();
    
    return () => {
      disconnectRef.current();
    };
  }, [url]); // 只在 URL 变化时重连

  return {
    isConnected,
    connectionError,
    connect,
    disconnect,
    sendMessage
  };
}