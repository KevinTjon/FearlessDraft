// Socket connection and event handling
import { Server, Socket } from 'socket.io';
import { 
  Team, 
  SocketEvents, 
  resolveTeamSide,
  DraftValidationError 
} from '@champ-draft-arena/shared';
import { SessionManager } from '../services/SessionManager.js';
import { DraftService } from '../services/DraftService.js';
import { TimerService } from '../services/TimerService.js';

export class SocketHandler {
  private connectedClients = new Map<string, { team: Team | null; draftId: string | null }>();

  constructor(
    private io: Server,
    private sessionManager: SessionManager,
    private draftService: DraftService,
    private timerService: TimerService
  ) {
    this.setupEventListeners();
  }

  private setupEventListeners(): void {
    this.io.on('connection', (socket) => {
      console.log(`Client connected: ${socket.id}`);
      this.handleConnection(socket);
    });

    // Listen to timer events
    this.timerService.on('phaseExpired', this.handlePhaseExpired.bind(this));
    this.timerService.on('swapPhaseUpdate', this.handleSwapPhaseUpdate.bind(this));
    this.timerService.on('swapPhaseComplete', this.handleSwapPhaseComplete.bind(this));
  }

  private handleConnection(socket: Socket): void {
    let currentDraftId: string | null = null;
    let currentTeam: Team | null = null;

    // Store client info
    this.connectedClients.set(socket.id, { team: null, draftId: null });

    socket.on('createDraft', (data: SocketEvents['createDraft']) => {
      try {
        console.log('Creating draft:', data);
        
        const session = this.sessionManager.createSession(
          data.draftId,
          data.blueTeamName,
          data.redTeamName
        );

        // Update connection status if client has a team
        if (currentTeam === 'BLUE' || currentTeam === 'RED') {
          this.sessionManager.updateConnectionStatus(data.draftId, currentTeam, true);
        }

        socket.join(data.draftId);
        this.updateClientInfo(socket.id, currentTeam, data.draftId);
        
        // Broadcast updated state
        this.broadcastSessionState(data.draftId);

      } catch (error) {
        this.handleError(socket, error, 'CREATE_DRAFT_ERROR');
      }
    });

    socket.on('joinDraft', (data: SocketEvents['joinDraft']) => {
      try {
        console.log('Joining draft:', data);
        
        const session = this.sessionManager.getSession(data.draftId);
        const resolvedTeam = resolveTeamSide(data.team as string, session);
        
        console.log('Resolved team:', { input: data.team, resolved: resolvedTeam });
        
        currentDraftId = data.draftId;
        currentTeam = resolvedTeam;
        socket.join(data.draftId);
        
        this.updateClientInfo(socket.id, resolvedTeam, data.draftId);

        // Update connection status for playing teams
        if (session && (resolvedTeam === 'BLUE' || resolvedTeam === 'RED')) {
          this.sessionManager.updateConnectionStatus(data.draftId, resolvedTeam, true);
        }

        // Broadcast updated state
        this.broadcastSessionState(data.draftId);

      } catch (error) {
        this.handleError(socket, error, 'JOIN_DRAFT_ERROR');
      }
    });

    socket.on('toggleReady', (data: SocketEvents['toggleReady']) => {
      try {
        const session = this.sessionManager.getSession(data.draftId);
        if (!session) {
          throw new Error('Session not found');
        }

        const updatedSession = this.draftService.toggleTeamReady(session, data.team);
        
        // Start phase timer if draft just started
        if (updatedSession.inProgress && updatedSession.currentPhaseIndex === 0) {
          this.timerService.startPhaseTimer(data.draftId, 0);
        }

        this.broadcastSessionState(data.draftId);

      } catch (error) {
        this.handleError(socket, error, 'TOGGLE_READY_ERROR');
      }
    });

    socket.on('setPendingSelection', (data: SocketEvents['setPendingSelection']) => {
      try {
        console.log('Setting pending selection:', {
          champion: data.champion?.name,
          team: data.team,
          draftId: data.draftId
        });

        const session = this.sessionManager.getSession(data.draftId);
        if (!session) {
          throw new Error('Session not found');
        }

        this.draftService.setPendingSelection(session, data.champion, data.team);

        // Broadcast pending selection update
        this.io.to(data.draftId).emit('pendingSelectionUpdate', {
          champion: data.champion,
          team: data.team
        });

        this.broadcastSessionState(data.draftId);

      } catch (error) {
        this.handleError(socket, error, 'SET_PENDING_ERROR');
      }
    });

    socket.on('selectChampion', (data: SocketEvents['selectChampion']) => {
      try {
        console.log('Selecting champion:', {
          champion: data.champion?.name,
          team: data.team,
          draftId: data.draftId
        });

        const session = this.sessionManager.getSession(data.draftId);
        if (!session) {
          throw new Error('Session not found');
        }

        // Select the champion
        this.draftService.selectChampion(session, data.champion, data.team);

        // Clear phase timer
        this.timerService.clearPhaseTimer(data.draftId);

        // Advance to next phase
        const { session: updatedSession, isComplete } = this.draftService.advancePhase(session);

        if (isComplete) {
          // Start swap phase
          this.timerService.startSwapPhaseTimer(data.draftId);
          this.io.to(data.draftId).emit('draftComplete', this.cleanSessionForClient(updatedSession));
        } else {
          // Start timer for next phase
          this.timerService.startPhaseTimer(data.draftId, updatedSession.currentPhaseIndex);
        }

        this.broadcastSessionState(data.draftId);

      } catch (error) {
        this.handleError(socket, error, 'SELECT_CHAMPION_ERROR');
      }
    });

    socket.on('reorderTeam', (data: SocketEvents['reorderTeam']) => {
      try {
        const session = this.sessionManager.getSession(data.draftId);
        if (!session) {
          throw new Error('Session not found');
        }

        this.draftService.reorderTeam(session, data.team, data.sourceIndex, data.targetIndex);

        // Broadcast reorder event
        this.io.to(data.draftId).emit('teamReorder', {
          team: data.team,
          sourceIndex: data.sourceIndex,
          targetIndex: data.targetIndex
        });

        this.broadcastSessionState(data.draftId);

      } catch (error) {
        this.handleError(socket, error, 'REORDER_ERROR');
      }
    });

    socket.on('disconnect', () => {
      console.log(`Client disconnected: ${socket.id}`);
      
      if (currentDraftId && (currentTeam === 'BLUE' || currentTeam === 'RED')) {
        // Update connection status
        this.sessionManager.updateConnectionStatus(currentDraftId, currentTeam, false);
        this.broadcastSessionState(currentDraftId);
      }

      // Clean up client info
      this.connectedClients.delete(socket.id);
    });
  }

