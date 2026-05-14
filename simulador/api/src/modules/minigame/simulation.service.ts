import { Injectable } from "@nestjs/common";

@Injectable()
export class SimulationService {
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
    const totalRevenue = this.calcRevenue(input);
    const totalCMV = this.calcCMV(input);
    const totalTaxes = this.calcTaxes(input, totalRevenue);

    const capexCosts = this.calcCapex(input);
    const licensingCosts = this.calcLicensing(input);
    const operatingCosts = this.calcOperatingCosts(input);
    const agingCosts = this.calcAging(input);
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
      totalRevenue > 0 ? (ebitdaValue / totalRevenue) * 100 : 0;

    const finalCash = input.storeCash + totalRevenue - totalExpenses;

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

      remainingStockValue: this.calcRemainingStockValue(input),
      stockBreakLoss,

      csat: this.calcCSAT(input),
      sla: this.calcSLA(input),
    };
  }

  private calcCustomersReceived(input: any) {
    const base = input.totalMarketCustomers || 1000;
    return base * input.marketShare;
  }

  private calcRevenue(input: any) {
    let revenue = 0;

    for (const stock of input.stockInputs) {
      const category = input.categories.find(
        (c: any) => c.id === stock.categoryId,
      );
      if (!category) continue;

      const margin = stock.commercialMargin ?? 30;
      const price = category.unitCost * (1 + margin / 100);
      const sold = stock.buyQty * input.marketShare;

      revenue += price * sold;
    }

    return revenue;
  }

  private calcTaxes(input: any, revenue: number) {
    return input.stockInputs.reduce((acc, stock) => {
      const category = input.categories.find(
        (c: any) => c.id === stock.categoryId,
      );
      if (!category) return acc;

      return acc + revenue * (category.taxRate / 100);
    }, 0);
  }

  private calcCMV(input: any) {
    return input.stockInputs.reduce((acc, stock) => {
      const c = input.categories.find(
        (cat: any) => cat.id === stock.categoryId,
      );
      return acc + (c?.unitCost ?? 0) * stock.buyQty;
    }, 0);
  }

  private calcCapex(input: any) {
    return input.capexSelections.reduce((acc, s) => {
      const c = input.capex.find((x: any) => x.id === s.capexId);
      return acc + (c?.cost ?? 0);
    }, 0);
  }

  private calcLicensing(input: any) {
    return input.capexSelections.reduce((acc, s) => {
      const c = input.capex.find((x: any) => x.id === s.capexId);
      return acc + (c?.recurringLicenseCost ?? 0);
    }, 0);
  }

  private calcOperatingCosts(input: any) {
    return input.stockInputs.length * 2500 +
      input.capexSelections.length * 600;
  }

  private calcAging(input: any) {
    return input.stockInputs.reduce((acc, stock) => {
      const c = input.categories.find(
        (cat: any) => cat.id === stock.categoryId,
      );
      if (!c) return acc;

      return acc + stock.buyQty * 0.2 * c.unitCost * c.agingPenaltyRate;
    }, 0);
  }

  private calcRemainingStockValue(input: any) {
    return input.stockInputs.reduce((acc, stock) => {
      const c = input.categories.find(
        (cat: any) => cat.id === stock.categoryId,
      );
      return acc + (stock.buyQty * 0.2 * (c?.unitCost ?? 0));
    }, 0);
  }

  private calcStockBreakLoss(input: any) {
    return input.stockInputs.reduce((acc, stock) => {
      const c = input.categories.find(
        (cat: any) => cat.id === stock.categoryId,
      );
      return acc + stock.buyQty * 0.03 * (c?.unitCost ?? 0);
    }, 0);
  }

  private calcInterestCosts(
    cash: number,
    revenue: number,
    cmv: number,
    op: number,
    capex: number,
    lic: number,
    aging: number,
  ) {
    const projected =
      cash + revenue - cmv - op - capex - lic - aging;

    return projected >= 0 ? 0 : Math.abs(projected) * 0.08;
  }

  private calcCSAT(input: any) {
    return Math.min(70 + input.capexSelections.length * 2, 100);
  }

  private calcSLA(input: any) {
    return Math.min(75 + input.capexSelections.length * 1.5, 100);
  }
}