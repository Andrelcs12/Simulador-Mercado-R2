export interface KPIs {
  ebitda: number;
  revenue: number;
  expenses: number;
  cash: number;
  csat: number;
  sla: number;
}

export interface DashboardResponse {
  sessionId: string;

  roundNumber: number;
  totalRounds: number;

  myStore: {
    storeId: string;
    name: string;

    position: number | null;

    // ✅ FORA DOS KPIS
    marketShare: number;

    kpis: KPIs;
  };

  ranking: {
    storeId: string;
    name: string;
    position: number;
    finalScore: number;
    marketShare: number;
  }[];

  configurations: any[];
}

export const EMPTY_DASHBOARD: DashboardResponse = {
  sessionId: "",

  roundNumber: 1,
  totalRounds: 3,

  myStore: {
    storeId: "",
    name: "Minha Loja",

    position: null,

    // ✅ AQUI
    marketShare: 0,

    kpis: {
      ebitda: 0,
      revenue: 0,
      expenses: 0,
      cash: 0,
      csat: 0,
      sla: 0,
    },
  },

  ranking: [],

  configurations: [],
};