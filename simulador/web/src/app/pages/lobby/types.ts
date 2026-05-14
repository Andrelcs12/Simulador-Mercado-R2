export interface Player {
  id: string;
  name: string;
  storeName: string;
  sessionId: string;
  role?: string;
  isReady?: boolean;
}

export interface GameConfig {
  duration: number;
  round: number;
  adminName: string;
}