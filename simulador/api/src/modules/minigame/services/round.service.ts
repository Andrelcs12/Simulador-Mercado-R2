import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { PrismaService } from '@/prisma.service';
import { SimulationService } from '../simulation.service';

@Injectable()
export class RoundService {
  constructor(
    private prisma: PrismaService,
    private simulation: SimulationService,
  ) {}

  // =========================
  // INTERNAL STATE
  // =========================
  private roundTimers = new Map<string, Date>();
  private readyPlayers = new Map<string, Set<string>>();

  // =========================
  // START ROUND
  // =========================
  async startRound(sessionId: string, duration: number) {
    const session = await this.prisma.gameSession.findUnique({
      where: { id: sessionId },
      include: { rounds: true },
    });

    if (!session) throw new NotFoundException('Sessão não encontrada');

    let round = session.rounds.find(
      (r) => r.roundNumber === session.currentRound + 1,
    );

    if (!round) {
      round = session.rounds.find((r) => r.status === 'OPEN');
    }

    if (!round) {
      throw new BadRequestException('Nenhuma rodada disponível');
    }

    const endTime = new Date(Date.now() + duration * 1000);

    await this.prisma.$transaction([
      this.prisma.gameRound.update({
        where: { id: round.id },
        data: {
          status: 'OPEN',
          startsAt: new Date(),
          endsAt: endTime,
        },
      }),

      this.prisma.gameSession.update({
        where: { id: sessionId },
        data: {
          status: 'IN_PROGRESS',
          currentRound: round.roundNumber,
        },
      }),
    ]);

    this.roundTimers.set(sessionId, endTime);

    return {
      sessionId,
      roundId: round.id,
      roundNumber: round.roundNumber,
      duration,
      endTime,
    };
  }

  // =========================
  // FORCE CLOSE ROUND
  // =========================
  async forceCloseRound(sessionId: string) {
    const session = await this.prisma.gameSession.findUnique({
      where: { id: sessionId },
      include: { rounds: true },
    });

    if (!session) throw new NotFoundException('Sessão não encontrada');

    const round = session.rounds.find((r) => r.status === 'OPEN');

    if (!round) {
      return { success: true, roundId: null };
    }

    const closed = await this.prisma.gameRound.update({
      where: { id: round.id },
      data: {
        status: 'CLOSED',
        endsAt: new Date(),
      },
    });

    this.roundTimers.delete(sessionId);
    this.readyPlayers.delete(sessionId);

    return {
      success: true,
      roundId: closed.id,
    };
  }

  async finishRound(
  sessionId: string,
  reason: 'TIME_UP' | 'ADMIN_STOP' | 'MANUAL' = 'MANUAL',
) {
  const session = await this.prisma.gameSession.findUnique({
    where: { id: sessionId },
    include: { rounds: true },
  });

  if (!session) throw new NotFoundException('Sessão não encontrada');

  const round = session.rounds.find((r) => r.status === 'OPEN');

  if (!round) {
    return { success: true, message: 'No active round' };
  }

  const closed = await this.prisma.gameRound.update({
    where: { id: round.id },
    data: {
      status: 'CLOSED',
      endsAt: new Date(),
    },
  });

  this.roundTimers.delete(sessionId);
  this.readyPlayers.delete(sessionId);

  const results = await this.runRoundSimulation(sessionId, closed.id);

  return {
    sessionId,
    roundId: closed.id,
    roundNumber: closed.roundNumber,
    reason,
    results,
  };
}

  // =========================
  // NEXT ROUND
  // =========================
  async startNextRound(sessionId: string) {
    const session = await this.prisma.gameSession.findUnique({
      where: { id: sessionId },
      include: { rounds: true },
    });

    if (!session) throw new NotFoundException('Sessão não encontrada');

    const next = session.rounds.find(
      (r) => r.roundNumber === session.currentRound + 1,
    );

    if (!next) {
      await this.prisma.gameSession.update({
        where: { id: sessionId },
        data: { status: 'FINISHED' },
      });

      this.roundTimers.delete(sessionId);
      this.readyPlayers.delete(sessionId);

      return { finished: true };
    }

    await this.prisma.gameSession.update({
      where: { id: sessionId },
      data: {
        currentRound: next.roundNumber,
        status: 'IN_PROGRESS',
      },
    });

    await this.prisma.gameRound.update({
      where: { id: next.id },
      data: {
        status: 'OPEN',
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

  // =========================
  // READY SYSTEM
  // =========================
  markPlayerReady(sessionId: string, playerId: string) {
    if (!this.readyPlayers.has(sessionId)) {
      this.readyPlayers.set(sessionId, new Set());
    }

    this.readyPlayers.get(sessionId)!.add(playerId);

    return {
      sessionId,
      playerId,
      totalReady: this.readyPlayers.get(sessionId)!.size,
    };
  }

  allPlayersReady(sessionId: string, playerIds: string[]) {
    const set = this.readyPlayers.get(sessionId) ?? new Set();
    return playerIds.every((id) => set.has(id));
  }

  // =========================
  // SIMULATION
  // =========================
  async runRoundSimulation(sessionId: string, roundId: string) {
    const session = await this.prisma.gameSession.findUnique({
      where: { id: sessionId },
    });

    if (!session) throw new NotFoundException('Sessão não encontrada');

    const round = await this.prisma.gameRound.findUnique({
      where: { id: roundId },
    });

    if (!round) throw new NotFoundException('Rodada não encontrada');

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

    const results = [];

    for (const config of configs) {
      const sim = this.simulation.calculateRound({
        categories,
        capex,
        stockInputs: config.stockInputs,
        capexSelections: config.capexSelections,
        storeCash: config.store.cashBalance,
        marketShare: 1,
      });

      const result = await this.prisma.roundResult.create({
        data: {
          sessionId,
          roundId,
          storeId: config.storeId,

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