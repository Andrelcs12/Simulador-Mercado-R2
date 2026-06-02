export interface KPIs {
  ebitda: number;
  revenue: number;
  expenses: number;
  cash: number;
  csat: number;
  sla: number;
  averagePrice?: number;
  availabilityRate?: number;
}

export interface CommercialItem {
  category: string;
  stockQty: number;
  maxEstoque?: number;
  investedCost: number;
  markupMargin: number;
  revenue: number;
  grossProfit: number;
}

export interface CapexItem {
  capexId: string;
  name: string;
  cost: number;
}

export interface DashboardResponse {
  sessionId: string;
  roundNumber: number;
  totalRounds: number;
  myStore: {
    storeId: string;
    name: string;
    position: number | null;
    marketShare: number;
    kpis: KPIs;
    // 🌟 Correção do Erro: Adicionados no payload da Loja do Jogador
    comercialBreakdown: CommercialItem[];
    capexSelections: CapexItem[];
    isProjected: boolean;
    configurations: {
      operatorsQty: number;
      serviceOperatorsQty: number;
      quizScore: number;
    };
  };
  ranking: {
    storeId: string;
    name: string;
    position: number;
    finalScore: number;
    marketShare: number;
  }[];
}

export const EMPTY_DASHBOARD: DashboardResponse = {
  sessionId: "",
  roundNumber: 1,
  totalRounds: 3,
  myStore: {
    storeId: "",
    name: "Minha Loja",
    position: null,
    marketShare: 0,
    kpis: {
      ebitda: 0,
      revenue: 0,
      expenses: 0,
      cash: 0,
      csat: 0,
      sla: 0,
    },
    comercialBreakdown: [],
    capexSelections: [],
    isProjected: true,
    configurations: {
      operatorsQty: 0,
      serviceOperatorsQty: 0,
      quizScore: 0,
    },
  },
  ranking: [],
};
