export interface DashboardResponse {
  session: {
    id: string;
    code: string;
    status: string;
    currentRound: number;
    totalRounds: number;
  };

  results: any[];

  ranking: {
    storeId: string;
    name: string;
    position: number;
    finalScore: number;
    marketShare: number;
  }[];

  configurations: any[];
}