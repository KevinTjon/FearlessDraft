// Validation utilities for draft operations
import { Champion, Team, DraftSession, draftSequence } from '../types/index.js';

export class DraftValidationError extends Error {
  constructor(message: string, public code: string) {
    super(message);
    this.name = 'DraftValidationError';
  }
}

/**
 * Validates if a champion selection is valid for the current draft state
 */
export function validateChampionSelection(
  champion: Champion | null,
  team: Team,
  session: DraftSession
): void {
  if (!session.inProgress) {
    throw new DraftValidationError('Draft is not in progress', 'DRAFT_NOT_ACTIVE');
  }

  const currentPhase = draftSequence[session.currentPhaseIndex];
  if (!currentPhase) {
    throw new DraftValidationError('Invalid draft phase', 'INVALID_PHASE');
  }

  if (currentPhase.team !== team) {
    throw new DraftValidationError(
      `It's not ${team}'s turn. Current turn: ${currentPhase.team}`,
      'WRONG_TEAM_TURN'
    );
  }

  if (champion) {
    // Check if champion is already selected or banned (including fearless bans)
    const allSelectedChampions = [
      ...session.bluePicks,
      ...session.redPicks,
      ...session.blueBans,
      ...session.redBans,
      ...session.fearlessBans  // Include fearless bans from previous games
    ];

    const isAlreadySelected = allSelectedChampions.some(c => c.id === champion.id);
    if (isAlreadySelected) {
      // Check if it's a fearless ban to provide more specific message
      const isFearlessBan = session.fearlessBans.some(c => c.id === champion.id);
      const message = isFearlessBan 
        ? `${champion.name} was banned in a previous game (Fearless Draft)`
        : `${champion.name} is already selected or banned`;
      
      throw new DraftValidationError(message, 'CHAMPION_ALREADY_SELECTED');
    }
  }
}

/**
 * Validates if a team can toggle ready state
 */
export function validateReadyToggle(team: Team, session: DraftSession): void {
  if (team === 'SPECTATOR' || team === 'BROADCAST') {
    throw new DraftValidationError(
      'Spectators and broadcast viewers cannot ready up',
      'INVALID_TEAM_ACTION'
    );
  }

  if (session.inProgress) {
    throw new DraftValidationError(
      'Cannot change ready state while draft is in progress',
      'DRAFT_IN_PROGRESS'
    );
  }
}

/**
 * Validates if a team reorder is allowed
 */
export function validateTeamReorder(
  team: Team,
  sourceIndex: number,
  targetIndex: number,
  session: DraftSession
): void {
  if (session.inProgress || session.currentPhaseIndex < draftSequence.length) {
    throw new DraftValidationError(
      'Can only reorder after draft is complete',
      'DRAFT_NOT_COMPLETE'
    );
  }

  const picks = team === 'BLUE' ? session.bluePicks : session.redPicks;
  
  if (sourceIndex < 0 || sourceIndex >= picks.length) {
    throw new DraftValidationError('Invalid source index', 'INVALID_SOURCE_INDEX');
  }

  if (targetIndex < 0 || targetIndex >= picks.length) {
    throw new DraftValidationError('Invalid target index', 'INVALID_TARGET_INDEX');
  }
}

/**
 * Validates draft session creation parameters
 */
export function validateDraftCreation(
  draftId: string,
  blueTeamName: string,
  redTeamName: string
): void {
  if (!draftId || draftId.trim().length === 0) {
    throw new DraftValidationError('Draft ID is required', 'INVALID_DRAFT_ID');
  }

  if (!blueTeamName || blueTeamName.trim().length === 0) {
    throw new DraftValidationError('Blue team name is required', 'INVALID_BLUE_TEAM_NAME');
  }

  if (!redTeamName || redTeamName.trim().length === 0) {
    throw new DraftValidationError('Red team name is required', 'INVALID_RED_TEAM_NAME');
  }

  if (blueTeamName.trim() === redTeamName.trim()) {
    throw new DraftValidationError('Team names must be different', 'DUPLICATE_TEAM_NAMES');
  }
}

/**
 * Resolves team name to team side (BLUE/RED)
 */
export function resolveTeamSide(
  teamInput: string | Team,
  session: DraftSession | null
): Team | null {
  if (!teamInput) return null;
  
  // Handle direct team enum values
  if (teamInput === 'BLUE' || teamInput === 'RED' || teamInput === 'SPECTATOR' || teamInput === 'BROADCAST') {
    return teamInput as Team;
  }
  
  // Try to match against session team names if available
  if (session) {
    if (teamInput === session.blueTeamName) return 'BLUE';
    if (teamInput === session.redTeamName) return 'RED';
  }
  
  return null;
}

/**
 * Validates if a phase transition is valid
 */
export function validatePhaseTransition(
  currentPhaseIndex: number,
  nextPhaseIndex: number
): boolean {
  // Allow completion (going beyond the last phase)
  if (nextPhaseIndex >= draftSequence.length) {
    return currentPhaseIndex === draftSequence.length - 1;
  }

  // Must advance by exactly 1
  return nextPhaseIndex === currentPhaseIndex + 1;
}
