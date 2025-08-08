// Timer management service - handles all draft timing logic
import { EventEmitter } from 'events';
import { DRAFT_CONFIG } from '@champ-draft-arena/shared';

export interface TimerEvents {
  phaseExpired: (draftId: string, phaseIndex: number) => void;
  swapPhaseUpdate: (draftId: string, timeLeft: number, canSwap: boolean) => void;
  swapPhaseComplete: (draftId: string) => void;
  timerStarted: (draftId: string, startTime: number, duration: number) => void;
  timerCleared: (draftId: string) => void;
}

export class TimerService extends EventEmitter {
  private phaseTimers = new Map<string, NodeJS.Timeout>();
  private swapTimers = new Map<string, NodeJS.Timeout>();
  private phaseStartTimes = new Map<string, number>(); // Track when phase timers started

  /**
   * Start a phase timer for a draft
   */
  startPhaseTimer(draftId: string, phaseIndex: number): void {
    // Clear any existing timer for this draft
    this.clearPhaseTimer(draftId);

    console.log(`Starting phase timer for draft ${draftId}, phase ${phaseIndex}`);

    const startTime = Date.now();
    this.phaseStartTimes.set(draftId, startTime);

    const timer = setTimeout(() => {
      this.clearPhaseTimer(draftId);
      this.emit('phaseExpired', draftId, phaseIndex);
    }, DRAFT_CONFIG.PHASE_TIMER_DURATION);

    this.phaseTimers.set(draftId, timer);

    // Emit timer started event with synchronization data
    this.emit('timerStarted', draftId, startTime, DRAFT_CONFIG.PHASE_TIMER_DURATION / 1000);
  }

  /**
   * Clear phase timer for a draft
   */
  clearPhaseTimer(draftId: string): void {
    const timer = this.phaseTimers.get(draftId);
    if (timer) {
      clearTimeout(timer);
      this.phaseTimers.delete(draftId);
      this.phaseStartTimes.delete(draftId);
      console.log(`Cleared phase timer for draft ${draftId}`);
      
      // Emit timer cleared event
      this.emit('timerCleared', draftId);
    }
  }

  /**
   * Start swap phase timer for a draft
   */
  startSwapPhaseTimer(draftId: string): void {
    // Clear any existing swap timer for this draft
    this.clearSwapTimer(draftId);

    console.log(`Starting swap phase timer for draft ${draftId}`);

    let timeLeft = DRAFT_CONFIG.SWAP_PHASE_DURATION;
    let canSwap = true;

    const timer = setInterval(() => {
      timeLeft--;

      // Disable swapping at the configured lock time
      if (timeLeft === DRAFT_CONFIG.SWAP_LOCK_TIME) {
        canSwap = false;
      }

      // Emit update
      this.emit('swapPhaseUpdate', draftId, timeLeft, canSwap);

      // Complete when time runs out
      if (timeLeft <= 0) {
        this.clearSwapTimer(draftId);
        this.emit('swapPhaseComplete', draftId);
      }
    }, 1000);

    this.swapTimers.set(draftId, timer);
  }

  /**
   * Clear swap timer for a draft
   */
  clearSwapTimer(draftId: string): void {
    const timer = this.swapTimers.get(draftId);
    if (timer) {
      clearInterval(timer);
      this.swapTimers.delete(draftId);
      console.log(`Cleared swap timer for draft ${draftId}`);
    }
  }

  /**
   * Clear all timers for a draft
   */
  clearAllTimers(draftId: string): void {
    this.clearPhaseTimer(draftId);
    this.clearSwapTimer(draftId);
  }

  /**
   * Check if a draft has active timers
   */
  hasActiveTimers(draftId: string): boolean {
    return this.phaseTimers.has(draftId) || this.swapTimers.has(draftId);
  }

  /**
   * Get active timer count
   */
  getActiveTimerCount(): { phase: number; swap: number } {
    return {
      phase: this.phaseTimers.size,
      swap: this.swapTimers.size
    };
  }

  /**
   * Get current timer state for synchronization
   */
  getTimerState(draftId: string): { phaseStartTime: number | null; phaseTimeLeft: number | null; phaseTimerActive: boolean } {
    const startTime = this.phaseStartTimes.get(draftId);
    const hasActiveTimer = this.phaseTimers.has(draftId);
    
    if (!startTime || !hasActiveTimer) {
      return {
        phaseStartTime: null,
        phaseTimeLeft: null,
        phaseTimerActive: false
      };
    }

    const elapsed = (Date.now() - startTime) / 1000;
    const timeLeft = Math.max(0, (DRAFT_CONFIG.PHASE_TIMER_DURATION / 1000) - elapsed);

    return {
      phaseStartTime: startTime,
      phaseTimeLeft: Math.ceil(timeLeft),
      phaseTimerActive: true
    };
  }

  /**
   * Cleanup all timers
   */
  destroy(): void {
    // Clear all phase timers
    for (const [draftId] of this.phaseTimers) {
      this.clearPhaseTimer(draftId);
    }

    // Clear all swap timers
    for (const [draftId] of this.swapTimers) {
      this.clearSwapTimer(draftId);
    }

    this.removeAllListeners();
  }
}

// Extend EventEmitter with proper typing
export interface TimerService {
  on<K extends keyof TimerEvents>(event: K, listener: TimerEvents[K]): this;
  emit<K extends keyof TimerEvents>(event: K, ...args: Parameters<TimerEvents[K]>): boolean;
}
