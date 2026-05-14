import {
  Injectable,
  NotFoundException,
} from "@nestjs/common";

import { PrismaService } from "@/prisma.service";
import {
  GameRoundStatus,
  GameSessionStatus,
} from "@/generated/prisma/enums";

@Injectable()
export class SessionService {
  constructor(
    private readonly prisma: PrismaService,
  ) {}

  private generateCode() {
    return Math.random()
      .toString(36)
      .substring(2, 6)
      .toUpperCase();
  }

  async createSession(totalRounds = 5) {
    const session =
      await this.prisma.gameSession.create({
        data: {
          code: this.generateCode(),
          status: GameSessionStatus.LOBBY,
          totalRounds,
          currentRound: 0,
        },
      });

    await this.prisma.gameRound.createMany({
      data: Array.from({
        length: totalRounds,
      }).map((_, i) => ({
        sessionId: session.id,
        roundNumber: i + 1,
        status: GameRoundStatus.CLOSED,
      })),
    });

    return session;
  }

  async getSessionById(sessionId: string) {
    const session =
      await this.prisma.gameSession.findUnique({
        where: { id: sessionId },
        include: {
          rounds: {
            orderBy: {
              roundNumber: "asc",
            },
          },
          players: true,
          stores: true,
        },
      });

    if (!session) {
      throw new NotFoundException(
        "Sessão não encontrada",
      );
    }

    return session;
  }

  async getSessionByCode(code: string) {
    const session =
      await this.prisma.gameSession.findUnique({
        where: { code },
        include: {
          rounds: true,
          players: true,
        },
      });

    if (!session) {
      throw new NotFoundException(
        "Sessão não encontrada",
      );
    }

    return session;
  }

  async finishSession(sessionId: string) {
    return this.prisma.gameSession.update({
      where: { id: sessionId },
      data: {
        status: GameSessionStatus.FINISHED,
      },
    });
  }

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

  async validateSession(sessionId: string) {
    const session =
      await this.prisma.gameSession.findUnique({
        where: { id: sessionId },
        select: {
          id: true,
          status: true,
        },
      });

    if (!session) {
      throw new NotFoundException(
        "Sessão não encontrada",
      );
    }

    return session;
  }
}