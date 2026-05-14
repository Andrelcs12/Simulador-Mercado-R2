import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from "@nestjs/common";

import { PrismaService } from "@/prisma.service";
import { SimulationService } from "../simulation.service";

@Injectable()
export class RoundService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly simulation: SimulationService,
  ) {}

  private roundTimers = new Map<string, NodeJS.Timeout>();
  private readyPlayers = new Map<string, Set<string>>();

  // =========================
  // START ROUND
  // =========================
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

  // =========================
  // FINISH ROUND (CORE)
  // =========================
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

  // =========================
  // FORCE STOP
  // =========================
  async forceStop(sessionId: string) {
    this.clearTimer(sessionId);
    return this.finishRound(sessionId, "ADMIN_STOP");
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
  // TIMER UTILS
  // =========================
  private clearTimer(sessionId: string) {
    const timer = this.roundTimers.get(sessionId);
    if (timer) clearTimeout(timer);
    this.roundTimers.delete(sessionId);
  }

  // =========================
  // SIMULATION
  // =========================
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
          ...sim,
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