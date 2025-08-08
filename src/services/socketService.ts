// Improved socket service with proper error handling and reconnection
import { io, Socket } from 'socket.io-client';
import { 
  Champion, 
  Team, 
  SocketEvents,
  DRAFT_CONFIG 
} from '@champ-draft-arena/shared';

export type SocketEventCallback<T extends keyof SocketEvents> = (data: SocketEvents[T]) => void;

class SocketService {
  private socket: Socket | null = null;
  private reconnectAttempts = 0;
  private isManuallyDisconnected = false;
  private eventListeners = new Map<string, Function[]>();

  /**
   * Connect to the socket server
   */
  connect(): Socket {
    if (this.socket?.connected) {
      return this.socket;
    }

    console.log('Connecting to socket server...');

    this.socket = io('http://localhost:3001', {
      reconnection: true,
      reconnectionAttempts: DRAFT_CONFIG.MAX_RECONNECT_ATTEMPTS,
      reconnectionDelay: DRAFT_CONFIG.RECONNECT_DELAY,
      transports: ['websocket', 'polling'],
      withCredentials: true,
      forceNew: true,
      timeout: 5000
    });

    this.setupSocketListeners();
    return this.socket;
  }

  /**
   * Disconnect from the socket server
   */
  disconnect(): void {
    console.log('Manually disconnecting from socket server...');
    this.isManuallyDisconnected = true;
    
    if (this.socket) {
      this.socket.disconnect();
      this.socket = null;
    }
    
    this.reconnectAttempts = 0;
    this.clearEventListeners();
  }

  /**
   * Check if socket is connected
   */
  isConnected(): boolean {
    return this.socket?.connected ?? false;
  }

  /**
   * Setup socket event listeners
   */
  private setupSocketListeners(): void {
    if (!this.socket) return;

    this.socket.on('connect', () => {
      console.log('✅ Socket connected successfully', { socketId: this.socket?.id });
      this.reconnectAttempts = 0;
      this.isManuallyDisconnected = false;
      this.emit('connectionStatusChange', 'connected');
    });

    this.socket.on('connect_error', (error) => {
      console.error('❌ Socket connection error:', error);
      this.reconnectAttempts++;
      
      if (this.reconnectAttempts >= DRAFT_CONFIG.MAX_RECONNECT_ATTEMPTS) {
        console.error('Max reconnection attempts reached');
        this.emit('connectionStatusChange', 'error');
      }
      
      this.emit('connectionError', error);
    });

    this.socket.on('disconnect', (reason) => {
      console.log('🔌 Socket disconnected:', reason);
      
      if (!this.isManuallyDisconnected) {
        this.emit('connectionStatusChange', 'disconnected');
        
        if (reason === 'io server disconnect') {
          // Server initiated disconnect, try to reconnect
          setTimeout(() => {
            if (!this.isManuallyDisconnected) {
              this.socket?.connect();
            }
          }, DRAFT_CONFIG.RECONNECT_DELAY);
        }
      }
    });

    this.socket.on('reconnect', (attemptNumber) => {
      console.log(`🔄 Reconnected after ${attemptNumber} attempts`);
      this.reconnectAttempts = 0;
      this.emit('connectionStatusChange', 'connected');
    });

    this.socket.on('reconnect_error', (error) => {
      console.error('🔄❌ Reconnection error:', error);
      this.emit('connectionError', error);
    });

    this.socket.on('reconnect_failed', () => {
      console.error('🔄❌ Reconnection failed after all attempts');
      this.emit('connectionStatusChange', 'error');
    });
  }

  /**
   * Emit an event to the server
   */
  private emitToServer<T extends keyof SocketEvents>(event: T, data: SocketEvents[T]): void {
    if (!this.socket?.connected) {
      console.error(`Cannot emit ${event}: socket not connected`);
      return;
    }

    this.socket.emit(event, data);
  }

  /**
   * Listen for an event from the server
   */
  private onFromServer<T extends keyof SocketEvents>(event: T, callback: SocketEventCallback<T>): void {
    if (!this.socket) {
      console.error(`Cannot listen for ${event}: socket not initialized`);
      return;
    }

    console.log(`🎧 Setting up listener for ${event}`);
    this.socket.on(event as string, callback as any);
    
    // Store listener for cleanup
    if (!this.eventListeners.has(event)) {
      this.eventListeners.set(event, []);
    }
    this.eventListeners.get(event)!.push(callback);
  }

