// Shared types for Champion Draft Arena
// This file is used by both client and server to ensure type consistency

export interface Champion {
  id: string;
  name: string;
  title: string;
  image: string;
  roles: string[];
  numericId: number;
}

export type Team = "BLUE" | "RED" | "SPECTATOR" | "BROADCAST";

export type DraftPhaseType = "BAN" | "PICK";

export interface DraftPhase {
  id: number;
  team: Team;
  type: DraftPhaseType;
  completed: boolean;
}

export interface DraftSlot {
  team: Team;
  champion: Champion | null;
  isActive: boolean;
  isBan: boolean;
  position?: string;
}

// Standard League of Legends draft sequence (20 phases)
export const draftSequence: DraftPhase[] = [
  // First Ban Phase (6 bans)
  { id: 1, team: "BLUE", type: "BAN", completed: false },
  { id: 2, team: "RED", type: "BAN", completed: false },
  { id: 3, team: "BLUE", type: "BAN", completed: false },
  { id: 4, team: "RED", type: "BAN", completed: false },
  { id: 5, team: "BLUE", type: "BAN", completed: false },
  { id: 6, team: "RED", type: "BAN", completed: false },
  
  // First Pick Phase (6 picks)
  { id: 7, team: "BLUE", type: "PICK", completed: false },
  { id: 8, team: "RED", type: "PICK", completed: false },
  { id: 9, team: "RED", type: "PICK", completed: false },
  { id: 10, team: "BLUE", type: "PICK", completed: false },
  { id: 11, team: "BLUE", type: "PICK", completed: false },
  { id: 12, team: "RED", type: "PICK", completed: false },
  
  // Second Ban Phase (4 bans)
  { id: 13, team: "RED", type: "BAN", completed: false },
  { id: 14, team: "BLUE", type: "BAN", completed: false },
  { id: 15, team: "RED", type: "BAN", completed: false },
  { id: 16, team: "BLUE", type: "BAN", completed: false },
  
  // Second Pick Phase (4 picks)
  { id: 17, team: "RED", type: "PICK", completed: false },
  { id: 18, team: "BLUE", type: "PICK", completed: false },
  { id: 19, team: "BLUE", type: "PICK", completed: false },
  { id: 20, team: "RED", type: "PICK", completed: false }
];

export const positions = ["TOP", "JUNGLE", "MID", "BOT", "SUPPORT"] as const;
export type Position = typeof positions[number];

// Draft session state interface
export interface DraftSession {
  id: string;
  blueTeamName: string;
  redTeamName: string;
  blueReady: boolean;
  redReady: boolean;
  inProgress: boolean;
  currentPhaseIndex: number;
  bluePicks: Champion[];
  redPicks: Champion[];
  blueBans: Champion[];
  redBans: Champion[];
  createdAt: string;
  blueConnected: boolean;
  redConnected: boolean;
  pendingChampion: Champion | null;
  pendingTeam: Team | null;
  isSwapPhase: boolean;
  swapTimeLeft: number;
  canSwap: boolean;
  
  // Timer synchronization fields
  phaseStartTime: number | null; // Timestamp when current phase timer started
  phaseTimeLeft: number | null;  // Seconds left in current phase (null if no active timer)
  phaseTimerActive: boolean;     // Whether phase timer is currently running
  
  // Post-draft next game preparation fields
  isPostDraft: boolean;          // Whether we're in post-draft phase for next game prep
  blueSideChoice: 'BLUE' | 'RED' | null; // Blue team's side choice for next game
  redSideChoice: 'BLUE' | 'RED' | null;  // Red team's side choice for next game
  blueNextGameReady: boolean;    // Blue team ready for next game draft
  redNextGameReady: boolean;     // Red team ready for next game draft
  
  // Fearless Draft system - champions banned in previous games that remain banned
  fearlessBans: Champion[];      // All champions banned in previous drafts (cumulative)
  gameNumber: number;            // Which game this is in the series (1, 2, 3, etc.)
}

// Socket event schemas for type safety
export interface SocketEvents {
  // Client to Server events
  createDraft: {
    draftId: string;
    blueTeamName: string;
    redTeamName: string;
    fearlessBans?: Champion[];    // Optional fearless bans from previous games
    gameNumber?: number;          // Optional game number (defaults to 1)
  };
  
  joinDraft: {
    draftId: string;
    team: Team | string; // Allow string for team name resolution
  };
  
  toggleReady: {
    draftId: string;
    team: Team;
  };
  
  selectChampion: {
    draftId: string;
    champion: Champion | null;
    team: Team;
  };
  
  setPendingSelection: {
    draftId: string;
    champion: Champion | null;
    team: Team;
  };
  
  reorderTeam: {
    draftId: string;
    team: Team;
    sourceIndex: number;
    targetIndex: number;
  };
  
  chooseSide: {
    draftId: string;
    team: Team;
    sideChoice: 'BLUE' | 'RED';
  };
  
  toggleNextGameReady: {
    draftId: string;
    team: Team;
  };
  
  // Server to Client events
  draftStateUpdate: DraftSession;
  
  draftComplete: DraftSession;
  
  pendingSelectionUpdate: {
    champion: Champion | null;
    team: Team;
  };
  
  teamReorder: {
    team: Team;
    sourceIndex: number;
    targetIndex: number;
  };
  
  timerExpired: {
    currentPhase: number;
  };
  
  error: {
    message: string;
    code?: string;
  };
  
  nextGameDraftReady: {
    draftId: string;
    nextGameDraftId: string;
    blueSide: Team; // Which team chose blue side
    redSide: Team;  // Which team chose red side
  };
}

// Configuration constants
export const DRAFT_CONFIG = {
  PHASE_TIMER_DURATION: 30000, // 30 seconds
  SWAP_PHASE_DURATION: 60, // 60 seconds
  SWAP_LOCK_TIME: 20, // Last 20 seconds of swap phase
  MAX_RECONNECT_ATTEMPTS: 3,
  RECONNECT_DELAY: 1000,
  SESSION_CLEANUP_INTERVAL: 300000, // 5 minutes
  SESSION_EXPIRY_TIME: 3600000, // 1 hour
} as const;

// Utility types for better type safety
export type DraftEventType = keyof SocketEvents;
export type ClientEvents = Pick<SocketEvents, 'createDraft' | 'joinDraft' | 'toggleReady' | 'selectChampion' | 'setPendingSelection' | 'reorderTeam' | 'chooseSide' | 'toggleNextGameReady'>;
export type ServerEvents = Pick<SocketEvents, 'draftStateUpdate' | 'draftComplete' | 'pendingSelectionUpdate' | 'teamReorder' | 'timerExpired' | 'error' | 'nextGameDraftReady'>;
