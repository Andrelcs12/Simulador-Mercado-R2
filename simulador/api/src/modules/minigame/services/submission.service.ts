import {
  BadRequestException,
  Injectable,
} from "@nestjs/common";

import { PrismaService } from "@/prisma.service";

@Injectable()
export class SubmissionService {
  constructor(private readonly prisma: PrismaService) {}

  private readyPlayers = new Map<string, Set<string>>();

  // =========================
  // SUBMIT CONFIGURATION
  // =========================

  async submitConfiguration(data: {
    playerId: string;
    sessionId: string;
    roundId: string;

    stockInputs: {
      categoryId: string;
      buyQty: number;
      commercialMargin: number;
      expectedSellPrice: number;
    }[];

    capexSelections: {
      capexId: string;
    }[];
  }) {
    await this.validateSubmissionWindow(data.roundId);

    const player = await this.prisma.player.findUnique({
      where: {
        id: data.playerId,
      },

      select: {
        storeId: true,
      },
    });

    if (!player?.storeId) {
      throw new BadRequestException(
        "Player sem store vinculada",
      );
    }

    const existingConfig =
      await this.prisma.configuration.findFirst({
        where: {
          roundId: data.roundId,
          storeId: player.storeId,
        },
      });

    if (existingConfig) {
      throw new BadRequestException(
        "Configuração já enviada nesta rodada",
      );
    }

    const config =
      await this.prisma.configuration.create({
        data: {
          sessionId: data.sessionId,
          roundId: data.roundId,
          storeId: player.storeId,

          operatorsQty: 0,
          serviceOperatorsQty: 0,
          quizScore: 0,

          stockInputs: {
            create: data.stockInputs.map((s) => ({
              categoryId: s.categoryId,
              buyQty: s.buyQty,
              commercialMargin:
                s.commercialMargin,
              expectedSellPrice:
                s.expectedSellPrice,
            })),
          },

          capexSelections: {
            create: data.capexSelections.map(
              (c) => ({
                capexId: c.capexId,
              }),
            ),
          },
        },

        include: {
          stockInputs: true,
          capexSelections: true,
          store: true,
        },
      });

    return {
      success: true,
      configId: config.id,
      submittedAt: config.submittedAt,
    };
  }

  // =========================
  // READY SYSTEM
  // =========================

  markPlayerReady(
    sessionId: string,
    playerId: string,
  ) {
    if (!this.readyPlayers.has(sessionId)) {
      this.readyPlayers.set(
        sessionId,
        new Set(),
      );
    }

    this.readyPlayers
      .get(sessionId)!
      .add(playerId);

    return {
      sessionId,
      playerId,
      totalReady:
        this.readyPlayers.get(sessionId)!.size,
    };
  }

  async allPlayersReady(sessionId: string) {
    const players =
      await this.prisma.player.findMany({
        where: {
          sessionId,
        },

        select: {
          id: true,
        },
      });

    const readySet =
      this.readyPlayers.get(sessionId) ??
      new Set();

    if (players.length === 0) {
      return false;
    }

    return players.every((p) =>
      readySet.has(p.id),
    );
  }

  clearReady(sessionId: string) {
    this.readyPlayers.delete(sessionId);
  }

  // =========================
  // VALIDATION
  // =========================

  async validateSubmissionWindow(
    roundId: string,
  ) {
    const round =
      await this.prisma.gameRound.findUnique({
        where: {
          id: roundId,
        },

        select: {
          status: true,
        },
      });

    if (!round) {
      throw new BadRequestException(
        "Round não encontrado",
      );
    }

    if (round.status !== "OPEN") {
      throw new BadRequestException(
        "Round não está aberta",
      );
    }

    return true;
  }
}