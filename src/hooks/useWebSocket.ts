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
  url: string | null;
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
      
      if (wsRef.current?.readyState === WebSocket.OPEN) {
        return;
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

        // 自动重连逻辑
        if (autoReconnect && reconnectAttempts.current < maxReconnectAttempts) {
          reconnectAttempts.current++;
          const delay = Math.min(1000 * Math.pow(2, reconnectAttempts.current - 1), 30000);
          
          console.log(`🔄 Attempting to reconnect in ${delay}ms (attempt ${reconnectAttempts.current}/${maxReconnectAttempts})`);
          
          reconnectTimeout.current = setTimeout(() => {
            connect();
          }, delay);
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

  useEffect(() => {
    connect();
    
    return () => {
      disconnect();
    };
  }, [connect, disconnect]);

  return {
    isConnected,
    connectionError,
    connect,
    disconnect,
    sendMessage
  };
}