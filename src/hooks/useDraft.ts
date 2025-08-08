// Custom hook for draft functionality - connects socket service to store
import { useEffect, useCallback, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { useToast } from '@/components/ui/use-toast';
import { useDraftStore, selectDraftState, selectUIState } from '../stores/draftStore';
import { socketService } from '../services/socketService';
import { throttleWithImmediate } from '../utils/throttle';
import { 
  Champion, 
  Team, 
  resolveTeamSide 
} from '@champ-draft-arena/shared';

interface UseDraftOptions {
  draftId: string;
  teamFromUrl: string | null;
  autoConnect?: boolean;
}

export function useDraft({ draftId, teamFromUrl, autoConnect = true }: UseDraftOptions) {
  const navigate = useNavigate();
  const { toast } = useToast();
  
  // Store state and actions
  const draftState = useDraftStore(selectDraftState);
  const uiState = useDraftStore(selectUIState);
  const {
    setDraftState,
    setLoading,
    setError,
    setConnectionStatus,
    setReconnectAttempts,
    updatePendingSelection,
    clearPendingSelection,
    reorderTeamPicks,
    reset,
    getCurrentPhase,
    getAllSelectedChampions,
    isChampionSelected,
    canMakeSelection,
    getDraftProgress,
  } = useDraftStore();

  // Refs for stable references
  const currentTeamRef = useRef<Team | null>(null);
  const isInitializedRef = useRef(false);

  /**
   * Initialize the draft connection
   */
  const initializeDraft = useCallback(async () => {
    if (!draftId || !teamFromUrl || isInitializedRef.current) {
      return;
    }

    try {
      setLoading(true);
      setError(null);
      setConnectionStatus('connecting');

      // Get saved draft data from sessionStorage
      const savedDraftData = sessionStorage.getItem(`draft_${draftId}`);
      let blueTeamName = 'Blue Team';
      let redTeamName = 'Red Team';
      
      if (savedDraftData) {
        try {
          const draftData = JSON.parse(savedDraftData);
          if (draftData.blueTeamName && draftData.redTeamName) {
            blueTeamName = draftData.blueTeamName;
            redTeamName = draftData.redTeamName;
          }
        } catch (e) {
          console.error('Error parsing saved draft data:', e);
        }
      } else {
        // If no saved data, check URL parameters for team assignments
        const urlParams = new URLSearchParams(window.location.search);
        const blueFromUrl = urlParams.get('blue');
        const redFromUrl = urlParams.get('red');
        
        if (blueFromUrl && redFromUrl) {
          blueTeamName = decodeURIComponent(blueFromUrl);
          redTeamName = decodeURIComponent(redFromUrl);
          console.log('Using team names from URL parameters:', { blueTeamName, redTeamName });
        } else {
          console.log('No saved team data or URL parameters, server will handle team assignment dynamically');
        }
      }

      // Resolve team from URL
      const resolvedTeam = resolveTeamSide(teamFromUrl, { 
        blueTeamName, 
        redTeamName 
      } as any);

      if (resolvedTeam) {
        currentTeamRef.current = resolvedTeam;
      }

      // Connect to socket
      const socket = socketService.connect();
      console.log('🔌 Socket connection initiated:', { connected: socketService.isConnected() });
      
      // Wait for socket to connect before proceeding
      const waitForConnection = () => {
        if (socketService.isConnected()) {
          console.log('🎯 Socket connected, proceeding with draft operations');
          
          // Create/join draft
          socketService.createDraft(draftId, blueTeamName, redTeamName);
          
          // Small delay to ensure draft is created before joining
          setTimeout(() => {
            if (resolvedTeam) {
              socketService.joinDraft(draftId, resolvedTeam);
            } else {
              socketService.joinDraft(draftId, teamFromUrl);
            }
          }, 100);
        } else {
          console.log('⏳ Waiting for socket connection...');
          setTimeout(waitForConnection, 50);
        }
      };
      
      waitForConnection();

      isInitializedRef.current = true;
      setConnectionStatus('connected');

    } catch (error) {
      console.error('Error initializing draft:', error);
      setError('Failed to initialize draft. Please try again.');
      setConnectionStatus('error');
    } finally {
      setLoading(false);
    }
  }, [draftId, teamFromUrl, setLoading, setError, setConnectionStatus]);

  /**
   * Setup socket event listeners
   */
  useEffect(() => {
    if (!autoConnect) return;

    // Draft state updates
    const handleDraftStateUpdate = (newState: any) => {
      console.log('🔄 Client received draft state update:', {
        blueTeamName: newState.blueTeamName,
        redTeamName: newState.redTeamName,
        blueConnected: newState.blueConnected,
        redConnected: newState.redConnected,
        blueReady: newState.blueReady,
        redReady: newState.redReady
      });
      
      // Resolve team if not yet resolved
      if (!currentTeamRef.current && teamFromUrl) {
        const resolvedTeam = resolveTeamSide(teamFromUrl, newState);
        if (resolvedTeam) {
          currentTeamRef.current = resolvedTeam;
          socketService.joinDraft(draftId, resolvedTeam);
        }
      }

      setDraftState(newState);
    };

    // Draft completion
    const handleDraftComplete = (finalState: any) => {
      console.log('Draft completed:', finalState);
      setDraftState({ ...finalState, isDraftComplete: true });
      
      toast({
        title: 'Draft Complete!',
        description: 'The champion draft has been completed.',
      });
    };

    // Pending selection updates
    const handlePendingSelectionUpdate = ({ champion, team }: any) => {
      console.log('Pending selection update:', { champion: champion?.name, team });
      updatePendingSelection(champion, team);
    };

    // Team reorder events
    const handleTeamReorder = ({ team, sourceIndex, targetIndex }: any) => {
      console.log('Team reorder:', { team, sourceIndex, targetIndex });
      reorderTeamPicks(team, sourceIndex, targetIndex);
    };

    // Timer expired events
    const handleTimerExpired = ({ currentPhase }: any) => {
      console.log('Timer expired for phase:', currentPhase);
      // The server will handle auto-selection, just log for now
    };

    // Error handling
    const handleError = ({ message, code }: any) => {
      console.error('Socket error:', { message, code });
      setError(message);
      toast({
        title: 'Error',
        description: message,
        variant: 'destructive',
      });
    };

    // Initialize draft first (this connects the socket)
    initializeDraft();

    // Setup listeners after socket connection
    setTimeout(() => {
      socketService.onDraftStateUpdate(handleDraftStateUpdate);
      socketService.onDraftComplete(handleDraftComplete);
      socketService.onPendingSelectionUpdate(handlePendingSelectionUpdate);
      socketService.onTeamReorder(handleTeamReorder);
      socketService.onTimerExpired(handleTimerExpired);
      socketService.onError(handleError);
    }, 100);

    // Cleanup function
    return () => {
      socketService.offDraftStateUpdate(handleDraftStateUpdate);
      socketService.offDraftComplete(handleDraftComplete);
      socketService.offPendingSelectionUpdate(handlePendingSelectionUpdate);
      socketService.offTeamReorder(handleTeamReorder);
      socketService.offTimerExpired(handleTimerExpired);
      socketService.offError(handleError);
    };
  }, [draftId, teamFromUrl, autoConnect, initializeDraft, setDraftState, updatePendingSelection, reorderTeamPicks, setError, toast]);

  /**
   * Cleanup on unmount
   */
  useEffect(() => {
    return () => {
      console.log('Draft hook unmounting - disconnecting socket');
      socketService.disconnect();
      reset();
    };
  }, [reset]);

  // Action handlers
  const toggleReady = useCallback(() => {
    const team = currentTeamRef.current;
    if (!draftId || !team || team === 'SPECTATOR' || team === 'BROADCAST') {
      return;
    }
    
    socketService.toggleReady(draftId, team);
  }, [draftId]);

  const selectChampion = useCallback((champion: Champion) => {
    const team = currentTeamRef.current;
    if (!draftId || !team || team === 'SPECTATOR' || team === 'BROADCAST') {
      return;
    }

    if (!canMakeSelection(team)) {
      toast({
        title: 'Not your turn',
        description: 'Wait for your turn to select a champion',
        variant: 'destructive',
      });
      return;
    }

    socketService.selectChampion(draftId, champion, team);
    clearPendingSelection();
  }, [draftId, canMakeSelection, toast, clearPendingSelection]);

  // Create throttled version for socket calls to prevent spam
  const throttledSocketPendingSelection = useCallback(
    throttleWithImmediate(
      // Immediate UI update - runs every time for responsive feel
      (champion: Champion, team: Team) => {
        updatePendingSelection(champion, team);
      },
      // Throttled socket call - prevents server spam
      (champion: Champion, team: Team) => {
        socketService.setPendingSelection(draftId, champion, team);
      },
      150 // 150ms throttle - allows max ~6-7 updates per second
    ),
    [draftId, updatePendingSelection]
  );

  const setPendingSelection = useCallback((champion: Champion) => {
    const team = currentTeamRef.current;
    if (!draftId || !team || team === 'SPECTATOR' || team === 'BROADCAST') {
      return;
    }

    if (!canMakeSelection(team)) {
      toast({
        title: 'Not your turn',
        description: 'Wait for your turn to select a champion',
        variant: 'destructive',
      });
      return;
    }

    // Use throttled version to prevent UI lag and server spam
    throttledSocketPendingSelection(champion, team);
  }, [draftId, canMakeSelection, toast, throttledSocketPendingSelection]);

  const confirmSelection = useCallback(() => {
    if (draftState.pendingChampion) {
      selectChampion(draftState.pendingChampion);
    }
  }, [draftState.pendingChampion, selectChampion]);

  const reorderTeam = useCallback((team: Team, sourceIndex: number, targetIndex: number) => {
    if (!draftId || !uiState.isDraftComplete) {
      return;
    }
    
    socketService.reorderTeam(draftId, team, sourceIndex, targetIndex);
  }, [draftId, uiState.isDraftComplete]);

  return {
    // State
    draftState,
    uiState,
    currentTeam: currentTeamRef.current,
    
    // Computed values
    currentPhase: getCurrentPhase(),
    allSelectedChampions: getAllSelectedChampions(),
    draftProgress: getDraftProgress(),
    
    // Actions
    toggleReady,
    selectChampion,
    setPendingSelection,
    confirmSelection,
    reorderTeam,
    
    // Utilities
    isChampionSelected,
    canMakeSelection: (team: Team) => canMakeSelection(team),
    
    // Connection utilities
    reconnect: initializeDraft,
    disconnect: socketService.disconnect.bind(socketService),
  };
}
