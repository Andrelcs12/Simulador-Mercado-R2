// ─────────────────────────────────────────────
// CAPEX
// ─────────────────────────────────────────────

export type CapexKey =
  | "seguranca"
  | "equipamentos"
  | "redes"
  | "site"
  | "selfcheckout"
  | "melhoria";

// CAPEX agora é valor numérico (0 = não selecionado)
export type CapexConfig = Record<CapexKey, number>;


// ─────────────────────────────────────────────
// COMERCIAL
// ─────────────────────────────────────────────

export type CategoriaKey =
  | "pereciveis"
  | "mercearia"
  | "eletro"
  | "hipel";

export interface CategoriaConfig {
  estoque: number;  // buyQty
  margem: number;   // commercialMargin %
}

export type ComercialConfig = Record<CategoriaKey, CategoriaConfig>;


// ─────────────────────────────────────────────
// APP CONFIG
// ─────────────────────────────────────────────

export interface AppConfig {
  capex: CapexConfig;

  comercial: ComercialConfig;

  operadoresCaixa: number;
  operadoresAtendimento: number;

  quizScore: number;
}


// ─────────────────────────────────────────────
// ROUND / PLAYER
// ─────────────────────────────────────────────

export interface RoundData {
  roundId: string;
  roundNumber: number;
  duration: number;        // segundos
  endTime: number | null;  // epoch ms
}

export interface PlayerData {
  id: string;
  sessionId: string;
  storeName: string;

  name?: string;

  store?: {
    id: string;
    name?: string;
  };
}