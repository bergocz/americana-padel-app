export type PlayerPosition = 'reves' | 'derecha' | 'indiferente';

export type ScoringCriteria = 'games' | 'matches';

export interface AmericanaPlayer {
  id: string;
  name: string;
  position: PlayerPosition;
  avatar?: string;
  pointsWon: number;
  matchesPlayed: number;
  matchesWon?: number;
  active: boolean;
  restCount: number;
}

export interface ClubCourt {
  id: number;
  name: string;
  active: boolean;
  surfaceColor?: 'blue' | 'green' | 'terracotta';
}

export interface AmericanaPair {
  playerReves: AmericanaPlayer;
  playerDerecha: AmericanaPlayer;
}

export interface AmericanaMatch {
  id: string;
  courtId: number;
  courtName: string;
  teamA: AmericanaPair;
  teamB: AmericanaPair;
  scoreA?: number;
  scoreB?: number;
}

export interface AmericanaRound {
  roundNumber: number;
  matches: AmericanaMatch[];
  restingPlayers: AmericanaPlayer[];
  completed: boolean;
  timestamp: number;
}

export interface PlayerLeaderboardEntry {
  player: AmericanaPlayer;
  matchesPlayed: number;
  matchesWon: number;
  matchesTied: number;
  matchesLost: number;
  gamesWon: number;
  gamesLost: number;
  gamesDiff: number;
}

export interface AmericanaState {
  courts: ClubCourt[];
  players: AmericanaPlayer[];
  rounds: AmericanaRound[];
  currentRoundNumber: number;
  matchDurationMinutes: number;
  scoringCriteria: ScoringCriteria;
  isTimerRunning: boolean;
  timeRemainingSeconds: number;
}
