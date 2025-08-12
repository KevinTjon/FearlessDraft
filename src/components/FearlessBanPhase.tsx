import { Champion } from "@champ-draft-arena/shared";

interface FearlessBanPhaseProps {
  fearlessBans: Champion[];
  gameNumber: number;
}

const FearlessBanPhase = ({ fearlessBans, gameNumber }: FearlessBanPhaseProps) => {
  console.log('🚫 FearlessBanPhase render:', { 
    fearlessBansCount: fearlessBans.length, 
    gameNumber,
    fearlessBans: fearlessBans.map(c => c.name) 
  });
  
  if (fearlessBans.length === 0) {
    console.log('🚫 FearlessBanPhase: No fearless bans, not rendering');
    return null; // Don't show component for Game 1
  }

  // Split fearless bans into two groups for display (like regular ban phase)
  const midPoint = Math.ceil(fearlessBans.length / 2);
  const leftBans = fearlessBans.slice(0, midPoint);
  const rightBans = fearlessBans.slice(midPoint);

  return (
    <div className="grid grid-cols-2 gap-8 mb-4">
      {/* Left Side Fearless Bans */}
      <div className="space-y-2">
        <h4 className="text-sm font-medium text-purple-400 mb-3 text-left">Previous Bans</h4>
        <div className="grid grid-cols-5 gap-2">
          {leftBans.map((champion, index) => (
            <div
              key={`fearless-left-${champion.id}`}
              className="relative group"
            >
              <div className="w-12 h-12 rounded overflow-hidden border border-gray-600/50 bg-black/30">
                <img
                  src={champion.image}
                  alt={champion.name}
                  className="w-full h-full object-cover grayscale opacity-50"
                />
              </div>
              
              {/* Tooltip */}
              <div className="absolute bottom-full left-1/2 transform -translate-x-1/2 mb-2 px-2 py-1 bg-black/90 text-white text-xs rounded opacity-0 group-hover:opacity-100 transition-opacity duration-200 pointer-events-none z-50 whitespace-nowrap">
                {champion.name}
                <br />
                <span className="text-purple-300">Fearless Ban</span>
              </div>
            </div>
          ))}
          {/* Fill empty slots */}
          {Array.from({ length: Math.max(0, 5 - leftBans.length) }).map((_, index) => (
            <div
              key={`fearless-left-empty-${index}`}
              className="w-12 h-12 rounded overflow-hidden border border-gray-700/30 bg-black/20"
            />
          ))}
        </div>
      </div>

      {/* Right Side Fearless Bans */}
      <div className="space-y-2">
        <h4 className="text-sm font-medium text-purple-400 mb-3 text-right">Previous Bans</h4>
        <div className="grid grid-cols-5 gap-2">
          {rightBans.map((champion, index) => (
            <div
              key={`fearless-right-${champion.id}`}
              className="relative group"
            >
              <div className="w-12 h-12 rounded overflow-hidden border border-gray-600/50 bg-black/30">
                <img
                  src={champion.image}
                  alt={champion.name}
                  className="w-full h-full object-cover grayscale opacity-50"
                />
              </div>
              
              {/* Tooltip */}
              <div className="absolute bottom-full left-1/2 transform -translate-x-1/2 mb-2 px-2 py-1 bg-black/90 text-white text-xs rounded opacity-0 group-hover:opacity-100 transition-opacity duration-200 pointer-events-none z-50 whitespace-nowrap">
                {champion.name}
                <br />
                <span className="text-purple-300">Fearless Ban</span>
              </div>
            </div>
          ))}
          {/* Fill empty slots */}
          {Array.from({ length: Math.max(0, 5 - rightBans.length) }).map((_, index) => (
            <div
              key={`fearless-right-empty-${index}`}
              className="w-12 h-12 rounded overflow-hidden border border-gray-700/30 bg-black/20"
            />
          ))}
        </div>
      </div>
    </div>
  );
};

export default FearlessBanPhase;
