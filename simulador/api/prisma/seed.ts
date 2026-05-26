import "dotenv/config";
import { PrismaClient } from "../src/generated/prisma/client";
import { PrismaPg } from "@prisma/adapter-pg";
import { Pool } from "pg";

const pool = new Pool({ connectionString: process.env.DATABASE_URL });
const adapter = new PrismaPg(pool);
const prisma = new PrismaClient({ adapter });

async function main() {
  console.log("🚀 Iniciando Seed...");

  // ===============================
  // CLEANUP (Ordem baseada nas Foreign Keys)
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
      { name: "Perecíveis", unitCost: 20, taxRate: 0.12, agingPenaltyRate: 0.2, totalMarketStock: 1000 },
      { name: "Mercearia", unitCost: 30, taxRate: 0.07, agingPenaltyRate: 0.05, totalMarketStock: 1500 },
      { name: "Eletro", unitCost: 500, taxRate: 0.25, agingPenaltyRate: 0.03, totalMarketStock: 200 },
      { name: "Higiene", unitCost: 45, taxRate: 0.17, agingPenaltyRate: 0.05, totalMarketStock: 800 },
    ],
  });

  // ===============================
  // CAPEX (Padronizados)
  // Slug deve ser usado pelo Frontend como referência única
  // ===============================
  await prisma.capexMaster.createMany({
    data: [
      { slug: "seguranca", name: "CAPEX Segurança", description: "Monitoramento de ataques cibernéticos", cost: 50000, recurringLicenseCost: 600, csatImpact: 0, slaImpact: 0, productivityImpact: 0 },
      { slug: "freezer", name: "CAPEX Balança/Freezer", description: "Troca de equipamentos desgastados", cost: 40000, recurringLicenseCost: 0, csatImpact: 2, slaImpact: 0, productivityImpact: 0 },
      { slug: "redes", name: "CAPEX Redes", description: "Migração de infraestrutura de redes", cost: 60000, recurringLicenseCost: 0, csatImpact: 0, slaImpact: 3, productivityImpact: 0 },
      { slug: "self-checkout", name: "CAPEX Self Checkout", description: "Aquisição de 4 self checkouts", cost: 80000, recurringLicenseCost: 80, csatImpact: 3, slaImpact: 0, productivityImpact: 0 },
      { slug: "site", name: "CAPEX Melhorias Site", description: "Migração da plataforma digital", cost: 50000, recurringLicenseCost: 650, csatImpact: 0, slaImpact: 0, productivityImpact: 2 },
      { slug: "bi", name: "CAPEX Melhoria Contínua", description: "Automação de processos e relatórios", cost: 30000, recurringLicenseCost: 0, csatImpact: 2, slaImpact: 2, productivityImpact: 3 },
    ],
  });

  // ===============================
  // STORES
  // ===============================
  const storeNames = ["Loja Alpha", "Loja Beta", "Loja Gamma", "Loja Delta"];
  for (const name of storeNames) {
    const store = await prisma.store.create({
      data: { name, sessionId: session.id, cashBalance: 700000 },
    });

    // ===============================
    // PLAYERS (Vínculo direto com a Loja)
    // ===============================
    const roles = ["STORE_MANAGER", "SERVICE_MANAGER", "SUPPLY_MANAGER", "COMMERCIAL_MANAGER", "OPERATION_MANAGER"];
    for (const role of roles) {
      await prisma.player.create({
        data: { 
          name: `${role.split('_')[0]}-${name}`, 
          role: role as any, 
          sessionId: session.id, 
          storeId: store.id 
        },
      });
    }
  }

  console.log("✅ Seed finalizado com sucesso!");
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(() => prisma.$disconnect());