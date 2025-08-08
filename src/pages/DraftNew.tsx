// Refactored Draft component using new architecture
import { useParams, useSearchParams, useNavigate } from "react-router-dom";
import { useDraft } from "../hooks/useDraft";
import { Button } from "@/components/ui/button";
import { Shield, UserCheck, RefreshCw, Trophy } from "lucide-react";
import ChampionGrid from "../components/ChampionGrid";
import TeamComposition from "../components/TeamComposition";
import BanPhase from "../components/BanPhase";
import DraftTimer from "../components/DraftTimer";
import { champions } from "../data/champions";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { positions, Champion as SharedChampion, DraftSlot } from "@champ-draft-arena/shared";
import { Champion } from "../data/types";

// Helper functions to convert between shared and local types
const convertToLocalChampion = (sharedChampion: SharedChampion): Champion => ({
  ...sharedChampion,
  numericId: sharedChampion.numericId || 0,
});

const convertToLocalChampionArray = (sharedChampions: SharedChampion[]): Champion[] =>
  sharedChampions.map(convertToLocalChampion);

const createDraftSlots = (champions: SharedChampion[], team: "BLUE" | "RED", isActive: boolean, currentPhase: any): DraftSlot[] =>
  champions.map((champion, index) => ({
    team,
    champion: convertToLocalChampion(champion),
    isActive: isActive && currentPhase?.type === "PICK" && currentPhase?.team === team,
    isBan: false,
    position: positions[index]
  }));

