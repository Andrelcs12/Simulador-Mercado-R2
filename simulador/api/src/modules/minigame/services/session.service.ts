import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '@/prisma.service';
import { GameRoundStatus, GameSessionStatus } from '@/generated/prisma/enums';

@Injectable()
export class SessionService {
  constructor(private prisma: PrismaService) {}

  // =========================
  // CODE GENERATOR (sem libs externas)
  // =========================
  private generateCode(): string {
    return Math.random()
      .toString(36)
      .substring(2, 6)
      .toUpperCase();
  }

  // =========================
  // CREATE SESSION
  // =========================
  async createSession(totalRounds = 5) {
    const code = this.generateCode();

    const session = await this.prisma.gameSession.create({
      data: {
        code,
        status: GameSessionStatus.LOBBY,
        totalRounds,
        currentRound: 0,
      },
    });

    await this.createRounds(session.id, totalRounds);

    return session;
  }

  // =========================
  // CREATE ROUNDS (placeholder se já existir)
  // =========================
  async createRounds(sessionId: string, totalRounds: number) {
    const rounds = Array.from({ length: totalRounds }).map((_, index) => ({
      sessionId,
      roundNumber: index + 1,
      status: GameRoundStatus.CLOSED,
    }));

    return this.prisma.gameRound.createMany({
      data: rounds,
    });
  }

  // =========================
  // GET SESSION BY ID
  // =========================
  async getSessionById(sessionId: string) {
    const session = await this.prisma.gameSession.findUnique({
      where: { id: sessionId },
      include: {
        rounds: {
          orderBy: { roundNumber: 'asc' },
        },
        players: true,
        stores: true,
      },
    });

    if (!session) {
      throw new NotFoundException('Sessão não encontrada');
    }

    return session;
  }

  // =========================
  // GET SESSION BY CODE
  // =========================
  async getSessionByCode(code: string) {
    const session = await this.prisma.gameSession.findUnique({
      where: { code },
      include: {
        rounds: true,
        players: true,
      },
    });

    if (!session) {
      throw new NotFoundException('Sessão não encontrada');
    }

    return session;
  }

  // =========================
  // FINISH SESSION
  // =========================
  async finishSession(sessionId: string) {
    const session = await this.prisma.gameSession.findUnique({
      where: { id: sessionId },
    });

    if (!session) {
      throw new NotFoundException('Sessão não encontrada');
    }

    return this.prisma.gameSession.update({
      where: { id: sessionId },
      data: {
        status: GameSessionStatus.FINISHED,
      },
    });
  }

  // =========================
  // UPDATE SESSION STATE
  // =========================
  async updateSessionState(
    sessionId: string,
    data: {
      status?: GameSessionStatus;
      currentRound?: number;
    },
  ) {
    return this.prisma.gameSession.update({
      where: { id: sessionId },
      data,
    });
  }

  // =========================
  // VALIDATE SESSION EXISTS
  // =========================
  async validateSession(sessionId: string) {
    const session = await this.prisma.gameSession.findUnique({
      where: { id: sessionId },
      select: { id: true, status: true },
    });

    if (!session) {
      throw new NotFoundException('Sessão não encontrada');
    }

    return session;
  }
}