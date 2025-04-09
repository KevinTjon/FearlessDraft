import { Server } from 'socket.io';
import { createServer } from 'http';
import { DraftPhase, Team, draftSequence } from './types/draftTypes.js';
import { Champion } from '../../src/data/champions.js';
import express from 'express';
import cors from 'cors';

interface DraftSession {
  id: string;
  blueTeamName: string;
  redTeamName: string;
  blueReady: boolean;
  redReady: boolean;
  inProgress: boolean;
  currentPhaseIndex: number;
  bluePicks: Champion[];
  redPicks: Champion[];
  blueBans: Champion[];
  redBans: Champion[];
  createdAt: string;
  blueConnected: boolean;
  redConnected: boolean;
  timer: NodeJS.Timeout | null;
  pendingChampion: Champion | null;
  pendingTeam: Team | null;
}

const app = express();
const httpServer = createServer(app);

// Enable CORS for all routes
app.use(cors());

// Configure Socket.IO with CORS
const io = new Server(httpServer, {
  cors: {
    origin: true,
    methods: ["GET", "POST"],
    credentials: true,
    allowedHeaders: ["*"]
  },
  allowEIO3: true,
  transports: ['websocket', 'polling']
});

const draftSessions = new Map<string, DraftSession>();

// Timer function for draft phases
function startDraftTimer(draftId: string) {
  const session = draftSessions.get(draftId);
  if (!session) {
    console.log('No session found for timer start:', { draftId });
    return;
  }

  // Check if we've reached the end of the draft
  if (session.currentPhaseIndex >= draftSequence.length) {
    console.log('Draft complete, no timer needed:', { phase: session.currentPhaseIndex });
    session.inProgress = false;
    io.to(draftId).emit('draftComplete', session);
    return;
  }

  const currentPhase = draftSequence[session.currentPhaseIndex];
  if (!currentPhase) {
    console.error('No phase definition found:', { phase: session.currentPhaseIndex });
    return;
  }

  const TIMER_DURATION = 30000; // 30 seconds

  // Clear any existing timer
  if (session.timer) {
    clearTimeout(session.timer);
    session.timer = null;
  }

  // Send phase start update
  console.log('Starting timer for phase:', {
    phase: session.currentPhaseIndex,
    team: currentPhase.team,
    type: currentPhase.type
  });

  const phaseStartUpdate = {
    ...session,
    timer: null
  };
  io.to(draftId).emit('draftStateUpdate', phaseStartUpdate);

  // Set new timer
  session.timer = setTimeout(() => {
    session.timer = null;
  }, TIMER_DURATION);
}

function validatePhaseTransition(session: any, nextPhaseIndex: number) {
  if (nextPhaseIndex >= draftSequence.length) return true;

  const currentPhase = draftSequence[session.currentPhaseIndex];
  const nextPhase = draftSequence[nextPhaseIndex];

  console.log('Validating phase transition:', {
    currentPhase: session.currentPhaseIndex,
    currentTeam: currentPhase.team,
    nextPhase: nextPhaseIndex,
    nextTeam: nextPhase.team
  });

  return true; // For now, just log the transition
}

