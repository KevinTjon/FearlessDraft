// Session management service - handles draft session lifecycle
import { DraftSession, DRAFT_CONFIG, validateDraftCreation } from '@champ-draft-arena/shared';

export class SessionManager {
  private sessions = new Map<string, DraftSession>();
  private cleanupTimer: NodeJS.Timeout | null = null;

  constructor() {
    this.startCleanupTimer();
  }

  /**
   * Create a new draft session
   */
  createSession(draftId: string, blueTeamName: string, redTeamName: string): DraftSession {
    // Validate input parameters
    validateDraftCreation(draftId, blueTeamName, redTeamName);

    // Check if session already exists
    const existingSession = this.sessions.get(draftId);
    if (existingSession) {
      // Update team names for existing session
      existingSession.blueTeamName = blueTeamName.trim();
      existingSession.redTeamName = redTeamName.trim();
      return existingSession;
    }

    // Create new session
    const session: DraftSession = {
      id: draftId,
      blueTeamName: blueTeamName.trim(),
      redTeamName: redTeamName.trim(),
      blueReady: false,
      redReady: false,
      inProgress: false,
      currentPhaseIndex: 0,
      bluePicks: [],
      redPicks: [],
      blueBans: [],
      redBans: [],
      createdAt: new Date().toISOString(),
      blueConnected: false,
      redConnected: false,
      pendingChampion: null,
      pendingTeam: null,
      isSwapPhase: false,
      swapTimeLeft: DRAFT_CONFIG.SWAP_PHASE_DURATION,
      canSwap: true
    };

    this.sessions.set(draftId, session);
    console.log(`Created new draft session: ${draftId}`, {
      blueTeam: blueTeamName,
      redTeam: redTeamName
    });

    return session;
  }

  /**
   * Get a session by ID
   */
  getSession(draftId: string): DraftSession | null {
    return this.sessions.get(draftId) || null;
  }

  /**
   * Update a session
   */
  updateSession(draftId: string, updates: Partial<DraftSession>): DraftSession | null {
    const session = this.sessions.get(draftId);
    if (!session) {
      return null;
    }

    Object.assign(session, updates);
    return session;
  }

  /**
   * Delete a session
   */
  deleteSession(draftId: string): boolean {
    return this.sessions.delete(draftId);
  }

  /**
   * Get all active sessions
   */
  getAllSessions(): DraftSession[] {
    return Array.from(this.sessions.values());
  }

  /**
   * Get session count
   */
  getSessionCount(): number {
    return this.sessions.size;
  }

  /**
   * Update connection status for a team
   */
  updateConnectionStatus(draftId: string, team: 'BLUE' | 'RED', connected: boolean): DraftSession | null {
    const session = this.sessions.get(draftId);
    if (!session) {
      return null;
    }

    if (team === 'BLUE') {
      session.blueConnected = connected;
    } else {
      session.redConnected = connected;
    }

    console.log(`Updated connection status for ${team} in session ${draftId}:`, {
      connected,
      blueConnected: session.blueConnected,
      redConnected: session.redConnected
    });

    return session;
  }

  /**
   * Start periodic cleanup of expired sessions
   */
  private startCleanupTimer(): void {
    this.cleanupTimer = setInterval(() => {
      this.cleanupExpiredSessions();
    }, DRAFT_CONFIG.SESSION_CLEANUP_INTERVAL);
  }

  /**
   * Clean up expired sessions
   */
  private cleanupExpiredSessions(): void {
    const now = Date.now();
    const expiredSessions: string[] = [];

    for (const [draftId, session] of this.sessions.entries()) {
      const sessionAge = now - new Date(session.createdAt).getTime();
      
      // Remove sessions that are older than expiry time and not in progress
      if (sessionAge > DRAFT_CONFIG.SESSION_EXPIRY_TIME && !session.inProgress) {
        expiredSessions.push(draftId);
      }
    }

    if (expiredSessions.length > 0) {
      console.log(`Cleaning up ${expiredSessions.length} expired sessions:`, expiredSessions);
      expiredSessions.forEach(draftId => {
        this.sessions.delete(draftId);
      });
    }
  }

  /**
   * Cleanup resources
   */
  destroy(): void {
    if (this.cleanupTimer) {
      clearInterval(this.cleanupTimer);
      this.cleanupTimer = null;
    }
    this.sessions.clear();
  }
}
