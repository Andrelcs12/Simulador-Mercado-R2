import { Injectable } from '@nestjs/common';

@Injectable()
export class SimulationService {
  calculateRound(input: {
    categories: any[];
    capex: any[];
    stockInputs: any[];
    capexSelections: any[];
    storeCash: number;
    marketShare: number;
  }) {
    const totalRevenue = this.calcRevenue(input);

    const totalCMV = this.calcCMV(input);

    const totalTaxes = this.calcTaxes(input, totalRevenue);

    const capexCosts = this.calcCapex(input);

    const licensingCosts = this.calcLicensing(input);

    const operatingCosts = this.calcOperatingCosts(input);

    const agingCosts = this.calcAging(input);

    const remainingStockValue = this.calcRemainingStockValue(input);

    const stockBreakLoss = this.calcStockBreakLoss(input);

    const interestCosts = this.calcInterestCosts(
      input.storeCash,
      totalRevenue,
      totalCMV,
      operatingCosts,
      capexCosts,
      licensingCosts,
      agingCosts,
    );

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
      totalRevenue > 0
        ? (ebitdaValue / totalRevenue) * 100
        : 0;

    const finalCash =
      input.storeCash + totalRevenue - totalExpenses;

    return {
      customersReceived: this.calcCustomersReceived(input),

      totalRevenue,
      totalTaxes,
      totalCMV,

      operatingCosts,
      capexCosts,
      licensingCosts,
      agingCosts,
      interestCosts,

      totalExpenses,

      ebitdaValue,
      ebitdaMargin,

      finalCash,

      remainingStockValue,

      stockBreakLoss,

      csat: this.calcCSAT(input),
      sla: this.calcSLA(input),
    };
  }

  // =========================
  // CUSTOMERS
  // =========================

  private calcCustomersReceived(input: any) {
    const baseCustomers = 1000;

    return baseCustomers * (input.marketShare || 1);
  }

  // =========================
  // REVENUE
  // =========================

  private calcRevenue(input: any) {
    let revenue = 0;

    for (const stock of input.stockInputs) {
      const category = input.categories.find(
        (c: any) => c.id === stock.categoryId,
      );

      if (!category) continue;

      const margin =
        stock.commercialMargin ?? 30;

      const sellPrice =
        category.unitCost * (1 + margin / 100);

      const soldQty =
        stock.buyQty * (input.marketShare || 1);

      revenue += sellPrice * soldQty;
    }

    return revenue;
  }

  // =========================
  // TAXES
  // =========================

  private calcTaxes(input: any, revenue: number) {
    let taxes = 0;

    for (const stock of input.stockInputs) {
      const category = input.categories.find(
        (c: any) => c.id === stock.categoryId,
      );

      if (!category) continue;

      taxes +=
        (revenue / input.stockInputs.length) *
        (category.taxRate / 100);
    }

    return taxes;
  }

  // =========================
  // CMV
  // =========================

  private calcCMV(input: any) {
    let cmv = 0;

    for (const stock of input.stockInputs) {
      const category = input.categories.find(
        (c: any) => c.id === stock.categoryId,
      );

      if (!category) continue;

      cmv += category.unitCost * stock.buyQty;
    }

    return cmv;
  }

  // =========================
  // CAPEX
  // =========================

  private calcCapex(input: any) {
    let total = 0;

    for (const selection of input.capexSelections) {
      const capex = input.capex.find(
        (c: any) => c.id === selection.capexId,
      );

      if (!capex) continue;

      total += capex.cost;
    }

    return total;
  }

  // =========================
  // LICENSING
  // =========================

  private calcLicensing(input: any) {
    let total = 0;

    for (const selection of input.capexSelections) {
      const capex = input.capex.find(
        (c: any) => c.id === selection.capexId,
      );

      if (!capex) continue;

      total += capex.recurringLicenseCost || 0;
    }

    return total;
  }

  // =========================
  // OPERATING COSTS
  // =========================

  private calcOperatingCosts(input: any) {
    const stockOps =
      input.stockInputs.length * 2500;

    const capexOps =
      input.capexSelections.length * 600;

    return stockOps + capexOps;
  }

  // =========================
  // AGING COSTS
  // =========================

  private calcAging(input: any) {
    let aging = 0;

    for (const stock of input.stockInputs) {
      const category = input.categories.find(
        (c: any) => c.id === stock.categoryId,
      );

      if (!category) continue;

      const unsoldQty =
        stock.buyQty * 0.2;

      aging +=
        unsoldQty *
        category.unitCost *
        category.agingPenaltyRate;
    }

    return aging;
  }

  // =========================
  // REMAINING STOCK
  // =========================

  private calcRemainingStockValue(input: any) {
    let total = 0;

    for (const stock of input.stockInputs) {
      const category = input.categories.find(
        (c: any) => c.id === stock.categoryId,
      );

      if (!category) continue;

      const remainingQty =
        stock.buyQty * 0.2;

      total += remainingQty * category.unitCost;
    }

    return total;
  }

  // =========================
  // STOCK BREAK LOSS
  // =========================

  private calcStockBreakLoss(input: any) {
    let total = 0;

    for (const stock of input.stockInputs) {
      const category = input.categories.find(
        (c: any) => c.id === stock.categoryId,
      );

      if (!category) continue;

      const breakQty =
        stock.buyQty * 0.03;

      total += breakQty * category.unitCost;
    }

    return total;
  }

  // =========================
  // INTEREST
  // =========================

  private calcInterestCosts(
    initialCash: number,
    revenue: number,
    cmv: number,
    operatingCosts: number,
    capexCosts: number,
    licensingCosts: number,
    agingCosts: number,
  ) {
    const projectedCash =
      initialCash +
      revenue -
      cmv -
      operatingCosts -
      capexCosts -
      licensingCosts -
      agingCosts;

    if (projectedCash >= 0) {
      return 0;
    }

    return Math.abs(projectedCash) * 0.08;
  }

  // =========================
  // CSAT
  // =========================

  private calcCSAT(input: any) {
    let score = 70;

    score += input.capexSelections.length * 2;

    return Math.min(score, 100);
  }

  // =========================
  // SLA
  // =========================

  private calcSLA(input: any) {
    let score = 75;

    score += input.capexSelections.length * 1.5;

    return Math.min(score, 100);
  }
}