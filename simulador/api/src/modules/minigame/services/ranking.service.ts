import { Injectable } from "@nestjs/common";
import { PrismaService } from "@/prisma.service";
import { Prisma } from "@/generated/prisma/client";

@Injectable()
export class RankingService {
  constructor(private readonly prisma: PrismaService) {}

  async computeRoundRanking(sessionId: string, roundId: string) {
    const results = await this.prisma.roundResult.findMany({
      where: { sessionId, roundId },
    });

    if (results.length === 0) return [];

    // =========================
    // RANK HELPER
    // =========================
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

    // =========================
    // SCORES
    // =========================
    const price = rank(
      results.map((r) => ({
        storeId: r.storeId,
        value: r.averagePrice,
      })),
      false,
    );

    const availability = rank(
      results.map((r) => ({
        storeId: r.storeId,
        value: r.availabilityRate,
      })),
      true,
    );

    const csat = rank(
      results.map((r) => ({
        storeId: r.storeId,
        value: r.csat,
      })),
      true,
    );

    // =========================
    // COMPUTE FINAL
    // =========================
    const computed = results
      .map((r) => {
        const priceScore = price.get(r.storeId) ?? 1;
        const availabilityScore = availability.get(r.storeId) ?? 1;
        const csatScore = csat.get(r.storeId) ?? 1;

        return {
          storeId: r.storeId,
          priceScore,
          availabilityScore,
          csatScore,
          finalScore: priceScore + availabilityScore + csatScore,
        };
      })
      .sort((a, b) => b.finalScore - a.finalScore);

    const total = computed.reduce((acc, r) => acc + r.finalScore, 0) || 1;

    const output = [];

    // =========================
    // PERSISTÊNCIA (TIPADA CORRETO)
    // =========================
    for (let i = 0; i < computed.length; i++) {
      const item = computed[i];

      const payload: Prisma.RoundRankingUncheckedCreateInput = {
        sessionId,
        roundId,
        storeId: item.storeId,

        roundNumber: 0, // se não usa ainda, mantém ou remove do schema

        marketShare: item.finalScore / total,

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

  buildRankingFromMetrics(
  input: {
    storeId: string;
    averagePrice: number;
    availabilityRate: number;
    csat: number;
  }[],
) {
  const rank = (items: any[], higherIsBetter = true) => {
    const sorted = [...items].sort((a, b) =>
      higherIsBetter ? b.value - a.value : a.value - b.value,
    );

    const map = new Map<string, number>();

    sorted.forEach((item, index) => {
      map.set(item.storeId, Math.max(4 - index, 1));
    });

    return map;
  };

  const price = rank(
    input.map((r) => ({
      storeId: r.storeId,
      value: r.averagePrice,
    })),
    false,
  );

  const availability = rank(
    input.map((r) => ({
      storeId: r.storeId,
      value: r.availabilityRate,
    })),
    true,
  );

  const csat = rank(
    input.map((r) => ({
      storeId: r.storeId,
      value: r.csat,
    })),
    true,
  );

  return input.map((r) => {
    const priceScore = price.get(r.storeId) ?? 1;
    const availabilityScore = availability.get(r.storeId) ?? 1;
    const csatScore = csat.get(r.storeId) ?? 1;

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