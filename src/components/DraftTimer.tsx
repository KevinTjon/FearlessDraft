import { useEffect, useState, useRef } from "react";
import { Team } from "../data/draftTypes";

interface DraftTimerProps {
  isActive: boolean;
  team: Team;
  teamName: string;
  onTimeUp: () => string | null; // Returns a key if lock acquired, null if already locked
  durationSeconds: number;
  currentPhase: number;
  // Timer synchronization props
  phaseStartTime?: number | null;
  phaseTimeLeft?: number | null;
  phaseTimerActive?: boolean;
}

const DraftTimer = ({ 
  isActive, 
  team, 
  teamName, 
  onTimeUp, 
  durationSeconds, 
  currentPhase, 
  phaseStartTime, 
  phaseTimeLeft, 
  phaseTimerActive 
}: DraftTimerProps) => {
  const [timeLeft, setTimeLeft] = useState(durationSeconds);
  const timerRef = useRef<NodeJS.Timeout | null>(null);
  const lastPhaseRef = useRef(currentPhase);
  const startTimeRef = useRef<number | null>(null);
  const hasLockRef = useRef<boolean>(false);

  // Enhanced useEffect with server synchronization
  useEffect(() => {
    // Clear existing timer
    if (timerRef.current) {
      clearInterval(timerRef.current);
      timerRef.current = null;
    }

    // Reset on phase change or inactive
    if (!isActive || currentPhase > lastPhaseRef.current || hasLockRef.current) {
      lastPhaseRef.current = currentPhase;
      hasLockRef.current = false;
      
      if (!isActive) {
        setTimeLeft(durationSeconds);
        return;
      }
    }

    // Use server-synchronized timer state if available
    if (phaseTimerActive && phaseStartTime && phaseTimeLeft !== null) {
      console.log('🔄 Syncing timer with server:', { phaseStartTime, phaseTimeLeft, phaseTimerActive });
      
      // Calculate current time based on server state
      const serverElapsed = (Date.now() - phaseStartTime) / 1000;
      const syncedTimeLeft = Math.max(0, phaseTimeLeft - Math.floor(serverElapsed));
      
      setTimeLeft(syncedTimeLeft);
      startTimeRef.current = phaseStartTime;
    } else if (isActive) {
      // Fallback to local timer logic
      setTimeLeft(durationSeconds);
      startTimeRef.current = Date.now();
    }

    // Start timer if active and not locked
    if (isActive && !hasLockRef.current) {
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
  }, [isActive, currentPhase, onTimeUp, durationSeconds, phaseStartTime, phaseTimeLeft, phaseTimerActive]);
  
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
