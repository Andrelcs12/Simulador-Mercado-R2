export interface Player {
  id: string;
  name: string;
  storeName: string;
  submittedAt?: string;
  isReady?: boolean;
}

export interface Session {
  id: string;
  code: string;
  status: string;
  currentRound?: number;
  totalRounds?: number;
}

export interface RoundConfig {
  durationMinutes: number;
  durationSeconds: number;
  roundNumber: number;
  intervalMinutes: number;
}