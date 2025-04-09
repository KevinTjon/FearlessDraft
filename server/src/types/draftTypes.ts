import { Champion } from './champions.js';

export type Team = "BLUE" | "RED";

export interface DraftSlot {
  team: Team;
  champion: Champion | null;
  isActive: boolean;
  isBan: boolean;
  position?: string;
}

export interface DraftPhase {
  id: number;
  team: Team;
  type: "BAN" | "PICK";
  completed: boolean;
}

export const draftSequence: DraftPhase[] = [
  { id: 1, team: "BLUE", type: "BAN", completed: false },
  { id: 2, team: "RED", type: "BAN", completed: false },
  { id: 3, team: "BLUE", type: "BAN", completed: false },
  { id: 4, team: "RED", type: "BAN", completed: false },
  { id: 5, team: "BLUE", type: "BAN", completed: false },
  { id: 6, team: "RED", type: "BAN", completed: false },
  { id: 7, team: "BLUE", type: "PICK", completed: false },
  { id: 8, team: "RED", type: "PICK", completed: false },
  { id: 9, team: "RED", type: "PICK", completed: false },
  { id: 10, team: "BLUE", type: "PICK", completed: false },
  { id: 11, team: "BLUE", type: "PICK", completed: false },
  { id: 12, team: "RED", type: "PICK", completed: false },
  { id: 13, team: "RED", type: "BAN", completed: false },
  { id: 14, team: "BLUE", type: "BAN", completed: false },
  { id: 15, team: "RED", type: "BAN", completed: false },
  { id: 16, team: "BLUE", type: "BAN", completed: false },
  { id: 17, team: "RED", type: "PICK", completed: false },
  { id: 18, team: "BLUE", type: "PICK", completed: false },
  { id: 19, team: "BLUE", type: "PICK", completed: false },
  { id: 20, team: "RED", type: "PICK", completed: false }
]; 