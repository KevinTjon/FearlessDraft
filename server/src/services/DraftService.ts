// Draft game logic service - handles all draft-specific business logic
import { 
  Champion, 
  Team, 
  DraftSession, 
  draftSequence,
  validateChampionSelection,
  validateReadyToggle,
  validateTeamReorder,
  validatePhaseTransition
} from '@champ-draft-arena/shared';

export class DraftService {
  /**
   * Toggle ready state for a team
   */
  toggleTeamReady(session: DraftSession, team: Team): DraftSession {
    validateReadyToggle(team, session);

    if (team === 'BLUE') {
      session.blueReady = !session.blueReady;
    } else if (team === 'RED') {
      session.redReady = !session.redReady;
    }

    // Start draft if both teams are ready
    if (session.blueReady && session.redReady && !session.inProgress) {
      session.inProgress = true;
      console.log(`Draft started for session ${session.id}`);
    }

    return session;
  }

  /**
   * Set pending champion selection
   */
  setPendingSelection(session: DraftSession, champion: Champion | null, team: Team): DraftSession {
    if (!session.inProgress) {
      throw new Error('Draft is not in progress');
    }

    const currentPhase = draftSequence[session.currentPhaseIndex];
    if (!currentPhase || currentPhase.team !== team) {
      throw new Error(`It's not ${team}'s turn`);
    }

    session.pendingChampion = champion;
    session.pendingTeam = champion ? team : null;

    console.log(`Pending selection set for ${team}:`, {
      champion: champion?.name || 'none',
      phase: session.currentPhaseIndex
    });

    return session;
  }

  /**
   * Select a champion (confirm selection)
   */
  selectChampion(session: DraftSession, champion: Champion | null, team: Team): DraftSession {
    validateChampionSelection(champion, team, session);

    const currentPhase = draftSequence[session.currentPhaseIndex];
    
    // Create empty champion if null was provided (timeout case)
    const championToUse = champion || this.createEmptyChampion();

    // Record the selection based on phase type
    if (currentPhase.type === 'PICK') {
      if (team === 'BLUE') {
        session.bluePicks.push(championToUse);
      } else {
        session.redPicks.push(championToUse);
      }
    } else { // BAN
      if (team === 'BLUE') {
        session.blueBans.push(championToUse);
      } else {
        session.redBans.push(championToUse);
      }
    }

    // Clear pending selection
    session.pendingChampion = null;
    session.pendingTeam = null;

    console.log(`Champion selected for ${team}:`, {
      champion: championToUse.name || 'Empty',
      type: currentPhase.type,
      phase: session.currentPhaseIndex
    });

    return session;
  }

  /**
   * Advance to the next phase
   */
  advancePhase(session: DraftSession): { session: DraftSession; isComplete: boolean } {
    const nextPhaseIndex = session.currentPhaseIndex + 1;

    if (!validatePhaseTransition(session.currentPhaseIndex, nextPhaseIndex)) {
      throw new Error('Invalid phase transition');
    }

    session.currentPhaseIndex = nextPhaseIndex;

    // Check if draft is complete
    const isComplete = nextPhaseIndex >= draftSequence.length;
    if (isComplete) {
      session.inProgress = false;
      session.isSwapPhase = true;
      session.swapTimeLeft = 60;
      session.canSwap = true;

      console.log(`Draft completed for session ${session.id}`);
    } else {
      console.log(`Advanced to phase ${nextPhaseIndex} for session ${session.id}`);
    }

    return { session, isComplete };
  }

  /**
   * Reorder team picks (only allowed after draft completion)
   */
  reorderTeam(
    session: DraftSession, 
    team: Team, 
    sourceIndex: number, 
    targetIndex: number
  ): DraftSession {
    validateTeamReorder(team, sourceIndex, targetIndex, session);

    const picks = team === 'BLUE' ? session.bluePicks : session.redPicks;
    
    // Perform direct swap
    const temp = picks[sourceIndex];
    picks[sourceIndex] = picks[targetIndex];
    picks[targetIndex] = temp;

    if (team === 'BLUE') {
      session.bluePicks = picks;
    } else {
      session.redPicks = picks;
    }

    console.log(`Team ${team} reordered picks:`, {
      sourceIndex,
      targetIndex,
      session: session.id
    });

    return session;
  }

