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
    return session;
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
