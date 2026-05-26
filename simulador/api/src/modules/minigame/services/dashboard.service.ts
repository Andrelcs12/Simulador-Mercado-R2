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
      select: { id: true, totalRounds: true, currentRound: true },
    });

    const round = await this.prisma.gameRound.findUnique({
      where: { id: roundId },
      select: { id: true, roundNumber: true },
    });

    const [ranking, myResult, myConfig] = await Promise.all([
      this.prisma.roundRanking.findMany({
        where: { sessionId, roundId },
        include: { store: true },
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
            comercialBreakdown: myConfig?.stockInputs.map((stock) => {
              const sellPrice = stock.category.unitCost * (1 + (stock.commercialMargin || 30) / 100);
              const investidoCusto = stock.buyQty * stock.category.unitCost;
              
              // Como seu banco consolidou o faturamento, no MVP calculamos o proporcional baseado no Market Share / Demand da rodada
              // Ou enviamos o Faturamento Ideal planejado para bater com o layout atual do seu front
              const faturamentoIdeal = stock.buyQty * sellPrice; 
              const lucroBrutoIdeal = faturamentoIdeal - investidoCusto;

              return {
                categoryId: stock.categoryId,
                name: stock.category.name,
                qtd: stock.buyQty,
                maxEstoque: stock.category.totalMarketStock, // Limite contextual
                investido: investidoCusto,
                margem: stock.commercialMargin,
                faturamento: faturamentoIdeal,
                lucroBruto: lucroBrutoIdeal,
              };
            }) ?? [],

            // 🌟 CAPEX COMPRADOS NA RODADA
            capexSelections: myConfig?.capexSelections.map((sel) => ({
              id: sel.capex.slug || sel.capexId,
              label: sel.capex.name,
              value: sel.capex.cost,
            })) ?? [],
          }
        : this.emptyMyStore(),

      ranking: ranking.map((r) => ({
        storeId: r.storeId,
        name: r.store.name,
        position: r.position,
        finalScore: r.finalScore,
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