  /**
   * Update swap phase state
   */
  updateSwapPhase(session: DraftSession, timeLeft: number, canSwap: boolean): DraftSession {
    session.swapTimeLeft = timeLeft;
    session.canSwap = canSwap;
    
    // Transition to post-draft phase when swap phase ends
    if (timeLeft <= 0) {
      session.isSwapPhase = false;
      session.isPostDraft = true;
    }
    
    return session;
  }

  /**
   * Choose side for game 2 (or deselect if same side is chosen again)
   */
  chooseSide(session: DraftSession, team: Team, sideChoice: 'BLUE' | 'RED'): DraftSession {
    if (!session.isPostDraft) {
      throw new Error('Can only choose sides during post-draft phase');
    }

    const currentChoice = team === 'BLUE' ? session.blueSideChoice : session.redSideChoice;
    
    // If the team is choosing the same side they already have, deselect it
    if (currentChoice === sideChoice) {
      if (team === 'BLUE') {
        session.blueSideChoice = null;
        session.blueNextGameReady = false; // Clear ready status when deselecting
      } else if (team === 'RED') {
        session.redSideChoice = null;
        session.redNextGameReady = false; // Clear ready status when deselecting
      }
      console.log(`Team ${team} deselected ${sideChoice} side`);
      return session;
    }

    // Validate that the other team hasn't already chosen this side
    const otherTeam = team === 'BLUE' ? 'RED' : 'BLUE';
    const otherTeamChoice = team === 'BLUE' ? session.redSideChoice : session.blueSideChoice;
    
    if (otherTeamChoice === sideChoice) {
      throw new Error(`${sideChoice} side is already taken by ${otherTeam} team`);
    }

    // Clear ready status if team changes their side choice
    if (currentChoice && currentChoice !== sideChoice) {
      if (team === 'BLUE') {
        session.blueNextGameReady = false;
      } else {
        session.redNextGameReady = false;
      }
    }

    if (team === 'BLUE') {
      session.blueSideChoice = sideChoice;
    } else if (team === 'RED') {
      session.redSideChoice = sideChoice;
    } else {
      throw new Error('Invalid team for side selection');
    }

    console.log(`Team ${team} chose ${sideChoice} side for game 2`);
    return session;
  }

  /**
   * Toggle next game ready state
   */
  toggleNextGameReady(session: DraftSession, team: Team): DraftSession {
    if (!session.isPostDraft) {
      throw new Error('Can only ready up during post-draft phase');
    }

    // Check if team has chosen a side
    const hasSideChoice = team === 'BLUE' ? session.blueSideChoice : session.redSideChoice;
    if (!hasSideChoice) {
      throw new Error('Must choose a side before readying up');
    }

    if (team === 'BLUE') {
      session.blueNextGameReady = !session.blueNextGameReady;
    } else if (team === 'RED') {
      session.redNextGameReady = !session.redNextGameReady;
    } else {
      throw new Error('Invalid team for ready toggle');
    }

    console.log(`Team ${team} ${session.blueNextGameReady || session.redNextGameReady ? 'readied up' : 'cancelled ready'} for next game`);
    
    // Check if both teams are ready for next game
    if (session.blueNextGameReady && session.redNextGameReady) {
      console.log(`Both teams ready for next game! Session: ${session.id}`);
      // Next game will be triggered by the socket handler
    }

    return session;
  }

  /**
   * Transition current session to next game state (in-place)
   */
  transitionToNextGame(session: DraftSession, nextGameData: {
    blueSide: Team;
    redSide: Team;
    blueTeamName: string;
    redTeamName: string;
    fearlessBans: Champion[];
    gameNumber: number;
  }): void {
    console.log(`🔄 Transitioning session ${session.id} from Game ${session.gameNumber} to Game ${nextGameData.gameNumber}`);
    
    // Reset draft state but keep team connections
    session.blueReady = true; // Auto-ready for fearless draft
    session.redReady = true;
    session.inProgress = true; // Start immediately
    session.currentPhaseIndex = 0;
    
    // Clear picks and bans from previous game
    session.bluePicks = [];
    session.redPicks = [];
    session.blueBans = [];
    session.redBans = [];
    
    // Clear pending selections
    session.pendingChampion = null;
    session.pendingTeam = null;
    
    // Reset swap phase
    session.isSwapPhase = false;
    session.swapTimeLeft = 300; // 5 minutes
    session.canSwap = true;
    
    // Reset timer fields
    session.phaseStartTime = null;
    session.phaseTimeLeft = null;
    session.phaseTimerActive = false;
    
    // Reset post-draft state
    session.isPostDraft = false;
    session.blueSideChoice = null;
    session.redSideChoice = null;
    session.blueNextGameReady = false;
    session.redNextGameReady = false;
    
    // Update team names based on side choices
    session.blueTeamName = nextGameData.blueTeamName;
    session.redTeamName = nextGameData.redTeamName;
    
    // Update fearless draft data
    session.fearlessBans = nextGameData.fearlessBans;
    session.gameNumber = nextGameData.gameNumber;
    
    console.log(`✅ Session transitioned: Game ${session.gameNumber}, ${session.fearlessBans.length} fearless bans`);
  }

