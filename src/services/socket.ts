import { io, Socket } from 'socket.io-client';
import { Champion } from '../data/champions';
import { Team } from '../data/draftTypes';

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
  pendingChampion: Champion | null;
  pendingTeam: Team | null;
}

let socket: Socket | null = null;
let reconnectAttempts = 0;
const MAX_RECONNECT_ATTEMPTS = 3;

const connect = () => {
  if (socket) return socket;

  // Use production URL in production, localhost in development
  const socketUrl = import.meta.env.PROD 
    ? window.location.origin 
    : 'http://localhost:3001';
  
  console.log('Connecting to socket server at:', socketUrl);

  socket = io(socketUrl, {
    reconnection: true,
    reconnectionAttempts: MAX_RECONNECT_ATTEMPTS,
    reconnectionDelay: 1000,
    transports: ['websocket', 'polling'],
    withCredentials: true,
    forceNew: true,
    timeout: 5000
  });

  socket.on('connect_error', (error) => {
    console.error('Connection error:', error);
    reconnectAttempts++;
    if (reconnectAttempts >= MAX_RECONNECT_ATTEMPTS) {
      console.error('Max reconnection attempts reached');
    }
  });

  socket.on('disconnect', (reason) => {
    console.log('Disconnected:', reason);
    if (reason === 'io server disconnect') {
      socket?.connect();
    }
  });

  return socket;
};

const disconnect = () => {
  if (socket) {
    socket.disconnect();
    socket = null;
    reconnectAttempts = 0;
  }
};

const createDraft = (draftId: string, blueTeamName: string, redTeamName: string) => {
  socket?.emit('createDraft', { draftId, blueTeamName, redTeamName });
};

const joinDraft = (draftId: string, team: Team) => {
  socket?.emit('joinDraft', { draftId, team });
};

const toggleReady = (draftId: string, team: Team) => {
  console.log('Toggling ready for team:', team);
  socket?.emit('toggleReady', { draftId, team });
};

const selectChampion = (draftId: string, champion: Champion, team: Team) => {
  socket?.emit('selectChampion', { draftId, champion, team });
};

const setPendingSelection = (draftId: string, champion: Champion | null, team: Team) => {
  socket?.emit('setPendingSelection', { draftId, champion, team });
};

const reorderTeam = (draftId: string, team: Team, sourceIndex: number, targetIndex: number) => {
  socket?.emit('reorderTeam', { draftId, team, sourceIndex, targetIndex });
};

const onTeamReorder = (callback: (data: { team: Team, sourceIndex: number, targetIndex: number }) => void) => {
  socket?.on('teamReorder', callback);
};

const onPendingSelectionUpdate = (callback: (data: { champion: Champion | null, team: Team }) => void) => {
  socket?.on('pendingSelectionUpdate', callback);
};

const onDraftStateUpdate = (callback: (state: any) => void) => {
  socket?.on('draftStateUpdate', callback);
};

const onDraftComplete = (callback: (state: any) => void) => {
  socket?.on('draftComplete', callback);
};

const onTimerExpired = (callback: (data: { currentPhase: number }) => void) => {
  socket?.on('timerExpired', callback);
};

export const socketService = {
  connect,
  disconnect,
  createDraft,
  joinDraft,
  toggleReady,
  selectChampion,
  setPendingSelection,
  reorderTeam,
  onTeamReorder,
  onPendingSelectionUpdate,
  onDraftStateUpdate,
  onDraftComplete,
  onTimerExpired
}; 