import { Injectable, NotFoundException, ConflictException, InternalServerErrorException } from '@nestjs/common';
import { PrismaService } from '@/prisma.service';

@Injectable()
export class MinigameService {
  constructor(private prisma: PrismaService) {}

  // Cria uma nova sessão (GameSession) com código curto (ex: XJ92)
  async createSession() {
    try {
      const code = Math.random().toString(36).substring(2, 6).toUpperCase();
      return await this.prisma.gameSession.create({
        data: {
          code,
          status: 'LOBBY',
          currentRound: 1,
        },
      });
    } catch (error) {
      throw new InternalServerErrorException('Erro ao criar sessão de jogo.');
    }
  }

  // Registra o jogador vinculando-o ao código da sessão digitado
  async registerPlayer(data: { name: string; email: string; storeName: string; sessionCode: string }) {
    try {
      // 1. Validar se a sessão com esse código existe
      const session = await this.prisma.gameSession.findUnique({
        where: { code: data.sessionCode.toUpperCase() },
      });

      if (!session) {
        throw new NotFoundException('Código de sala não encontrado.');
      }

      // 2. Verificar se a loja já está ocupada por outro e-mail nesta sessão
      const existingStore = await this.prisma.player.findFirst({
        where: {
          storeName: data.storeName,
          sessionId: session.id,
          isActive: true,
          NOT: { email: data.email },
        },
      });

      if (existingStore) {
        throw new ConflictException('Esta unidade de negócio já possui um gestor nesta sala.');
      }

      // 3. Upsert do Jogador (Cria ou atualiza e vincula à sessão encontrada)
      return await this.prisma.player.upsert({
        where: { email: data.email },
        update: {
          name: data.name,
          storeName: data.storeName,
          sessionId: session.id,
          isActive: true,
          socketId: null, // Resetamos para o gateway atualizar na conexão
        },
        create: {
          name: data.name,
          email: data.email,
          storeName: data.storeName,
          sessionId: session.id,
          role: 'player',
        },
        include: { session: true } // Retorna os dados da sessão (incluindo o UUID id)
      });
    } catch (error) {
      if (error instanceof NotFoundException || error instanceof ConflictException) throw error;
      console.error('Erro no registro:', error);
      throw new InternalServerErrorException('Erro interno ao processar registro.');
    }
  }

  async updateSocketId(playerId: string, socketId: string) {
    return this.prisma.player.update({
      where: { id: playerId },
      data: { socketId },
    });
  }

  async getPlayersBySession(sessionId: string) {
    return this.prisma.player.findMany({
      where: { sessionId, isActive: true },
      orderBy: { createdAt: 'asc' },
    });
  }


  async getSessionById(sessionId: string) {
  const session = await this.prisma.gameSession.findUnique({
    where: { id: sessionId },
  });
  if (!session) throw new NotFoundException('Sessão não encontrada.');
  return session;
}


    async setPlayerReady(playerId: string) {
  return this.prisma.player.update({
    where: { id: playerId },
    data: { isActive: true }, // Ou use um campo 'isReady' se tiver no seu schema
  });
}
}