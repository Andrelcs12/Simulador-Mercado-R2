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
    });

    if (!session) {
      throw new NotFoundException("Sessão não encontrada");
    }

    return session;
  }

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

  getSessionById(sessionId: string) {
    return this.prisma.gameSession.findUnique({
      where: { id: sessionId },
      include: {
        rounds: { orderBy: { roundNumber: "asc" } },
        players: true,
        stores: true,
      },
    });
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

  updateSessionState(sessionId: string, data: {
    status?: GameSessionStatus;
    currentRound?: number;
  }) {
    return this.prisma.gameSession.update({
      where: { id: sessionId },
      data,
    });
  }

  validateSession(sessionId: string) {
    return this.getSessionOrThrow(sessionId);
  }


  async finalizeSession(sessionId: string) {
  const results = await this.prisma.roundResult.findMany({
    where: { sessionId },
  });

  if (!results.length) {
    return { success: false, message: "Nenhum resultado encontrado" };
  }

  const grouped = results.reduce((acc, r) => {
    if (!acc[r.storeId]) acc[r.storeId] = [];
    acc[r.storeId].push(r);
    return acc;
  }, {} as Record<string, typeof results>);

  const finalResults: any[] = [];

  for (const storeId of Object.keys(grouped)) {
    const storeResults = grouped[storeId];

    const totalRevenue = storeResults.reduce((a, r) => a + r.totalRevenue, 0);
    const totalExpenses = storeResults.reduce((a, r) => a + r.totalExpenses, 0);
    const finalEbitda = storeResults.reduce((a, r) => a + r.ebitdaValue, 0);

    const finalEbitdaMargin =
      totalRevenue > 0 ? (finalEbitda / totalRevenue) * 100 : 0;

    const finalMarketShare =
      storeResults.reduce((a, r) => a + r.marketShare, 0) /
      storeResults.length;

    await this.prisma.sessionResult.upsert({
      where: {
        sessionId_storeId: { sessionId, storeId },
      },
      create: {
        sessionId,
        storeId,
        totalRevenue,
        totalExpenses,
        finalCash: storeResults.at(-1)?.finalCash || 0,
        finalEbitda,
        finalEbitdaMargin,
        finalMarketShare,
        finalScore: finalEbitdaMargin,
        position: 0,
      },
      update: {
        totalRevenue,
        totalExpenses,
        finalCash: storeResults.at(-1)?.finalCash || 0,
        finalEbitda,
        finalEbitdaMargin,
        finalMarketShare,
        finalScore: finalEbitdaMargin,
      },
    });

    finalResults.push({ storeId, finalEbitdaMargin });
  }

  const ranking = finalResults.sort(
    (a, b) => b.finalEbitdaMargin - a.finalEbitdaMargin,
  );

  for (let i = 0; i < ranking.length; i++) {
    await this.prisma.sessionResult.update({
      where: {
        sessionId_storeId: {
          sessionId,
          storeId: ranking[i].storeId,
        },
      },
      data: { position: i + 1 },
    });
  }

  // 🔥 IMPORTANTE: emit só depois de ranking pronto
  this.server?.to(sessionId).emit("session:finalized", {
    sessionId,
    ranking,
  });

  return { success: true, ranking };
}


}