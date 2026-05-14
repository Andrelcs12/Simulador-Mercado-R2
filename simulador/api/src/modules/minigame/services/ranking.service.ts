import { Injectable } from "@nestjs/common";
import { PrismaService } from "@/prisma.service";

@Injectable()
export class RankingService {
  constructor(
    private readonly prisma: PrismaService,
  ) {}

  async computeSessionRanking(sessionId: string) {
    const results =
      await this.prisma.roundResult.findMany({
        where: { sessionId },
      });

    const storeScores = new Map<
      string,
      number
    >();

    for (const r of results) {
      const score =
        (r.ebitdaValue ?? 0) +
        (r.finalCash ?? 0) * 0.1 -
        (r.agingCosts ?? 0);

      storeScores.set(
        r.storeId,
        (storeScores.get(r.storeId) ?? 0) +
          score,
      );
    }

    const sorted = [...storeScores.entries()].sort(
      (a, b) => b[1] - a[1],
    );

    let lastScore: number | null = null;
    let position = 0;
    let lastRank = 0;

    const result = [];

    for (const [storeId, score] of sorted) {
      position++;

      if (lastScore === null || score !== lastScore) {
        lastRank = position;
      }

      await this.prisma.sessionResult.upsert({
        where: {
          sessionId_storeId: {
            sessionId,
            storeId,
          },
        },
        create: {
          sessionId,
          storeId,
          finalScore: score,
          totalRevenue: 0,
          totalExpenses: 0,
          finalEbitda: 0,
          finalEbitdaMargin: 0,
          finalCash: 0,
          position: lastRank,
        },
        update: {
          finalScore: score,
          position: lastRank,
        },
      });

      result.push({
        storeId,
        score,
        position: lastRank,
      });

      lastScore = score;
    }

    return result;
  }
}