import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '@/prisma.service';
import { PlayerRole } from '@/generated/prisma/enums';

@Injectable()
export class PlayerService {
  constructor(private prisma: PrismaService) {}

  async registerPlayer(data: {
  name: string;
  email: string;
  sessionCode: string;
  role: PlayerRole;
  storeName: string;
}) {
  const session = await this.prisma.gameSession.findUnique({
    where: {
      code: data.sessionCode,
    },
  });

  if (!session) {
    throw new Error("Sessão não encontrada");
  }

  // cria loja
  const store = await this.prisma.store.create({
    data: {
      name: data.storeName,
      sessionId: session.id,
    },
  });

  // cria player
  return this.prisma.player.upsert({
    where: {
      email: data.email,
    },

    update: {
      name: data.name,
      role: data.role,
      sessionId: session.id,
      storeId: store.id,
    },

    create: {
      name: data.name,
      email: data.email,
      role: data.role,
      sessionId: session.id,
      storeId: store.id,
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