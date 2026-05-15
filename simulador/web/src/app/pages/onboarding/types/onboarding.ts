export interface CategoriaConfig {
  estoque: number;
  margem: number;
}

export type CategoriaKey = "pereciveis" | "mercearia" | "eletro" | "hipel";

export interface AppConfig {
  capex: Record<string, number>;
  comercial: Record<CategoriaKey, CategoriaConfig>;
  operadores: number;
}

export interface RoundData {
  roundId: string;
  roundNumber: number;
  duration: number;
  endTime: number | null;
}

export interface PlayerData {
  id: string;
  sessionId: string;
  storeName: string;
  store?: { id: string };
}