// Refactored Draft component using new architecture
import { useParams, useSearchParams, useNavigate } from "react-router-dom";
import { useDraft } from "../hooks/useDraft";
import { Button } from "@/components/ui/button";
import { Shield, UserCheck, RefreshCw, Trophy, Swords, Crown } from "lucide-react";
import { useEffect } from "react";
import ChampionGrid from "../components/ChampionGrid";
import TeamComposition from "../components/TeamComposition";
import BanPhase from "../components/BanPhase";
import DraftTimer from "../components/DraftTimer";
import { champions } from "../data/champions";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { positions, Champion as SharedChampion, DraftSlot } from "@champ-draft-arena/shared";
import { Champion } from "../data/types";
import FearlessBanPhase from "../components/FearlessBanPhase";

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
    chooseSide,
    toggleNextGameReady,
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
                        `Waiting for both captains to connect... (Blue: ${draftState.blueConnected}, Red: ${draftState.redConnected})`
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
                {draftState.isSwapPhase ? "Swap Phase" : draftState.isPostDraft ? "Next Game Preparation" : "Draft Complete!"}
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

          {/* Post-Draft Next Game Preparation UI */}
          {draftState.isPostDraft && (
            <div className="mb-4 p-4 bg-black/40 border border-lol-gold/20 rounded-lg">
              <div className="text-center mb-4">
                <div className="flex items-center justify-center gap-2 mb-2">
                  <Swords className="h-5 w-5 text-lol-gold" />
                  <h3 className="text-lg font-semibold text-lol-gold">Choose Your Side & Ready Up</h3>
                </div>
                <p className="text-sm text-lol-text/70">Captains must choose sides and ready up for the next game draft</p>
              </div>

              {/* Side Selection & Ready Status Grid */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {/* Blue Team Section */}
                <div className="p-4 bg-blue-900/20 border border-blue-500/30 rounded-lg">
                  <div className="flex items-center gap-2 mb-3">
                    <Shield className="h-4 w-4 text-blue-400" />
                    <h4 className="font-semibold text-blue-400">{draftState.blueTeamName}</h4>
                  </div>
                  
                  <div className="space-y-3">
                    {/* Side Choice Display */}
                    <div className="text-sm">
                      <span className="text-lol-text/70">Side Choice: </span>
                      {draftState.blueSideChoice ? (
                        <span className={`font-medium ${draftState.blueSideChoice === 'BLUE' ? 'text-blue-400' : 'text-red-400'}`}>
                          {draftState.blueSideChoice} Side
                        </span>
                      ) : (
                        <span className="text-lol-text/50">Not chosen</span>
                      )}
                    </div>

                    {/* Side Selection Buttons - Only for Blue Team Captain */}
                    {currentTeam === 'BLUE' && (
                      <div className="flex gap-2">
                        <Button
                          size="sm"
                          onClick={() => chooseSide('BLUE')}
                          disabled={draftState.redSideChoice === 'BLUE'}
                          className={`flex-1 font-semibold text-white border-2 transition-all ${
                            draftState.blueSideChoice === 'BLUE' 
                              ? 'bg-blue-600 hover:bg-blue-500 border-blue-400 shadow-lg' 
                              : draftState.redSideChoice === 'BLUE'
                              ? 'bg-gray-600 border-gray-500 cursor-not-allowed opacity-50'
                              : 'bg-blue-800/60 hover:bg-blue-700 border-blue-500 hover:border-blue-400'
                          }`}
                        >
                          {draftState.redSideChoice === 'BLUE' ? 'Taken by Red' : 'Blue Side'}
                        </Button>
                        <Button
                          size="sm"
                          onClick={() => chooseSide('RED')}
                          disabled={draftState.redSideChoice === 'RED'}
                          className={`flex-1 font-semibold text-white border-2 transition-all ${
                            draftState.blueSideChoice === 'RED' 
                              ? 'bg-red-600 hover:bg-red-500 border-red-400 shadow-lg' 
                              : draftState.redSideChoice === 'RED'
                              ? 'bg-gray-600 border-gray-500 cursor-not-allowed opacity-50'
                              : 'bg-red-800/60 hover:bg-red-700 border-red-500 hover:border-red-400'
                          }`}
                        >
                          {draftState.redSideChoice === 'RED' ? 'Taken by Red' : 'Red Side'}
                        </Button>
                      </div>
                    )}

                    {/* Ready Status */}
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        {draftState.blueNextGameReady ? (
                          <UserCheck className="h-4 w-4 text-green-400" />
                        ) : (
                          <div className="h-4 w-4 rounded border border-lol-text/30" />
                        )}
                        <span className={`text-sm ${draftState.blueNextGameReady ? 'text-green-400' : 'text-lol-text/70'}`}>
                          {draftState.blueNextGameReady ? 'Ready' : 'Not Ready'}
                        </span>
                      </div>

                      {/* Ready Button - Only for Blue Team Captain */}
                      {currentTeam === 'BLUE' && (
                        <Button
                          size="sm"
                          variant={draftState.blueNextGameReady ? 'destructive' : 'default'}
                          onClick={toggleNextGameReady}
                          disabled={!draftState.blueSideChoice}
                          className={!draftState.blueNextGameReady ? 'bg-green-600 hover:bg-green-500' : ''}
                        >
                          {draftState.blueNextGameReady ? 'Cancel' : 'Ready'}
                        </Button>
                      )}
                    </div>
                  </div>
                </div>

                {/* Red Team Section */}
                <div className="p-4 bg-red-900/20 border border-red-500/30 rounded-lg">
                  <div className="flex items-center gap-2 mb-3">
                    <Shield className="h-4 w-4 text-red-400" />
                    <h4 className="font-semibold text-red-400">{draftState.redTeamName}</h4>
                  </div>
                  
                  <div className="space-y-3">
                    {/* Side Choice Display */}
                    <div className="text-sm">
                      <span className="text-lol-text/70">Side Choice: </span>
                      {draftState.redSideChoice ? (
                        <span className={`font-medium ${draftState.redSideChoice === 'BLUE' ? 'text-blue-400' : 'text-red-400'}`}>
                          {draftState.redSideChoice} Side
                        </span>
                      ) : (
                        <span className="text-lol-text/50">Not chosen</span>
                      )}
                    </div>

                    {/* Side Selection Buttons - Only for Red Team Captain */}
                    {currentTeam === 'RED' && (
                      <div className="flex gap-2">
                        <Button
                          size="sm"
                          onClick={() => chooseSide('BLUE')}
                          disabled={draftState.blueSideChoice === 'BLUE'}
                          className={`flex-1 font-semibold text-white border-2 transition-all ${
                            draftState.redSideChoice === 'BLUE' 
                              ? 'bg-blue-600 hover:bg-blue-500 border-blue-400 shadow-lg' 
                              : draftState.blueSideChoice === 'BLUE'
                              ? 'bg-gray-600 border-gray-500 cursor-not-allowed opacity-50'
                              : 'bg-blue-800/60 hover:bg-blue-700 border-blue-500 hover:border-blue-400'
                          }`}
                        >
                          {draftState.blueSideChoice === 'BLUE' ? 'Taken by Blue' : 'Blue Side'}
                        </Button>
                        <Button
                          size="sm"
                          onClick={() => chooseSide('RED')}
                          disabled={draftState.blueSideChoice === 'RED'}
                          className={`flex-1 font-semibold text-white border-2 transition-all ${
                            draftState.redSideChoice === 'RED' 
                              ? 'bg-red-600 hover:bg-red-500 border-red-400 shadow-lg' 
                              : draftState.blueSideChoice === 'RED'
                              ? 'bg-gray-600 border-gray-500 cursor-not-allowed opacity-50'
                              : 'bg-red-800/60 hover:bg-red-700 border-red-500 hover:border-red-400'
                          }`}
                        >
                          {draftState.blueSideChoice === 'RED' ? 'Taken by Blue' : 'Red Side'}
                        </Button>
                      </div>
                    )}

                    {/* Ready Status */}
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        {draftState.redNextGameReady ? (
                          <UserCheck className="h-4 w-4 text-green-400" />
                        ) : (
                          <div className="h-4 w-4 rounded border border-lol-text/30" />
                        )}
                        <span className={`text-sm ${draftState.redNextGameReady ? 'text-green-400' : 'text-lol-text/70'}`}>
                          {draftState.redNextGameReady ? 'Ready' : 'Not Ready'}
                        </span>
                      </div>

                      {/* Ready Button - Only for Red Team Captain */}
                      {currentTeam === 'RED' && (
                        <Button
                          size="sm"
                          variant={draftState.redNextGameReady ? 'destructive' : 'default'}
                          onClick={toggleNextGameReady}
                          disabled={!draftState.redSideChoice}
                          className={!draftState.redNextGameReady ? 'bg-green-600 hover:bg-green-500' : ''}
                        >
                          {draftState.redNextGameReady ? 'Cancel' : 'Ready'}
                        </Button>
                      )}
                    </div>
                  </div>
                </div>
              </div>

              {/* Overall Status */}
              <div className="mt-4 text-center">
                {draftState.blueNextGameReady && draftState.redNextGameReady ? (
                  <div className="inline-flex items-center gap-2 bg-green-900/20 text-green-400 px-4 py-2 rounded-lg">
                    <Crown className="h-4 w-4" />
                    <span className="font-medium">Both teams ready! Starting next game draft...</span>
                  </div>
                ) : (
                  <div className="text-sm text-lol-text/70">
                    {!draftState.blueSideChoice || !draftState.redSideChoice ? (
                      "Waiting for both teams to choose sides..."
                    ) : !draftState.blueNextGameReady && !draftState.redNextGameReady ? (
                      "Waiting for both teams to ready up..."
                    ) : !draftState.blueNextGameReady ? (
                      `Waiting for ${draftState.blueTeamName} to ready up...`
                    ) : (
                      `Waiting for ${draftState.redTeamName} to ready up...`
                    )}
                  </div>
                )}
              </div>
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
                  phaseStartTime={draftState.phaseStartTime}
                  phaseTimeLeft={draftState.phaseTimeLeft}
                  phaseTimerActive={draftState.phaseTimerActive}
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
          flex-1 overflow-hidden transition-all duration-700 ease-in-out flex flex-col
          ${uiState.isDraftComplete ? 'opacity-50 scale-95' : 'opacity-100 scale-100'}
        `}>
          <div className="flex-1 overflow-hidden">
            <ChampionGrid
              champions={champions}
              onChampionSelect={selectChampion}
              selectedChampions={convertToLocalChampionArray(allSelectedChampions)}
              bannedChampions={(() => {
                const fearlessBans = draftState.fearlessBans || [];
                const allBans = [
                  ...draftState.blueBans, 
                  ...draftState.redBans,
                  ...fearlessBans
                ];
                console.log('🚫 All banned champions:', allBans.map(c => c.name));
                console.log('🚫 Fearless bans specifically:', fearlessBans.map(c => c.name));
                console.log('🚫 Current draft bans:', [...draftState.blueBans, ...draftState.redBans].map(c => c.name));
                return convertToLocalChampionArray(allBans);
              })()}
              pendingChampion={draftState.pendingChampion ? convertToLocalChampion(draftState.pendingChampion) : null}
              onPendingSelect={setPendingSelection}
              onConfirm={confirmSelection}
              isMyTurn={currentTeam ? canMakeSelection(currentTeam) : false}
              currentTeamName={currentTeam === "BLUE" ? draftState.blueTeamName : draftState.redTeamName}
              isPickPhase={currentPhase?.type === "PICK"}
              isDraftComplete={uiState.isDraftComplete}
            />
          </div>
          
          {/* Fearless Bans Display - underneath champion grid */}
          <div className="flex-none px-4 pb-2">
            {(() => {
              const fearlessBans = draftState.fearlessBans || [];
              const gameNumber = draftState.gameNumber || 1;
              console.log('🎮 DraftNew rendering FearlessBanPhase:', {
                fearlessBansCount: fearlessBans.length,
                gameNumber,
                draftStateKeys: Object.keys(draftState),
                hasInProgress: draftState.inProgress
              });
              return (
                <FearlessBanPhase 
                  fearlessBans={fearlessBans} 
                  gameNumber={gameNumber} 
                />
              );
            })()}
          </div>
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
