export interface CategoriaConfig {
  estoque: number;
  margem: number;
}

export type CategoriaKey =
  | "pereciveis"
  | "mercearia"
  | "eletro"
  | "hipel";

export interface ComercialConfig {
  pereciveis: CategoriaConfig;
  mercearia: CategoriaConfig;
  eletro: CategoriaConfig;
  hipel: CategoriaConfig;
}

// ✅ IDs válidos de CAPEX
export type CapexKey =
  | "seguranca"
  | "equipamentos"
  | "redes"
  | "site"
  | "selfcheckout"
  | "melhoria";

export interface AppConfig {
  // ✅ true = selecionado
  capex: Record<CapexKey, boolean>;

  // COMERCIAL
  comercial: ComercialConfig;

  // OPERAÇÃO
  operadoresCaixa: number;
  operadoresAtendimento: number;

  // QUIZ / CSAT
  quizScore: number;
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

  store?: {
    id: string;
    name?: string;
  };
}