io.on('connection', (socket) => {
  let currentDraftId: string | null = null;
  let currentTeam: Team | null = null;

  socket.on('joinDraft', ({ draftId, team }: { draftId: string; team: Team }) => {
    console.log('Joining draft session:', { draftId, team });
    
    const session = draftSessions.get(draftId);
    if (!session) {
      console.log('No session found, creating new session for:', { draftId, team });
      // Create a new session if it doesn't exist
      const newSession: DraftSession = {
        id: draftId,
        blueTeamName: 'Blue Team',
        redTeamName: 'Red Team',
        blueReady: false,
        redReady: false,
        inProgress: false,
        currentPhaseIndex: 0,
        bluePicks: [],
        redPicks: [],
        blueBans: [],
        redBans: [],
        createdAt: new Date().toISOString(),
        blueConnected: team === 'BLUE',
        redConnected: team === 'RED',
        timer: null,
        pendingChampion: null,
        pendingTeam: null
      };
      draftSessions.set(draftId, newSession);
      currentDraftId = draftId;
      currentTeam = team;
      socket.join(draftId);

      const sessionUpdate = {
        ...newSession,
        timer: null
      };
      io.to(draftId).emit('draftStateUpdate', sessionUpdate);
      return;
    }

    // Update connection status
    if (team === 'BLUE') {
      session.blueConnected = true;
    } else {
      session.redConnected = true;
    }

    currentDraftId = draftId;
    currentTeam = team;
    socket.join(draftId);

    // Wait a short moment to ensure join is complete
    setTimeout(() => {
      const sessionUpdate = {
        ...session,
        timer: null
      };
      io.to(draftId).emit('draftStateUpdate', sessionUpdate);
    }, 100);
  });

  socket.on('createDraft', ({ draftId, blueTeamName, redTeamName }: { draftId: string; blueTeamName: string; redTeamName: string }) => {
    console.log('Creating draft session:', { draftId, blueTeamName, redTeamName });
    
    let session = draftSessions.get(draftId);
    if (!session) {
      session = {
        id: draftId,
        blueTeamName,
        redTeamName,
        blueReady: false,
        redReady: false,
        inProgress: false,
        currentPhaseIndex: 0,
        bluePicks: [],
        redPicks: [],
        blueBans: [],
        redBans: [],
        createdAt: new Date().toISOString(),
        blueConnected: false,
        redConnected: false,
        timer: null,
        pendingChampion: null,
        pendingTeam: null
      };
      draftSessions.set(draftId, session);
      console.log('Created new draft session:', { draftId, status: 'created' });
    } else {
      // Update team names for existing session
      session.blueTeamName = blueTeamName;
      session.redTeamName = redTeamName;
      console.log('Updated existing draft session:', { draftId, status: 'updated' });
    }

    // Ensure socket joins the room before sending any updates
    socket.join(draftId);

    // Wait a short moment to ensure join is complete
    setTimeout(() => {
      const sessionUpdate = {
        ...session!,
        timer: null
      };
      io.to(draftId).emit('draftStateUpdate', sessionUpdate);
    }, 100);
  });

  socket.on('toggleReady', ({ draftId, team }: { draftId: string; team: Team }) => {
    const session = draftSessions.get(draftId);
    if (!session) return;

    if (team === 'BLUE') {
      session.blueReady = !session.blueReady;
    } else {
      session.redReady = !session.redReady;
    }

    // Start draft if both teams are ready
    if (session.blueReady && session.redReady && !session.inProgress) {
      session.inProgress = true;
      startDraftTimer(draftId);
    }

    const sessionUpdate = {
      ...session,
      timer: null
    };
    io.to(draftId).emit('draftStateUpdate', sessionUpdate);
  });

  socket.on('setPendingSelection', ({ draftId, champion, team }: { draftId: string; champion: Champion | null; team: Team }) => {
    console.log('Setting pending selection:', { 
      draftId, 
      champion: champion?.name, 
      team,
      phase: draftSessions.get(draftId)?.currentPhaseIndex
    });

    const session = draftSessions.get(draftId);
    if (!session) {
      console.log('No session found, cannot set pending selection:', { draftId });
      return;
    }

    if (!session.inProgress) {
      console.log('Draft not in progress, cannot set pending selection:', { draftId });
      return;
    }

    const currentPhase = draftSequence[session.currentPhaseIndex];
    if (!currentPhase) {
      console.log('Invalid phase for pending selection:', { 
        phase: session.currentPhaseIndex,
        draftId 
      });
      return;
    }

    if (currentPhase.team !== team) {
      console.log('Wrong team attempting pending selection:', {
        attemptingTeam: team,
        currentPhase: session.currentPhaseIndex,
        expectedTeam: currentPhase.team,
        phaseType: currentPhase.type
      });
      return;
    }

    // Update pending selection
    session.pendingChampion = champion;
    session.pendingTeam = champion ? team : null;

    console.log('Updated pending selection:', {
      phase: session.currentPhaseIndex,
      team: session.pendingTeam,
      champion: session.pendingChampion?.name
    });

    // Broadcast the pending selection update to all clients in the draft
    io.to(draftId).emit('pendingSelectionUpdate', { champion, team });

    // Also send a state update to keep everything in sync
    const sessionUpdate = {
      ...session,
      timer: null
    };
    io.to(draftId).emit('draftStateUpdate', sessionUpdate);
  });

  socket.on('selectChampion', ({ draftId, champion, team }: { draftId: string; champion: Champion | null; team: Team }) => {
    const session = draftSessions.get(draftId);
    if (!session || !session.inProgress) return;

    const currentPhase = draftSequence[session.currentPhaseIndex];
    if (currentPhase.team !== team) {
      console.log('Wrong team trying to make selection:', {
        expectedTeam: currentPhase.team,
        actualTeam: team,
        phase: session.currentPhaseIndex
      });
      return;
    }

    // Create empty champion if null was sent
    const championToUse = champion || {
      id: 'empty',
      name: 'Empty Selection',
      title: 'Timed Out',
      image: '',
      roles: []
    };

    // Record the selection
    if (currentPhase.type === 'PICK') {
      if (team === 'BLUE') {
        session.bluePicks.push(championToUse);
      } else {
        session.redPicks.push(championToUse);
      }
    } else {
      if (team === 'BLUE') {
        session.blueBans.push(championToUse);
      } else {
        session.redBans.push(championToUse);
      }
    }

    // Clear current timer
    if (session.timer) {
      clearTimeout(session.timer);
      session.timer = null;
    }

    // Clear pending selection immediately to prevent visual duplication
    session.pendingChampion = null;
    session.pendingTeam = null;

    // Send a single confirmation update with the selection
    const confirmUpdate = {
      ...session,
      timer: null
    };
    io.to(draftId).emit('draftStateUpdate', confirmUpdate);

    // Advance phase after a short delay
    setTimeout(() => {
      // Validate next phase before advancing
      const nextPhaseIndex = session.currentPhaseIndex + 1;
      if (validatePhaseTransition(session, nextPhaseIndex)) {
        // Advance to next phase
        session.currentPhaseIndex = nextPhaseIndex;
        console.log('Advancing to next phase:', {
          newPhase: session.currentPhaseIndex,
          nextTeam: session.currentPhaseIndex < draftSequence.length ? draftSequence[session.currentPhaseIndex].team : 'none'
        });

        if (session.currentPhaseIndex < draftSequence.length) {
          // Start timer for next phase which will send the phase update
          startDraftTimer(draftId);
        } else {
          session.inProgress = false;
          io.to(draftId).emit('draftComplete', session);
        }
      } else {
        console.error('Invalid phase transition detected');
      }
    }, 300);
  });

  socket.on('disconnect', () => {
    if (currentDraftId && currentTeam) {
      const session = draftSessions.get(currentDraftId);
      if (session) {
        if (currentTeam === 'BLUE') {
          session.blueConnected = false;
        } else {
          session.redConnected = false;
        }
        const sessionUpdate = {
          ...session,
          timer: null
        };
        io.to(currentDraftId).emit('draftStateUpdate', sessionUpdate);
      }
    }
  });
});

httpServer.listen(3001, () => {
  console.log('Server running on port 3001');
});
