import {
  BadRequestException,
  Injectable,
} from "@nestjs/common";

import { PrismaService } from "@/prisma.service";
import { SubmitConfigurationDTO } from "../contracts/submission.dto";


@Injectable()
export class SubmissionService {
  constructor(private readonly prisma: PrismaService) {}

  private readyPlayers = new Map<string, Set<string>>();

  // =========================
  // CONFIG SUBMISSION
  // =========================

  async submitConfiguration(data: SubmitConfigurationDTO) {
    await this.validateSubmissionWindow(data.roundId);

    const storeId = await this.getStoreId(data.playerId);

    await this.ensureUniqueConfig(data.roundId, storeId);

    const config = await this.prisma.configuration.create({
      data: {
        sessionId: data.sessionId,
        roundId: data.roundId,
        storeId,

        operatorsQty: data.operatorsQty,
        serviceOperatorsQty: data.serviceOperatorsQty,
        quizScore: data.quizScore,

        stockInputs: {
          create: data.stockInputs,
        },

        capexSelections: {
          create: data.capexSelections,
        },
      },
    });

    return {
      success: true,
      configId: config.id,
      submittedAt: config.submittedAt,
    };
  }

  // =========================
  // HELPERS
  // =========================

  private async getStoreId(playerId: string) {
    const player = await this.prisma.player.findUnique({
      where: { id: playerId },
      select: { storeId: true },
    });

    if (!player?.storeId) {
      throw new BadRequestException("Player sem store vinculada");
    }

    return player.storeId;
  }

  private async ensureUniqueConfig(roundId: string, storeId: string) {
    const exists = await this.prisma.configuration.findFirst({
      where: { roundId, storeId },
      select: { id: true },
    });

    if (exists) {
      throw new BadRequestException("Config já enviada nesta rodada");
    }
  }

  // =========================
  // READY SYSTEM (SIMPLIFICADO)
  // =========================

  markPlayerReady(sessionId: string, playerId: string) {
    let set = this.readyPlayers.get(sessionId);

    if (!set) {
      set = new Set<string>();
      this.readyPlayers.set(sessionId, set);
    }

    set.add(playerId);

    return {
      sessionId,
      playerId,
      totalReady: set.size,
    };
  }

  async allPlayersReady(sessionId: string) {
    const players = await this.prisma.player.findMany({
      where: { sessionId },
      select: { id: true },
    });

    const ready = this.readyPlayers.get(sessionId);

    if (!players.length) return false;

    return players.every((p) => ready?.has(p.id));
  }

  clearReady(sessionId: string) {
    this.readyPlayers.delete(sessionId);
  }

  // =========================
  // VALIDATION
  // =========================

  async validateSubmissionWindow(roundId: string) {
    const round = await this.prisma.gameRound.findUnique({
      where: { id: roundId },
      select: { status: true },
    });

    if (!round) {
      throw new BadRequestException("Round não encontrado");
    }

    if (round.status !== "OPEN") {
      throw new BadRequestException("Round não está aberta");
    }

    return true;
  }
}