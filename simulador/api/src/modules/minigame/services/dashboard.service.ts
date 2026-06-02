import { Injectable } from "@nestjs/common";
import { PrismaService } from "@/prisma.service";

@Injectable()
export class DashboardService {
  constructor(private prisma: PrismaService) {}

  private buildCommercialBreakdown(config: any) {
    return config?.stockInputs.map((stock) => {
      const sellPrice =
        stock.category.unitCost * (1 + (stock.commercialMargin || 30) / 100);
      const investedCost = stock.buyQty * stock.category.unitCost;
      const revenue = stock.buyQty * sellPrice;

      return {
        categoryId: stock.categoryId,
        category: stock.category.name,
        stockQty: stock.buyQty,
        maxEstoque: stock.category.totalMarketStock,
        investedCost,
        markupMargin: stock.commercialMargin,
        revenue,
        grossProfit: revenue - investedCost,
      };
    }) ?? [];
  }

  private buildCapexSelections(config: any) {
    return config?.capexSelections.map((sel) => ({
      capexId: sel.capex.slug || sel.capexId,
      name: sel.capex.name,
      cost: sel.capex.cost,
    })) ?? [];
  }

  private calculateProjectedSla(serviceOperatorsQty: number) {
    if (serviceOperatorsQty >= 8) return 95;
    if (serviceOperatorsQty >= 6) return 85;
    if (serviceOperatorsQty >= 4) return 75;
    if (serviceOperatorsQty >= 2) return 60;
    return 40;
  }

  private buildProjectedKpis(config: any) {
    const commercialBreakdown = this.buildCommercialBreakdown(config);
    const capexSelections = this.buildCapexSelections(config);

    const revenue = commercialBreakdown.reduce(
      (acc, item) => acc + item.revenue,
      0,
    );
    const stockCost = commercialBreakdown.reduce(
      (acc, item) => acc + item.investedCost,
      0,
    );
    const capexCosts = capexSelections.reduce(
      (acc, item) => acc + item.cost,
      0,
    );

    const operatingCosts =
      (config?.operatorsQty ?? 0) * 2200 +
      (config?.serviceOperatorsQty ?? 0) * 3200;

    const expenses = stockCost + capexCosts + operatingCosts;
    const cash = (config?.store?.cashBalance ?? 700000) - expenses;

    const operatorFactor = Math.min((config?.operatorsQty ?? 0) / 10, 1);
    const quizFactor = Math.min(Math.max((config?.quizScore ?? 0) / 100, 0), 1);

    return {
      ebitda: revenue - expenses,
      revenue,
      expenses,
      cash,
      csat: Math.round(operatorFactor * quizFactor * 100),
      sla: this.calculateProjectedSla(config?.serviceOperatorsQty ?? 0),
    };
  }

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
      comercialBreakdown: [],
      capexSelections: [],
      configurations: {
        operatorsQty: 0,
        serviceOperatorsQty: 0,
        quizScore: 0,
      },
      isProjected: true,
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
      select: { id: true, totalRounds: true, currentRound: true },
    });

    const round = await this.prisma.gameRound.findUnique({
      where: { id: roundId },
      select: { id: true, roundNumber: true },
    });

    const [ranking, myResult, myConfig] = await Promise.all([
      this.prisma.roundRanking.findMany({
        where: { sessionId, roundId },
        include: { store: { include: { players: true } } },
        orderBy: { position: "asc" },
        take: 50,
      }),

      storeId
        ? this.prisma.roundResult.findUnique({
            where: { storeId_roundId: { storeId, roundId } },
            include: { store: true },
          })
        : null,

      // 🌟 BUSCA AS DECISÕES COMERCIAIS/CAPEX DA RODADA
      storeId
        ? this.prisma.configuration.findUnique({
            where: { storeId_roundId: { storeId, roundId } },
            include: {
              store: true,
              stockInputs: { include: { category: true } },
              capexSelections: { include: { capex: true } },
            },
          })
        : null,
    ]);

    const myRanking = storeId
      ? await this.prisma.roundRanking.findUnique({
          where: { sessionId_roundId_storeId: { sessionId, roundId, storeId } },
        })
      : null;

    const commercialBreakdown = this.buildCommercialBreakdown(myConfig);
    const capexSelections = this.buildCapexSelections(myConfig);
    const configurations = {
      operatorsQty: myConfig?.operatorsQty ?? 0,
      serviceOperatorsQty: myConfig?.serviceOperatorsQty ?? 0,
      quizScore: myConfig?.quizScore ?? 0,
    };

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
            marketShare: (myResult.marketShare ?? 0) * 100, // Transforma em % para o KPI do front
            kpis: {
              ebitda: myResult.ebitdaValue ?? 0,
              revenue: myResult.totalRevenue ?? 0,
              expenses: myResult.totalExpenses ?? 0,
              cash: myResult.finalCash ?? 0,
              csat: (myResult.csat ?? 0) * 100, // Transforma em %
              sla: (myResult.sla ?? 0) * 100,   // Transforma em %
              averagePrice: myResult.averagePrice ?? 0,
              availabilityRate: (myResult.availabilityRate ?? 0) * 100,
            },
            // 🌟 DETALHAMENTO COMERCIAL POR CATEGORIA PARA A TABELA DO FRONT
            comercialBreakdown: commercialBreakdown,

            // 🌟 CAPEX COMPRADOS NA RODADA
            capexSelections,
            configurations,
            isProjected: false,
          }
        : myConfig
          ? {
              storeId: myConfig.storeId,
              name: myConfig.store?.name ?? "Minha Loja",
              position: null,
              marketShare: 0,
              kpis: this.buildProjectedKpis(myConfig),
              comercialBreakdown: commercialBreakdown,
              capexSelections,
              configurations,
              isProjected: true,
            }
          : this.emptyMyStore(),

      ranking: ranking.map((r) => ({
        roundId: r.roundId,
        playerId: r.store.players?.[0]?.id ?? "",
        playerName: r.store.players?.[0]?.name ?? r.store.name,
        storeId: r.storeId,
        name: r.store.name,
        score: r.finalScore,
        position: r.position,
        marketShare: (r.marketShare ?? 0) * 100,
      })),
    };
  }

  // Adicione dentro de DashboardService
