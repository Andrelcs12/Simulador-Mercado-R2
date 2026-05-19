import {
  BadRequestException,
  Injectable,
  Logger,
} from "@nestjs/common";

import { PrismaService } from "@/prisma.service";
import { PlayerConfigurationInput } from "../contracts/simulation-input";

@Injectable()
export class SubmissionService {
  constructor(private readonly prisma: PrismaService) {}

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

    // DEBUG PAYLOAD COMPLETO
    this.logger.debug(
      JSON.stringify(
        {
          playerId: data.playerId,
          sessionId: data.sessionId,
          roundId: data.roundId,
          operatorsQty: data.operatorsQty,
          serviceOperatorsQty: data.serviceOperatorsQty,
          stockInputs: data.stockInputs,
          capexSelections: data.capexSelections,
        },
        null,
        2,
      ),
    );

    await this.validateSubmissionWindow(data.roundId);

    const storeId = await this.getStoreId(data.playerId);

    this.logger.debug(`STORE ID: ${storeId}`);

    await this.ensureUniqueConfig(data.roundId, storeId);

    // =========================
    // BUSCA CATEGORIAS REAIS
    // =========================

    const categories = await this.prisma.categoryMaster.findMany({
      select: {
        id: true,
        name: true,
      },
    });

    this.logger.debug(
      `CATEGORIAS ENCONTRADAS: ${categories.length}`,
    );

    this.logger.debug(
      JSON.stringify(categories, null, 2),
    );

    // SET DE IDS VÁLIDOS
    const validCategoryIds = new Set(
      categories.map((c) => c.id),
    );

    // =========================
    // VALIDAÇÃO STOCK INPUTS
    // =========================

    const parsedStockInputs = data.stockInputs.map((s, index) => {
      this.logger.debug(
        `[STOCK ${index}] categoryId recebido: ${s.categoryId}`,
      );

      const exists = validCategoryIds.has(s.categoryId);

      this.logger.debug(
        `[STOCK ${index}] categoria existe? ${exists}`,
      );

      if (!exists) {
        this.logger.error(
          `Categoria inválida detectada: ${s.categoryId}`,
        );

        this.logger.error(
          "Categorias válidas disponíveis:",
        );

        this.logger.error(
          JSON.stringify(
            categories.map((c) => ({
              id: c.id,
              name: c.name,
            })),
            null,
            2,
          ),
        );

        throw new BadRequestException(
          `Categoria inválida: ${s.categoryId}`,
        );
      }

      return {
        categoryId: s.categoryId,
        buyQty: s.buyQty,
        commercialMargin: s.commercialMargin,
        expectedSellPrice: s.expectedSellPrice,
      };
    });

    // =========================
    // DEBUG FINAL
    // =========================

    this.logger.debug(
      "STOCK INPUTS PARSEADOS:",
    );

    this.logger.debug(
      JSON.stringify(parsedStockInputs, null, 2),
    );

    // =========================
    // CREATE CONFIG
    // =========================

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
            create: data.capexSelections,
          },
        },

        include: {
          stockInputs: true,
          capexSelections: true,
        },
      });

      this.logger.log(
        `CONFIGURAÇÃO CRIADA COM SUCESSO: ${config.id}`,
      );

      return {
        success: true,
        configId: config.id,
        submittedAt: config.submittedAt,
      };
    } catch (error) {
      this.logger.error(
        "ERRO AO CRIAR CONFIGURAÇÃO",
      );

      this.logger.error(error);

      if (error instanceof Error) {
        this.logger.error(error.message);
        this.logger.error(error.stack);
      }

      throw error;
    }
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