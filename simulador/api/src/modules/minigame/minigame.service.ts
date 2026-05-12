import {
  BadRequestException,
  ConflictException,
  ForbiddenException,
  Injectable,
  InternalServerErrorException,
  NotFoundException,
} from '@nestjs/common';
import { PrismaService } from '@/prisma.service';
import { FinanceService } from '../finance/finance.service';
import { InventoryService } from '../inventory/inventory.service';
import { PricingService } from '../pricing/pricing.service';
import { CapexService } from '../capex/capex.service';

type SubmitConfigurationDto = {
  playerId?: string;
  storeId: string;
  sessionId: string;
  roundNumber: number;
  stockInputs: Array<{
    categoryId: string;
    buyQty: number;
    appliedMargin: number;
  }>;
  capexSelections: Array<{
    capexId: string;
  }>;
};

@Injectable()
export class MinigameService {
  private readonly roundTimers = new Map<string, Date>();

  constructor(
    private prisma: PrismaService,
    private financeService: FinanceService,
    private inventoryService: InventoryService,
    private pricingService: PricingService,
    private capexService: CapexService,
  ) {}

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

  async registerPlayer(data: {
    name: string;
    email: string;
    storeName: string;
    sessionCode: string;
  }) {
    try {
      const session = await this.prisma.gameSession.findUnique({
        where: { code: data.sessionCode.toUpperCase() },
      });

      if (!session) {
        throw new NotFoundException('Código de sala não encontrado.');
      }

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

      const player = await this.prisma.player.upsert({
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
        include: { session: true },
      });

      await this.ensureStoreExists(player.id, player.storeName);

      return player;
    } catch (error) {
      if (error instanceof NotFoundException || error instanceof ConflictException) {
        throw error;
      }

      console.error('Erro no registro:', error);
      throw new InternalServerErrorException('Erro interno ao processar registro.');
    }
  }

  async getPlayerById(playerId: string) {
    const player = await this.prisma.player.findUnique({
      where: { id: playerId },
      include: { store: true, session: true },
    });

    if (!player) {
      throw new NotFoundException('Jogador não encontrado.');
    }

    return player;
  }

  async getSessionById(sessionId: string) {
    const session = await this.prisma.gameSession.findUnique({
      where: { id: sessionId },
      include: {
        players: {
          where: { isActive: true },
          orderBy: { createdAt: 'asc' },
        },
      },
    });

    if (!session) {
      throw new NotFoundException('Sessão não encontrada.');
    }

    return session;
  }