async getHistory(sessionId: string, storeId?: string) {
  // Busca todas as rodadas que já possuem resultados
  const history = await this.prisma.roundResult.findMany({
    where: { sessionId, storeId },
    include: { round: true, store: true },
    orderBy: { round: { roundNumber: 'asc' } },
  });

  // Retorna os dados formatados para o front
  return history.map(r => ({
    roundNumber: r.round.roundNumber,
    ebitda: r.ebitdaValue,
    position: r.sla, // Ajuste conforme seu critério de posição no histórico
    marketShare: r.marketShare
  }));
}

  async getRoundRankingBoard(sessionId: string) {
    const rankings = await this.prisma.roundRanking.findMany({
      where: { sessionId },
      include: {
        round: {
          select: {
            id: true,
            roundNumber: true,
          },
        },
        store: {
          include: {
            players: {
              select: {
                id: true,
                name: true,
              },
            },
          },
        },
      },
      orderBy: [
        { round: { roundNumber: "asc" } },
        { position: "asc" },
      ],
    });

    const grouped = new Map<string, {
      roundId: string;
      roundNumber: number;
      rankings: Array<{
        position: number;
        playerId: string;
        playerName: string;
        storeId: string;
        score: number;
      }>;
    }>();

    for (const item of rankings) {
      const roundId = item.roundId;
      const roundNumber = item.round?.roundNumber ?? 0;
      const player = item.store.players?.[0];

      if (!grouped.has(roundId)) {
        grouped.set(roundId, {
          roundId,
          roundNumber,
          rankings: [],
        });
      }

      grouped.get(roundId)!.rankings.push({
        position: item.position,
        playerId: player?.id ?? "",
        playerName: player?.name ?? item.store.name,
        storeId: item.storeId,
        score: item.finalScore,
      });
    }

    return Array.from(grouped.values()).sort(
      (a, b) => a.roundNumber - b.roundNumber,
    );
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
