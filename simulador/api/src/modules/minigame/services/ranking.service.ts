import { Injectable } from "@nestjs/common";
import { PrismaService } from "@/prisma.service";
import { Prisma } from "@/generated/prisma/client";
import { SimulationRankingInput } from "../contracts/simulation-input";
import { SimulationService } from "../simulation.service";

@Injectable()
export class RankingService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly simulation: SimulationService,
  ) {}

  // ======================================================
  // COMPUTE ROUND RANKING (PERSISTIDO)
  // ======================================================
  async computeRoundRanking(sessionId: string, roundId: string) {
    const results = await this.prisma.roundResult.findMany({
      where: { sessionId, roundId },
    });

    if (results.length === 0) {
      return this.computeRoundRankingFromConfigurations(sessionId, roundId);
    }

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

  async computeRoundRankingFromConfigurations(
    sessionId: string,
    roundId: string,
  ) {
    const [categories, configs, round] = await Promise.all([
      this.prisma.categoryMaster.findMany(),
      this.prisma.configuration.findMany({
        where: { sessionId, roundId },
        include: {
          stockInputs: true,
          capexSelections: true,
          store: {
            include: {
              players: {
                select: {
                  id: true,
                  name: true,
                },
              },
            },
          },
        },
      }),
      this.prisma.gameRound.findUnique({
        where: { id: roundId },
        select: { roundNumber: true },
      }),
    ]);

    if (configs.length === 0) return [];

    const rankingInput = configs.map((config) => {
      const metrics = this.simulation.calculateBaseMetrics({
        categories,
        stockInputs: config.stockInputs,
        operatorsQty: config.operatorsQty,
        serviceOperatorsQty: config.serviceOperatorsQty,
        quizScore: config.quizScore,
      });

      return {
        storeId: config.storeId,
        averagePrice: metrics.averagePrice,
        availabilityRate: metrics.availabilityRate,
        csat: metrics.csat,
      };
    });

    const computed = this.buildRankingFromMetrics(rankingInput);
    const totalScore = Math.max(
      computed.reduce((acc, item) => acc + item.finalScore, 0),
      1,
    );

    const outputs: any[] = [];

    for (let i = 0; i < computed.length; i++) {
      const item = computed[i];
      const config = configs.find((c) => c.storeId === item.storeId);
      const player = config?.store?.players?.[0];

      const payload: Prisma.RoundRankingUncheckedCreateInput = {
        sessionId,
        roundId,
        storeId: item.storeId,
        roundNumber: round?.roundNumber ?? 0,
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

      outputs.push({
        roundId,
        playerId: player?.id ?? null,
        playerName: player?.name ?? config?.store.name ?? "",
        storeId: item.storeId,
        score: item.finalScore,
        priceScore: item.priceScore,
        availabilityScore: item.availabilityScore,
        csatScore: item.csatScore,
        position: i + 1,
      });
    }

    return outputs;
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