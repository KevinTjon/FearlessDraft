import { useState, useEffect, useRef } from "react";
import { useParams, useSearchParams, useNavigate } from "react-router-dom";
import { useToast } from "@/components/ui/use-toast";
import { Button } from "@/components/ui/button";
import { Shield, UserCheck, RefreshCw, Trophy } from "lucide-react";
import ChampionGrid from "../components/ChampionGrid";
import TeamComposition from "../components/TeamComposition";
import BanPhase from "../components/BanPhase";
import PhaseIndicator from "../components/PhaseIndicator";
import DraftTimer from "../components/DraftTimer";
import { champions } from "../data/champions";
import { Champion } from "../data/types";
import { DEFAULT_CHAMPION_ICON } from "../data/staticChampions";
import { draftSequence, Team, DraftSlot, positions } from "../data/draftTypes";
import { socketService } from "../services/socket";
import { Alert, AlertDescription } from "@/components/ui/alert";

interface DraftState {
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
}

const Draft = () => {
  const { draftId } = useParams();
  const [searchParams] = useSearchParams();
  const team = searchParams.get("team")?.toUpperCase() as Team | null;
  const navigate = useNavigate();
  const { toast } = useToast();

  // Draft state
  const [draftState, setDraftState] = useState<DraftState | null>(null);
  const [isDraftComplete, setIsDraftComplete] = useState(false);
  const [isSwapPhase, setIsSwapPhase] = useState(false);
  const [swapTimeLeft, setSwapTimeLeft] = useState(60);
  const [canSwap, setCanSwap] = useState(true);
  const lastHandledPhase = useRef<number>(-1);
  const pendingTimeUp = useRef<boolean>(false);
  const latestDraftState = useRef<DraftState | null>(null);
  const timeoutLockKey = useRef<string | null>(null);
  const previousPhase = useRef<number>(-1);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!draftId || !team) {
      console.log("No draftId or team provided");
      // Only redirect if the draft isn't complete
      if (!isDraftComplete) {
        navigate('/');
      }
      return;
    }

    console.log("Initializing draft with:", { draftId, team });

    // Get saved draft data from sessionStorage
    const savedDraftData = sessionStorage.getItem(`draft_${draftId}`);
    let blueTeamName = "Blue Team";
    let redTeamName = "Red Team";
    
    if (savedDraftData) {
      try {
        const draftData = JSON.parse(savedDraftData);
        if (draftData.blueTeamName && draftData.redTeamName) {
          blueTeamName = draftData.blueTeamName;
          redTeamName = draftData.redTeamName;
          console.log("Using saved team names:", { blueTeamName, redTeamName });
        }
      } catch (e) {
        console.error("Error parsing draft data:", e);
      }
    }

    try {
      // Connect to WebSocket and create/join draft
      console.log("Attempting to connect to socket...");
      const socket = socketService.connect();
      
      console.log("Creating draft...");
      socketService.createDraft(draftId, blueTeamName, redTeamName);
      
      // Small delay to ensure draft is created before joining
      setTimeout(() => {
        console.log("Joining draft...");
        socketService.joinDraft(draftId, team);
      }, 100);

      // Listen for socket connection errors
      socket.on('connect_error', (error) => {
        console.error("Socket connection error:", error);
        setError("Unable to connect to draft server. Please check your connection and try again.");
        setIsLoading(false);
      });

      socket.on('connect', () => {
        console.log("Socket connected successfully");
      });

    } catch (error) {
      console.error("Error setting up socket connection:", error);
      setError("An error occurred while setting up the draft. Please try again.");
      setIsLoading(false);
    }

    // Listen for timer expiry
    socketService.onTimerExpired(({ currentPhase }) => {
      console.log('Timer expired for phase:', currentPhase);
      if (currentPhase === latestDraftState.current?.currentPhaseIndex) {
        handleTimeUp();
      }
    });

    // Listen for draft state updates
    socketService.onDraftStateUpdate((newState) => {
      console.log("%%%% EXECUTING LATEST onDraftStateUpdate HANDLER %%%%"); 

      // If draft is already complete, don't process any more state updates
      if (isDraftComplete) {
        console.log("Draft is complete, ignoring state update");
        return;
      }

      console.log("Received draft state update:", {
        pendingChampion: newState.pendingChampion?.name,
        pendingTeam: newState.pendingTeam,
        currentPhase: newState.currentPhaseIndex,
        currentTeam: team,
        previousPhaseIndex: latestDraftState.current?.currentPhaseIndex,
        lastHandledPhaseValue: lastHandledPhase.current,
        pendingTimeUpFlag: pendingTimeUp.current
      });

      const previousPhaseIndex = latestDraftState.current?.currentPhaseIndex;

      // Only clear pendingTimeUp if this update is for our auto-confirmed phase
      if (previousPhaseIndex !== undefined && 
          newState.currentPhaseIndex > previousPhaseIndex && 
          previousPhaseIndex === lastHandledPhase.current && 
          pendingTimeUp.current) {
        console.log(`Phase advanced from ${previousPhaseIndex} to ${newState.currentPhaseIndex}, clearing pendingTimeUp flag.`);
        pendingTimeUp.current = false;
        lastHandledPhase.current = newState.currentPhaseIndex - 1;
      }

      latestDraftState.current = newState;
      setDraftState(newState);

      console.log("Updated draft state from server:", {
         pendingChampion: newState.pendingChampion?.name,
         pendingTeam: newState.pendingTeam,
         phase: newState.currentPhaseIndex,
         pendingTimeUpFlagAfterUpdate: pendingTimeUp.current
      });
    });

    // Listen for draft completion
    socketService.onDraftComplete((finalState) => {
      console.log("Draft complete - setting final state");
      setDraftState(finalState);
      setIsDraftComplete(true);
      pendingTimeUp.current = false;
      latestDraftState.current = finalState;
      
      // Disconnect socket after draft completion
      socketService.disconnect();
      
      toast({
        title: "Draft Complete!",
        description: "The champion draft has been completed."
      });
    });

    // Listen for pending selection updates
    socketService.onPendingSelectionUpdate(({ champion, team: selectingTeam }) => {
      console.log("Received pending selection update:", { 
        champion: champion?.name, 
        selectingTeam,
        currentTeam: team,
        currentDraftState: draftState,
        pendingTimeUp: pendingTimeUp.current
      });

      // Update draft state directly based on previous state
      setDraftState(prev => {
        if (!prev) return prev;
        
        const updatedState = {
          ...prev,
          pendingChampion: champion,
          pendingTeam: selectingTeam
        };
        
        console.log("Updated draft state:", {
          pendingChampion: updatedState.pendingChampion?.name,
          pendingTeam: updatedState.pendingTeam,
          currentPhase: updatedState.currentPhaseIndex,
          pendingTimeUp: pendingTimeUp.current
        });
        
        latestDraftState.current = updatedState;
        return updatedState;
      });
    });

    // Listen for team reorder events
    socketService.onTeamReorder(({ team: reorderTeam, sourceIndex, targetIndex }) => {
      setDraftState(prev => {
        if (!prev) return prev;
        
        const picks = reorderTeam === "BLUE" ? [...prev.bluePicks] : [...prev.redPicks];
        
        // Perform direct swap
        const temp = picks[sourceIndex];
        picks[sourceIndex] = picks[targetIndex];
        picks[targetIndex] = temp;
        
        return {
          ...prev,
          bluePicks: reorderTeam === "BLUE" ? picks : prev.bluePicks,
          redPicks: reorderTeam === "RED" ? picks : prev.redPicks
        };
      });
    });

    // Cleanup on unmount
    return () => {
      console.log("%%%% Draft Component Unmounting - Disconnecting Socket %%%%");
      socketService.disconnect();
    };
  }, [draftId, team, navigate, toast, isDraftComplete]);

  useEffect(() => {
    if (!draftState) return;

    // Clear lock if phase advanced
    if (draftState.currentPhaseIndex > previousPhase.current) {
      console.log('Phase advanced, clearing lock:', {
        from: previousPhase.current,
        to: draftState.currentPhaseIndex,
        hadLock: !!timeoutLockKey.current
      });
      timeoutLockKey.current = null;
      pendingTimeUp.current = false;
    }
    
    previousPhase.current = draftState.currentPhaseIndex;
  }, [draftState?.currentPhaseIndex]);

  const toggleReady = () => {
    if (!draftId || !team) return;
    
    // Spectators and broadcast viewers cannot toggle ready state
    if (team === 'SPECTATOR' || team === 'BROADCAST') {
      return;
    }
    
    socketService.toggleReady(draftId, team);
  };

  const handleChampionSelect = (champion: Champion) => {
    const currentDraftState = latestDraftState.current;
    if (!draftId || !team || !currentDraftState || !currentDraftState.inProgress) return;

    // Spectators and broadcast viewers cannot make selections
    if (team === 'SPECTATOR' || team === 'BROADCAST') {
      return;
    }

    const currentPhase = draftSequence[currentDraftState.currentPhaseIndex];
    if (currentPhase.team !== team) {
      toast({
        title: "Not your turn",
        description: "Wait for your turn to select a champion",
        variant: "destructive"
      });
      return;
    }

    console.log('Sending champion selection:', {
      champion: champion.name,
      team,
      phase: currentPhase.type,
      phaseIndex: currentDraftState.currentPhaseIndex
    });

    socketService.selectChampion(draftId, champion, team);
    
    console.log('Clearing local states after selection:', {
      hadPendingLocal: !!currentDraftState.pendingChampion,
      hadPendingDraft: !!currentDraftState.pendingChampion
    });

    // Clear both local and draft state
    setDraftState(prev => prev ? {
      ...prev,
      pendingChampion: null,
      pendingTeam: null
    } : prev);
    if (latestDraftState.current) {
        latestDraftState.current.pendingChampion = null;
        latestDraftState.current.pendingTeam = null;
    }
    pendingTimeUp.current = false;
  };

  const handlePendingSelect = (champion: Champion) => {
    const currentDraftState = latestDraftState.current;
    if (!draftId || !team || !currentDraftState || !currentDraftState.inProgress) return;

    // Spectators and broadcast viewers cannot make selections
    if (team === 'SPECTATOR' || team === 'BROADCAST') {
      return;
    }

    const currentPhase = draftSequence[currentDraftState.currentPhaseIndex];
    if (currentPhase.team !== team) {
      toast({
        title: "Not your turn",
        description: "Wait for your turn to select a champion",
        variant: "destructive"
      });
      return;
    }

    // Update draft state directly
    setDraftState(prev => {
        if (!prev) return prev;
        const updated = {
            ...prev,
            pendingChampion: champion,
            pendingTeam: team
        };
        latestDraftState.current = updated;
        return updated;
    });

    socketService.setPendingSelection(draftId, champion, team);
  };

  const handleConfirmSelection = () => {
    const pendingToConfirm = latestDraftState.current?.pendingChampion;
    if (!pendingToConfirm) {
      console.warn("Confirm selection called with no pending champion in ref.");
      return;
    }

    handleChampionSelect(pendingToConfirm);
  };

  const handleTimeUp = () => {
    // If we already have a lock, don't allow another timeout
    if (timeoutLockKey.current) {
      console.log('Timer expired but lock is already taken:', {
        currentPhase: latestDraftState.current?.currentPhaseIndex,
        previousPhase: previousPhase.current
      });
      return null;
    }

    const currentDraftState = latestDraftState.current;
    if (!draftId || !team || !currentDraftState || isDraftComplete) {
      console.log("handleTimeUp: Aborting - invalid state or draft complete.", { 
        draftId, 
        team, 
        currentDraftState, 
        isDraftComplete,
        currentPhase: currentDraftState?.currentPhaseIndex,
        previousPhase: previousPhase.current
      });
      return null;
    }

    const currentPhaseIndex = currentDraftState.currentPhaseIndex;
    const currentPhase = draftSequence[currentPhaseIndex];
    if (!currentPhase) {
      console.error(`handleTimeUp: No phase definition found for index ${currentPhaseIndex}`);
      return null;
    }

    const isMyTurn = currentPhase.team === team;

    console.log(`handleTimeUp: Processing Phase ${currentPhaseIndex}`, {
      pendingChampion: currentDraftState.pendingChampion?.name,
      pendingTeam: currentDraftState.pendingTeam,
      myTeam: team,
      currentPickingTeam: currentPhase.team,
      isMyTurn,
      phaseType: currentPhase.type
    });

    if (!isMyTurn) {
      console.log('Timer up - Not my turn. Waiting for opponent action.');
      pendingTimeUp.current = false;
      return null;
    }

    // Generate a unique lock key
    const key = `${Date.now()}-${Math.random()}`;
    timeoutLockKey.current = key;

    if (currentDraftState.pendingChampion && currentDraftState.pendingTeam === team) {
      // If there's a pending champion, confirm it
      console.log('Timer up - Auto-confirming pending selection:', {
        champion: currentDraftState.pendingChampion.name,
        team: team,
        phaseIndex: currentPhaseIndex,
        key: key
      });
      
      socketService.selectChampion(draftId, currentDraftState.pendingChampion, team);
    } else {
      // If no champion is selected, create an empty champion and select it
      const emptyChampion: Champion = {
        id: 'empty',
        name: '',
        title: '',
        image: DEFAULT_CHAMPION_ICON,
        roles: [],
        numericId: -1
      };
      console.log('Timer up - No selection made, using empty champion');
      socketService.selectChampion(draftId, emptyChampion, team);
    }

    // Set flag to indicate we're waiting for the server to confirm the selection
    pendingTimeUp.current = true;
    lastHandledPhase.current = currentPhaseIndex;

    // Clear pending states after selection is sent
    setDraftState(prev => {
      if (!prev || prev.currentPhaseIndex !== currentPhaseIndex) return prev;
      const updated = { ...prev, pendingChampion: null, pendingTeam: null };
      latestDraftState.current = updated;
      return updated;
    });

    return key;
  };

  useEffect(() => {
    // Validate champions list
    if (!champions || champions.length === 0) {
      setError("Champions list is not available");
      setIsLoading(false);
      return;
    }

    // Get saved draft data for team names
    const savedDraftData = sessionStorage.getItem(`draft_${draftId}`);
    let blueTeamName = "Blue Team";
    let redTeamName = "Red Team";
    
    if (savedDraftData) {
      try {
        const draftData = JSON.parse(savedDraftData);
        if (draftData.blueTeamName && draftData.redTeamName) {
          blueTeamName = draftData.blueTeamName;
          redTeamName = draftData.redTeamName;
        }
      } catch (e) {
        console.error("Error parsing draft data:", e);
      }
    }

    // Initialize draft state with saved team names
    const initialState: DraftState = {
      id: draftId || '',
      blueTeamName: blueTeamName,
      redTeamName: redTeamName,
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
      swapTimeLeft: 60,
      canSwap: true
    };
    setDraftState(initialState);
    setIsLoading(false);
  }, [draftId]);

  // Add new functions to handle reordering
  const handleBlueTeamReorder = (sourceIndex: number, targetIndex: number) => {
    if (!isDraftComplete || !draftId) return;
    
    // Send reorder event through socket
    socketService.reorderTeam(draftId, "BLUE", sourceIndex, targetIndex);
  };

  const handleRedTeamReorder = (sourceIndex: number, targetIndex: number) => {
    if (!isDraftComplete || !draftId) return;
    
    // Send reorder event through socket
    socketService.reorderTeam(draftId, "RED", sourceIndex, targetIndex);
  };

  // Effect to handle swap phase timer
  useEffect(() => {
    if (isDraftComplete && !isSwapPhase) {
      setIsSwapPhase(true);
      setSwapTimeLeft(60);
      setCanSwap(true);
    }

    if (isSwapPhase) {
      const timer = setInterval(() => {
        setSwapTimeLeft((prev) => {
          if (prev <= 0) return 0;
          if (prev === 20) setCanSwap(false);
          return prev - 1;
        });
      }, 1000);

      return () => clearInterval(timer);
    }
  }, [isDraftComplete, isSwapPhase]);

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-lol-dark">
        <div className="flex flex-col items-center">
          <RefreshCw className="animate-spin h-8 w-8 text-lol-gold mb-4" />
          <p className="text-lol-text">Loading draft session...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <Alert variant="destructive" className="m-4">
        <AlertDescription>{error}</AlertDescription>
      </Alert>
    );
  }

  if (!draftState) {
    return (
      <Alert variant="destructive" className="m-4">
        <AlertDescription>Unable to initialize draft state. Please refresh the page.</AlertDescription>
      </Alert>
    );
  }

  // Show ready screen if draft hasn't started
  if (!draftState.inProgress && !isDraftComplete) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-lol-dark p-4">
        <div className="w-full max-w-4xl bg-black/40 border border-lol-gold/20 rounded-xl p-8">
          {/* Header */}
          <div className="text-center mb-8">
            <h1 className="text-4xl font-bold text-lol-gold mb-2">Champion Draft</h1>
            <p className="text-lol-text/70">Session ID: {draftId}</p>
          </div>
          
          {/* Teams Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-8">
            {/* Blue Team Card */}
            <div className={`p-6 rounded-lg border ${draftState.blueConnected ? 'border-blue-500/30' : 'border-gray-500/30'} 
              ${draftState.blueReady ? 'bg-blue-900/30' : 'bg-black/40'} transition-colors duration-300`}>
              <div className="flex items-center justify-between mb-6">
                <div className="flex items-center gap-3">
                  <Shield className={`h-6 w-6 ${draftState.blueConnected ? 'text-blue-400' : 'text-gray-400'}`} />
                  <h2 className={`text-2xl font-semibold ${draftState.blueConnected ? 'text-blue-400' : 'text-gray-400'}`}>
                    {draftState.blueTeamName}
                  </h2>
                </div>
                <div className={`flex items-center gap-2 px-3 py-1.5 rounded-full text-sm
                  ${draftState.blueConnected ? 'bg-green-900/30 text-green-400' : 'bg-red-900/30 text-red-400'}`}>
                  <div className={`w-2 h-2 rounded-full ${draftState.blueConnected ? 'bg-green-400 animate-pulse' : 'bg-red-400'}`} />
                  <span>{draftState.blueConnected ? 'Connected' : 'Disconnected'}</span>
                </div>
              </div>
              
              <div className="space-y-4">
                <div className="flex flex-col items-center">
                  {draftState.blueConnected ? (
                    <>
                      {draftState.blueReady ? (
                        <div className="w-full flex items-center justify-center text-green-400 bg-green-900/20 px-4 py-2.5 rounded-lg">
                          <UserCheck className="h-5 w-5 mr-2" />
                          <span className="font-medium">Ready to Draft</span>
                        </div>
                      ) : (
                        <div className="w-full flex items-center justify-center text-lol-text/50 bg-black/20 px-4 py-2.5 rounded-lg border border-lol-gold/5">
                          <span className="font-medium">Awaiting Ready Status</span>
                        </div>
                      )}
                      {team === 'BLUE' && (
                        <Button
                          variant={draftState.blueReady ? "destructive" : "default"}
                          onClick={toggleReady}
                          className={`w-full mt-3 ${!draftState.blueReady ? 'bg-blue-600 hover:bg-blue-500 text-white' : ''}`}
                        >
                          {draftState.blueReady ? "Cancel Ready" : "Ready Up"}
                        </Button>
                      )}
                    </>
                  ) : (
                    <div className="w-full text-red-400/70 text-center bg-red-950/30 px-4 py-3 rounded-lg">
                      <p>Waiting for captain to connect...</p>
                    </div>
                  )}
                </div>
              </div>
            </div>

            {/* Red Team Card */}
            <div className={`p-6 rounded-lg border ${draftState.redConnected ? 'border-red-500/30' : 'border-gray-500/30'} 
              ${draftState.redReady ? 'bg-red-900/30' : 'bg-black/40'} transition-colors duration-300`}>
              <div className="flex items-center justify-between mb-6">
                <div className="flex items-center gap-3">
                  <Shield className={`h-6 w-6 ${draftState.redConnected ? 'text-red-400' : 'text-gray-400'}`} />
                  <h2 className={`text-2xl font-semibold ${draftState.redConnected ? 'text-red-400' : 'text-gray-400'}`}>
                    {draftState.redTeamName}
                  </h2>
                </div>
                <div className={`flex items-center gap-2 px-3 py-1.5 rounded-full text-sm
                  ${draftState.redConnected ? 'bg-green-900/30 text-green-400' : 'bg-red-900/30 text-red-400'}`}>
                  <div className={`w-2 h-2 rounded-full ${draftState.redConnected ? 'bg-green-400 animate-pulse' : 'bg-red-400'}`} />
                  <span>{draftState.redConnected ? 'Connected' : 'Disconnected'}</span>
                </div>
              </div>
              
              <div className="space-y-4">
                <div className="flex flex-col items-center">
                  {draftState.redConnected ? (
                    <>
                      {draftState.redReady ? (
                        <div className="w-full flex items-center justify-center text-green-400 bg-green-900/20 px-4 py-2.5 rounded-lg">
                          <UserCheck className="h-5 w-5 mr-2" />
                          <span className="font-medium">Ready to Draft</span>
                        </div>
                      ) : (
                        <div className="w-full flex items-center justify-center text-lol-text/50 bg-black/20 px-4 py-2.5 rounded-lg border border-lol-gold/5">
                          <span className="font-medium">Awaiting Ready Status</span>
                        </div>
                      )}
                      {team === 'RED' && (
                        <Button
                          variant={draftState.redReady ? "destructive" : "default"}
                          onClick={toggleReady}
                          className={`w-full mt-3 ${!draftState.redReady ? 'bg-red-600 hover:bg-red-500 text-white' : ''}`}
                        >
                          {draftState.redReady ? "Cancel Ready" : "Ready Up"}
                        </Button>
                      )}
                    </>
                  ) : (
                    <div className="w-full text-red-400/70 text-center bg-red-950/30 px-4 py-3 rounded-lg">
                      <p>Waiting for captain to connect...</p>
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>

          {/* Status Section */}
          <div className="space-y-6">
            {/* Draft Status */}
            <div className="text-center">
              {draftState.blueReady && draftState.redReady ? (
                <div className="inline-flex items-center gap-2 bg-green-900/20 text-green-400 px-6 py-3 rounded-lg">
                  <Trophy className="h-5 w-5" />
                  <p className="font-medium">Both teams are ready! Starting draft...</p>
                </div>
              ) : (
                <div className="space-y-2">
                  <div className="inline-flex items-center gap-2 px-6 py-3 rounded-lg bg-blue-900/20 text-blue-300">
                    <p className="font-medium">
                      {!draftState.blueConnected || !draftState.redConnected ? (
                        "Waiting for both captains to connect..."
                      ) : !draftState.blueReady && !draftState.redReady ? (
                        "Waiting for both teams to ready up"
                      ) : !draftState.blueReady ? (
                        `Waiting for ${draftState.blueTeamName} to ready up`
                      ) : (
                        `Waiting for ${draftState.redTeamName} to ready up`
                      )}
                    </p>
                  </div>
                  {(team === 'SPECTATOR' || team === 'BROADCAST') && (
                    <div className="inline-flex items-center gap-2 px-4 py-2 rounded-lg bg-gray-900/30">
                      <p className="text-sm text-lol-text/70">
                        Viewing as {team.toLowerCase()}
                      </p>
                    </div>
                  )}
                </div>
              )}
            </div>

            {/* Instructions Panel */}
            <div className="text-center">
              <div className="inline-block px-6 py-4 rounded-lg bg-black/40 border border-lol-gold/10">
                <h3 className="text-lol-gold font-medium mb-2">How to Start</h3>
                <p className="text-sm text-lol-text/70">
                  {team === 'BLUE' || team === 'RED' ? (
                    <>
                      1. Wait for both team captains to connect<br />
                      2. Click the "Ready Up" button when your team is prepared<br />
                      3. Once both teams are ready, the draft will begin automatically
                    </>
                  ) : (
                    <>
                      The draft will begin automatically when:<br />
                      • Both team captains are connected<br />
                      • Both teams have indicated they are ready
                    </>
                  )}
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // The actual draft interface
  return (
    <div className="h-screen grid grid-cols-1 lg:grid-cols-12 bg-lol-dark overflow-hidden">
      {/* Left sidebar - Blue team */}
      <div className={`
        transition-all duration-700 ease-in-out
        ${isDraftComplete ? 'lg:col-span-3' : 'lg:col-span-3'}
        bg-blue-900 bg-opacity-20 p-2 sm:p-4 flex items-center justify-end
        h-full
      `}>
        <TeamComposition 
          team="BLUE"
          teamName={draftState.blueTeamName}
          slots={draftState.bluePicks.map((champion, index) => ({
            team: "BLUE",
            champion,
            isActive: !isDraftComplete && 
              draftSequence[draftState.currentPhaseIndex]?.type === "PICK" && 
              draftSequence[draftState.currentPhaseIndex]?.team === "BLUE",
            isBan: false,
            position: ["TOP", "JUNGLE", "MID", "BOT", "SUPPORT"][index]
          }))}
          isPickPhase={!isDraftComplete && draftSequence[draftState.currentPhaseIndex]?.type === "PICK"}
          pendingChampion={draftState.pendingTeam === "BLUE" && draftSequence[draftState.currentPhaseIndex]?.type === "PICK" ? draftState.pendingChampion : null}
          isMyTeam={team === "BLUE"}
          isDraftComplete={isDraftComplete}
          isSwapPhase={isSwapPhase}
          canSwap={canSwap}
          onReorder={handleBlueTeamReorder}
        />
      </div>
      
      {/* Main content */}
      <div className={`
        transition-all duration-700 ease-in-out
        ${isDraftComplete ? 'lg:col-span-6' : 'lg:col-span-6'}
        p-2 sm:p-4 flex flex-col h-full
      `}>
        <div className="flex-none">
          {(isDraftComplete || isSwapPhase) && (
            <div className="mb-2 sm:mb-4 text-center animate-fade-in">
              <h2 className="text-xl sm:text-2xl font-bold text-lol-gold">
                {isSwapPhase ? "Swap Phase" : "Draft Complete!"}
              </h2>
              {isSwapPhase && (
                <div className="mt-1 sm:mt-2">
                  <div className="text-base sm:text-lg text-lol-text">
                    Time remaining: <span className={swapTimeLeft <= 20 ? "text-red-500" : "text-lol-gold"}>{swapTimeLeft}s</span>
                  </div>
                  {swapTimeLeft <= 20 && (
                    <div className="text-sm text-red-500 mt-1">
                      Swapping locked
                    </div>
                  )}
                </div>
              )}
            </div>
          )}
          <div className="mb-2 sm:mb-4">
            {draftState.inProgress && !isDraftComplete && (
              <div className="flex justify-center">
                <DraftTimer 
                  key={draftState.currentPhaseIndex}
                  isActive={true}
                  team={draftSequence[draftState.currentPhaseIndex]?.team || "BLUE"}
                  teamName={draftSequence[draftState.currentPhaseIndex]?.team === "BLUE" ? draftState.blueTeamName : draftState.redTeamName}
                  onTimeUp={handleTimeUp}
                  durationSeconds={30}
                  currentPhase={draftState.currentPhaseIndex}
                />
              </div>
            )}
          </div>
          
          <div className="mb-2 sm:mb-4">
            <BanPhase
              blueTeamBans={draftState.blueBans}
              redTeamBans={draftState.redBans}
              blueTeamName={draftState.blueTeamName}
              redTeamName={draftState.redTeamName}
              isPickPhase={draftSequence[draftState.currentPhaseIndex]?.type === "PICK"}
              currentPhase={draftState.currentPhaseIndex}
              pendingChampion={draftSequence[draftState.currentPhaseIndex]?.type === "BAN" ? draftState.pendingChampion : null}
              isMyTeam={draftSequence[draftState.currentPhaseIndex]?.team === team}
              team={team}
              pendingTeam={draftSequence[draftState.currentPhaseIndex]?.type === "BAN" ? draftState.pendingTeam : null}
            />
          </div>
        </div>

        <div className={`
          flex-1 overflow-hidden transition-all duration-700 ease-in-out
          ${isDraftComplete ? 'opacity-50 scale-95' : 'opacity-100 scale-100'}
        `}>
          <ChampionGrid
            champions={champions}
            onChampionSelect={handleChampionSelect}
            selectedChampions={[...draftState.bluePicks, ...draftState.redPicks]}
            bannedChampions={[...draftState.blueBans, ...draftState.redBans]}
            pendingChampion={draftState.pendingChampion}
            onPendingSelect={handlePendingSelect}
            onConfirm={handleConfirmSelection}
            isMyTurn={!isDraftComplete && draftSequence[draftState.currentPhaseIndex]?.team === team}
            currentTeamName={team === "BLUE" ? draftState.blueTeamName : draftState.redTeamName}
            isPickPhase={draftSequence[draftState.currentPhaseIndex]?.type === "PICK"}
            isDraftComplete={isDraftComplete}
          />
        </div>
      </div>
      
      {/* Right sidebar - Red team */}
      <div className={`
        transition-all duration-700 ease-in-out
        ${isDraftComplete ? 'lg:col-span-3' : 'lg:col-span-3'}
        bg-red-900 bg-opacity-20 p-2 sm:p-4 flex items-center justify-end
        h-full
      `}>
        <TeamComposition 
          team="RED"
          teamName={draftState.redTeamName}
          slots={draftState.redPicks.map((champion, index) => ({
            team: "RED",
            champion,
            isActive: !isDraftComplete && 
              draftSequence[draftState.currentPhaseIndex]?.type === "PICK" && 
              draftSequence[draftState.currentPhaseIndex]?.team === "RED",
            isBan: false,
            position: ["TOP", "JUNGLE", "MID", "BOT", "SUPPORT"][index]
          }))}
          isPickPhase={!isDraftComplete && draftSequence[draftState.currentPhaseIndex]?.type === "PICK"}
          pendingChampion={draftState.pendingTeam === "RED" && draftSequence[draftState.currentPhaseIndex]?.type === "PICK" ? draftState.pendingChampion : null}
          isMyTeam={team === "RED"}
          isDraftComplete={isDraftComplete}
          isSwapPhase={isSwapPhase}
          canSwap={canSwap}
          onReorder={handleRedTeamReorder}
        />
      </div>
    </div>
  );
};

export default Draft;