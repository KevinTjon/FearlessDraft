// Centralized draft state management using Zustand
import { create } from 'zustand';
import { subscribeWithSelector } from 'zustand/middleware';
import { 
  DraftSession, 
  Champion, 
  Team, 
  draftSequence 
} from '@champ-draft-arena/shared';

interface DraftStore extends DraftSession {
  // UI state
  isLoading: boolean;
  error: string | null;
  isDraftComplete: boolean;
  
  // Connection state
  connectionStatus: 'connecting' | 'connected' | 'disconnected' | 'error';
  reconnectAttempts: number;
  
  // Actions
  setDraftState: (state: Partial<DraftSession>) => void;
  setLoading: (loading: boolean) => void;
  setError: (error: string | null) => void;
  setConnectionStatus: (status: DraftStore['connectionStatus']) => void;
  setReconnectAttempts: (attempts: number) => void;
  updatePendingSelection: (champion: Champion | null, team: Team) => void;
  clearPendingSelection: () => void;
  reorderTeamPicks: (team: Team, sourceIndex: number, targetIndex: number) => void;
  reset: () => void;
  
  // Selectors (computed values)
  getCurrentPhase: () => typeof draftSequence[number] | null;
  getAllSelectedChampions: () => Champion[];
  isChampionSelected: (championId: string) => boolean;
  canMakeSelection: (team: Team) => boolean;
  getDraftProgress: () => { current: number; total: number; percentage: number };
}

const initialState: Omit<DraftStore, 'setDraftState' | 'setLoading' | 'setError' | 'setConnectionStatus' | 'setReconnectAttempts' | 'updatePendingSelection' | 'clearPendingSelection' | 'reorderTeamPicks' | 'reset' | 'getCurrentPhase' | 'getAllSelectedChampions' | 'isChampionSelected' | 'canMakeSelection' | 'getDraftProgress'> = {
  id: '',
  blueTeamName: 'Blue Team',
  redTeamName: 'Red Team',
  blueReady: false,
  redReady: false,
  inProgress: false,
  currentPhaseIndex: 0,
  bluePicks: [],
  redPicks: [],
  blueBans: [],
  redBans: [],
  createdAt: '',
  blueConnected: false,
  redConnected: false,
  pendingChampion: null,
  pendingTeam: null,
  isSwapPhase: false,
  swapTimeLeft: 60,
  canSwap: true,
  
  // Timer synchronization fields
  phaseStartTime: null,
  phaseTimeLeft: null,
  phaseTimerActive: false,
  
  // Post-draft next game preparation fields
  isPostDraft: false,
  blueSideChoice: null,
  redSideChoice: null,
  blueNextGameReady: false,
  redNextGameReady: false,
  
  // Fearless Draft system
  fearlessBans: [],
  gameNumber: 1,
  
  // UI state
  isLoading: true,
  error: null,
  isDraftComplete: false,
  
  // Connection state
  connectionStatus: 'connecting',
  reconnectAttempts: 0,
};

