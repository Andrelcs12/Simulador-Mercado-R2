
export interface DashboardResponse {
  sessionId: string;

  roundNumber: number;
  totalRounds: number;

  myStore: {
    storeId: string;
    name: string;

    position: number | null;
    marketShare: number;

    kpis: {
      ebitda: number;
      revenue: number;
      expenses: number;
      cash: number;
      csat: number;
      sla: number;
    };
  } | null;

  ranking: {
    storeId: string;
    name: string;
    position: number;
    finalScore: number;
    marketShare: number;
  }[];

  configurations: any[];
}