import { DraftSlot, Team } from "../data/draftTypes";
import { positions } from "../data/draftTypes";
import { Champion } from "../data/types";
import { DEFAULT_CHAMPION_ICON } from "../data/staticChampions";
import { useState, useEffect } from "react";
import WideSplash from '../Wide.png';

interface TeamCompositionProps {
  slots: DraftSlot[];
  team: Team;
  teamName: string;
  isPickPhase: boolean;
  pendingChampion: Champion | null;
  isMyTeam: boolean;
}

const TeamComposition = ({ slots, team, teamName, isPickPhase, pendingChampion, isMyTeam }: TeamCompositionProps) => {
  const teamClass = team === "BLUE" ? "bg-blue-900" : "bg-lol-darkRed";
  const teamBorderClass = team === "BLUE" ? "border-lol-blue" : "border-lol-red";
  const teamTextClass = team === "BLUE" ? "text-lol-lightBlue" : "text-lol-red";
  
  // Track which champions have completed their pick animation
  const [pickedChampions, setPickedChampions] = useState<{[key: number]: boolean}>({});
  // Track failed splash art loads
  const [failedLoads, setFailedLoads] = useState<{[key: number]: boolean}>({});
  // Track image transition state
  const [imageTransitioned, setImageTransitioned] = useState<{[key: number]: boolean}>({});
  
  // Create an array of all slots including empty ones
  const allSlots = positions.map((position, index) => {
    const existingSlot = slots.find((slot, slotIndex) => slotIndex === index);
    return existingSlot || {
      team,
      champion: null,
      isActive: false,
      isBan: false,
      position
    };
  });

  // Find the next empty slot index
  const nextEmptySlotIndex = allSlots.findIndex(slot => !slot.champion);

  // Effect to handle champion pick animation
  useEffect(() => {
    allSlots.forEach((slot, index) => {
      if (slot.champion && !pickedChampions[index]) {
        // First change the image
        setPickedChampions(prev => ({
          ...prev,
          [index]: true
        }));
        
        // Then after a delay, trigger the width expansion
        setTimeout(() => {
          setImageTransitioned(prev => ({
            ...prev,
            [index]: true
          }));
        }, 300); // 300ms delay before expanding
      }
    });
  }, [slots]);

  const handleImageError = (index: number) => {
    setFailedLoads(prev => ({
      ...prev,
      [index]: true
    }));
  };

  const getChampionImage = (slot: DraftSlot, index: number, isPendingSlot: boolean) => {
    if (isPendingSlot && pendingChampion) {
      return pendingChampion.image;
    }
    if (slot.champion) {
      // If not picked yet, use regular icon
      if (!pickedChampions[index]) {
        return slot.champion.image;
      }
      
      // If splash art failed to load, use wide.png as fallback
      if (failedLoads[index]) {
        return WideSplash;
      }

      // Try loading the splash art using numeric ID
      return `https://cdn.communitydragon.org/latest/champion/${(slot.champion as any).numericId}/splash-art/centered/skin/0`;
    }
    return DEFAULT_CHAMPION_ICON;
  };
  
  return (
    <div className={`${teamClass} bg-opacity-20 px-4 py-4 rounded-lg w-[300px] h-full flex flex-col justify-center`}>
      <h3 className={`text-2xl font-bold ${teamTextClass} text-center mb-4`}>{teamName}</h3>
      <div className={`border-b-2 ${teamBorderClass} border-opacity-50 mb-6`}></div>
      <div className={`flex flex-col gap-4 ${team === "BLUE" ? "items-start" : "items-end"}`}>
        {allSlots.map((slot, index) => {
          const isPendingSlot = index === nextEmptySlotIndex && pendingChampion && isPickPhase;
          const isPickedChampion = slot.champion && pickedChampions[index];
          const hasTransitioned = imageTransitioned[index];
          
          return (
            <div key={slot.position} 
              className={`
                relative
                ${hasTransitioned ? 'w-64' : 'w-36'}
                transition-all duration-700 ease-in-out
              `}
            >
              <div 
                className={`
                  overflow-hidden relative 
                  ${slot.isActive && isPickPhase ? 'phase-active' : ''}
                  ${!slot.champion && !isPendingSlot ? 'bg-black bg-opacity-30' : ''}
                  ${slot.champion && team === "BLUE" ? 'team-blue-glow shadow-lg shadow-blue-500/50' : ''}
                  ${slot.champion && team === "RED" ? 'team-red-glow shadow-lg shadow-red-500/50' : ''}
                  ${isPendingSlot ? 'animate-border-glow' : ''}
                  ${hasTransitioned ? 'w-64' : 'w-36'} h-36
                  border-2 ${teamBorderClass} border-opacity-50 
                  transition-all duration-700 ease-in-out
                  hover:border-opacity-100 rounded-lg
                  ${team === "BLUE" ? "origin-left" : "origin-right"}
                `}
              >
                {(slot.champion || isPendingSlot) ? (
                  <div className="relative h-full group">
                    <img 
                      src={getChampionImage(slot, index, isPendingSlot)}
                      alt={isPendingSlot ? pendingChampion!.name : slot.champion!.name}
                      onError={() => handleImageError(index)}
                      style={{
                        objectPosition: team === "BLUE" ? "left center" : "right center",
                        objectFit: pickedChampions[index] ? 'cover' : 'contain',
                        width: pickedChampions[index] ? '100%' : '136px',
                        height: '136px'
                      }}
                      className={`
                        transition-all duration-300 ease-in-out
                        ${isPendingSlot ? 'opacity-90' : ''}
                        ${!pickedChampions[index] ? 'mx-auto' : ''}
                      `}
                      crossOrigin="anonymous"
                    />
                    {isPendingSlot && (
                      <div className="absolute bottom-0 left-0 right-0 bg-black bg-opacity-80 py-2">
                        <div className="text-base font-medium text-center text-white">
                          {pendingChampion!.name}
                        </div>
                      </div>
                    )}
                    {isPickedChampion && (
                      <div className="absolute bottom-0 left-0 right-0 bg-black bg-opacity-60 py-1">
                        <div className="text-sm text-center text-white">
                          {slot.champion!.name}
                        </div>
                      </div>
                    )}
                  </div>
                ) : (
                  <div className="flex flex-col items-center justify-center h-full">
                    <div className="w-full h-full bg-black bg-opacity-30"></div>
                  </div>
                )}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default TeamComposition;

// Add this to your global CSS or a new style tag
const styles = `
@keyframes border-glow {
  0% {
    box-shadow: 0 0 5px 1px rgba(255, 215, 0, 0.3);
    border-color: rgba(255, 215, 0, 0.5);
  }
  25% {
    box-shadow: 0 0 8px 2px rgba(255, 215, 0, 0.4);
    border-color: rgba(255, 215, 0, 0.7);
  }
  50% {
    box-shadow: 0 0 12px 3px rgba(255, 215, 0, 0.5);
    border-color: rgba(255, 215, 0, 0.9);
  }
  75% {
    box-shadow: 0 0 8px 2px rgba(255, 215, 0, 0.4);
    border-color: rgba(255, 215, 0, 0.7);
  }
  100% {
    box-shadow: 0 0 5px 1px rgba(255, 215, 0, 0.3);
    border-color: rgba(255, 215, 0, 0.5);
  }
}

.animate-border-glow {
  animation: border-glow 3s ease-in-out infinite;
  border: 2px solid rgba(255, 215, 0, 0.5);
}
`;

const styleSheet = document.createElement("style");
styleSheet.innerText = styles;
document.head.appendChild(styleSheet);
