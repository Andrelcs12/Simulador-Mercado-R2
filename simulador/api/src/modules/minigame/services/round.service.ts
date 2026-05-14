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

    const results = await this.runRoundSimulation(
      sessionId,
      closed.id,
    );

    // 🔥 CRÍTICO: ranking automático após simulação
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

  async runRoundSimulation(sessionId: string, roundId: string) {
  const round = await this.prisma.gameRound.findUnique({
    where: { id: roundId },
  });

  if (!round) throw new NotFoundException("Rodada não encontrada");

  const session = await this.prisma.gameSession.findUnique({
    where: { id: sessionId },
  });

  if (!session) throw new NotFoundException("Sessão não encontrada");

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

  // 🔥 RANKING ANTERIOR (base do market share dinâmico)
  const previousRanking = await this.prisma.roundRanking.findMany({
    where: { sessionId },
    orderBy: { position: "asc" },
  });

  const totalStores = configs.length;

  const marketShareMap = new Map<string, number>();

  // =========================
  // MARKET SHARE RULE ENGINE
  // =========================

  if (previousRanking.length === 0) {
    // primeira rodada → igualitário
    for (const c of configs) {
      marketShareMap.set(c.storeId, 1 / totalStores);
    }
  } else {
    const totalWeight = previousRanking.reduce(
      (acc, r) => acc + (totalStores - r.position + 1),
      0,
    );

    for (const r of previousRanking) {
      const weight = totalStores - r.position + 1;
      marketShareMap.set(r.storeId, weight / totalWeight);
    }
  }

  const results = [];

  // =========================
  // CONSTANTE DO MODELO (DA REGRA DO JOGO)
  // =========================
  const TOTAL_MARKET_CUSTOMERS = 1000;

  for (const config of configs) {
    const marketShare =
      marketShareMap.get(config.storeId) ?? 1 / totalStores;

    const sim = this.simulation.calculateRound({
      categories,
      capex,

      stockInputs: config.stockInputs,
      capexSelections: config.capexSelections,

      storeCash: config.store.cashBalance,
      marketShare,

      operatorsQty: config.operatorsQty ?? 0,
      serviceOperatorsQty: config.serviceOperatorsQty ?? 0,
      quizScore: config.quizScore ?? 0,

      totalMarketCustomers: TOTAL_MARKET_CUSTOMERS,
    });

    const { indicators, ...safeSim } = sim as any;

    const result = await this.prisma.roundResult.create({
      data: {
        sessionId,
        roundId,
        storeId: config.storeId,

        marketShare,

        customersReceived: safeSim.customersReceived,
        totalRevenue: safeSim.totalRevenue,
        totalTaxes: safeSim.totalTaxes,
        totalCMV: safeSim.totalCMV,

        operatingCosts: safeSim.operatingCosts,
        capexCosts: safeSim.capexCosts,
        licensingCosts: safeSim.licensingCosts,
        agingCosts: safeSim.agingCosts,
        interestCosts: safeSim.interestCosts,

        totalExpenses: safeSim.totalExpenses,

        ebitdaValue: safeSim.ebitdaValue,
        ebitdaMargin: safeSim.ebitdaMargin,

        finalCash: safeSim.finalCash,

        remainingStockValue: safeSim.remainingStockValue,
        stockBreakLoss: safeSim.stockBreakLoss,

        csat: safeSim.csat,
        sla: safeSim.sla,
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