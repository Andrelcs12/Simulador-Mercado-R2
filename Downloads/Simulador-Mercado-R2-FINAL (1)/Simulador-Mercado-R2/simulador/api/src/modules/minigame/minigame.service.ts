import { Injectable, NotFoundException, ConflictException, InternalServerErrorException, BadRequestException, ForbiddenException } from '@nestjs/common';
import { PrismaService } from '@/prisma.service';

const BUDGET_LIMIT = 700_000;

@Injectable()
export class MinigameService {
  constructor(private prisma: PrismaService) {}

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

  async registerPlayer(data: { name: string; email: string; storeName: string; sessionCode: string }) {
    try {
      const session = await this.prisma.gameSession.findUnique({
        where: { code: data.sessionCode.toUpperCase() },
      });

      if (!session) throw new NotFoundException('Código de sala não encontrado.');

      const existingStore = await this.prisma.player.findFirst({
        where: {
          storeName: data.storeName,
          sessionId: session.id,
          isActive: true,
          NOT: { email: data.email },
        },
      });

      if (existingStore) throw new ConflictException('Esta unidade de negócio já possui um gestor nesta sala.');

      return await this.prisma.player.upsert({
        where: { email: data.email },
        update: {
          name: data.name,
          storeName: data.storeName,
          sessionId: session.id,
          isActive: true,
          socketId: null,
        },
        create: {
          name: data.name,
          email: data.email,
          storeName: data.storeName,
          sessionId: session.id,
          role: 'player',
        },
        include: { session: true }
      });
    } catch (error) {
      if (error instanceof NotFoundException || error instanceof ConflictException) throw error;
      throw new InternalServerErrorException('Erro interno ao processar registro.');
    }
  }

  async getPlayerById(playerId: string) {
    const player = await this.prisma.player.findUnique({ where: { id: playerId } });
    if (!player) throw new NotFoundException('Jogador não encontrado.');
    return player;
  }

