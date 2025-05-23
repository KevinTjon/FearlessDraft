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
  isDraftComplete?: boolean;
  isSwapPhase?: boolean;
  canSwap?: boolean;
  onReorder?: (sourceIndex: number, targetIndex: number) => void;
}

const TeamComposition = ({ 
  slots, 
  team, 
  teamName, 
  isPickPhase, 
  pendingChampion, 
  isMyTeam, 
  isDraftComplete,
  isSwapPhase,
  canSwap,
  onReorder 
}: TeamCompositionProps) => {
  const teamClass = team === "BLUE" ? "bg-blue-900" : "bg-lol-darkRed";
  const teamBorderClass = team === "BLUE" ? "border-lol-blue" : "border-lol-red";
  const teamTextClass = team === "BLUE" ? "text-lol-lightBlue" : "text-lol-red";
  
  // Track which champions have completed their pick animation
  const [pickedChampions, setPickedChampions] = useState<{[key: number]: boolean}>({});
  // Track failed splash art loads
  const [failedLoads, setFailedLoads] = useState<{[key: number]: boolean}>({});
  // Track image transition state
  const [imageTransitioned, setImageTransitioned] = useState<{[key: number]: boolean}>({});
  // Track drag state
  const [draggedIndex, setDraggedIndex] = useState<number | null>(null);
  // Add new state for drag preview
  const [dragPreview, setDragPreview] = useState<string | null>(null);
  const [draggedOverIndex, setDraggedOverIndex] = useState<number | null>(null);

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

  // Modify the drag handlers to check for swap phase
  const handleDragStart = (e: React.DragEvent<HTMLDivElement>, index: number) => {
    if ((!isDraftComplete && !isSwapPhase) || !allSlots[index].champion || !canSwap) return;
    
    setDraggedIndex(index);
    e.dataTransfer.setData('text/plain', index.toString());
    
    // Create a custom drag preview
    const draggedSlot = allSlots[index];
    if (draggedSlot.champion) {
      // Set drag effect
      e.dataTransfer.effectAllowed = 'move';
      
      // Create a preview element
      const preview = document.createElement('div');
      preview.className = `
        fixed top-0 left-0 pointer-events-none
        bg-black/90 rounded-lg border-2 ${teamBorderClass}
        shadow-lg transform scale-90 opacity-90
        w-36 h-36 flex items-center justify-center
        overflow-hidden
      `;
      
      // Add champion image to preview
      const img = document.createElement('img');
      img.src = draggedSlot.champion.image;
      img.className = 'w-full h-full object-cover';
      preview.appendChild(img);
      
      // Add champion name
      const nameDiv = document.createElement('div');
      nameDiv.className = 'absolute bottom-0 left-0 right-0 bg-black/80 py-1 px-2 text-white text-sm text-center';
      nameDiv.textContent = draggedSlot.champion.name;
      preview.appendChild(nameDiv);
      
      // Add preview to document temporarily
      document.body.appendChild(preview);
      
      // Set drag image and offset
      e.dataTransfer.setDragImage(preview, 68, 68);
      
      // Remove preview after a short delay
      setTimeout(() => {
        document.body.removeChild(preview);
      }, 0);
    }
  };

  const handleDragEnd = (e: React.DragEvent<HTMLDivElement>) => {
    setDraggedIndex(null);
    setDraggedOverIndex(null);
    e.currentTarget.classList.remove('opacity-50');
  };

  const handleDragOver = (e: React.DragEvent<HTMLDivElement>, index: number) => {
    e.preventDefault();
    if ((!isDraftComplete && !isSwapPhase) || !canSwap) return;
    setDraggedOverIndex(index);
    e.currentTarget.classList.add('border-opacity-100');
    e.dataTransfer.dropEffect = 'move';
  };

  const handleDragLeave = (e: React.DragEvent<HTMLDivElement>) => {
    e.currentTarget.classList.remove('border-opacity-100');
    setDraggedOverIndex(null);
  };

  const handleDrop = (e: React.DragEvent<HTMLDivElement>, targetIndex: number) => {
    e.preventDefault();
    e.currentTarget.classList.remove('border-opacity-100');
    
    if (!isDraftComplete || draggedIndex === null) return;
    
    const sourceIndex = parseInt(e.dataTransfer.getData('text/plain'));
    if (sourceIndex === targetIndex) return;
    
    // Call onReorder with both indices for a direct swap
    onReorder?.(sourceIndex, targetIndex);
  };

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
        }, 1); // 300ms delay before expanding
      }
    });
  }, [slots]);

  // Effect to handle draft completion animation
  useEffect(() => {
    if (isDraftComplete) {
      // When draft completes, trigger all transitions
      allSlots.forEach((slot, index) => {
        if (slot.champion) {
          setPickedChampions(prev => ({
            ...prev,
            [index]: true
          }));
          setTimeout(() => {
            setImageTransitioned(prev => ({
              ...prev,
              [index]: true
            }));
          }, 300);
        }
      });
    }
  }, [isDraftComplete]);

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
    <div className={`
      ${teamClass} bg-opacity-20 px-2 sm:px-4 py-2 sm:py-4 rounded-lg 
      h-full w-full flex flex-col justify-center
      transition-all duration-700 ease-in-out
      max-w-[320px] sm:max-w-[400px] md:max-w-[480px] lg:max-w-[560px]
      min-w-[240px]
      ${team === "RED" ? "ml-auto" : ""}
      bg-black/20 border border-gray-800
      ${team === "BLUE" ? "team-blue-glow shadow-lg shadow-blue-500/50" : ""}
      ${team === "RED" ? "team-red-glow shadow-lg shadow-red-500/50" : ""}
      scale-105
    `}>
      <h3 className={`text-lg sm:text-xl md:text-2xl font-bold ${teamTextClass} text-center mb-2 sm:mb-4`}>
        {teamName}
        {isSwapPhase && canSwap && (
          <div className="text-xs sm:text-sm font-normal text-lol-gold mt-1">
            {isMyTeam ? "Drag champions to swap positions" : "Team can swap positions"}
          </div>
        )}
        {isSwapPhase && !canSwap && (
          <div className="text-xs sm:text-sm font-normal text-lol-gold mt-1">
            Swapping locked
          </div>
        )}
      </h3>
      <div className={`border-b-2 ${teamBorderClass} border-opacity-50 mb-4 sm:mb-6`}></div>
      <div className="flex flex-col gap-2 sm:gap-4 w-full">
        {allSlots.map((slot, index) => {
          const isPendingSlot = index === nextEmptySlotIndex && pendingChampion && isPickPhase;
          const isPickedChampion = slot.champion && pickedChampions[index];
          const hasTransitioned = imageTransitioned[index];
          const isDraftCompleteTransition = (isDraftComplete || isSwapPhase) && hasTransitioned;
          const isBeingDragged = index === draggedIndex;
          const isDraggedOver = index === draggedOverIndex;
          
          return (
            <div 
              key={slot.position}
              draggable={(isDraftComplete || (isSwapPhase && canSwap && isMyTeam)) && slot.champion !== null}
              onDragStart={(e) => handleDragStart(e, index)}
              onDragEnd={handleDragEnd}
              onDragOver={(e) => handleDragOver(e, index)}
              onDragLeave={handleDragLeave}
              onDrop={(e) => handleDrop(e, index)}
              className={`
                relative cursor-${(isDraftComplete || (isSwapPhase && canSwap && isMyTeam)) && slot.champion ? 'move' : 'default'}
                w-full
                transition-all duration-700 ease-in-out
                ${isBeingDragged ? 'opacity-50 scale-95' : 'opacity-100'}
                ${isDraggedOver ? 'scale-105' : 'scale-100'}
                hover:scale-105
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
                  aspect-[3/1]
                  border border-gray-700
                  transition-all duration-300 ease-in-out
                  ${isDraggedOver ? 'border-opacity-100 scale-105 shadow-xl' : 'hover:border-opacity-100'} 
                  rounded-lg
                  ${isBeingDragged ? 'opacity-50' : ''}
                  ${slot.champion ? 'bg-black/40' : ''}
                  shadow-lg hover:shadow-xl
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
                        objectFit: 'cover',
                        width: '100%',
                        height: '100%'
                      }}
                      className={`
                        transition-all duration-300 ease-in-out
                        ${isPendingSlot ? 'opacity-90' : ''}
                        scale-105 hover:scale-110
                        ${isBeingDragged ? 'scale-95' : ''}
                      `}
                      crossOrigin="anonymous"
                    />
                    {isPendingSlot && (
                      <div className="absolute bottom-0 left-0 right-0 bg-black bg-opacity-80 py-1 sm:py-2">
                        <div className="text-sm sm:text-base font-medium text-center text-white">
                          {pendingChampion!.name}
                        </div>
                      </div>
                    )}
                    {isPickedChampion && (
                      <div className="absolute bottom-0 left-0 right-0 bg-black bg-opacity-60 py-0.5 sm:py-1">
                        <div className="text-xs sm:text-sm text-center text-white">
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
