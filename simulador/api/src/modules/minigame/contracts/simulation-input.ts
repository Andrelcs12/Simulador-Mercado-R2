// =========================
// INPUT BRUTO (PLAYER CONFIG)
// =========================
export type PlayerConfigurationInput = {
  playerId: string;
  sessionId: string;
  roundId: string;

  operatorsQty: number;
  serviceOperatorsQty: number;
  quizScore: number;

  stockInputs: {
    categoryId: string;
    buyQty: number;
    commercialMargin: number;
    expectedSellPrice: number;
  }[];

  capexSelections: {
    capexId: string;
  }[];
};

// =========================
// INPUT DA SIMULAÇÃO DA RODADA
// =========================

export type SimulationRoundInput = {
  categories: any[];
  capex: any[];

  stockInputs: PlayerConfigurationInput["stockInputs"];
  capexSelections: PlayerConfigurationInput["capexSelections"];

  // dinheiro da loja (FALTAVA)
  storeCash: number;

  operatorsQty: number;
  serviceOperatorsQty: number;
  quizScore: number;

  totalMarketCustomers: number;

  // ranking
  competitivenessScore: number;
  competitorsTotalScore: number;

  // métricas base
  averagePrice: number;
  availabilityRate: number;
  csat: number;
  sla: number;
};

// =========================
// INPUT RANKING
// =========================
export type SimulationRankingInput = {
  storeId: string;
  averagePrice: number;
  availabilityRate: number;
  csat: number;
};