  /**
   * Create next game draft session data
   */
  createNextGameDraft(originalSession: DraftSession): { 
    nextGameDraftId: string; 
    blueSide: Team; 
    redSide: Team;
    blueTeamName: string;
    redTeamName: string;
    fearlessBans: Champion[];
    gameNumber: number;
  } {
    if (!originalSession.isPostDraft || !originalSession.blueNextGameReady || !originalSession.redNextGameReady) {
      throw new Error('Cannot create next game draft: teams not ready');
    }

    if (!originalSession.blueSideChoice || !originalSession.redSideChoice) {
      throw new Error('Cannot create next game draft: side choices not complete');
    }

    const nextGameDraftId = `${originalSession.id}-next`;
    
    // Determine which team gets which side in next game
    const blueSide = originalSession.blueSideChoice === 'BLUE' ? 'BLUE' : 'RED';
    const redSide = originalSession.redSideChoice === 'BLUE' ? 'BLUE' : 'RED';
    
    // Team names for next game (swap if sides are swapped)
    const blueTeamName = blueSide === 'BLUE' ? originalSession.blueTeamName : originalSession.redTeamName;
    const redTeamName = redSide === 'RED' ? originalSession.redTeamName : originalSession.blueTeamName;

    // Prepare fearless bans - combine previous fearless bans with current draft bans
    const currentDraftBans = [...originalSession.blueBans, ...originalSession.redBans];
    const fearlessBans = [...originalSession.fearlessBans, ...currentDraftBans];
    const gameNumber = originalSession.gameNumber + 1;

    console.log(`Creating next game draft:`, {
      originalId: originalSession.id,
      nextGameDraftId,
      blueSide,
      redSide,
      blueTeamName,
      redTeamName,
      fearlessBansCount: fearlessBans.length,
      gameNumber
    });

    return {
      nextGameDraftId,
      blueSide,
      redSide,
      blueTeamName,
      redTeamName,
      fearlessBans,
      gameNumber
    };
  }

  /**
   * Get current phase information
   */
  getCurrentPhaseInfo(session: DraftSession) {
    const phase = draftSequence[session.currentPhaseIndex];
    return {
      phase,
      phaseIndex: session.currentPhaseIndex,
      isComplete: session.currentPhaseIndex >= draftSequence.length,
      totalPhases: draftSequence.length
    };
  }

  /**
   * Get all selected/banned champions
   */
  getAllSelectedChampions(session: DraftSession): Champion[] {
    return [
      ...session.bluePicks,
      ...session.redPicks,
      ...session.blueBans,
      ...session.redBans
    ];
  }

  /**
   * Check if a champion is available for selection
   */
  isChampionAvailable(session: DraftSession, championId: string): boolean {
    const allSelected = this.getAllSelectedChampions(session);
    return !allSelected.some(c => c.id === championId);
  }

  /**
   * Create an empty champion for timeout cases
   */
  private createEmptyChampion(): Champion {
    return {
      id: 'empty',
      name: 'Empty Selection',
      title: 'Timed Out',
      image: '',
      roles: [],
      numericId: -1
    };
  }

  /**
   * Get draft statistics
   */
  getDraftStats(session: DraftSession) {
    return {
      totalBans: session.blueBans.length + session.redBans.length,
      totalPicks: session.bluePicks.length + session.redPicks.length,
      blueBans: session.blueBans.length,
      redBans: session.redBans.length,
      bluePicks: session.bluePicks.length,
      redPicks: session.redPicks.length,
      currentPhase: session.currentPhaseIndex,
      isComplete: session.currentPhaseIndex >= draftSequence.length,
      inProgress: session.inProgress
    };
  }
}
