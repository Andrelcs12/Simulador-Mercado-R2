import { Injectable } from "@nestjs/common";

import { PrismaService } from "@/prisma.service";

@Injectable()
export class RankingService {
  constructor(
    private readonly prisma: PrismaService,
  ) {}

  async computeRoundRanking(
    sessionId: string,
    roundId: string,
  ) {
    const results =
      await this.prisma.roundResult.findMany({
        where: {
          sessionId,
          roundId,
        },
      });

    if (!results.length) {
      return [];
    }

    // =========================
    // HELPER
    // =========================

    const buildRankMap = (
      values: {
        storeId: string;
        value: number;
      }[],
      higherIsBetter = true,
    ) => {
      const sorted = [...values].sort((a, b) =>
        higherIsBetter
          ? b.value - a.value
          : a.value - b.value,
      );

      const map = new Map<string, number>();

      sorted.forEach((item, index) => {
        map.set(item.storeId, 4 - index);
      });

      return map;
    };

    // =========================
    // PRICE SCORE
    // MENOR PREÇO = MELHOR
    // =========================

    const priceScores =
      buildRankMap(
        results.map((r) => ({
          storeId: r.storeId,
          value: r.averagePrice || 0,
        })),
        false,
      );

    // =========================
    // AVAILABILITY SCORE
    // MAIOR = MELHOR
    // =========================

    const availabilityScores =
      buildRankMap(
        results.map((r) => ({
          storeId: r.storeId,
          value:
            r.availabilityRate || 0,
        })),
        true,
      );

    // =========================
    // CSAT SCORE
    // MAIOR = MELHOR
    // =========================

    const csatScores =
      buildRankMap(
        results.map((r) => ({
          storeId: r.storeId,
          value: r.csat || 0,
        })),
        true,
      );

    // =========================
    // FINAL SCORES
    // =========================

    const finalScores = results.map((r) => {
      const priceScore =
        priceScores.get(r.storeId) || 1;

      const availabilityScore =
        availabilityScores.get(
          r.storeId,
        ) || 1;

      const csatScore =
        csatScores.get(r.storeId) || 1;

      const finalScore =
        priceScore +
        availabilityScore +
        csatScore;

      return {
        storeId: r.storeId,

        priceScore,
        availabilityScore,
        csatScore,

        finalScore,
      };
    });

    // =========================
    // SORT FINAL
    // =========================

    const sorted = [...finalScores].sort(
      (a, b) =>
        b.finalScore - a.finalScore,
    );

    // =========================
    // MARKET SHARE
    // =========================

    const totalScore =
      sorted.reduce(
        (acc, item) =>
          acc + item.finalScore,
        0,
      ) || 1;

    const output = [];

    for (
      let i = 0;
      i < sorted.length;
      i++
    ) {
      const item = sorted[i];

      const marketShare =
        item.finalScore / totalScore;

      await this.prisma.roundRanking.upsert({
        where: {
          sessionId_roundId_storeId: {
            sessionId,
            roundId,
            storeId: item.storeId,
          },
        },

        create: {
          sessionId,
          roundId,

          storeId: item.storeId,

          roundNumber: 0,

          marketShare,

          priceScore:
            item.priceScore,

          availabilityScore:
            item.availabilityScore,

          csatScore:
            item.csatScore,

          finalScore:
            item.finalScore,

          position: i + 1,
        },

        update: {
          marketShare,

          priceScore:
            item.priceScore,

          availabilityScore:
            item.availabilityScore,

          csatScore:
            item.csatScore,

          finalScore:
            item.finalScore,

          position: i + 1,
        },
      });

      output.push({
        storeId: item.storeId,

        position: i + 1,

        marketShare,

        priceScore:
          item.priceScore,

        availabilityScore:
          item.availabilityScore,

        csatScore:
          item.csatScore,

        finalScore:
          item.finalScore,
      });
    }

    return output;
  }
}