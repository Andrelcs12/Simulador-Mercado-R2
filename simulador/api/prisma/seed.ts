import { PrismaClient } from "../src/generated/prisma/client";
import { PrismaPg } from "@prisma/adapter-pg";
import { Pool } from "pg";

const pool = new Pool({ connectionString: process.env.DATABASE_URL });
const adapter = new PrismaPg(pool);
const prisma = new PrismaClient({ adapter });

async function main() {
  console.log("🚀 Iniciando Seed...");

  // ===============================
  // CLEANUP (ordem correta FK)
  // ===============================
  await prisma.stockInput.deleteMany();
  await prisma.storeCapex.deleteMany();
  await prisma.configuration.deleteMany();
  await prisma.roundResult.deleteMany();
  await prisma.sessionResult.deleteMany();
  await prisma.roundRanking.deleteMany();

  await prisma.store.deleteMany();
  await prisma.player.deleteMany();
  await prisma.gameRound.deleteMany();
  await prisma.gameSession.deleteMany();

  await prisma.categoryMaster.deleteMany();
  await prisma.capexMaster.deleteMany();

  // ===============================
  // SESSION BASE
  // ===============================
  const session = await prisma.gameSession.create({
    data: {
      code: "SIM-001",
      totalRounds: 3,
      currentRound: 0,
      status: "LOBBY",
    },
  });

  // ===============================
  // CATEGORIES
  // ===============================
  await prisma.categoryMaster.createMany({
    data: [
      {
        name: "Perecíveis",
        unitCost: 20,
        taxRate: 0.12,
        agingPenaltyRate: 0.2,
        totalMarketStock: 1000,
      },
      {
        name: "Mercearia",
        unitCost: 30,
        taxRate: 0.07,
        agingPenaltyRate: 0.05,
        totalMarketStock: 1500,
      },
      {
        name: "Eletro",
        unitCost: 500,
        taxRate: 0.25,
        agingPenaltyRate: 0.03,
        totalMarketStock: 200,
      },
      {
        name: "Higiene",
        unitCost: 45,
        taxRate: 0.17,
        agingPenaltyRate: 0.05,
        totalMarketStock: 800,
      },
    ],
  });

  // ===============================
  // CAPEX
  // ===============================
  await prisma.capexMaster.createMany({
    data: [
      {
        name: "CAPEX Segurança",
        description: "Proteção contra ataques e downtime",
        cost: 500,
        recurringLicenseCost: 500,
        csatImpact: 0,
        slaImpact: 0,
        productivityImpact: 0,
      },
      {
        name: "CAPEX Balança/Freezer",
        description: "Equipamentos de perecíveis",
        cost: 400,
        recurringLicenseCost: 0,
        csatImpact: 2,
        slaImpact: 0,
        productivityImpact: 0,
      },
      {
        name: "CAPEX Redes",
        description: "Infraestrutura de rede",
        cost: 600,
        recurringLicenseCost: 0,
        csatImpact: 0,
        slaImpact: 3,
        productivityImpact: 0,
      },
      {
        name: "CAPEX Self Checkout",
        description: "Redução de filas",
        cost: 800,
        recurringLicenseCost: 80,
        csatImpact: 3,
        slaImpact: 0,
        productivityImpact: 0,
      },
      {
        name: "CAPEX Melhorias Site",
        description: "Plataforma digital",
        cost: 500,
        recurringLicenseCost: 500,
        csatImpact: 0,
        slaImpact: 0,
        productivityImpact: 2,
      },
      {
        name: "CAPEX Melhoria Contínua",
        description: "Automação e BI",
        cost: 300,
        recurringLicenseCost: 0,
        csatImpact: 2,
        slaImpact: 2,
        productivityImpact: 3,
      },
    ],
  });

  // ===============================
  // STORES
  // ===============================
  const storeNames = ["Loja Alpha", "Loja Beta", "Loja Gamma", "Loja Delta"];

  const stores: any[] = [];

  for (const name of storeNames) {
    const store = await prisma.store.create({
      data: {
        name,
        sessionId: session.id,
        cashBalance: 700000,
      },
    });

    stores.push(store);
  }

  // ===============================
  // PLAYERS (SEM EMAIL)
  // ===============================
  const roles = [
    "STORE_MANAGER",
    "SERVICE_MANAGER",
    "SUPPLY_MANAGER",
    "COMMERCIAL_MANAGER",
    "OPERATION_MANAGER",
  ] as const;

  for (const store of stores) {
    for (const role of roles) {
      await prisma.player.create({
        data: {
          name: `${role}-${store.name}`,
          role,
          sessionId: session.id,
          storeId: store.id,
        },
      });
    }
  }

  console.log("✅ Seed finalizado com sucesso!");
}

main()
  .catch(console.error)
  .finally(() => prisma.$disconnect());