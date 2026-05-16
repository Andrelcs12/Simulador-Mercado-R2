import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from "@nestjs/common";

import { PrismaService } from "@/prisma.service";
import { SimulationService } from "../simulation.service";
import { RankingService } from "./ranking.service";

@Injectable()
export class RoundService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly simulation: SimulationService,
    private readonly ranking: RankingService,
  ) {}

  private roundTimers = new Map<string, NodeJS.Timeout>();
  private readyPlayers = new Map<string, Set<string>>();

  async startRound(sessionId: string, duration: number) {
    const session = await this.prisma.gameSession.findUnique({
      where: { id: sessionId },
      include: { rounds: true },
    });

    if (!session) throw new NotFoundException("Sessão não encontrada");

    const round = session.rounds.find(
      (r) => r.roundNumber === session.currentRound + 1,
    );

    if (!round) throw new BadRequestException("Nenhuma rodada disponível");

    const startsAt = new Date();
    const endsAt = new Date(Date.now() + duration * 1000);

    await this.prisma.$transaction([
      this.prisma.gameRound.update({
        where: { id: round.id },
        data: {
          status: "OPEN",
          startsAt,
          endsAt,
        },
      }),
      this.prisma.gameSession.update({
        where: { id: sessionId },
        data: {
          status: "IN_PROGRESS",
          currentRound: round.roundNumber,
        },
      }),
    ]);

    return {
      sessionId,
      roundId: round.id,
      roundNumber: round.roundNumber,
      duration,
      startsAt,
      endsAt,
    };
  }

  async finishRound(
    sessionId: string,
    reason: "TIME_UP" | "ADMIN_STOP" | "MANUAL" = "MANUAL",
  ) {
    const session = await this.prisma.gameSession.findUnique({
      where: { id: sessionId },
      include: { rounds: true },
    });

    if (!session) throw new NotFoundException("Sessão não encontrada");

    const round = session.rounds.find((r) => r.status === "OPEN");

    if (!round) {
      return {
        sessionId,
        success: true,
        message: "No active round",
      };
    }

    const closed = await this.prisma.gameRound.update({
      where: { id: round.id },
      data: {
        status: "CLOSED",
        endsAt: new Date(),
      },
    });

    this.clearTimer(sessionId);
    this.readyPlayers.delete(sessionId);

    const results = await this.runRoundSimulation(sessionId, closed.id);

    await this.ranking.computeRoundRanking(sessionId, closed.id);

    return {
      sessionId,
      roundId: closed.id,
      roundNumber: closed.roundNumber,
      reason,
      results,
    };
  }

  async startNextRound(sessionId: string) {
    const session = await this.prisma.gameSession.findUnique({
      where: { id: sessionId },
      include: { rounds: true },
    });

    if (!session) throw new NotFoundException("Sessão não encontrada");

    const next = session.rounds.find(
      (r) => r.roundNumber === session.currentRound + 1,
    );

    if (!next) {
      await this.prisma.gameSession.update({
        where: { id: sessionId },
        data: { status: "FINISHED" },
      });

      this.clearTimer(sessionId);
      this.readyPlayers.delete(sessionId);

      return { sessionId, finished: true };
    }

    await this.prisma.gameSession.update({
      where: { id: sessionId },
      data: {
        currentRound: next.roundNumber,
        status: "IN_PROGRESS",
      },
    });

    await this.prisma.gameRound.update({
      where: { id: next.id },
      data: {
        status: "OPEN",
        startsAt: new Date(),
        endsAt: null,
      },
    });

    return {
      sessionId,
      roundId: next.id,
      roundNumber: next.roundNumber,
    };
  }

  private clearTimer(sessionId: string) {
    const timer = this.roundTimers.get(sessionId);
    if (timer) clearTimeout(timer);
    this.roundTimers.delete(sessionId);
  }

  // =====================================================
// SIMULATION FLOW CORRIGIDO
// =====================================================

async runRoundSimulation(sessionId: string, roundId: string) {
  const round = await this.prisma.gameRound.findUnique({
    where: { id: roundId },
  });

  if (!round) throw new NotFoundException("Rodada não encontrada");

  const configs = await this.prisma.configuration.findMany({
    where: { roundId },
    include: {
      stockInputs: true,
      capexSelections: true,
      store: true,
    },
  });

  const categories = await this.prisma.categoryMaster.findMany();
  const capex = await this.prisma.capexMaster.findMany();

  // 1. métricas base (SEM mercado ainda)
  const baseResults = configs.map((config) => {
    const metrics = this.simulation.calculateBaseMetrics({
      categories,
      stockInputs: config.stockInputs,
      operatorsQty: config.operatorsQty,
      serviceOperatorsQty: config.serviceOperatorsQty,
      quizScore: config.quizScore,
    });

    return { config, metrics };
  });

  // 2. monta ranking INPUT (SEM calcular ainda dentro do ranking service)
  const rankingInput = baseResults.map((r) => ({
    storeId: r.config.storeId,
    averagePrice: r.metrics.averagePrice,
    availabilityRate: r.metrics.availabilityRate,
    csat: r.metrics.csat,
  }));

  // 🔥 IMPORTANTE: ranking deve ser baseado nesses dados, não reconsultar DB
  const ranking = this.ranking.buildRankingFromMetrics(rankingInput);

  const totalScore =
    ranking.reduce((acc, x) => acc + x.finalScore, 0) || 1;

  // 3. execução final com marketShare REAL
  const results = [];

  for (const r of baseResults) {
    const rankItem = ranking.find(
      (x) => x.storeId === r.config.storeId,
    );

    const sim = this.simulation.calculateRoundResult({
      categories,
      capex,
      stockInputs: r.config.stockInputs,
      capexSelections: r.config.capexSelections,
      storeCash: r.config.store.cashBalance,

      operatorsQty: r.config.operatorsQty,
      serviceOperatorsQty: r.config.serviceOperatorsQty,

      quizScore: r.config.quizScore,

      totalMarketCustomers: 1000,

      // 🔥 AGORA CORRETO (SEM MOCK)
      competitivenessScore: rankItem?.finalScore ?? 1,
      competitorsTotalScore: totalScore,

      averagePrice: r.metrics.averagePrice,
      availabilityRate: r.metrics.availabilityRate,
      csat: r.metrics.csat,
      sla: r.metrics.sla,
    });

    const result = await this.prisma.roundResult.create({
      data: {
        sessionId,
        roundId,
        storeId: r.config.storeId,

        marketShare: sim.marketShare,

        customersReceived: sim.customersReceived,

        totalRevenue: sim.totalRevenue,
        totalTaxes: sim.totalTaxes,
        totalCMV: sim.totalCMV,

        operatingCosts: sim.operatingCosts,
        capexCosts: sim.capexCosts,
        licensingCosts: sim.licensingCosts,

        agingCosts: sim.agingCosts,
        interestCosts: sim.interestCosts,

        totalExpenses: sim.totalExpenses,

        ebitdaValue: sim.ebitdaValue,
        ebitdaMargin: sim.ebitdaMargin,

        finalCash: sim.finalCash,

        remainingStockValue: sim.remainingStockValue,
        stockBreakLoss: sim.stockBreakLoss,

        csat: sim.csat,
        sla: sim.sla,

        averagePrice: sim.averagePrice,
        availabilityRate: sim.availabilityRate,
      },
    });

    results.push(result);
  }

  return {
    sessionId,
    roundId,
    roundNumber: round.roundNumber,
    results,
  };
}
}