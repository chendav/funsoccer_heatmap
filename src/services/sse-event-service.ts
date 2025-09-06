/**
 * Server-Sent Events (SSE) client service for real-time event streaming
 * Replaces polling with push-based updates from server
 */

export interface SSEEvent {
  type: string;
  data: any;
  timestamp: string;
}

export interface DeviceState {
  device_id: string;
  status: 'online' | 'offline';
  info?: any;
  last_heartbeat?: string;
}

export interface StatusConfirmation {
  confirmation_id: string;
  device_id: string;
  command: string;
  status: 'pending' | 'ready' | 'busy' | 'error';
  details?: any;
}

type EventHandler = (event: SSEEvent) => void;

export class SSEEventService {
  private eventSource: EventSource | null = null;
  private eventHandlers: Map<string, Set<EventHandler>> = new Map();
  private reconnectTimeout: NodeJS.Timeout | null = null;
  private clientId: string;
  private isConnected: boolean = false;
  private baseUrl: string;
  private reconnectAttempts: number = 0;
  private maxReconnectAttempts: number = 10;
  private reconnectDelay: number = 1000;

  constructor(baseUrl?: string) {
    this.baseUrl = baseUrl || process.env.NEXT_PUBLIC_BACKEND_API_BASE || '';
    this.clientId = this.generateClientId();
  }