export const useDraftStore = create<DraftStore>()(
  subscribeWithSelector((set, get) => ({
    ...initialState,

    setDraftState: (state) => {
      set((current) => {
        console.log('🏪 DraftStore setDraftState called:', {
          incomingGameNumber: state.gameNumber,
          incomingFearlessBansCount: state.fearlessBans?.length || 0,
          currentGameNumber: current.gameNumber,
          currentFearlessBansCount: current.fearlessBans?.length || 0,
          incomingKeys: Object.keys(state)
        });
        
        const newState = { ...current, ...state };
        
        console.log('🏪 DraftStore after merge:', {
          finalGameNumber: newState.gameNumber,
          finalFearlessBansCount: newState.fearlessBans?.length || 0
        });
        
        // Update isDraftComplete based on phase index
        if (state.currentPhaseIndex !== undefined) {
          newState.isDraftComplete = state.currentPhaseIndex >= draftSequence.length;
        }
        
        // Transition to post-draft phase when swap phase ends
        if (newState.isDraftComplete && !newState.isSwapPhase && !newState.isPostDraft) {
          newState.isPostDraft = true;
        }
        
        return newState;
      });
    },

    setLoading: (loading) => set({ isLoading: loading }),
    
    setError: (error) => set({ error }),
    
    setConnectionStatus: (status) => set({ connectionStatus: status }),
    
    setReconnectAttempts: (attempts) => set({ reconnectAttempts: attempts }),

    updatePendingSelection: (champion, team) => 
      set({ pendingChampion: champion, pendingTeam: champion ? team : null }),

    clearPendingSelection: () => 
      set({ pendingChampion: null, pendingTeam: null }),

    reorderTeamPicks: (team, sourceIndex, targetIndex) => {
      set((state) => {
        const picks = team === 'BLUE' ? [...state.bluePicks] : [...state.redPicks];
        
        // Perform swap
        const temp = picks[sourceIndex];
        picks[sourceIndex] = picks[targetIndex];
        picks[targetIndex] = temp;
        
        return {
          ...state,
          bluePicks: team === 'BLUE' ? picks : state.bluePicks,
          redPicks: team === 'RED' ? picks : state.redPicks,
        };
      });
    },

    reset: () => set(initialState),

    // Selectors
    getCurrentPhase: () => {
      const state = get();
      return draftSequence[state.currentPhaseIndex] || null;
    },

    getAllSelectedChampions: () => {
      const state = get();
      return [
        ...state.bluePicks,
        ...state.redPicks,
        ...state.blueBans,
        ...state.redBans,
      ];
    },

    isChampionSelected: (championId) => {
      const selectedChampions = get().getAllSelectedChampions();
      return selectedChampions.some(c => c.id === championId);
    },

    canMakeSelection: (team) => {
      const state = get();
      if (!state.inProgress || state.isDraftComplete) return false;
      
      const currentPhase = get().getCurrentPhase();
      return currentPhase?.team === team;
    },

    getDraftProgress: () => {
      const state = get();
      const current = Math.min(state.currentPhaseIndex, draftSequence.length);
      const total = draftSequence.length;
      const percentage = (current / total) * 100;
      
      return { current, total, percentage };
    },
  }))
);

// Selectors for better performance (prevents unnecessary re-renders)
export const selectDraftState = (state: DraftStore) => ({
  id: state.id,
  blueTeamName: state.blueTeamName,
  redTeamName: state.redTeamName,
  blueReady: state.blueReady,
  redReady: state.redReady,
  inProgress: state.inProgress,
  currentPhaseIndex: state.currentPhaseIndex,
  bluePicks: state.bluePicks,
  redPicks: state.redPicks,
  blueBans: state.blueBans,
  redBans: state.redBans,
  blueConnected: state.blueConnected,
  redConnected: state.redConnected,
  pendingChampion: state.pendingChampion,
  pendingTeam: state.pendingTeam,
  isSwapPhase: state.isSwapPhase,
  swapTimeLeft: state.swapTimeLeft,
  canSwap: state.canSwap,
  // Timer synchronization fields
  phaseStartTime: state.phaseStartTime,
  phaseTimeLeft: state.phaseTimeLeft,
  phaseTimerActive: state.phaseTimerActive,
  // Post-draft next game preparation fields
  isPostDraft: state.isPostDraft,
  blueSideChoice: state.blueSideChoice,
  redSideChoice: state.redSideChoice,
  blueNextGameReady: state.blueNextGameReady,
  redNextGameReady: state.redNextGameReady,
  // Fearless Draft fields
  fearlessBans: state.fearlessBans,
  gameNumber: state.gameNumber,
});

export const selectUIState = (state: DraftStore) => ({
  isLoading: state.isLoading,
  error: state.error,
  isDraftComplete: state.isDraftComplete,
  connectionStatus: state.connectionStatus,
  reconnectAttempts: state.reconnectAttempts,
});

export const selectTeamState = (team: Team) => (state: DraftStore) => ({
  teamName: team === 'BLUE' ? state.blueTeamName : state.redTeamName,
  ready: team === 'BLUE' ? state.blueReady : state.redReady,
  connected: team === 'BLUE' ? state.blueConnected : state.redConnected,
  picks: team === 'BLUE' ? state.bluePicks : state.redPicks,
  bans: team === 'BLUE' ? state.blueBans : state.redBans,
});