  async getSessionById(sessionId: string) {
    const session = await this.prisma.gameSession.findUnique({
      where: { id: sessionId },
      include: { 
        players: {
          where: { isActive: true },
          orderBy: { createdAt: 'asc' }
        } 
      },
    });
    if (!session) throw new NotFoundException('Sessão não encontrada.');
    return session;
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

  async setPlayerReady(playerId: string) {
    return this.prisma.player.update({
      where: { id: playerId },
      data: { isActive: true },
    });
  }

  // ✅ GET /minigame/master-data
  async getMasterData() {
    const [categories, capex] = await Promise.all([
      this.prisma.categoryMaster.findMany({
        orderBy: { name: 'asc' },
        select: {
          id: true,
          name: true,
          unitCost: true,
          taxRate: true,
          agingPenaltyRate: true,
          marketStock: true,
        },
      }),
      this.prisma.capexMaster.findMany({
        orderBy: { name: 'asc' },
        select: {
          id: true,
          name: true,
          description: true,
          cost: true,
          baseLicense: true,
          upgradeImpact: true,
        },
      }),
    ]);

    return {
      categories: categories.map(c => ({
        ...c,
        defaultMargin: 15, // margem padrão para o frontend inicializar o campo
      })),
      capex,
      budgetLimit: BUDGET_LIMIT,
    };
  }

  // ✅ GET /minigame/store-status/:playerId
  async getStoreStatus(playerId: string) {
    const player = await this.prisma.player.findUnique({
      where: { id: playerId },
      include: { store: true },
    });

    if (!player) throw new NotFoundException('Jogador não encontrado.');

    // Se a Store já existe, usa o initialCash dela. Senão, usa o limite padrão.
    const balance = player.store?.initialCash ?? BUDGET_LIMIT;

    return {
      playerId,
      storeName: player.storeName,
      balance,
      budgetLimit: BUDGET_LIMIT,
    };
  }

  // ✅ POST /minigame/submit-config
  async submitConfig(body: {
    storeId: string;
    sessionId: string;
    roundNumber: number;
    stockInputs: { categoryId: string; buyQty: number; appliedMargin: number }[];
    capexSelections: { capexId: string }[];
  }) {
    // 1. Verificar se a sessão está ativa
    const session = await this.prisma.gameSession.findUnique({
      where: { id: body.sessionId },
    });
    if (!session) throw new NotFoundException('Sessão não encontrada.');
    if (session.status === 'FINISHED') throw new ForbiddenException('A rodada já foi encerrada pelo servidor.');

    // 2. Buscar o player
    const player = await this.prisma.player.findUnique({
      where: { id: body.storeId },
      include: { store: true },
    });
    if (!player) throw new NotFoundException('Jogador não encontrado.');

    // 3. Criar Store se não existir
    let store = player.store;
    if (!store) {
      store = await this.prisma.store.create({
        data: {
          name: player.storeName,
          initialCash: BUDGET_LIMIT,
          playerId: player.id,
        },
      });
    }

    // 4. Calcular custo total
    const categoryIds = body.stockInputs.map(s => s.categoryId);
    const categories = await this.prisma.categoryMaster.findMany({
      where: { id: { in: categoryIds } },
    });
    const capexIds = body.capexSelections.map(c => c.capexId);
    const capexItems = await this.prisma.capexMaster.findMany({
      where: { id: { in: capexIds } },
    });

    const stockCost = body.stockInputs.reduce((acc, input) => {
      const cat = categories.find(c => c.id === input.categoryId);
      return acc + (cat?.unitCost ?? 0) * input.buyQty;
    }, 0);
    const capexCost = capexItems.reduce((acc, item) => acc + item.cost, 0);
    const totalCost = stockCost + capexCost;

    if (totalCost > (store.initialCash ?? BUDGET_LIMIT)) {
      throw new BadRequestException({
        message: 'Saldo insuficiente.',
        required: totalCost,
        available: store.initialCash ?? BUDGET_LIMIT,
      });
    }

    // 5. Criar Configuration (registro central da rodada para este player)
    const config = await this.prisma.configuration.create({
      data: {
        storeId: store.id,
        sessionId: body.sessionId,
        roundNumber: body.roundNumber,
        totalSpent: totalCost,
      },
    });

    // 6. Salvar StockInputs vinculados à Configuration
    for (const input of body.stockInputs) {
      if (input.buyQty > 0) {
        await this.prisma.stockInput.create({
          data: {
            configId: config.id,
            categoryId: input.categoryId,
            buyQty: input.buyQty,
            appliedMargin: input.appliedMargin,
          },
        });
      }
    }

    // 7. Salvar seleções de CAPEX vinculadas à Configuration
    for (const capex of body.capexSelections) {
      await this.prisma.storeCapex.create({
        data: {
          configId: config.id,
          capexId: capex.capexId,
        },
      });
    }

    return {
      message: 'Decisões registradas com sucesso.',
      totalCost,
      roundNumber: body.roundNumber,
    };
  }

  // ✅ GET /minigame/results/:sessionId
  async getSessionResults(sessionId: string) {
    const players = await this.prisma.player.findMany({
      where: { sessionId, isActive: true },
      include: {
        scores: { orderBy: { round: 'asc' } },
      },
      orderBy: { createdAt: 'asc' },
    });

    // Calcula ranking com base na soma dos scores (EBITDA simulado)
    const ranked = players
      .map(p => ({
        playerId: p.id,
        playerName: p.name,
        storeName: p.storeName,
        ebitda: p.scores.reduce((sum, s) => sum + s.value, 0),
        netProfit: p.scores.reduce((sum, s) => sum + s.value * 0.7, 0), // estimativa de 70%
        position: 0,
      }))
      .sort((a, b) => b.ebitda - a.ebitda)
      .map((p, i) => ({ ...p, position: i + 1 }));

    return ranked;
  }

  // ✅ POST /minigame/next-round
  async nextRound(sessionId: string) {
    const session = await this.prisma.gameSession.findUnique({
      where: { id: sessionId },
    });

    if (!session) throw new NotFoundException('Sessão não encontrada.');

    const updatedSession = await this.prisma.gameSession.update({
      where: { id: sessionId },
      data: {
        currentRound: session.currentRound + 1,
        status: 'LOBBY',
      },
    });

    return {
      message: 'Próxima rodada preparada.',
      currentRound: updatedSession.currentRound,
    };
  }
}