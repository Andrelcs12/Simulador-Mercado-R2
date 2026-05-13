import { BadRequestException, Injectable } from '@nestjs/common';
import { PrismaService } from '@/prisma.service';

@Injectable()
export class SubmissionService {
  constructor(private prisma: PrismaService) {}

  private readyPlayers = new Map<string, Set<string>>();

  // =========================
  // SUBMIT CONFIGURATION
  // =========================
  async submitConfiguration(data: {
    playerId: string;
    storeId: string;
    sessionId: string;
    roundId: string;
    stockInputs: { categoryId: string; buyQty: number }[];
    capexSelections: { capexId: string }[];
  }) {
    // 🔥 garante store correta via player (evita inconsistência)
    const player = await this.prisma.player.findUnique({
      where: { id: data.playerId },
      select: { storeId: true },
    });

    if (!player?.storeId) {
      throw new BadRequestException('Player sem store vinculada');
    }

    const config = await this.prisma.configuration.create({
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

            // obrigatórios no schema atual
            commercialMargin: 0,
            expectedSellPrice: 0,
          })),
        },

        capexSelections: {
          create: data.capexSelections.map((c) => ({
            capexId: c.capexId,
          })),
        },
      },
      include: {
        stockInputs: true,
        capexSelections: true,
        store: true,
      },
    });

    return {
      configId: config.id,
      submittedAt: config.submittedAt,
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

  async allPlayersReady(sessionId: string) {
    const players = await this.prisma.player.findMany({
      where: { sessionId },
      select: { id: true },
    });

    const readySet = this.readyPlayers.get(sessionId) ?? new Set();

    if (players.length === 0) return false;

    return players.every((p) => readySet.has(p.id));
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
      throw new BadRequestException('Round não encontrado');
    }

    if (round.status !== 'OPEN') {
      throw new BadRequestException('Round não está aberto');
    }

    return true;
  }
}