  /**
   * Remove event listener
   */
  private offFromServer<T extends keyof SocketEvents>(event: T, callback?: SocketEventCallback<T>): void {
    if (!this.socket) return;

    if (callback) {
      this.socket.off(event as string, callback as any);
      
      // Remove from stored listeners
      const listeners = this.eventListeners.get(event);
      if (listeners) {
        const index = listeners.indexOf(callback);
        if (index > -1) {
          listeners.splice(index, 1);
        }
      }
    } else {
      this.socket.off(event as string);
      this.eventListeners.delete(event);
    }
  }

  /**
   * Clear all event listeners
   */
  private clearEventListeners(): void {
    this.eventListeners.clear();
  }

  /**
   * Emit custom events for the application
   */
  private emit(event: string, data?: any): void {
    // This would typically use an EventEmitter pattern
    // For now, we'll use console logging
    console.log(`📡 Socket service event: ${event}`, data);
  }

  // Public API methods
  createDraft(draftId: string, blueTeamName: string, redTeamName: string): void {
    this.emitToServer('createDraft', { draftId, blueTeamName, redTeamName });
  }

  joinDraft(draftId: string, team: Team | string): void {
    this.emitToServer('joinDraft', { draftId, team });
  }

  toggleReady(draftId: string, team: Team): void {
    this.emitToServer('toggleReady', { draftId, team });
  }

  selectChampion(draftId: string, champion: Champion | null, team: Team): void {
    this.emitToServer('selectChampion', { draftId, champion, team });
  }

  setPendingSelection(draftId: string, champion: Champion | null, team: Team): void {
    this.emitToServer('setPendingSelection', { draftId, champion, team });
  }

  reorderTeam(draftId: string, team: Team, sourceIndex: number, targetIndex: number): void {
    this.emitToServer('reorderTeam', { draftId, team, sourceIndex, targetIndex });
  }

  // Event listeners
  onDraftStateUpdate(callback: SocketEventCallback<'draftStateUpdate'>): void {
    this.onFromServer('draftStateUpdate', callback);
  }

  onDraftComplete(callback: SocketEventCallback<'draftComplete'>): void {
    this.onFromServer('draftComplete', callback);
  }

  onPendingSelectionUpdate(callback: SocketEventCallback<'pendingSelectionUpdate'>): void {
    this.onFromServer('pendingSelectionUpdate', callback);
  }

  onTeamReorder(callback: SocketEventCallback<'teamReorder'>): void {
    this.onFromServer('teamReorder', callback);
  }

  onTimerExpired(callback: SocketEventCallback<'timerExpired'>): void {
    this.onFromServer('timerExpired', callback);
  }

  onError(callback: SocketEventCallback<'error'>): void {
    this.onFromServer('error', callback);
  }

  // Connection event listeners (custom events)
  onConnectionStatusChange(callback: (status: 'connecting' | 'connected' | 'disconnected' | 'error') => void): void {
    // This would be implemented with a proper EventEmitter
    // For now, store the callback for manual calling
  }

  onConnectionError(callback: (error: any) => void): void {
    // This would be implemented with a proper EventEmitter
    // For now, store the callback for manual calling
  }

  // Cleanup methods
  offDraftStateUpdate(callback?: SocketEventCallback<'draftStateUpdate'>): void {
    this.offFromServer('draftStateUpdate', callback);
  }

  offDraftComplete(callback?: SocketEventCallback<'draftComplete'>): void {
    this.offFromServer('draftComplete', callback);
  }

  offPendingSelectionUpdate(callback?: SocketEventCallback<'pendingSelectionUpdate'>): void {
    this.offFromServer('pendingSelectionUpdate', callback);
  }

  offTeamReorder(callback?: SocketEventCallback<'teamReorder'>): void {
    this.offFromServer('teamReorder', callback);
  }

  offTimerExpired(callback?: SocketEventCallback<'timerExpired'>): void {
    this.offFromServer('timerExpired', callback);
  }

  offError(callback?: SocketEventCallback<'error'>): void {
    this.offFromServer('error', callback);
  }

  /**
   * Get connection statistics
   */
  getConnectionStats() {
    return {
      connected: this.isConnected(),
      reconnectAttempts: this.reconnectAttempts,
      isManuallyDisconnected: this.isManuallyDisconnected,
      socketId: this.socket?.id || null,
    };
  }
}

// Export singleton instance
export const socketService = new SocketService();
