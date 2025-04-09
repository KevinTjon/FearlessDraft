import { useState, useEffect } from "react";
import { champions } from "../data/champions";
import { draftSequence, DraftPhase, DraftSlot, Team } from "../data/draftTypes";
import { Champion } from "../data/types";
import ChampionGrid from "../components/ChampionGrid";
import TeamComposition from "../components/TeamComposition";
import BanPhase from "../components/BanPhase";
import DraftTimer from "../components/DraftTimer";
import PhaseIndicator from "../components/PhaseIndicator";
import { useToast } from "@/components/ui/use-toast";

const Index = () => {
  const { toast } = useToast();
  const [currentPhase, setCurrentPhase] = useState(1);
  const [phases, setPhases] = useState<DraftPhase[]>(draftSequence);
  const [resetTimer, setResetTimer] = useState(0);
  const [playerTeam, setPlayerTeam] = useState<Team>("BLUE");
  const [blueTeamPicks, setBlueTeamPicks] = useState<DraftSlot[]>([
    { team: "BLUE", champion: null, isActive: false, isBan: false, position: "TOP" },
    { team: "BLUE", champion: null, isActive: false, isBan: false, position: "JUNGLE" },
    { team: "BLUE", champion: null, isActive: false, isBan: false, position: "MID" },
    { team: "BLUE", champion: null, isActive: false, isBan: false, position: "BOT" },
    { team: "BLUE", champion: null, isActive: false, isBan: false, position: "SUPPORT" }
  ]);
  const [redTeamPicks, setRedTeamPicks] = useState<DraftSlot[]>([
    { team: "RED", champion: null, isActive: false, isBan: false, position: "TOP" },
    { team: "RED", champion: null, isActive: false, isBan: false, position: "JUNGLE" },
    { team: "RED", champion: null, isActive: false, isBan: false, position: "MID" },
    { team: "RED", champion: null, isActive: false, isBan: false, position: "BOT" },
    { team: "RED", champion: null, isActive: false, isBan: false, position: "SUPPORT" }
  ]);
  const [blueTeamBans, setBlueTeamBans] = useState<DraftSlot[]>([
    { team: "BLUE", champion: null, isActive: false, isBan: true },
    { team: "BLUE", champion: null, isActive: false, isBan: true },
    { team: "BLUE", champion: null, isActive: false, isBan: true },
    { team: "BLUE", champion: null, isActive: false, isBan: true },
    { team: "BLUE", champion: null, isActive: false, isBan: true }
  ]);
  const [redTeamBans, setRedTeamBans] = useState<DraftSlot[]>([
    { team: "RED", champion: null, isActive: false, isBan: true },
    { team: "RED", champion: null, isActive: false, isBan: true },
    { team: "RED", champion: null, isActive: false, isBan: true },
    { team: "RED", champion: null, isActive: false, isBan: true },
    { team: "RED", champion: null, isActive: false, isBan: true }
  ]);
  const [pendingChampion, setPendingChampion] = useState<Champion | null>(null);
  
  const isPickPhase = phases[currentPhase - 1]?.type === "PICK";
  const currentTeam = phases[currentPhase - 1]?.team || "BLUE";
  
  useEffect(() => {
    updateActiveSlots();
  }, []);
  
  useEffect(() => {
    updateActiveSlots();
  }, [currentPhase]);
  
  const updateActiveSlots = () => {
    const currentPhaseObj = phases[currentPhase - 1];
    if (!currentPhaseObj) return;
    
    const { team, type } = currentPhaseObj;
    
    setBlueTeamPicks(prev => prev.map(slot => ({ ...slot, isActive: false })));
    setRedTeamPicks(prev => prev.map(slot => ({ ...slot, isActive: false })));
    setBlueTeamBans(prev => prev.map(slot => ({ ...slot, isActive: false })));
    setRedTeamBans(prev => prev.map(slot => ({ ...slot, isActive: false })));
    
    if (type === "PICK") {
      const teamPicks = team === "BLUE" ? blueTeamPicks : redTeamPicks;
      const setTeamPicks = team === "BLUE" ? setBlueTeamPicks : setRedTeamPicks;
      
      const emptySlotIndex = teamPicks.findIndex(slot => slot.champion === null);
      if (emptySlotIndex !== -1) {
        setTeamPicks(prev => 
          prev.map((slot, idx) => ({
            ...slot,
            isActive: idx === emptySlotIndex
          }))
        );
      }
    } else if (type === "BAN") {
      const teamBans = team === "BLUE" ? blueTeamBans : redTeamBans;
      const setTeamBans = team === "BLUE" ? setBlueTeamBans : setRedTeamBans;
      
      const emptySlotIndex = teamBans.findIndex(slot => slot.champion === null);
      if (emptySlotIndex !== -1) {
        setTeamBans(prev => 
          prev.map((slot, idx) => ({
            ...slot,
            isActive: idx === emptySlotIndex
          }))
        );
      }
    }
  };
  
  const handleChampionSelect = (champion: Champion) => {
    setPendingChampion(champion);
  };
  
  const handleConfirm = () => {
    if (!pendingChampion) return;

    const currentPhaseObj = phases[currentPhase - 1];
    if (!currentPhaseObj) return;
    
    const { team, type } = currentPhaseObj;
    
    if (type === "PICK") {
      const teamPicks = team === "BLUE" ? blueTeamPicks : redTeamPicks;
      const setTeamPicks = team === "BLUE" ? setBlueTeamPicks : setRedTeamPicks;
      
      const activeSlotIndex = teamPicks.findIndex(slot => slot.isActive);
      if (activeSlotIndex !== -1) {
        setTeamPicks(prev => 
          prev.map((slot, idx) => 
            idx === activeSlotIndex ? { ...slot, champion: pendingChampion, isActive: false } : slot
          )
        );
        
        setPhases(prev => 
          prev.map((phase, idx) => 
            idx === currentPhase - 1 ? { ...phase, completed: true } : phase
          )
        );
        
        setPendingChampion(null);
        
        if (currentPhase < phases.length) {
          return;
        } else {
          toast({
            title: "Draft Complete",
            description: "The champion draft has been completed!",
          });
        }
      }
    } else if (type === "BAN") {
      const teamBans = team === "BLUE" ? blueTeamBans : redTeamBans;
      const setTeamBans = team === "BLUE" ? setBlueTeamBans : setRedTeamBans;
      
      const activeSlotIndex = teamBans.findIndex(slot => slot.isActive);
      if (activeSlotIndex !== -1) {
        setTeamBans(prev => 
          prev.map((slot, idx) => 
            idx === activeSlotIndex ? { ...slot, champion: pendingChampion, isActive: false } : slot
          )
        );
        
        setPhases(prev => 
          prev.map((phase, idx) => 
            idx === currentPhase - 1 ? { ...phase, completed: true } : phase
          )
        );
        
        setPendingChampion(null);
        
        if (currentPhase < phases.length) {
          return;
        } else {
          toast({
            title: "Draft Complete",
            description: "The champion draft has been completed!",
          });
        }
      }
    }
  };
  
  const handleTimeUp = (): string | null => {
    const currentPhaseObj = phases[currentPhase - 1];
    if (!currentPhaseObj) return null;
    
    if (pendingChampion) {
        handleConfirm();
    } else {
        const availableChampions = champions.filter(champ => 
            ![...blueTeamPicks, ...redTeamPicks, ...blueTeamBans, ...redTeamBans]
                .some(slot => slot.champion?.id === champ.id)
        );
        
        if (availableChampions.length > 0) {
            const randomChampion = availableChampions[Math.floor(Math.random() * availableChampions.length)];
            handleChampionSelect(randomChampion);
            handleConfirm();
            
            toast({
                title: "Time's up!",
                description: `Randomly selected ${randomChampion.name} for ${currentTeam} team.`,
                variant: "destructive"
            });
        }
    }
    
    if (currentPhase < phases.length) {
        setCurrentPhase(prev => prev + 1);
        setResetTimer(prev => prev + 1);
    }
    
    return "time_up_lock";
  };
  
  const getSelectedChampions = (): Champion[] => {
    return [
      ...blueTeamPicks.filter(slot => slot.champion !== null).map(slot => slot.champion as Champion),
      ...redTeamPicks.filter(slot => slot.champion !== null).map(slot => slot.champion as Champion)
    ];
  };
  
  const getBannedChampions = (): Champion[] => {
    return [
      ...blueTeamBans.filter(slot => slot.champion !== null).map(slot => slot.champion as Champion),
      ...redTeamBans.filter(slot => slot.champion !== null).map(slot => slot.champion as Champion)
    ];
  };

  return (
    <div className="min-h-screen h-screen flex flex-col py-2 px-4">
      <div className="container mx-auto h-full flex flex-col">
        <h1 className="text-2xl font-bold text-center text-lol-gold mb-3">
          League of Legends Champion Draft
        </h1>
        
        {/* Team Selection */}
        <div className="mb-4 flex justify-center gap-4">
          <button
            onClick={() => setPlayerTeam("BLUE")}
            className={`px-6 py-2 rounded-lg transition-colors ${
              playerTeam === "BLUE"
                ? "bg-blue-600 text-white"
                : "bg-gray-800 text-gray-300 hover:bg-gray-700"
            }`}
          >
            Play as Blue Team
          </button>
          <button
            onClick={() => setPlayerTeam("RED")}
            className={`px-6 py-2 rounded-lg transition-colors ${
              playerTeam === "RED"
                ? "bg-red-600 text-white"
                : "bg-gray-800 text-gray-300 hover:bg-gray-700"
            }`}
          >
            Play as Red Team
          </button>
        </div>
        
        <div className="flex flex-1 overflow-hidden">
          <div className="w-1/5 pr-1 flex flex-col">
            <TeamComposition 
              slots={blueTeamPicks} 
              team="BLUE" 
              isPickPhase={isPickPhase}
              teamName="Blue Team"
              pendingChampion={pendingChampion}
              isMyTeam={currentTeam === "BLUE"}
            />
          </div>
          
          <div className="flex-1 flex flex-col">
            <div className="p-1 bg-black bg-opacity-70 rounded-md mb-1 text-center flex items-center justify-between">
              <div className="flex-1"></div>
              <div className="flex-1">
                <h3 className="font-bold text-sm">
                  <span className={currentTeam === "BLUE" ? "text-lol-blue" : "text-lol-red"}>
                    {currentTeam} TEAM
                  </span>
                  <span className="mx-2 text-lol-gold">•</span>
                  <span className="text-lol-text">
                    {isPickPhase ? "PICK" : "BAN"}
                  </span>
                </h3>
              </div>
              <div className="flex-1 flex justify-end">
                <DraftTimer 
                  isActive={true}
                  team={currentTeam}
                  teamName={currentTeam === "BLUE" ? "Blue Team" : "Red Team"}
                  onTimeUp={handleTimeUp}
                  durationSeconds={30}
                  currentPhase={currentPhase}
                />
              </div>
            </div>
            
            <div className="flex-1 overflow-y-auto">
              <ChampionGrid 
                champions={champions}
                onChampionSelect={handleChampionSelect}
                selectedChampions={getSelectedChampions()}
                bannedChampions={getBannedChampions()}
                pendingChampion={pendingChampion}
                onPendingSelect={handleChampionSelect}
                onConfirm={handleConfirm}
                isMyTurn={currentTeam === playerTeam}
                currentTeamName={currentTeam === "BLUE" ? "Blue Team" : "Red Team"}
                isPickPhase={isPickPhase}
              />
            </div>
          </div>
          
          <div className="w-1/5 pl-1 flex flex-col">
            <TeamComposition 
              slots={redTeamPicks} 
              team="RED" 
              isPickPhase={isPickPhase}
              teamName="Red Team"
              pendingChampion={pendingChampion}
              isMyTeam={currentTeam === "RED"}
            />
          </div>
        </div>
      </div>
    </div>
  );
};

export default Index;
