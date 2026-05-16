

import { Injectable } from "@nestjs/common";

@Injectable()
export class SimulationService {
  calculateBaseMetrics(input: {
    categories: any[];
    stockInputs: any[];
    operatorsQty: number;
    serviceOperatorsQty: number;
    quizScore: number;
  }) {
    let totalBought = 0;
    let priceSum = 0;

    for (const stock of input.stockInputs) {
      const category = input.categories.find(
        (c) => c.id === stock.categoryId,
      );
      if (!category) continue;

      const sellPrice =
        category.unitCost * (1 + (stock.commercialMargin || 30) / 100);

      priceSum += sellPrice;
      totalBought += stock.buyQty;
    }

    const averagePrice =
      input.stockInputs.length > 0
        ? priceSum / input.stockInputs.length
        : 0;

    const csat =
      Math.min(input.operatorsQty / 10, 1) *
      (input.quizScore / 100);

    let sla = 40;
    if (input.serviceOperatorsQty >= 8) sla = 95;
    else if (input.serviceOperatorsQty >= 6) sla = 85;
    else if (input.serviceOperatorsQty >= 4) sla = 75;
    else if (input.serviceOperatorsQty >= 2) sla = 60;

    const totalMarketStock = input.categories.reduce(
      (acc, c) => acc + (c.totalMarketStock || 0),
      0,
    );

    const availabilityRate =
      totalMarketStock > 0 ? totalBought / totalMarketStock : 0;

    return {
      averagePrice,
      availabilityRate,
      csat,
      sla,
    };
  }

  calculateRoundResult(input: {
    categories: any[];
    capex: any[];
    stockInputs: any[];
    capexSelections: any[];
    storeCash: number;

    operatorsQty: number;
    serviceOperatorsQty: number;

    quizScore: number;

    totalMarketCustomers: number;

    // ✅ AGORA CORRETO: ranking externo entra como score
    competitivenessScore: number;
    competitorsTotalScore: number;

    averagePrice: number;
    availabilityRate: number;
    csat: number;
    sla: number;
  }) {
    const marketShare =
      input.competitorsTotalScore > 0
        ? input.competitivenessScore / input.competitorsTotalScore
        : 0;

    const demandBase = input.totalMarketCustomers * marketShare;

    const slaPenalty = (100 - input.sla) / 100;
    const effectiveDemand = demandBase * (1 - slaPenalty * 0.3);

    let totalRevenue = 0;
    let totalCMV = 0;
    let totalTaxes = 0;
    let agingCosts = 0;
    let remainingStockValue = 0;

    const stockCount = input.stockInputs.length || 1;

    for (const stock of input.stockInputs) {
      const category = input.categories.find(
        (c) => c.id === stock.categoryId,
      );
      if (!category) continue;

      const sellPrice =
        category.unitCost * (1 + (stock.commercialMargin || 30) / 100);

      const demandPerCategory = effectiveDemand / stockCount;

      const priceFactor = Math.max(0.5, 1 - sellPrice / 1000);

      const adjustedDemand = demandPerCategory * priceFactor;

      const soldQty = Math.min(stock.buyQty, adjustedDemand);

      const remainingQty = stock.buyQty - soldQty;

      const revenue = soldQty * sellPrice;

      totalRevenue += revenue;

      totalTaxes += revenue * (category.taxRate / 100);

      totalCMV += stock.buyQty * category.unitCost;

      agingCosts +=
        remainingQty *
        category.unitCost *
        (category.agingPenaltyRate || 0);

      remainingStockValue += remainingQty * category.unitCost;
    }

    const capexCosts = input.capexSelections.reduce((acc, sel) => {
      const capex = input.capex.find((c) => c.id === sel.capexId);
      return acc + (capex?.cost || 0);
    }, 0);

    const licensingCosts = input.capexSelections.reduce((acc, sel) => {
      const capex = input.capex.find((c) => c.id === sel.capexId);
      return acc + (capex?.recurringLicenseCost || 0);
    }, 0);

    const operatingCosts =
      input.operatorsQty * 2200 +
      input.serviceOperatorsQty * 3200;

    const stockBreakLoss = totalCMV * 0.03;

    const totalCashNeed =
      totalCMV + capexCosts + licensingCosts + operatingCosts;

    const exceeded = totalCashNeed - input.storeCash;

    const interestCosts = exceeded > 0 ? exceeded * 0.12 : 0;

    const totalExpenses =
      totalCMV +
      totalTaxes +
      capexCosts +
      licensingCosts +
      operatingCosts +
      agingCosts +
      stockBreakLoss +
      interestCosts;

    const ebitdaValue = totalRevenue - totalExpenses;

    const ebitdaMargin =
      totalRevenue > 0 ? (ebitdaValue / totalRevenue) * 100 : 0;

    return {
      marketShare,
      customersReceived: effectiveDemand,

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

      finalCash: input.storeCash - totalExpenses,

      remainingStockValue,

      csat: input.csat,
      sla: input.sla,
      averagePrice: input.averagePrice,
      availabilityRate: input.availabilityRate,
    };
  }
}