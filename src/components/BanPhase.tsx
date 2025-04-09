import { Champion } from "../data/types";
import { DEFAULT_CHAMPION_ICON } from "../data/staticChampions";
import { Team } from "../data/draftTypes";

interface BanPhaseProps {
  blueTeamBans: Champion[];
  redTeamBans: Champion[];
  blueTeamName: string;
  redTeamName: string;
  isPickPhase: boolean;
  currentPhase: number;
  pendingChampion: Champion | null;
  isMyTeam: boolean;
  team: Team;
  pendingTeam: Team | null;
}

const BanPhase = ({
  blueTeamBans,
  redTeamBans,
  blueTeamName,
  redTeamName,
  isPickPhase,
  currentPhase,
  pendingChampion,
  isMyTeam,
  team,
  pendingTeam
}: BanPhaseProps) => {
  return (
    <div className="grid grid-cols-2 gap-4">
      {/* Blue Team Bans */}
      <div className="space-y-2">
        <h3 className="text-sm font-medium text-blue-400 mb-2">{blueTeamName} Bans</h3>
        <div className="grid grid-cols-5 gap-2 max-w-[300px]">
          {Array.from({ length: 5 }).map((_, index) => {
            const champion = blueTeamBans[index];
            const isPending = pendingTeam === 'BLUE' && index === blueTeamBans.length;
            return (
              <div
                key={`blue-ban-${index}`}
                className={`w-12 h-12 rounded overflow-hidden border ${
                  champion
                    ? 'border-blue-500/50'
                    : isPending
                    ? 'border-red-500 animate-pulse'
                    : 'border-gray-700'
                }`}
              >
                {champion && (
                  <img
                    src={champion.image}
                    alt={champion.name}
                    className="w-full h-full object-cover"
                  />
                )}
                {isPending && pendingChampion && (
                  <img
                    src={pendingChampion.image}
                    alt={pendingChampion.name}
                    className="w-full h-full object-cover opacity-50"
                  />
                )}
              </div>
            );
          })}
        </div>
      </div>

      {/* Red Team Bans */}
      <div className="space-y-2 flex flex-col items-end">
        <h3 className="text-sm font-medium text-red-400 mb-2">{redTeamName} Bans</h3>
        <div className="grid grid-cols-5 gap-2 max-w-[300px]">
          {Array.from({ length: 5 }).map((_, index) => {
            const champion = redTeamBans[index];
            const isPending = pendingTeam === 'RED' && index === redTeamBans.length;
            return (
              <div
                key={`red-ban-${index}`}
                className={`w-12 h-12 rounded overflow-hidden border ${
                  champion
                    ? 'border-red-500/50'
                    : isPending
                    ? 'border-red-500 animate-pulse'
                    : 'border-gray-700'
                }`}
              >
                {champion && (
                  <img
                    src={champion.image}
                    alt={champion.name}
                    className="w-full h-full object-cover"
                  />
                )}
                {isPending && pendingChampion && (
                  <img
                    src={pendingChampion.image}
                    alt={pendingChampion.name}
                    className="w-full h-full object-cover opacity-50"
                  />
                )}
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};

export default BanPhase;
