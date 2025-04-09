import { DraftPhase, Team } from "../data/draftTypes";

interface PhaseIndicatorProps {
  phases: DraftPhase[];
  currentPhase: number;
  blueTeamName: string;
  redTeamName: string;
}

const PhaseIndicator = ({ phases, currentPhase, blueTeamName, redTeamName }: PhaseIndicatorProps) => {
  return (
    <div className="grid grid-cols-10 gap-2">
      {phases.map((phase, index) => (
        <div
          key={index}
          className={`flex items-center justify-center p-2 rounded ${
            index === currentPhase
              ? phase.team === 'BLUE'
                ? 'bg-blue-600/40 text-white'
                : 'bg-red-600/40 text-white'
              : index < currentPhase
              ? 'bg-gray-700/40 text-gray-300'
              : 'bg-gray-800/40 text-gray-400'
          }`}
        >
          <div className="text-center">
            <div className="text-sm font-medium">
              {phase.type === 'BAN' ? 'Ban' : 'Pick'}
            </div>
          </div>
        </div>
      ))}
    </div>
  );
};

export default PhaseIndicator;
