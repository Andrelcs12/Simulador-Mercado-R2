export type RoundSimulationInput = {
  categories: any[];
  capex: any[];
  stockInputs: any[];
  capexSelections: any[];
  storeCash: number;

  operatorsQty: number;
  serviceOperatorsQty: number;

  quizScore: number;

  totalMarketCustomers: number;

  competitivenessScore: number;
  competitorsTotalScore: number;

  averagePrice: number;
  availabilityRate: number;
  csat: number;
  sla: number;
};