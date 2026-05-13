import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '@/prisma.service';
import { PlayerRole } from '@/generated/prisma/enums';

@Injectable()
export class PlayerService {
  constructor(private prisma: PrismaService) {}

  async registerPlayer(data: {
    name: string;
    email: string;
    sessionId: string;
    role: PlayerRole;
  }) {
    return this.prisma.player.upsert({
      where: { email: data.email },
      update: {
        name: data.name,
        role: data.role,
        sessionId: data.sessionId,
      },
      create: {
        name: data.name,
        email: data.email,
        role: data.role,
        sessionId: data.sessionId,
      },
    });
  }

  async getPlayerById(playerId: string) {
    const player = await this.prisma.player.findUnique({
      where: { id: playerId },
      include: { store: true },
    });

    if (!player) throw new NotFoundException('Player não encontrado');

    return player;
  }

  async getPlayersBySession(sessionId: string) {
    return this.prisma.player.findMany({
      where: { sessionId },
    });
  }

  async getPlayersSnapshot(sessionId: string) {
    return this.prisma.player.findMany({
      where: { sessionId },
      select: {
        id: true,
        name: true,
        email: true,
        role: true,
        storeId: true,
        socketId: true,
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

    if (!player) throw new NotFoundException('Player não encontrado');

    await this.prisma.player.delete({
      where: { id: playerId },
    });

    return { playerId, kicked: true };
  }
}