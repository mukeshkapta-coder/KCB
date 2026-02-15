export enum PlayerSkill {
  BATSMAN = 'Batter',
  BOWLER = 'Bowler',
  ALL_ROUNDER = 'All-Rounder',
  WICKETKEEPER = 'WK-Batter'
}

export interface PlayerStats {
  matches: number;
  innings?: number;
  runs?: number;
  wickets?: number;
  strikeRate?: number;
  economy?: number;
}

export interface Player {
  id: string;
  name: string;
  skill: string;
  basePrice: number;
  category: 'A+' | 'A' | 'B' | 'C';
  country: string;
  rating: number; 
  teamId?: string;
  soldPrice?: number;
  isSold: boolean;
  stats?: PlayerStats;
  originalTeam?: string;
  imageUrl?: string;
}

export interface Franchise {
  id: string;
  name: string;
  budget: number;
  roster: Player[];
  color: string;
  icon: string;
  captainId?: string;
  viceCaptainId?: string;
  totalPoints?: number;
}

export interface AuctionState {
  currentPhase: 'PRE_AUCTION' | 'LIVE_AUCTION' | 'POST_AUCTION';
  currentPlayerId: string | null;
  currentBid: number;
  lastBidderId: string | null;
  bidHistory: { teamId: string; amount: number }[];
}

export interface MatchPlayerPerformance {
  playerName: string;
  points: number;
  isPOTM: boolean;
  breakdown: string;
  franchiseIdSnapshot?: string;
  multiplierApplied?: number;
}

export interface MatchRecord {
  id: string;
  matchNumber: number;
  date: string;
  url: string;
  performances: MatchPlayerPerformance[];
  isPhaseFixed: boolean;
}