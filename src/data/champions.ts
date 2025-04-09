import { Champion } from './types';
import { allChampions } from './staticChampions';

// Export the champions from staticChampions
export const champions: Champion[] = allChampions;

const DDRAGON_VERSION = '15.7.1';
const DDRAGON_BASE_URL = `https://ddragon.leagueoflegends.com/cdn/${DDRAGON_VERSION}`;

// Get all unique roles from the champions
export const getAllRoles = (): string[] => {
  const rolesSet = new Set<string>();
  champions.forEach(champion => {
    champion.roles.forEach(role => rolesSet.add(role));
  });
  return Array.from(rolesSet).sort();
};

// Get champions by role
export const getChampionsByRole = (role: string): Champion[] => {
  return champions.filter(champion => champion.roles.includes(role));
};

// Export all available roles
export const availableRoles = getAllRoles();

