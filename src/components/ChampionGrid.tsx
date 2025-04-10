import { useState } from "react";
import { Champion } from "../data/types";
import { Input } from "@/components/ui/input";
import { Search, Filter, X } from "lucide-react";
import { positions } from "../data/draftTypes";
import { Button } from "@/components/ui/button";
import { Alert, AlertDescription } from "@/components/ui/alert";

interface ChampionGridProps {
  champions: Champion[];
  onChampionSelect: (champion: Champion) => void;
  selectedChampions: Champion[];
  bannedChampions: Champion[];
  pendingChampion: Champion | null;
  onPendingSelect: (champion: Champion) => void;
  onConfirm: () => void;
  isMyTurn: boolean;
  currentTeamName: string;
  isPickPhase: boolean;
  isDraftComplete?: boolean;
}

const roleIcons = {
  TOP: "/role-icons/Position_Gold-Top.png",
  JUNGLE: "/role-icons/Position_Gold-Jungle.png",
  MID: "/role-icons/Position_Gold-Mid.png",
  BOT: "/role-icons/Position_Gold-Bot.png",
  SUPPORT: "/role-icons/Position_Gold-Support.png"
};

export default function ChampionGrid({
  champions,
  onChampionSelect,
  selectedChampions,
  bannedChampions,
  pendingChampion,
  onPendingSelect,
  onConfirm,
  isMyTurn,
  currentTeamName,
  isPickPhase,
  isDraftComplete
}: ChampionGridProps) {
  const [selectedChampion, setSelectedChampion] = useState<Champion | null>(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [positionFilter, setPositionFilter] = useState<string | null>(null);

  // Error handling for champions list
  if (!champions || champions.length === 0) {
    return (
      <Alert variant="destructive" className="m-4">
        <AlertDescription>
          Unable to load champions list. Please refresh the page or try again later.
        </AlertDescription>
      </Alert>
    );
  }
  
  const filteredChampions = champions.filter(champion => {
    const matchesSearch = champion.name.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesPosition = positionFilter ? champion.roles.includes(positionFilter.toLowerCase()) : true;
    
    return matchesSearch && matchesPosition;
  });

  const handleChampionClick = (champion: Champion) => {
    if (!isMyTurn) return;
    if (selectedChampions.some(c => c.id === champion.id)) return;
    if (bannedChampions.some(c => c.id === champion.id)) return;
    
    // Use pending selection for both pick and ban phases
    onPendingSelect(champion);
  };

  const handleConfirm = () => {
    if (!isMyTurn) return;
    onConfirm();
  };

  return (
    <div className="flex flex-col h-full">
      {/* Header with Search and Filters */}
      {!isDraftComplete && (
        <div className="space-y-2 flex-none mb-2">
          <div className="flex items-center justify-between gap-4">
            <div className="flex-1 max-w-md">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
                <input
                  type="text"
                  placeholder="Search champions..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full pl-10 pr-4 py-2 bg-black/40 border border-gray-700 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:border-lol-gold"
                />
              </div>
            </div>
          </div>

          <div className="flex items-center gap-3">
            {Object.entries(roleIcons).map(([role, iconPath]) => (
              <button
                key={role}
                onClick={() => setPositionFilter(positionFilter === role ? null : role)}
                className={`w-10 h-10 flex items-center justify-center transition-all ${
                  positionFilter === role 
                  ? 'scale-110' 
                  : 'hover:scale-105'
                }`}
              >
                <img 
                  src={iconPath} 
                  alt={role} 
                  className={`w-8 h-8 ${positionFilter === role ? 'opacity-100' : 'opacity-50'}`}
                />
              </button>
            ))}
          </div>
        </div>
      )}

      {/* Champion Grid */}
      <div className={`
        bg-black/20 rounded-lg border border-gray-800
        transition-all duration-700 ease-in-out
        overflow-hidden w-full
        ${isDraftComplete ? 'mx-auto max-w-[1200px]' : ''}
      `}>
        <div className={`
          overflow-y-auto overflow-x-hidden hide-scrollbar
          transition-all duration-700 ease-in-out
          ${isDraftComplete ? 'h-[400px]' : 'h-[320px]'}
        `}>
          <div className={`
            grid p-4
            transition-all duration-700 ease-in-out
            grid-cols-10 gap-2 auto-rows-min
            w-full
          `}>
            {filteredChampions.map((champion) => {
              const isSelected = selectedChampions.some(c => c.id === champion.id);
              const isBanned = bannedChampions.some(c => c.id === champion.id);
              const isPending = pendingChampion?.id === champion.id;
              const isDisabled = isSelected || isBanned;
              
              return (
                <button
                  key={champion.id}
                  onClick={() => handleChampionClick(champion)}
                  disabled={isDisabled}
                  className={`
                    aspect-square rounded-lg overflow-hidden transition-all relative
                    w-full max-w-[108px]
                    ${isDraftComplete ? 'max-w-[100px] border-0' : 'border-2'}
                    ${!isDraftComplete && isSelected ? 'border-yellow-500' : ''}
                    ${!isDraftComplete && isBanned ? 'border-red-500' : ''}
                    ${!isDraftComplete && isPending ? (
                      isPickPhase ? 'border-green-500 scale-105' : 'border-red-500 scale-105'
                    ) : 'border-transparent'}
                    ${isDisabled ? 'cursor-not-allowed' : ''}
                    ${!isDisabled && isMyTurn && !isDraftComplete ? 'hover:scale-105 cursor-pointer' : ''}
                  `}
                >
                  <img
                    src={champion.image}
                    alt={champion.name}
                    className={`w-full h-full object-cover ${isDisabled ? 'grayscale opacity-50' : ''}`}
                  />
                </button>
              );
            })}
          </div>
        </div>
      </div>

      {/* Footer with Confirm Button */}
      {isMyTurn && pendingChampion && !isDraftComplete && (
        <div className="flex-none px-4 flex justify-center mt-3">
          <button
            onClick={handleConfirm}
            className="w-64 h-14 bg-gradient-to-r from-[#B8860B] to-[#DAA520] hover:from-[#DAA520] hover:to-[#B8860B] 
            text-black font-semibold rounded-lg transition-all duration-200 flex items-center justify-center gap-3 
            shadow-lg shadow-black/20 border border-[#B8860B]/50"
          >
            <span className="text-lg">{isPickPhase ? `Lock In ${pendingChampion.name}` : `Ban ${pendingChampion.name}`}</span>
          </button>
        </div>
      )}
    </div>
  );
}

// Update the styles constant to include scrollbar hiding
const styles = `
/* Hide scrollbar for Chrome, Safari and Opera */
.hide-scrollbar::-webkit-scrollbar {
  display: none;
}

/* Hide scrollbar for IE, Edge and Firefox */
.hide-scrollbar {
  -ms-overflow-style: none;  /* IE and Edge */
  scrollbar-width: none;  /* Firefox */
}
`;

const styleSheet = document.createElement("style");
styleSheet.innerText = styles;
document.head.appendChild(styleSheet);
