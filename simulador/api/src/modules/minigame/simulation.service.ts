import { Injectable } from "@nestjs/common";
import { SimulationRoundInput } from "./contracts/simulation-input";

@Injectable()
export class SimulationService {

  // ======================================================
  // BASE METRICS
  // ======================================================
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

    const operatorFactor = Math.min(input.operatorsQty / 10, 1);
    const quizFactor = Math.min(Math.max(input.quizScore / 100, 0), 1);

    const csat = operatorFactor * quizFactor;

    let sla = 0.4;

    if (input.serviceOperatorsQty >= 8) sla = 0.95;
    else if (input.serviceOperatorsQty >= 6) sla = 0.85;
    else if (input.serviceOperatorsQty >= 4) sla = 0.75;
    else if (input.serviceOperatorsQty >= 2) sla = 0.6;

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

  // ======================================================
  // ROUND SIMULATION
  // ======================================================
  calculateRoundResult(input: SimulationRoundInput) {

    const competitiveness = input.competitivenessScore;
const totalCompetitiveness = input.competitorsTotalScore;

const marketShare =
  totalCompetitiveness > 0
    ? competitiveness / totalCompetitiveness
    : 0;

    const demandBase = input.totalMarketCustomers * marketShare;

    const serviceMultiplier =
      (0.5 * input.csat) + (0.5 * input.sla);

    const effectiveDemand = demandBase * serviceMultiplier;

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