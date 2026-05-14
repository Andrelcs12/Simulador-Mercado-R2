import { Injectable } from "@nestjs/common";
import { PrismaService } from "@/prisma.service";

@Injectable()
export class DashboardService {
  constructor(private prisma: PrismaService) {}

  async getRoundDashboard(sessionId: string, roundId: string, storeId?: string) {
  const session = await this.prisma.gameSession.findUnique({
    where: { id: sessionId },
  });

  const [ranking, myResult] = await Promise.all([
    this.prisma.roundRanking.findMany({
      where: { sessionId, roundId },
      include: { store: true },
      orderBy: { position: "asc" },
      take: storeId ? 10 : 50,
    }),

    storeId
      ? this.prisma.roundResult.findUnique({
          where: {
            storeId_roundId: {
              storeId,
              roundId,
            },
          },
          include: { store: true },
        })
      : null,
  ]);

  const myRanking = storeId
    ? await this.prisma.roundRanking.findUnique({
        where: {
          sessionId_roundId_storeId: {
            sessionId,
            roundId,
            storeId,
          },
        },
      })
    : null;

  return {
    sessionId,
    roundNumber: session?.currentRound,

    myStore: myResult
      ? {
          storeId: myResult.storeId,
          name: myResult.store.name,
          position: myRanking?.position ?? null,
          marketShare: myResult.marketShare,
          kpis: {
            ebitda: myResult.ebitdaValue,
            revenue: myResult.totalRevenue,
            expenses: myResult.totalExpenses,
            cash: myResult.finalCash,
            csat: myResult.csat,
            sla: myResult.sla,
          },
        }
      : null,

    ranking: ranking.map(r => ({
      storeId: r.storeId,
      name: r.store.name,
      position: r.position,
      finalScore: r.finalScore,
      marketShare: r.marketShare,
    })),
  };
}
}