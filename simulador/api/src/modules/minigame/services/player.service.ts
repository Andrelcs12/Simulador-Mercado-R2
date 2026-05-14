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

  // 🔥 FIX PRINCIPAL: inclui store
  async getPlayersSnapshot(sessionId: string) {
    return this.prisma.player.findMany({
      where: { sessionId },
      select: {
        id: true,
        name: true,
        role: true,
        socketId: true,
        store: {
          select: {
            name: true,
          },
        },
      },
    });
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