  private handlePhaseExpired(draftId: string, phaseIndex: number): void {
    console.log(`Phase expired for draft ${draftId}, phase ${phaseIndex}`);
    
    const session = this.sessionManager.getSession(draftId);
    if (!session || !session.inProgress) {
      return;
    }

    // If there's a pending champion, confirm it; otherwise use empty champion
    const currentPhase = session.currentPhaseIndex;
    if (currentPhase !== phaseIndex) {
      console.log('Phase mismatch, ignoring expired timer');
      return;
    }

    try {
      const phaseInfo = this.draftService.getCurrentPhaseInfo(session);
      if (!phaseInfo.phase) {
        return;
      }

      // Auto-select champion (pending or empty)
      this.draftService.selectChampion(session, session.pendingChampion, phaseInfo.phase.team);

      // Advance phase
      const { session: updatedSession, isComplete } = this.draftService.advancePhase(session);

      if (isComplete) {
        this.timerService.startSwapPhaseTimer(draftId);
        this.io.to(draftId).emit('draftComplete', this.cleanSessionForClient(updatedSession));
      } else {
        this.timerService.startPhaseTimer(draftId, updatedSession.currentPhaseIndex);
      }

      this.broadcastSessionState(draftId);

    } catch (error) {
      console.error('Error handling phase expiry:', error);
    }
  }

  private handleSwapPhaseUpdate(draftId: string, timeLeft: number, canSwap: boolean): void {
    const session = this.sessionManager.getSession(draftId);
    if (!session) {
      return;
    }

    this.draftService.updateSwapPhase(session, timeLeft, canSwap);
    this.broadcastSessionState(draftId);
  }

  private handleSwapPhaseComplete(draftId: string): void {
    console.log(`Swap phase completed for draft ${draftId}`);
    // Could add additional cleanup or notifications here
  }

  private broadcastSessionState(draftId: string): void {
    const session = this.sessionManager.getSession(draftId);
    if (session) {
      this.io.to(draftId).emit('draftStateUpdate', this.cleanSessionForClient(session));
    }
  }

  private cleanSessionForClient(session: any) {
    // Remove any server-only properties that shouldn't be sent to client
    const { ...cleanSession } = session;
    return cleanSession;
  }

  private updateClientInfo(socketId: string, team: Team | null, draftId: string | null): void {
    this.connectedClients.set(socketId, { team, draftId });
  }

  private handleError(socket: Socket, error: unknown, code: string): void {
    console.error(`Socket error [${code}]:`, error);
    
    let message = 'An unexpected error occurred';
    
    if (error instanceof DraftValidationError) {
      message = error.message;
      code = error.code;
    } else if (error instanceof Error) {
      message = error.message;
    }

    socket.emit('error', { message, code });
  }

  /**
   * Get connection statistics
   */
  getStats() {
    return {
      connectedClients: this.connectedClients.size,
      sessions: this.sessionManager.getSessionCount(),
      timers: this.timerService.getActiveTimerCount()
    };
  }

  /**
   * Cleanup resources
   */
  destroy(): void {
    this.connectedClients.clear();
  }
}
