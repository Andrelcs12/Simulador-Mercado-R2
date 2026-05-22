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
  maxPereciveis: number;
  maxMercearia: number;
  maxEletro: number;
  maxHipel: number;
}

export type RoundConfigCategoryLimitKey =
  | "maxPereciveis"
  | "maxMercearia"
  | "maxEletro"
  | "maxHipel";

export const DEFAULT_ROUND_CONFIG_LIMITS: Pick<
  RoundConfig,
  RoundConfigCategoryLimitKey
> = {
  maxPereciveis: 5000,
  maxMercearia: 4000,
  maxEletro: 400,
  maxHipel: 3000,
};
