import { WebSocketEnvelope } from '../types';

type MessageHandler<T = any> = (data: WebSocketEnvelope<T>) => void;

export class RealtimeWebSocketService {
  private static instance: RealtimeWebSocketService;
  private ws: WebSocket | null = null;
  private subscriptions: Map<string, Set<MessageHandler>> = new Map();
  private reconnectAttempts = 0;
  private maxReconnectAttempts = 10;
  private reconnectInterval = 3000;
  private heartbeatTimer: any = null;
  private lastSequenceReceived = 0;
  private isConnected = false;
  private url = 'ws://localhost:8000/ws';

  private constructor() {}

  public static getInstance(): RealtimeWebSocketService {
    if (!RealtimeWebSocketService.instance) {
      RealtimeWebSocketService.instance = new RealtimeWebSocketService();
    }
    return RealtimeWebSocketService.instance;
  }

  public connect(url: string = 'ws://localhost:8000/ws'): void {
    this.url = url;
    try {
      this.ws = new WebSocket(url);

      this.ws.onopen = () => {
        console.log('[WSS] Connected to Realtime Broker:', this.url);
        this.isConnected = true;
        this.reconnectAttempts = 0;
        this.startHeartbeat();
        // Resubscribe all active topics
        this.resubscribeAll();
      };

      this.ws.onmessage = (event) => {
        try {
          const envelope: WebSocketEnvelope<any> = JSON.parse(event.data);
          
          // Verify sequence numbering
          if (envelope.sequence && envelope.sequence > this.lastSequenceReceived) {
            this.lastSequenceReceived = envelope.sequence;
          }

          // Distribute to handlers
          this.subscriptions.forEach((handlers) => {
            handlers.forEach((fn) => fn(envelope));
          });
        } catch (err) {
          console.warn('[WSS] Non-JSON message received:', event.data);
        }
      };

      this.ws.onclose = () => {
        console.warn('[WSS] Disconnected. Initiating auto-reconnect...');
        this.isConnected = false;
        this.stopHeartbeat();
        this.scheduleReconnect();
      };

      this.ws.onerror = (err) => {
        console.error('[WSS] Connection error:', err);
      };
    } catch (err) {
      this.scheduleReconnect();
    }
  }

  public subscribe<T>(topic: string, handler: MessageHandler<T>): () => void {
    if (!this.subscriptions.has(topic)) {
      this.subscriptions.set(topic, new Set());
    }
    this.subscriptions.get(topic)!.add(handler);

    // If connected, send STOMP subscribe frame
    if (this.isConnected && this.ws?.readyState === WebSocket.OPEN) {
      this.sendFrame('SUBSCRIBE', { destination: topic, id: 'sub-' + topic });
    }

    return () => {
      const topicHandlers = this.subscriptions.get(topic);
      if (topicHandlers) {
        topicHandlers.delete(handler);
        if (topicHandlers.size === 0) {
          this.subscriptions.delete(topic);
          if (this.isConnected && this.ws?.readyState === WebSocket.OPEN) {
            this.sendFrame('UNSUBSCRIBE', { id: 'sub-' + topic });
          }
        }
      }
    };
  }

  public publish(topic: string, payload: any): void {
    if (this.isConnected && this.ws?.readyState === WebSocket.OPEN) {
      const envelope: WebSocketEnvelope<any> = {
        eventType: 'CHAT_MESSAGE_SENT',
        sequence: ++this.lastSequenceReceived,
        timestamp: new Date().toISOString(),
        correlationId: 'client-' + Date.now(),
        payload
      };
      this.sendFrame('SEND', { destination: topic }, JSON.stringify(envelope));
    }
  }

  private sendFrame(command: string, headers: Record<string, string>, body: string = ''): void {
    if (this.ws && this.ws.readyState === WebSocket.OPEN) {
      const frame = `${command}\n${Object.entries(headers)
        .map(([k, v]) => `${k}:${v}`)
        .join('\n')}\n\n${body}\0`;
      this.ws.send(frame);
    }
  }

  private startHeartbeat(): void {
    this.stopHeartbeat();
    this.heartbeatTimer = setInterval(() => {
      if (this.isConnected && this.ws?.readyState === WebSocket.OPEN) {
        this.ws.send('\n'); // Standard STOMP ping
      }
    }, 10000);
  }

  private stopHeartbeat(): void {
    if (this.heartbeatTimer) {
      clearInterval(this.heartbeatTimer);
      this.heartbeatTimer = null;
    }
  }

  private scheduleReconnect(): void {
    if (this.reconnectAttempts < this.maxReconnectAttempts) {
      this.reconnectAttempts++;
      const delay = Math.min(this.reconnectInterval * Math.pow(1.5, this.reconnectAttempts - 1), 30000);
      console.log(`[WSS] Reconnecting in ${Math.round(delay / 1000)}s (attempt ${this.reconnectAttempts})`);
      setTimeout(() => this.connect(this.url), delay);
    }
  }

  private resubscribeAll(): void {
    this.subscriptions.forEach((_, topic) => {
      this.sendFrame('SUBSCRIBE', { destination: topic, id: 'sub-' + topic });
    });
  }

  public disconnect(): void {
    this.stopHeartbeat();
    if (this.ws) {
      this.ws.close();
      this.ws = null;
    }
    this.isConnected = false;
  }
}
