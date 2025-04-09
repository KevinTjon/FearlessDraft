import { useEffect, useState, useRef } from "react";
import { Team } from "../data/draftTypes";

interface DraftTimerProps {
  isActive: boolean;
  team: Team;
  teamName: string;
  onTimeUp: () => string | null; // Returns a key if lock acquired, null if already locked
  durationSeconds: number;
  currentPhase: number;
}

const DraftTimer = ({ isActive, team, teamName, onTimeUp, durationSeconds, currentPhase }: DraftTimerProps) => {
  const [timeLeft, setTimeLeft] = useState(durationSeconds);
  const timerRef = useRef<NodeJS.Timeout | null>(null);
  const lastPhaseRef = useRef(currentPhase);
  const startTimeRef = useRef<number | null>(null);
  const hasLockRef = useRef<boolean>(false);

  // Single useEffect to handle all timer logic
  useEffect(() => {
    // Only reset timer on phase change or when timer is not active
    if (!isActive || currentPhase > lastPhaseRef.current || hasLockRef.current) {
      setTimeLeft(durationSeconds);
      startTimeRef.current = Date.now();
      lastPhaseRef.current = currentPhase;
      hasLockRef.current = false;
      
      if (timerRef.current) {
        clearInterval(timerRef.current);
        timerRef.current = null;
      }
      
      if (!isActive) return;
    }

    // Start or continue timer
    if (!timerRef.current && !hasLockRef.current) {
      // Initialize start time if not set
      if (!startTimeRef.current) {
        startTimeRef.current = Date.now() - ((durationSeconds - timeLeft) * 1000);
      }

      timerRef.current = setInterval(() => {
        const now = Date.now();
        const elapsed = Math.floor((now - (startTimeRef.current || now)) / 1000);
        const newTimeLeft = Math.max(0, durationSeconds - elapsed);
        
        setTimeLeft(newTimeLeft);

        if (newTimeLeft <= 0 && !hasLockRef.current) {
          const key = onTimeUp();
          if (key) {
            hasLockRef.current = true;
            if (timerRef.current) {
              clearInterval(timerRef.current);
              timerRef.current = null;
            }
          }
        }
      }, 200); // Update more frequently for smoother countdown
    }

    return () => {
      if (timerRef.current) {
        clearInterval(timerRef.current);
        timerRef.current = null;
      }
    };
  }, [isActive, currentPhase, onTimeUp, durationSeconds]);
  
  const percentage = (timeLeft / durationSeconds) * 100;
  
  return (
    <div className="relative w-[40rem] h-10 flex items-center justify-center rounded-lg bg-black/40 overflow-hidden">
      {/* Progress bar background */}
      <div 
        className={`absolute left-0 top-0 h-full transition-all duration-200 ${
          team === 'BLUE' ? 'bg-blue-600/30' : 'bg-red-600/30'
        }`}
        style={{ width: `${percentage}%` }}
      />
      
      {/* Timer text */}
      <div className={`relative text-lg font-bold ${
        timeLeft <= 5 ? 'text-red-400' : 'text-white'
      }`}>
        {timeLeft}s
      </div>
    </div>
  );
};

export default DraftTimer;
