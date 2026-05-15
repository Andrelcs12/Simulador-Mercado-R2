import { PrismaService } from "@/prisma.service";
import { Injectable } from "@nestjs/common";

@Injectable()
export class SimulationService {

   constructor(private readonly prisma: PrismaService) {}


  calculateRound(input: {
    categories: any[];
    capex: any[];

    stockInputs: any[];
    capexSelections: any[];

    storeCash: number;
    marketShare: number;

    operatorsQty: number;
    serviceOperatorsQty: number;

    quizScore: number;

    totalMarketCustomers: number;
  }) {
    const customersReceived =
      input.totalMarketCustomers *
      input.marketShare;

    const stockCount =
      input.stockInputs.length || 1;

    let totalRevenue = 0;
    let totalTaxes = 0;
    let totalCMV = 0;
    let agingCosts = 0;
    let remainingStockValue = 0;
    let averagePrice = 0;

    for (const stock of input.stockInputs) {
      const category =
        input.categories.find(
          (c: any) =>
            c.id === stock.categoryId,
        );

      if (!category) continue;

      const margin =
        stock.commercialMargin || 30;

      const sellPrice =
        category.unitCost *
        (1 + margin / 100);

      const demand =
        customersReceived / stockCount;

      const soldQty = Math.min(
        stock.buyQty,
        demand,
      );

      const remainingQty =
        stock.buyQty - soldQty;

      const revenue =
        soldQty * sellPrice;

      totalRevenue += revenue;

      totalTaxes +=
        revenue *
        (category.taxRate / 100);

      totalCMV +=
        stock.buyQty *
        category.unitCost;

      agingCosts +=
        remainingQty *
        category.unitCost *
        (category.agingPenaltyRate ||
          0);

      remainingStockValue +=
        remainingQty *
        category.unitCost;

      averagePrice += sellPrice;
    }

    averagePrice =
      averagePrice / stockCount;

    const capexCosts =
      input.capexSelections.reduce(
        (acc, selection) => {
          const capex =
            input.capex.find(
              (c: any) =>
                c.id ===
                selection.capexId,
            );

          return (
            acc + (capex?.cost || 0)
          );
        },
        0,
      );

    const licensingCosts =
      input.capexSelections.reduce(
        (acc, selection) => {
          const capex =
            input.capex.find(
              (c: any) =>
                c.id ===
                selection.capexId,
            );

          return (
            acc +
            (capex?.recurringLicenseCost ||
              0)
          );
        },
        0,
      );

    const operatingCosts =
      input.operatorsQty * 2200 +
      input.serviceOperatorsQty *
        3200;

    const stockBreakLoss =
      totalCMV * 0.03;

    const exceededCash =
      totalCMV +
      capexCosts +
      licensingCosts +
      operatingCosts -
      input.storeCash;

    const interestCosts =
      exceededCash > 0
        ? exceededCash * 0.12
        : 0;

    const totalExpenses =
      totalCMV +
      totalTaxes +
      capexCosts +
      licensingCosts +
      operatingCosts +
      agingCosts +
      stockBreakLoss +
      interestCosts;

    const ebitdaValue =
      totalRevenue - totalExpenses;

    const ebitdaMargin =
      totalRevenue > 0
        ? (ebitdaValue /
            totalRevenue) *
          100
        : 0;

    const operatorFactor =
      Math.min(
        input.operatorsQty / 10,
        1,
      );

    const csat =
      operatorFactor *
      input.quizScore;

    const sla =
      input.serviceOperatorsQty >= 8
        ? 95
        : input.serviceOperatorsQty >= 6
          ? 85
          : input.serviceOperatorsQty >= 4
            ? 75
            : input.serviceOperatorsQty >= 2
              ? 60
              : 40;

    const totalBought =
      input.stockInputs.reduce(
        (acc, stock) =>
          acc + stock.buyQty,
        0,
      );

    const totalMarketStock =
      input.categories.reduce(
        (acc, category) =>
          acc +
          (category.totalMarketStock ||
            0),
        0,
      );

    const availabilityRate =
      totalMarketStock > 0
        ? totalBought /
          totalMarketStock
        : 0;

    return {
      customersReceived,

      totalRevenue,
      totalTaxes,
      totalCMV,

      operatingCosts,
      capexCosts,
      licensingCosts,

      agingCosts,
      stockBreakLoss,
      interestCosts,

      totalExpenses,

      ebitdaValue,
      ebitdaMargin,

      finalCash:
        input.storeCash -
        totalCMV -
        capexCosts -
        licensingCosts -
        operatingCosts -
        interestCosts,

      remainingStockValue,

      csat,
      sla,

      averagePrice,
      availabilityRate,
    };
  }




  async finalizeSession(sessionId: string) {
  const rounds = await this.prisma.roundResult.findMany({
    where: { sessionId },
  });

  const stockHistory = await this.prisma.stockInput.findMany({
    where: {
      configuration: {
        sessionId,
      },
    },
    include: {
      category: true,
    },
  });

  const totalCustomers = rounds.reduce(
    (acc, r) => acc + r.customersReceived,
    0,
  );

  const agingLoss = this.calculateFinalAging({
    stockInputsHistory: stockHistory.map((s) => ({
      categoryId: s.categoryId,
      buyQty: s.buyQty,
      unitCost: s.category?.unitCost ?? 0,
    })),
    totalCustomersServed: totalCustomers,
  });

  await this.prisma.sessionResult.updateMany({
    where: { sessionId },
    data: {
      finalScore: {
        decrement: agingLoss,
      },
    },
  });

  return {
    sessionId,
    agingLoss,
    status: "FINALIZED",
  };
}

  private calculateFinalAging(input: {
    stockInputsHistory: {
      categoryId: string;
      buyQty: number;
      unitCost: number;
    }[];

    totalCustomersServed: number;
  }) {
    let totalLoss = 0;

    for (const stock of input.stockInputsHistory) {
      const estimatedSold = Math.min(
        stock.buyQty,
        input.totalCustomersServed,
      );

      const remaining = stock.buyQty - estimatedSold;

      if (remaining <= 0) continue;

      totalLoss += remaining * stock.unitCost * 0.2;
    }

    return totalLoss;
  }


}