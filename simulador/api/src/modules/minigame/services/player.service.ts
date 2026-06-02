import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from "@nestjs/common";

import { PrismaService } from "@/prisma.service";
import { PlayerRole } from "@/generated/prisma/enums";

@Injectable()
export class PlayerService {
  constructor(private readonly prisma: PrismaService) {}

  async registerPlayer(data: {
    name: string;
    sessionCode: string;
    role: PlayerRole;
    storeName: string;
  }) {
    const session = await this.prisma.gameSession.findUnique({
      where: { code: data.sessionCode },
    });

    if (!session) {
      throw new NotFoundException("Sessão não encontrada");
    }

    if (session.status === "FINISHED") {
      throw new BadRequestException("Sessão finalizada");
    }

    const existingPlayer = await this.prisma.player.findFirst({
      where: {
        name: data.name,
        sessionId: session.id,
      },
      include: { store: true },
    });

    if (existingPlayer) return existingPlayer;

    const store = await this.prisma.store.create({
      data: {
        name: data.storeName,
        sessionId: session.id,
      },
    });

    return this.prisma.player.create({
      data: {
        name: data.name,
        role: data.role,
        sessionId: session.id,
        storeId: store.id,
      },
      include: { store: true },
    });
  }

  async getPlayerById(playerId: string) {
    const player = await this.prisma.player.findUnique({
      where: { id: playerId },
      include: { store: true },
    });

    if (!player) {
      throw new NotFoundException("Player não encontrado");
    }

    return player;
  }

  async getPlayersBySession(sessionId: string) {
    return this.prisma.player.findMany({
      where: { sessionId },
      include: { store: true },
    });
  }

  // player.service.ts
async getPlayersSnapshot(sessionId: string) {
  const players = await this.prisma.player.findMany({
    where: { sessionId },
    include: {
      store: {
        select: { name: true },
      },
    },
  });

  // Busca as configurações da rodada atual para saber quem submeteu
  const session = await this.prisma.gameSession.findUnique({
    where: { id: sessionId },
    include: {
      rounds: {
        where: { status: "OPEN" },
        take: 1,
      },
    },
  });

  const activeRoundId = session?.rounds?.[0]?.id ?? null;

  let submittedPlayerIds = new Set<string>();

  if (activeRoundId) {
    const configs = await this.prisma.configuration.findMany({
      where: { sessionId, roundId: activeRoundId },
      select: {
        storeId: true,
        submittedAt: true,
        store: {
          select: {
            players: {
              select: { id: true },
            },
          },
        },
      },
    });

    for (const config of configs) {
      for (const p of config.store.players) {
        submittedPlayerIds.add(p.id);
      }
    }
  }

  return players.map((p) => ({
    id: p.id,
    name: p.name,
    storeName: p.store?.name ?? "Sem loja",
    isReady: p.isReady ?? false,          // precisa existir no schema
    submittedAt: submittedPlayerIds.has(p.id)
      ? new Date().toISOString()
      : undefined,
  }));
}

  async updateSocketId(playerId: string, socketId: string) {
    return this.prisma.player.update({
      where: { id: playerId },
      data: { socketId },
    });
  }

  async kickPlayer(playerId: string) {
    const player = await this.prisma.player.findUnique({
      where: { id: playerId },
    });

    if (!player) {
      throw new NotFoundException("Player não encontrado");
    }

    await this.prisma.player.delete({
      where: { id: playerId },
    });

    return { success: true, playerId };
  }
}