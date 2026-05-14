import { Injectable } from "@nestjs/common";
import { PrismaService } from "@/prisma.service";

@Injectable()
export class RankingService {
  constructor(private readonly prisma: PrismaService) {}

  async computeRoundRanking(sessionId: string, roundId: string) {
    const results = await this.prisma.roundResult.findMany({
      where: { sessionId, roundId },
    });

    const map = new Map<string, number>();

    // SCORE BASE (conforme tua simulação real)
    for (const r of results) {
      const score =
        (r.ebitdaValue ?? 0) * 0.5 +
        (r.finalCash ?? 0) * 0.2 +
        (r.csat ?? 0) * 1000 +
        (r.sla ?? 0) * 800 -
        (r.agingCosts ?? 0) * 0.3;

      map.set(r.storeId, (map.get(r.storeId) ?? 0) + score);
    }

    const sorted = [...map.entries()].sort((a, b) => b[1] - a[1]);

    const totalWeight = sorted.reduce((acc, [, v]) => acc + v, 0) || 1;

    let position = 0;
    let lastScore: number | null = null;
    let rank = 0;

    const output: any[] = [];

    for (const [storeId, score] of sorted) {
      position++;

      if (lastScore === null || score !== lastScore) {
        rank = position;
      }

      const marketShare = score / totalWeight;

      await this.prisma.roundRanking.upsert({
        where: {
          sessionId_roundId_storeId: {
            sessionId,
            roundId,
            storeId,
          },
        },
        create: {
          sessionId,
          roundId,
          storeId,

          roundNumber: 0, // opcional (pode preencher depois se quiser)

          priceScore: 0,
          availabilityScore: 0,
          csatScore: 0,

          finalScore: score,
          position: rank,

          marketShare,
        },
        update: {
          finalScore: score,
          position: rank,
          marketShare,
        },
      });

      output.push({
        storeId,
        score,
        rank,
        marketShare,
      });

      lastScore = score;
    }

    return output;
  }
}