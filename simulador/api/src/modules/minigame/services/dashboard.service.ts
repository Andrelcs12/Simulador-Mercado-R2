import { Injectable } from "@nestjs/common";
import { PrismaService } from "@/prisma.service";

@Injectable()
export class DashboardService {
  constructor(private prisma: PrismaService) {}

  // ======================================================
  // EMPTY FALLBACK (NUNCA NULL PRO FRONT)
  // ======================================================
  private emptyMyStore() {
    return {
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
    };
  }

  // ======================================================
  // DASHBOARD POR ROUND ID (BASE)
  // ======================================================
  async getRoundDashboard(
    sessionId: string,
    roundId: string,
    storeId?: string,
  ) {
    const session = await this.prisma.gameSession.findUnique({
      where: { id: sessionId },
      select: {
        id: true,
        totalRounds: true,
        currentRound: true,
      },
    });

    const round = await this.prisma.gameRound.findUnique({
      where: { id: roundId },
      select: {
        id: true,
        roundNumber: true,
      },
    });

    const [ranking, myResult] = await Promise.all([
      this.prisma.roundRanking.findMany({
        where: { sessionId, roundId },
        include: { store: true },
        orderBy: { position: "asc" },
        take: 50,
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
      roundId,

      roundNumber: round?.roundNumber ?? session?.currentRound ?? 1,
      totalRounds: session?.totalRounds ?? 1,

      myStore: myResult
        ? {
            storeId: myResult.storeId,
            name: myResult.store.name,
            position: myRanking?.position ?? null,
            marketShare: myResult.marketShare ?? 0,
            kpis: {
              ebitda: myResult.ebitdaValue ?? 0,
              revenue: myResult.totalRevenue ?? 0,
              expenses: myResult.totalExpenses ?? 0,
              cash: myResult.finalCash ?? 0,
              csat: myResult.csat ?? 0,
              sla: myResult.sla ?? 0,
            },
          }
        : this.emptyMyStore(),

      ranking: ranking.map((r) => ({
        storeId: r.storeId,
        name: r.store.name,
        position: r.position,
        finalScore: r.finalScore,
        marketShare: r.marketShare ?? 0,
      })),

      configurations: [],
    };
  }

  // ======================================================
  // DASHBOARD AUTOMÁTICO (SEM ROUND ID)
  // ======================================================
  async getLatestDashboard(sessionId: string, storeId?: string) {
    const session = await this.prisma.gameSession.findUnique({
      where: { id: sessionId },
      select: {
        id: true,
        currentRound: true,
        totalRounds: true,
      },
    });

    if (!session) {
      return {
        sessionId,
        roundNumber: 0,
        totalRounds: 0,
        myStore: this.emptyMyStore(),
        ranking: [],
        configurations: [],
      };
    }

    const round = await this.prisma.gameRound.findFirst({
      where: {
        sessionId,
        roundNumber: session.currentRound,
      },
    });

    if (!round) {
      return {
        sessionId,
        roundNumber: session.currentRound,
        totalRounds: session.totalRounds,
        myStore: this.emptyMyStore(),
        ranking: [],
        configurations: [],
      };
    }

    return this.getRoundDashboard(sessionId, round.id, storeId);
  }
}