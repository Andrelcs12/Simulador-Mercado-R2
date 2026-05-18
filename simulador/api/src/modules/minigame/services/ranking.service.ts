import { Injectable } from "@nestjs/common";
import { PrismaService } from "@/prisma.service";
import { Prisma } from "@/generated/prisma/client";
import { SimulationRankingInput } from "../contracts/simulation-input";

@Injectable()
export class RankingService {
  constructor(private readonly prisma: PrismaService) {}

  // ======================================================
  // COMPUTE ROUND RANKING (PERSISTIDO)
  // ======================================================
  async computeRoundRanking(sessionId: string, roundId: string) {
    const results = await this.prisma.roundResult.findMany({
      where: { sessionId, roundId },
    });

    if (results.length === 0) return [];

    // ======================================================
    // RANK HELPER (1 = melhor, 4 = pior)
    // ======================================================
    const rank = (
      items: { storeId: string; value: number }[],
      higherIsBetter = true,
    ) => {
      const sorted = [...items].sort((a, b) =>
        higherIsBetter ? b.value - a.value : a.value - b.value,
      );

      const map = new Map<string, number>();

      sorted.forEach((item, index) => {
        map.set(item.storeId, Math.max(4 - index, 1));
      });

      return map;
    };

    // ======================================================
    // SCORES INDIVIDUAIS
    // ======================================================
    const priceRank = rank(
      results.map((r) => ({
        storeId: r.storeId,
        value: r.averagePrice ?? 0,
      })),
      false,
    );

    const availabilityRank = rank(
      results.map((r) => ({
        storeId: r.storeId,
        value: r.availabilityRate ?? 0,
      })),
      true,
    );

    const csatRank = rank(
      results.map((r) => ({
        storeId: r.storeId,
        value: r.csat ?? 0,
      })),
      true,
    );

    // ======================================================
    // FINAL SCORE
    // ======================================================
    const computed = results
      .map((r) => {
        const priceScore = priceRank.get(r.storeId) ?? 1;
        const availabilityScore = availabilityRank.get(r.storeId) ?? 1;
        const csatScore = csatRank.get(r.storeId) ?? 1;

        return {
          storeId: r.storeId,
          priceScore,
          availabilityScore,
          csatScore,
          finalScore: priceScore + availabilityScore + csatScore,
        };
      })
      .sort((a, b) => b.finalScore - a.finalScore);

    const totalScore =
      computed.reduce((acc, r) => acc + r.finalScore, 0) || 1;

    const output: any[] = [];

    // ======================================================
    // PERSISTÊNCIA (UPSERT IDEMPOTENTE)
    // ======================================================
    for (let i = 0; i < computed.length; i++) {
      const item = computed[i];

      const payload: Prisma.RoundRankingUncheckedCreateInput = {
        sessionId,
        roundId,
        storeId: item.storeId,

        // mantém compatibilidade caso você use depois
        roundNumber: 0,

        // market share relativo do ranking
        marketShare: item.finalScore / totalScore,

        priceScore: item.priceScore,
        availabilityScore: item.availabilityScore,
        csatScore: item.csatScore,

        finalScore: item.finalScore,
        position: i + 1,
      };

      await this.prisma.roundRanking.upsert({
        where: {
          sessionId_roundId_storeId: {
            sessionId,
            roundId,
            storeId: item.storeId,
          },
        },
        create: payload,
        update: payload,
      });

      output.push(payload);
    }

    return output;
  }

  // ======================================================
  // BUILD RANKING FROM METRICS (USADO NO ROUND SERVICE)
  // ======================================================
  buildRankingFromMetrics(input: SimulationRankingInput[]) {
    const rank = (
      items: { storeId: string; value: number }[],
      higherIsBetter = true,
    ) => {
      const sorted = [...items].sort((a, b) =>
        higherIsBetter ? b.value - a.value : a.value - b.value,
      );

      const map = new Map<string, number>();

      sorted.forEach((item, index) => {
        map.set(item.storeId, Math.max(4 - index, 1));
      });

      return map;
    };

    const priceRank = rank(
      input.map((r) => ({
        storeId: r.storeId,
        value: r.averagePrice,
      })),
      false,
    );

    const availabilityRank = rank(
      input.map((r) => ({
        storeId: r.storeId,
        value: r.availabilityRate,
      })),
      true,
    );

    const csatRank = rank(
      input.map((r) => ({
        storeId: r.storeId,
        value: r.csat,
      })),
      true,
    );

    return input.map((r) => {
      const priceScore = priceRank.get(r.storeId) ?? 1;
      const availabilityScore = availabilityRank.get(r.storeId) ?? 1;
      const csatScore = csatRank.get(r.storeId) ?? 1;

      return {
        storeId: r.storeId,
        priceScore,
        availabilityScore,
        csatScore,
        finalScore: priceScore + availabilityScore + csatScore,
      };
    });
  }
}