export interface SubmitConfigurationDTO {
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
}