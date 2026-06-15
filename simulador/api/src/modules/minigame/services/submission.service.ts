import {
  BadRequestException,
  Injectable,
  Logger,
} from "@nestjs/common";

import { PrismaService } from "@/prisma.service";
import { PlayerConfigurationInput } from "../contracts/simulation-input";
import { RankingService } from "./ranking.service";

@Injectable()
export class SubmissionService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly ranking: RankingService,
  ) {}

  private readyPlayers = new Map<string, Set<string>>();

  // logger nest
  private readonly logger = new Logger(SubmissionService.name);

  // =========================
  // CONFIG SUBMISSION
  // =========================


  async submitConfiguration(data: PlayerConfigurationInput) {
    this.logger.log("====================================");
    this.logger.log("NOVA SUBMISSÃO RECEBIDA");
    this.logger.log("====================================");

    await this.validateSubmissionWindow(data.roundId);
    const storeId = await this.getStoreId(data.playerId);
    await this.ensureUniqueConfig(data.roundId, storeId);

    // 1. Busca Categorias e Capex Master (incluindo o SLUG agora)
    const [categories, capexMasters] = await Promise.all([
      this.prisma.categoryMaster.findMany({ select: { id: true } }),
      this.prisma.capexMaster.findMany({ select: { id: true, slug: true } }),
    ]);

    const validCategoryIds = new Set(categories.map((c) => c.id));

    // 2. Validação e Mapeamento de Stock Inputs
    const parsedStockInputs = data.stockInputs.map((s) => {
      if (!validCategoryIds.has(s.categoryId)) {
        throw new BadRequestException(`Categoria inválida: ${s.categoryId}`);
      }
      return {
        categoryId: s.categoryId,
        buyQty: s.buyQty,
        commercialMargin: s.commercialMargin,
        expectedSellPrice: s.expectedSellPrice,
      };
    });

    // 3. Validação e Mapeamento de Capex Selections via SLUG
    // O front envia um objeto com 'capexId' que agora contém o slug (ex: 'seguranca')
    const parsedCapexSelections = data.capexSelections.map((c) => {
      const master = capexMasters.find((m) => m.slug === c.capexId);
      
      if (!master) {
        this.logger.error(`Capex não encontrado no banco: ${c.capexId}`);
        throw new BadRequestException(`Capex inválido: ${c.capexId}`);
      }
      
      // Retornamos o ID real que está no banco, mapeado a partir do slug
      return { capexId: master.id };
    });

    // 4. Criação da Configuração
    try {
      const config = await this.prisma.configuration.create({
        data: {
          sessionId: data.sessionId,
          roundId: data.roundId,
          storeId,
          operatorsQty: data.operatorsQty,
          serviceOperatorsQty: data.serviceOperatorsQty,
          quizScore: data.quizScore,
          stockInputs: {
            create: parsedStockInputs,
          },
          capexSelections: {
            create: parsedCapexSelections,
          },
        },
        include: {
          stockInputs: true,
          capexSelections: true,
        },
      });

      this.logger.log(`CONFIGURAÇÃO CRIADA COM SUCESSO: ${config.id}`);

      // Atualiza ranking da rodada sempre que uma submissão é processada.
      await this.ranking.computeRoundRanking(data.sessionId, data.roundId);

      return {
        success: true,
        configId: config.id,
        submittedAt: config.submittedAt,
      };
    } catch (error) {
      this.logger.error("ERRO AO CRIAR CONFIGURAÇÃO NO BANCO", error);
      throw error;
    }
  }

  // Adicione este método ao seu SubmissionService
async getCategories() {
  return this.prisma.categoryMaster.findMany({
    select: {
      id: true,
      name: true,
    },
  });
}
  
  // =========================
  // HELPERS
  // =========================

  

  private async getStoreId(playerId: string) {
    this.logger.debug(
      `Buscando store do player: ${playerId}`,
    );

    const player = await this.prisma.player.findUnique({
      where: {
        id: playerId,
      },

      select: {
        storeId: true,
      },
    });

    if (!player?.storeId) {
      this.logger.error(
        `Player sem store vinculada: ${playerId}`,
      );

      throw new BadRequestException(
        "Player sem store vinculada",
      );
    }

    return player.storeId;
  }

  private async ensureUniqueConfig(
    roundId: string,
    storeId: string,
  ) {
    this.logger.debug(
      `Validando config única | round=${roundId} | store=${storeId}`,
    );

    const exists = await this.prisma.configuration.findFirst({
      where: {
        roundId,
        storeId,
      },

      select: {
        id: true,
      },
    });

    if (exists) {
      this.logger.error(
        `Config duplicada encontrada: ${exists.id}`,
      );

      throw new BadRequestException(
        "Config já enviada nesta rodada",
      );
    }
  }

  // =========================
  // READY SYSTEM
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
      where: {
        sessionId,
      },

      select: {
        id: true,
      },
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
    this.logger.debug(
      `Validando janela de submissão da rodada: ${roundId}`,
    );

    const round = await this.prisma.gameRound.findUnique({
      where: {
        id: roundId,
      },

      select: {
        status: true,
      },
    });

    if (!round) {
      this.logger.error(
        `Round não encontrado: ${roundId}`,
      );

      throw new BadRequestException(
        "Round não encontrado",
      );
    }

    this.logger.debug(
      `Status da rodada: ${round.status}`,
    );

    if (round.status !== "OPEN") {
      throw new BadRequestException(
        "Round não está aberta",
      );
    }

    return true;
  }
}