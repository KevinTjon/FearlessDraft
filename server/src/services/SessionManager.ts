// Session management service - handles draft session lifecycle
import { DraftSession, Champion, DRAFT_CONFIG, validateDraftCreation } from '@champ-draft-arena/shared';

export class SessionManager {
  private sessions = new Map<string, DraftSession>();
  private cleanupTimer: NodeJS.Timeout | null = null;

  constructor() {
    this.startCleanupTimer();
  }

  /**
   * Create a new draft session
   */
  createSession(draftId: string, blueTeamName: string, redTeamName: string, fearlessBans: Champion[] = [], gameNumber: number = 1): DraftSession {
    console.log(`🏗️ createSession: Creating/updating session ${draftId}`, { blueTeamName, redTeamName });
    
    // Validate input parameters
    validateDraftCreation(draftId, blueTeamName, redTeamName);

    // Check if session already exists
    const existingSession = this.sessions.get(draftId);
    if (existingSession) {
      console.log(`📝 createSession: Session exists, current teams:`, {
        currentBlue: existingSession.blueTeamName,
        currentRed: existingSession.redTeamName,
        newBlue: blueTeamName,
        newRed: redTeamName
      });
      
      // Smart team name updating: only update if we have better names than defaults
      const hasDefaultBlue = existingSession.blueTeamName === 'Blue Team';
      const hasDefaultRed = existingSession.redTeamName === 'Red Team';
      const newBlueIsNotDefault = blueTeamName.trim() !== 'Blue Team';
      const newRedIsNotDefault = redTeamName.trim() !== 'Red Team';
      
      if (hasDefaultBlue && newBlueIsNotDefault) {
        existingSession.blueTeamName = blueTeamName.trim();
        console.log(`✅ createSession: Updated BLUE team name to "${blueTeamName.trim()}"`);
      }
      if (hasDefaultRed && newRedIsNotDefault) {
        existingSession.redTeamName = redTeamName.trim();
        console.log(`✅ createSession: Updated RED team name to "${redTeamName.trim()}"`);
      }
      
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
      canSwap: true,
      
      // Initialize timer fields
      phaseStartTime: null,
      phaseTimeLeft: null,
      phaseTimerActive: false,
      
      // Initialize post-draft next game preparation fields
      isPostDraft: false,
      blueSideChoice: null,
      redSideChoice: null,
      blueNextGameReady: false,
      redNextGameReady: false,
      
      // Initialize fearless draft fields
      fearlessBans: fearlessBans || [],  // Champions banned in previous games
      gameNumber: gameNumber || 1        // Which game this is in the series
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
      redConnected: session.redConnected,
      gameNumber: session.gameNumber,
      inProgress: session.inProgress
    });

    // Auto-start logic removed - now handled by session transition

    return session;
  }

  /**
   * Assign a custom team name to the appropriate team slot when a captain joins
   * Uses a more balanced approach - alternates between blue and red based on session ID hash
   */
  assignTeamName(draftId: string, customTeamName: string): 'BLUE' | 'RED' | null {
    const session = this.sessions.get(draftId);
    if (!session) {
      console.log(`❌ assignTeamName: Session not found for ${draftId}`);
      throw new Error('Session not found');
    }

    const trimmedName = customTeamName.trim();
    console.log(`🔍 assignTeamName: Trying to assign "${trimmedName}" in session ${draftId}`, {
      currentBlue: session.blueTeamName,
      currentRed: session.redTeamName,
      blueConnected: session.blueConnected,
      redConnected: session.redConnected
    });
    
    // If the name already matches an existing team, return that team
    if (trimmedName === session.blueTeamName) {
      console.log(`✅ assignTeamName: "${trimmedName}" matches existing BLUE team`);
      return 'BLUE';
    }
    if (trimmedName === session.redTeamName) {
      console.log(`✅ assignTeamName: "${trimmedName}" matches existing RED team`);
      return 'RED';
    }
    
    // Check which slots are available
    const blueAvailable = session.blueTeamName === 'Blue Team' && !session.blueConnected;
    const redAvailable = session.redTeamName === 'Red Team' && !session.redConnected;
    
    console.log(`🎯 assignTeamName: Slot availability`, { blueAvailable, redAvailable });
    
    // If only one slot available, use it
    if (blueAvailable && !redAvailable) {
      session.blueTeamName = trimmedName;
      console.log(`✅ assignTeamName: Assigned "${trimmedName}" to BLUE team in session ${draftId}`);
      return 'BLUE';
    }
    
    if (redAvailable && !blueAvailable) {
      session.redTeamName = trimmedName;
      console.log(`✅ assignTeamName: Assigned "${trimmedName}" to RED team in session ${draftId}`);
      return 'RED';
    }
    
    // If both slots available, use a deterministic but balanced approach
    // Hash the draft ID to determine which team gets priority
    if (blueAvailable && redAvailable) {
      const hash = draftId.split('').reduce((acc, char) => acc + char.charCodeAt(0), 0);
      const preferBlue = hash % 2 === 0;
      
      console.log(`🎲 assignTeamName: Both slots available, using hash-based assignment (preferBlue: ${preferBlue})`);
      
      if (preferBlue) {
        session.blueTeamName = trimmedName;
        console.log(`✅ assignTeamName: Assigned "${trimmedName}" to BLUE team in session ${draftId} (hash-based)`);
        return 'BLUE';
      } else {
        session.redTeamName = trimmedName;
        console.log(`✅ assignTeamName: Assigned "${trimmedName}" to RED team in session ${draftId} (hash-based)`);
        return 'RED';
      }
    }
    
    // If both teams have custom names, we can't assign this name
    console.log(`❌ assignTeamName: Could not assign "${trimmedName}" - both teams already have custom names`);
    return null;
  }

  /**
   * Update timer state for a session
   */
  updateTimerState(draftId: string, phaseStartTime: number | null, phaseTimeLeft: number | null, phaseTimerActive: boolean): DraftSession | null {
    const session = this.sessions.get(draftId);
    if (!session) {
      return null;
    }

    session.phaseStartTime = phaseStartTime;
    session.phaseTimeLeft = phaseTimeLeft;
    session.phaseTimerActive = phaseTimerActive;

    return session;
  }

  /**
   * Get current timer state for a session
   */
  getTimerState(draftId: string): { phaseStartTime: number | null; phaseTimeLeft: number | null; phaseTimerActive: boolean } | null {
    const session = this.sessions.get(draftId);
    if (!session) {
      return null;
    }

    return {
      phaseStartTime: session.phaseStartTime,
      phaseTimeLeft: session.phaseTimeLeft,
      phaseTimerActive: session.phaseTimerActive
    };
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