  private generateClientId(): string {
    return `web_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  }

  /**
   * Connect to SSE stream
   */
  public connect(): void {
    if (this.eventSource) {
      return; // Already connected
    }

    const url = `${this.baseUrl}/api/v1/events/stream?client_id=${this.clientId}`;
    
    console.log('[SSE] Connecting to event stream:', url);

    try {
      this.eventSource = new EventSource(url);

      this.eventSource.onopen = () => {
        console.log('[SSE] Connection established');
        this.isConnected = true;
        this.reconnectAttempts = 0;
        this.reconnectDelay = 1000;
        this.emit('connection', { status: 'connected', clientId: this.clientId });
      };

      this.eventSource.onmessage = (event) => {
        try {
          const data = JSON.parse(event.data);
          this.handleEvent(data);
        } catch (error) {
          console.error('[SSE] Error parsing event:', error);
        }
      };

      this.eventSource.onerror = (error) => {
        console.error('[SSE] Connection error:', error);
        this.isConnected = false;
        this.emit('connection', { status: 'error', error });
        this.handleReconnect();
      };
    } catch (error) {
      console.error('[SSE] Failed to create EventSource:', error);
      this.handleReconnect();
    }
  }

  /**
   * Disconnect from SSE stream
   */
  public disconnect(): void {
    if (this.reconnectTimeout) {
      clearTimeout(this.reconnectTimeout);
      this.reconnectTimeout = null;
    }

    if (this.eventSource) {
      this.eventSource.close();
      this.eventSource = null;
      this.isConnected = false;
      console.log('[SSE] Disconnected from event stream');
      this.emit('connection', { status: 'disconnected' });
    }
  }

  /**
   * Handle reconnection with exponential backoff
   */
  private handleReconnect(): void {
    if (this.eventSource) {
      this.eventSource.close();
      this.eventSource = null;
    }

    if (this.reconnectAttempts >= this.maxReconnectAttempts) {
      console.error('[SSE] Max reconnection attempts reached');
      this.emit('connection', { status: 'failed', reason: 'max_attempts_reached' });
      return;
    }

    this.reconnectAttempts++;
    const delay = Math.min(this.reconnectDelay * Math.pow(2, this.reconnectAttempts - 1), 30000);

    console.log(`[SSE] Reconnecting in ${delay}ms (attempt ${this.reconnectAttempts}/${this.maxReconnectAttempts})`);

    this.reconnectTimeout = setTimeout(() => {
      this.connect();
    }, delay);
  }

  /**
   * Handle incoming event
   */
  private handleEvent(data: any): void {
    const event: SSEEvent = {
      type: data.type,
      data: data,
      timestamp: data.timestamp || new Date().toISOString()
    };

    // Emit to general handlers
    this.emit('event', event);

    // Emit to type-specific handlers
    this.emit(data.type, data);

    // Handle specific event types
    switch (data.type) {
      case 'ping':
        // Heartbeat from server, no action needed
        break;

      case 'device_registered':
        console.log('[SSE] Device registered:', data.device_id);
        this.emit('device_update', {
          device_id: data.device_id,
          status: 'online',
          info: data.device_info
        });
        break;

      case 'device_offline':
        console.log('[SSE] Device offline:', data.device_id);
        this.emit('device_update', {
          device_id: data.device_id,
          status: 'offline'
        });
        break;

      case 'device_heartbeat':
        this.emit('device_heartbeat', {
          device_id: data.device_id,
          timestamp: data.timestamp
        });
        break;

      case 'status_confirmed':
        console.log('[SSE] Status confirmed:', data);
        this.emit('status_confirmation', data);
        break;

      case 'command_execute':
        console.log('[SSE] Command executing:', data);
        this.emit('command_execution', data);
        break;

      default:
        console.log('[SSE] Unknown event type:', data.type);
    }
  }

  /**
   * Subscribe to events of a specific type
   */
  public on(eventType: string, handler: EventHandler): () => void {
    if (!this.eventHandlers.has(eventType)) {
      this.eventHandlers.set(eventType, new Set());
    }
    
    this.eventHandlers.get(eventType)!.add(handler);

    // Return unsubscribe function
    return () => {
      const handlers = this.eventHandlers.get(eventType);
      if (handlers) {
        handlers.delete(handler);
        if (handlers.size === 0) {
          this.eventHandlers.delete(eventType);
        }
      }
    };
  }

  /**
   * Emit event to all registered handlers
   */
  private emit(eventType: string, data: any): void {
    const handlers = this.eventHandlers.get(eventType);
    if (handlers) {
      handlers.forEach(handler => {
        try {
          handler({ type: eventType, data, timestamp: new Date().toISOString() });
        } catch (error) {
          console.error(`[SSE] Error in event handler for ${eventType}:`, error);
        }
      });
    }
  }

  /**
   * Subscribe to specific device events
   */
  public async subscribeToDevice(deviceId: string): Promise<void> {
    try {
      const response = await fetch(`${this.baseUrl}/api/v1/events/subscribe/${deviceId}`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ client_id: this.clientId })
      });

      if (response.ok) {
        console.log(`[SSE] Subscribed to device ${deviceId}`);
      } else {
        console.error(`[SSE] Failed to subscribe to device ${deviceId}`);
      }
    } catch (error) {
      console.error(`[SSE] Error subscribing to device ${deviceId}:`, error);
    }
  }

  /**
   * Unsubscribe from device events
   */
  public async unsubscribeFromDevice(deviceId: string): Promise<void> {
    try {
      const response = await fetch(`${this.baseUrl}/api/v1/events/subscribe/${deviceId}?client_id=${this.clientId}`, {
        method: 'DELETE'
      });

      if (response.ok) {
        console.log(`[SSE] Unsubscribed from device ${deviceId}`);
      }
    } catch (error) {
      console.error(`[SSE] Error unsubscribing from device ${deviceId}:`, error);
    }
  }

  /**
   * Send command to device with status confirmation
   */
  public async sendCommand(deviceId: string, command: string, parameters?: any): Promise<any> {
    try {
      const response = await fetch(`${this.baseUrl}/api/v1/devices/${deviceId}/command`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          command,
          parameters,
          require_confirmation: true
        })
      });

      if (response.ok) {
        const result = await response.json();
        console.log(`[SSE] Command sent to device ${deviceId}:`, result);
        return result;
      } else {
        throw new Error(`Failed to send command: ${response.status}`);
      }
    } catch (error) {
      console.error(`[SSE] Error sending command to device ${deviceId}:`, error);
      throw error;
    }
  }

  /**
   * Get all online devices
   */
  public async getOnlineDevices(): Promise<DeviceState[]> {
    try {
      const response = await fetch(`${this.baseUrl}/api/v1/devices/online`);
      if (response.ok) {
        const data = await response.json();
        return data.devices;
      }
      return [];
    } catch (error) {
      console.error('[SSE] Error fetching online devices:', error);
      return [];
    }
  }

  /**
   * Find devices near a location
   */
  public async findNearbyDevices(latitude: number, longitude: number, maxDistance: number = 10): Promise<any[]> {
    try {
      const params = new URLSearchParams({
        latitude: latitude.toString(),
        longitude: longitude.toString(),
        max_distance_km: maxDistance.toString()
      });

      const response = await fetch(`${this.baseUrl}/api/v1/devices/nearby?${params}`);
      if (response.ok) {
        const data = await response.json();
        return data.devices;
      }
      return [];
    } catch (error) {
      console.error('[SSE] Error finding nearby devices:', error);
      return [];
    }
  }

  /**
   * Check if connected to SSE stream
   */
  public isConnectedToStream(): boolean {
    return this.isConnected;
  }

  /**
   * Get client ID
   */
  public getClientId(): string {
    return this.clientId;
  }
}

// Create singleton instance
export const sseEventService = new SSEEventService();