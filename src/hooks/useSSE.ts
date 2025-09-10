'use client';

import { useEffect, useState, useCallback, useRef } from 'react';
import { displayAPI } from '@/services/api';

interface SSEOptions {
  reconnectInterval?: number;
  maxReconnectAttempts?: number;
  heartbeatInterval?: number;
}

interface SSEState {
  isConnected: boolean;
  error: string | null;
  lastUpdate: Date | null;
}

export function useSSE(
  sessionId: string | null,
  onMessage: (data: any) => void,
  options: SSEOptions = {}
) {
  const {
    reconnectInterval = 5000,
    maxReconnectAttempts = 10,
    heartbeatInterval = 30000
  } = options;

  const [state, setState] = useState<SSEState>({
    isConnected: false,
    error: null,
    lastUpdate: null
  });

  const eventSourceRef = useRef<EventSource | null>(null);
  const reconnectAttemptsRef = useRef(0);
  const heartbeatTimerRef = useRef<NodeJS.Timeout | null>(null);

  const connect = useCallback(() => {
    if (!sessionId || eventSourceRef.current) return;

    try {
      const url = `${process.env.NEXT_PUBLIC_API_BASE || 'http://localhost:8000'}/api/sessions/${sessionId}/stream`;
      const eventSource = new EventSource(url);
      eventSourceRef.current = eventSource;

      eventSource.onopen = () => {
        console.log('[SSE] Connection opened');
        setState(prev => ({
          ...prev,
          isConnected: true,
          error: null
        }));
        reconnectAttemptsRef.current = 0;
        
        // Start heartbeat monitoring
        if (heartbeatTimerRef.current) {
          clearTimeout(heartbeatTimerRef.current);
        }
        heartbeatTimerRef.current = setTimeout(() => {
          console.log('[SSE] Heartbeat timeout, reconnecting...');
          disconnect();
          connect();
        }, heartbeatInterval);
      };

      eventSource.onmessage = (event) => {
        try {
          // Reset heartbeat timer on any message
          if (heartbeatTimerRef.current) {
            clearTimeout(heartbeatTimerRef.current);
            heartbeatTimerRef.current = setTimeout(() => {
              console.log('[SSE] Heartbeat timeout, reconnecting...');
              disconnect();
              connect();
            }, heartbeatInterval);
          }

          // Handle heartbeat messages
          if (event.data.startsWith(':')) {
            console.log('[SSE] Heartbeat received');
            return;
          }

          const data = JSON.parse(event.data);
          setState(prev => ({
            ...prev,
            lastUpdate: new Date()
          }));
          onMessage(data);
        } catch (error) {
          console.error('[SSE] Error parsing message:', error);
        }
      };

      eventSource.onerror = (error) => {
        console.error('[SSE] Connection error:', error);
        setState(prev => ({
          ...prev,
          isConnected: false,
          error: 'Connection lost'
        }));
        
        eventSource.close();
        eventSourceRef.current = null;
        
        // Clear heartbeat timer
        if (heartbeatTimerRef.current) {
          clearTimeout(heartbeatTimerRef.current);
          heartbeatTimerRef.current = null;
        }
        
        // Attempt reconnection
        if (reconnectAttemptsRef.current < maxReconnectAttempts) {
          reconnectAttemptsRef.current++;
          console.log(`[SSE] Reconnecting... (attempt ${reconnectAttemptsRef.current}/${maxReconnectAttempts})`);
          setTimeout(connect, reconnectInterval);
        } else {
          setState(prev => ({
            ...prev,
            error: 'Maximum reconnection attempts reached'
          }));
        }
      };

    } catch (error) {
      console.error('[SSE] Failed to create connection:', error);
      setState(prev => ({
        ...prev,
        isConnected: false,
        error: error instanceof Error ? error.message : 'Failed to connect'
      }));
    }
  }, [sessionId, onMessage, reconnectInterval, maxReconnectAttempts, heartbeatInterval]);

  const disconnect = useCallback(() => {
    if (eventSourceRef.current) {
      eventSourceRef.current.close();
      eventSourceRef.current = null;
    }
    
    if (heartbeatTimerRef.current) {
      clearTimeout(heartbeatTimerRef.current);
      heartbeatTimerRef.current = null;
    }
    
    setState(prev => ({
      ...prev,
      isConnected: false
    }));
  }, []);

  const reconnect = useCallback(() => {
    disconnect();
    reconnectAttemptsRef.current = 0;
    connect();
  }, [connect, disconnect]);

  useEffect(() => {
    if (sessionId) {
      connect();
    } else {
      disconnect();
    }

    return () => {
      disconnect();
    };
  }, [sessionId, connect, disconnect]);

  return {
    ...state,
    reconnect
  };
}

export function useSessionSSE(sessionId: string | null) {
  const [sessionData, setSessionData] = useState<any>(null);
  const [heatmapData, setHeatmapData] = useState<any>(null);
  const [statistics, setStatistics] = useState<any>(null);

  const handleMessage = useCallback((data: any) => {
    switch (data.type) {
      case 'session_update':
        setSessionData(data.payload);
        break;
      case 'heatmap_update':
        setHeatmapData(data.payload);
        break;
      case 'statistics_update':
        setStatistics(data.payload);
        break;
      default:
        console.log('[SSE] Unknown message type:', data.type);
    }
  }, []);

  const sse = useSSE(sessionId, handleMessage);

  return {
    ...sse,
    sessionData,
    heatmapData,
    statistics
  };
}