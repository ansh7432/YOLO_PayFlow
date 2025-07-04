import { io, Socket } from 'socket.io-client';
import { authUtils } from '../utils/auth';
import { Platform } from 'react-native';

class WebSocketService {
  private socket: Socket | null = null;
  private reconnectAttempts = 0;
  private maxReconnectAttempts = 5;
  private reconnectInterval = 5000;
  private listeners: Map<string, Function[]> = new Map();

  async connect(): Promise<void> {
    try {
      const token = await authUtils.getToken();
      if (!token) {
        console.warn('No auth token available for WebSocket connection');
        return;
      }

      console.log('🔌 Connecting with token:', token.substring(0, 20) + '...');

      // Use correct server URL for platform
      let serverUrl = process.env.EXPO_PUBLIC_API_URL;
      if (!serverUrl) {
        if (Platform.OS === 'web') {
          serverUrl = 'http://localhost:3000';
        } else if (Platform.OS === 'android') {
          serverUrl = 'http://10.0.2.2:3000';
        } else {
          serverUrl = 'http://localhost:3000';
        }
      }
      
      this.socket = io(serverUrl, {
        auth: {
          token,
        },
        query: {
          token, // Also send as query parameter as fallback
        },
        transports: ['websocket'],
        upgrade: true,
        rememberUpgrade: true,
      });

      this.setupEventListeners();
      this.reconnectAttempts = 0;
      
      console.log('🔌 WebSocket connecting to:', serverUrl);
    } catch (error) {
      console.error('Failed to connect to WebSocket:', error);
    }
  }

  private setupEventListeners(): void {
    if (!this.socket) return;

    this.socket.on('connect', () => {
      console.log('🔌 WebSocket connected:', this.socket?.id);
      this.reconnectAttempts = 0;
    });

    this.socket.on('disconnect', (reason) => {
      console.log('🔌 WebSocket disconnected:', reason);
      if (reason === 'io server disconnect') {
        // Server disconnected, try to reconnect manually
        this.handleReconnect();
      }
    });

    this.socket.on('connect_error', (error) => {
      console.error('🔌 WebSocket connection error:', error);
      this.handleReconnect();
    });

    this.socket.on('error', (error) => {
      console.error('🔌 WebSocket error:', error);
    });

    this.socket.on('connected', (data) => {
      console.log('🔌 WebSocket authenticated:', data);
    });

    // Listen for payment events
    this.socket.on('paymentCreated', (payment) => {
      console.log('📧 Payment created:', payment);
      this.emit('paymentCreated', payment);
    });

    this.socket.on('paymentUpdated', (payment) => {
      console.log('📧 Payment updated:', payment);
      this.emit('paymentUpdated', payment);
    });

    this.socket.on('paymentDeleted', (data) => {
      console.log('📧 Payment deleted:', data);
      this.emit('paymentDeleted', data);
    });

    this.socket.on('statsUpdated', () => {
      console.log('📧 Stats updated');
      this.emit('statsUpdated');
    });
  }

  private handleReconnect(): void {
    if (this.reconnectAttempts >= this.maxReconnectAttempts) {
      console.error('🔌 Max reconnection attempts reached');
      return;
    }

    this.reconnectAttempts++;
    console.log(`🔌 Attempting to reconnect (${this.reconnectAttempts}/${this.maxReconnectAttempts})...`);
    
    setTimeout(() => {
      this.connect();
    }, this.reconnectInterval);
  }

  disconnect(): void {
    if (this.socket) {
      this.socket.disconnect();
      this.socket = null;
      console.log('🔌 WebSocket disconnected manually');
    }
  }

  // Event emitter functionality for the app
  on(event: string, callback: Function): void {
    if (!this.listeners.has(event)) {
      this.listeners.set(event, []);
    }
    this.listeners.get(event)?.push(callback);
  }

  off(event: string, callback: Function): void {
    const eventListeners = this.listeners.get(event);
    if (eventListeners) {
      const index = eventListeners.indexOf(callback);
      if (index > -1) {
        eventListeners.splice(index, 1);
      }
    }
  }

  private emit(event: string, data?: any): void {
    const eventListeners = this.listeners.get(event);
    if (eventListeners) {
      eventListeners.forEach(callback => callback(data));
    }
  }

  // Send a ping to test connection
  ping(): void {
    if (this.socket?.connected) {
      this.socket.emit('ping');
      this.socket.once('pong', (data) => {
        console.log('🏓 WebSocket ping/pong:', data);
      });
    }
  }

  isConnected(): boolean {
    return this.socket?.connected || false;
  }
}

// Export singleton instance
export const webSocketService = new WebSocketService();