const DraftNew = () => {
  const { draftId } = useParams();
  const [searchParams] = useSearchParams();
  const teamFromUrl = searchParams.get("team");
  const navigate = useNavigate();

  // Use the new draft hook
  const {
    draftState,
    uiState,
    currentTeam,
    currentPhase,
    allSelectedChampions,
    draftProgress,
    toggleReady,
    selectChampion,
    setPendingSelection,
    confirmSelection,
    reorderTeam,
    isChampionSelected,
    canMakeSelection,
  } = useDraft({
    draftId: draftId || '',
    teamFromUrl,
  });

  // Redirect if missing required params and not complete
  if ((!draftId || !teamFromUrl) && !uiState.isDraftComplete) {
    navigate('/');
    return null;
  }

  // Loading state
  if (uiState.isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-lol-dark">
        <div className="flex flex-col items-center">
          <RefreshCw className="animate-spin h-8 w-8 text-lol-gold mb-4" />
          <p className="text-lol-text">Loading draft session...</p>
          <p className="text-lol-text/70 text-sm mt-2">
            Connection: {uiState.connectionStatus}
          </p>
        </div>
      </div>
    );
  }

  // Error state
  if (uiState.error) {
    return (
      <Alert variant="destructive" className="m-4">
        <AlertDescription>
          {uiState.error}
          <Button 
            onClick={() => window.location.reload()} 
            className="ml-4"
            size="sm"
          >
            Retry
          </Button>
        </AlertDescription>
      </Alert>
    );
  }

  // Connection error state
  if (uiState.connectionStatus === 'error') {
    return (
      <Alert variant="destructive" className="m-4">
        <AlertDescription>
          Unable to connect to draft server. Please check your connection and try again.
          <Button 
            onClick={() => window.location.reload()} 
            className="ml-4"
            size="sm"
          >
            Retry Connection
          </Button>
        </AlertDescription>
      </Alert>
    );
  }

  // Show ready screen if draft hasn't started
  if (!draftState.inProgress && !uiState.isDraftComplete) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-lol-dark p-4">
        <div className="w-full max-w-4xl bg-black/40 border border-lol-gold/20 rounded-xl p-8">
          {/* Header */}
          <div className="text-center mb-8">
            <h1 className="text-4xl font-bold text-lol-gold mb-2">Champion Draft</h1>
            <p className="text-lol-text/70">Session ID: {draftId}</p>
            <div className="mt-2 text-sm text-lol-text/50">
              Connection: {uiState.connectionStatus}
              {uiState.reconnectAttempts > 0 && (
                <span className="ml-2">
                  (Reconnect attempts: {uiState.reconnectAttempts})
                </span>
              )}
            </div>
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
                      {currentTeam === 'BLUE' && (
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
                      {currentTeam === 'RED' && (
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
                  {(currentTeam === 'SPECTATOR' || currentTeam === 'BROADCAST') && (
                    <div className="inline-flex items-center gap-2 px-4 py-2 rounded-lg bg-gray-900/30">
                      <p className="text-sm text-lol-text/70">
                        Viewing as {currentTeam?.toLowerCase()}
                      </p>
                    </div>
                  )}
                </div>
              )}
            </div>

            {/* Draft Progress */}
            <div className="text-center">
              <div className="inline-block px-6 py-4 rounded-lg bg-black/40 border border-lol-gold/10">
                <h3 className="text-lol-gold font-medium mb-2">Draft Progress</h3>
                <div className="w-64 bg-gray-700 rounded-full h-2 mb-2">
                  <div 
                    className="bg-lol-gold h-2 rounded-full transition-all duration-300" 
                    style={{ width: `${draftProgress.percentage}%` }}
                  />
                </div>
                <p className="text-sm text-lol-text/70">
                  {draftProgress.current} / {draftProgress.total} phases complete
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
        ${uiState.isDraftComplete ? 'lg:col-span-3' : 'lg:col-span-3'}
        bg-blue-900 bg-opacity-20 p-2 sm:p-4 flex items-center justify-end
        h-full
      `}>
        <TeamComposition 
          team="BLUE"
          teamName={draftState.blueTeamName}
          slots={createDraftSlots(draftState.bluePicks, "BLUE", !uiState.isDraftComplete, currentPhase)}
          isPickPhase={!uiState.isDraftComplete && currentPhase?.type === "PICK"}
          pendingChampion={draftState.pendingTeam === "BLUE" && currentPhase?.type === "PICK" ? convertToLocalChampion(draftState.pendingChampion!) : null}
          isMyTeam={currentTeam === "BLUE"}
          isDraftComplete={uiState.isDraftComplete}
          isSwapPhase={draftState.isSwapPhase}
          canSwap={draftState.canSwap}
          onReorder={(sourceIndex, targetIndex) => reorderTeam("BLUE", sourceIndex, targetIndex)}
        />
      </div>
      
      {/* Main content */}
      <div className={`
        transition-all duration-700 ease-in-out
        ${uiState.isDraftComplete ? 'lg:col-span-6' : 'lg:col-span-6'}
        p-2 sm:p-4 flex flex-col h-full
      `}>
        <div className="flex-none">
          {(uiState.isDraftComplete || draftState.isSwapPhase) && (
            <div className="mb-2 sm:mb-4 text-center animate-fade-in">
              <h2 className="text-xl sm:text-2xl font-bold text-lol-gold">
                {draftState.isSwapPhase ? "Swap Phase" : "Draft Complete!"}
              </h2>
              {draftState.isSwapPhase && (
                <div className="mt-1 sm:mt-2">
                  <div className="text-base sm:text-lg text-lol-text">
                    Time remaining: <span className={draftState.swapTimeLeft <= 20 ? "text-red-500" : "text-lol-gold"}>{draftState.swapTimeLeft}s</span>
                  </div>
                  {draftState.swapTimeLeft <= 20 && (
                    <div className="text-sm text-red-500 mt-1">
                      Swapping locked
                    </div>
                  )}
                </div>
              )}
            </div>
          )}
          <div className="mb-2 sm:mb-4">
            {draftState.inProgress && !uiState.isDraftComplete && currentPhase && (
              <div className="flex justify-center">
                <DraftTimer 
                  key={draftState.currentPhaseIndex}
                  isActive={true}
                  team={currentPhase.team}
                  teamName={currentPhase.team === "BLUE" ? draftState.blueTeamName : draftState.redTeamName}
                  onTimeUp={() => "timeout"} // Server handles timeouts now
                  durationSeconds={30}
                  currentPhase={draftState.currentPhaseIndex}
                />
              </div>
            )}
          </div>
          
          <div className="mb-2 sm:mb-4">
            <BanPhase
              blueTeamBans={convertToLocalChampionArray(draftState.blueBans)}
              redTeamBans={convertToLocalChampionArray(draftState.redBans)}
              blueTeamName={draftState.blueTeamName}
              redTeamName={draftState.redTeamName}
              isPickPhase={currentPhase?.type === "PICK"}
              currentPhase={draftState.currentPhaseIndex}
              pendingChampion={currentPhase?.type === "BAN" && draftState.pendingChampion ? convertToLocalChampion(draftState.pendingChampion) : null}
              isMyTeam={currentPhase?.team === currentTeam}
              team={currentTeam}
              pendingTeam={currentPhase?.type === "BAN" ? draftState.pendingTeam : null}
            />
          </div>
        </div>

        <div className={`
          flex-1 overflow-hidden transition-all duration-700 ease-in-out
          ${uiState.isDraftComplete ? 'opacity-50 scale-95' : 'opacity-100 scale-100'}
        `}>
          <ChampionGrid
            champions={champions}
            onChampionSelect={selectChampion}
            selectedChampions={convertToLocalChampionArray(allSelectedChampions)}
            bannedChampions={convertToLocalChampionArray([...draftState.blueBans, ...draftState.redBans])}
            pendingChampion={draftState.pendingChampion ? convertToLocalChampion(draftState.pendingChampion) : null}
            onPendingSelect={setPendingSelection}
            onConfirm={confirmSelection}
            isMyTurn={currentTeam ? canMakeSelection(currentTeam) : false}
            currentTeamName={currentTeam === "BLUE" ? draftState.blueTeamName : draftState.redTeamName}
            isPickPhase={currentPhase?.type === "PICK"}
            isDraftComplete={uiState.isDraftComplete}
          />
        </div>
      </div>
      
      {/* Right sidebar - Red team */}
      <div className={`
        transition-all duration-700 ease-in-out
        ${uiState.isDraftComplete ? 'lg:col-span-3' : 'lg:col-span-3'}
        bg-red-900 bg-opacity-20 p-2 sm:p-4 flex items-center justify-end
        h-full
      `}>
        <TeamComposition 
          team="RED"
          teamName={draftState.redTeamName}
          slots={createDraftSlots(draftState.redPicks, "RED", !uiState.isDraftComplete, currentPhase)}
          isPickPhase={!uiState.isDraftComplete && currentPhase?.type === "PICK"}
          pendingChampion={draftState.pendingTeam === "RED" && currentPhase?.type === "PICK" && draftState.pendingChampion ? convertToLocalChampion(draftState.pendingChampion) : null}
          isMyTeam={currentTeam === "RED"}
          isDraftComplete={uiState.isDraftComplete}
          isSwapPhase={draftState.isSwapPhase}
          canSwap={draftState.canSwap}
          onReorder={(sourceIndex, targetIndex) => reorderTeam("RED", sourceIndex, targetIndex)}
        />
      </div>
    </div>
  );
};

export default DraftNew;