  async updateSocketId(playerId: string, socketId: string) {
    return this.prisma.player.update({
      where: { id: playerId },
      data: { socketId, isActive: true },
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

  async ensureStoreExists(playerId: string, storeName: string) {
    const existingStore = await this.prisma.store.findUnique({
      where: { playerId },
    });

    if (existingStore) {
      return existingStore;
    }

    return this.prisma.store.create({
      data: {
        name: storeName,
        initialCash: 700000.0,
        playerId,
      },
    });
  }

  async getMasterData() {
    const [categories, capex] = await Promise.all([
      this.prisma.categoryMaster.findMany({
        orderBy: { name: 'asc' },
      }),
      this.capexService.getMasterCapex(),
    ]);

    return { categories, capex };
  }

  async getStoreStatus(playerId: string) {
    const player = await this.prisma.player.findUnique({
      where: { id: playerId },
      include: {
        store: {
          include: {
            configurations: {
              orderBy: { createdAt: 'desc' },
              take: 1,
              include: {
                stockInputs: {
                  include: { category: true },
                },
                capexSelections: {
                  include: { capexMaster: true },
                },
              },
            },
          },
        },
      },
    });

    if (!player?.store) {
      throw new NotFoundException('Loja não encontrada para o player informado.');
    }

    return {
      store: player.store,
      balance: player.store.initialCash,
      latestConfiguration: player.store.configurations[0] ?? null,
    };
  }

  async startRound(sessionId: string, duration: number) {
    const session = await this.prisma.gameSession.findUnique({
      where: { id: sessionId },
    });

    if (!session) {
      throw new NotFoundException('Sessão não encontrada.');
    }

    if (session.status === 'FINISHED') {
      throw new BadRequestException('A sessão já foi finalizada.');
    }

    const endTime = new Date(Date.now() + duration * 1000);
    this.roundTimers.set(sessionId, endTime);

    const updatedSession = await this.prisma.gameSession.update({
      where: { id: sessionId },
      data: { status: 'IN_PROGRESS' },
    });

    return {
      sessionId: updatedSession.id,
      roundNumber: updatedSession.currentRound,
      duration,
      endTime,
    };
  }

  async nextRound(sessionId: string) {
    const session = await this.prisma.gameSession.findUnique({
      where: { id: sessionId },
    });

    if (!session) {
      throw new NotFoundException('Sessão não encontrada.');
    }

    this.roundTimers.delete(sessionId);

    return this.prisma.gameSession.update({
      where: { id: sessionId },
      data: {
        currentRound: session.currentRound + 1,
        status: 'LOBBY',
      },
    });
  }

  async finishSession(sessionId: string) {
    this.roundTimers.delete(sessionId);

    return this.prisma.gameSession.update({
      where: { id: sessionId },
      data: { status: 'FINISHED' },
    });
  }

  async submitConfiguration(data: SubmitConfigurationDto) {
    const { storeId, sessionId, roundNumber, stockInputs, capexSelections } = data;

    if (!sessionId) {
      throw new BadRequestException('sessionId é obrigatório.');
    }

    const session = await this.prisma.gameSession.findUnique({
      where: { id: sessionId },
    });

    if (!session) {
      throw new NotFoundException('Sessão não encontrada.');
    }

    if (session.status !== 'IN_PROGRESS') {
      throw new ForbiddenException('A rodada não está aberta para submissões.');
    }

    if (session.currentRound !== roundNumber) {
      throw new ConflictException('A rodada informada não corresponde à rodada atual da sessão.');
    }

    const endTime = this.roundTimers.get(sessionId);
    if (!endTime || new Date() > endTime) {
      throw new ForbiddenException('Tempo esgotado para enviar decisões desta rodada.');
    }

    const store = await this.prisma.store.findUnique({
      where: { id: storeId },
    });

    if (!store) {
      throw new NotFoundException('Loja não encontrada.');
    }

    const existingConfiguration = await this.prisma.configuration.findFirst({
      where: {
        storeId,
        sessionId,
        roundNumber,
      },
    });

    if (existingConfiguration) {
      throw new ConflictException('Esta rodada já foi enviada para esta loja.');
    }

    const categoryIds = stockInputs.map((item) => item.categoryId);
    const capexIds = capexSelections.map((item) => item.capexId);

    const [categories, capexItems, currentBalance] = await Promise.all([
      categoryIds.length
        ? this.prisma.categoryMaster.findMany({
            where: { id: { in: categoryIds } },
          })
        : Promise.resolve([]),
      capexIds.length
        ? this.prisma.capexMaster.findMany({
            where: { id: { in: capexIds } },
          })
        : Promise.resolve([]),
      this.financeService.getStoreBalance(storeId),
    ]);

    const categoriesMap = new Map(categories.map((item) => [item.id, item]));
    const capexMap = new Map(capexItems.map((item) => [item.id, item]));

    const totalStockCost = stockInputs.reduce((acc, item) => {
      const category = categoriesMap.get(item.categoryId);
      if (!category) {
        throw new NotFoundException(`Categoria ${item.categoryId} não encontrada.`);
      }
      return acc + category.unitCost * item.buyQty;
    }, 0);

    const totalCapexCost = capexSelections.reduce((acc, item) => {
      const capex = capexMap.get(item.capexId);
      if (!capex) {
        throw new NotFoundException(`Capex ${item.capexId} não encontrado.`);
      }
      return acc + capex.cost;
    }, 0);

    const totalSpent = totalStockCost + totalCapexCost;

    if (totalSpent > currentBalance) {
      throw new BadRequestException('Saldo insuficiente para esta operação.');
    }

    try {
      return await this.prisma.$transaction(async (tx) => {
        const config = await tx.configuration.create({
          data: {
            storeId,
            sessionId,
            roundNumber,
            totalSpent,
          },
        });

        await this.inventoryService.addStockToStore(config.id, stockInputs, tx);
        await this.pricingService.updateStoreMargins(config.id, stockInputs, tx);
        await this.capexService.activateInvestments(config.id, capexSelections, tx);
        await this.financeService.registerTransaction(storeId, -totalSpent, tx);

        return tx.configuration.findUnique({
          where: { id: config.id },
          include: {
            stockInputs: {
              include: { category: true },
            },
            capexSelections: {
              include: { capexMaster: true },
            },
            store: true,
            session: true,
          },
        });
      });
    } catch (error) {
      console.error('Erro ao salvar configuração da rodada:', error);

      if (
        error instanceof BadRequestException ||
        error instanceof NotFoundException ||
        error instanceof ConflictException ||
        error instanceof ForbiddenException
      ) {
        throw error;
      }

      throw new InternalServerErrorException('Não foi possível salvar as decisões da rodada.');
    }
  }
}
