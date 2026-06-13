import {
  Injectable,
  NotFoundException,
} from "@nestjs/common";

import { PrismaService } from "@/prisma.service";
import {
  GameRoundStatus,
  GameSessionStatus,
} from "@/generated/prisma/enums";
import { Server } from "socket.io";

@Injectable()
export class SessionService {
  constructor(private readonly prisma: PrismaService) {}

  private server: Server;

  setServer(server: Server) {
    this.server = server;
  }

  private generateCode() {
    return Math.random().toString(36).substring(2, 6).toUpperCase();
  }

  private async getSessionOrThrow(sessionId: string) {
    const session = await this.prisma.gameSession.findUnique({
      where: { id: sessionId },
      include: {
        rounds: true,
        players: true,
        stores: true,
      },
    });

    if (!session) {
      throw new NotFoundException("Sessão não encontrada");
    }

    return session;
  }

  // =========================
  // CREATE SESSION
  // =========================
  async createSession(totalRounds = 5) {
    const session = await this.prisma.gameSession.create({
      data: {
        code: this.generateCode(),
        status: GameSessionStatus.LOBBY,
        totalRounds,
        currentRound: 0,
      },
    });

    await this.prisma.gameRound.createMany({
      data: Array.from({ length: totalRounds }).map((_, i) => ({
        sessionId: session.id,
        roundNumber: i + 1,
        status: GameRoundStatus.CLOSED,
      })),
    });

    return session;
  }

  // =========================
  // SAFE GET SESSION (IMPORTANTE)
  // =========================
  async getSessionById(sessionId: string) {
    const session = await this.prisma.gameSession.findUnique({
      where: { id: sessionId },
      include: {
        rounds: {
          orderBy: { roundNumber: "asc" },
        },
        players: true,
        stores: true,
      },
    });

    if (!session) {
      return null; // NÃO CRASHA GATEWAY
    }

    return session;
  }

  getSessionByCode(code: string) {
    return this.prisma.gameSession.findUnique({
      where: { code },
      include: {
        rounds: true,
        players: true,
      },
    });
  }

  finishSession(sessionId: string) {
    return this.prisma.gameSession.update({
      where: { id: sessionId },
      data: { status: GameSessionStatus.FINISHED },
    });
  }

  updateSessionState(
    sessionId: string,
    data: {
      status?: GameSessionStatus;
      currentRound?: number;
    },
  ) {
    return this.prisma.gameSession.update({
      where: { id: sessionId },
      data,
    });
  }

  validateSession(sessionId: string) {
    return this.getSessionOrThrow(sessionId);
  }

  // =========================
  // FINALIZE SESSION (CORRIGIDO)
  // =========================
  async finalizeSession(sessionId: string) {
    const session = await this.getSessionOrThrow(sessionId);

    const REQUIRED_ROUNDS = 3;

    // 🔥 CORRETO: rounds finalizados de verdade
    const completedRounds = session.rounds.filter(
      (r) => r.status === "PROCESSED" || r.status === "CLOSED",
    );

    if (completedRounds.length < REQUIRED_ROUNDS) {
      return {
        success: false,
        message: `Jogo ainda não finalizado (${completedRounds.length}/${REQUIRED_ROUNDS})`,
      };
    }

    const results = await this.prisma.roundResult.findMany({
      where: { sessionId },
    });

    if (!results.length) {
      return {
        success: false,
        message: "Nenhum resultado encontrado",
      };
    }

    const grouped = results.reduce((acc, r) => {
      if (!acc[r.storeId]) acc[r.storeId] = [];
      acc[r.storeId].push(r);
      return acc;
    }, {} as Record<string, typeof results>);

    const finalResults = Object.entries(grouped).map(
      ([storeId, storeResults]) => {
        const totalRevenue = storeResults.reduce(
          (a, r) => a + r.totalRevenue,
          0,
        );

        const totalExpenses = storeResults.reduce(
          (a, r) => a + r.totalExpenses,
          0,
        );

        const finalEbitda = storeResults.reduce(
          (a, r) => a + r.ebitdaValue,
          0,
        );

        return {
          storeId,
          totalRevenue,
          totalExpenses,
          finalEbitda,
          finalEbitdaMargin: totalRevenue
            ? (finalEbitda / totalRevenue) * 100
            : 0,
          finalMarketShare:
            storeResults.reduce((a, r) => a + r.marketShare, 0) /
            storeResults.length,
          finalCash: storeResults.at(-1)?.finalCash ?? 0,
        };
      },
    );

    // Critério das regras: melhor % de EBITDA. Desempate pelo valor absoluto de
    // EBITDA (quando ninguém teve receita, a margem fica 0 para todos e o valor decide).
    const ranking = [...finalResults].sort(
      (a, b) =>
        b.finalEbitdaMargin - a.finalEbitdaMargin ||
        b.finalEbitda - a.finalEbitda,
    );

    await Promise.all(
      ranking.map((r, index) =>
        this.prisma.sessionResult.upsert({
          where: {
            sessionId_storeId: {
              sessionId,
              storeId: r.storeId,
            },
          },
          create: {
            sessionId,
            storeId: r.storeId,
            totalRevenue: r.totalRevenue,
            totalExpenses: r.totalExpenses,
            finalCash: r.finalCash,
            finalEbitda: r.finalEbitda,
            finalEbitdaMargin: r.finalEbitdaMargin,
            finalMarketShare: r.finalMarketShare,
            finalScore: r.finalEbitdaMargin,
            position: index + 1,
          },
          update: {
            totalRevenue: r.totalRevenue,
            totalExpenses: r.totalExpenses,
            finalCash: r.finalCash,
            finalEbitda: r.finalEbitda,
            finalEbitdaMargin: r.finalEbitdaMargin,
            finalMarketShare: r.finalMarketShare,
            finalScore: r.finalEbitdaMargin,
            position: index + 1,
          },
        }),
      ),
    );

    // Ranking enriquecido (com nomes e posição) para o pódio/telas finais.
    const enrichedRanking = await this.getFinalRanking(sessionId);

    this.server?.to(sessionId).emit("session:finalized", {
      sessionId,
      rounds: REQUIRED_ROUNDS,
      ranking: enrichedRanking,
    });

    return {
      success: true,
      sessionId,
      rounds: REQUIRED_ROUNDS,
      ranking: enrichedRanking,
    };
  }

  // =========================
  // RANKING FINAL (ENRIQUECIDO)
  // =========================
  async getFinalRanking(sessionId: string) {
    const results = await this.prisma.sessionResult.findMany({
      where: { sessionId },
      orderBy: { position: "asc" },
      include: {
        store: {
          include: {
            players: { select: { id: true, name: true } },
          },
        },
      },
    });

    return results.map((r) => ({
      position: r.position,
      storeId: r.storeId,
      storeName: r.store?.name ?? "Loja",
      playerName: r.store?.players?.[0]?.name ?? r.store?.name ?? "",
      playerId: r.store?.players?.[0]?.id ?? "",
      finalEbitda: r.finalEbitda,
      finalEbitdaMargin: r.finalEbitdaMargin, // já em %
      finalMarketShare: (r.finalMarketShare ?? 0) * 100, // fração → %
      finalCash: r.finalCash,
      totalRevenue: r.totalRevenue,
      totalExpenses: r.totalExpenses,
    }));
  }
}