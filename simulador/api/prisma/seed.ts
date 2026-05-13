import { PrismaClient } from '../src/generated/prisma/client';
import { PrismaPg } from '@prisma/adapter-pg';
import { Pool } from 'pg';

const pool = new Pool({ connectionString: process.env.DATABASE_URL });
const adapter = new PrismaPg(pool);
const prisma = new PrismaClient({ adapter });

async function main() {
  console.log('🚀 Iniciando Seed...');

  // Limpeza na ordem correta para evitar erros de FK
  await prisma.stockInput.deleteMany();
  await prisma.storeCapex.deleteMany();
  await prisma.configuration.deleteMany();
  await prisma.categoryMaster.deleteMany();
  await prisma.capexMaster.deleteMany();
  await prisma.roundResult.deleteMany();
  await prisma.sessionResult.deleteMany();
  await prisma.store.deleteMany();
  await prisma.player.deleteMany();

  // 1. Criar Jogador para as lojas
  const adminPlayer = await prisma.player.create({
    data: {
      name: 'Sistema',
      email: 'admin@sistema.com',
      storeName: 'Nossa Loja (Cencosud)',
    },
  });

  // 2. Popular Categorias
  await prisma.categoryMaster.createMany({
    data: [
      { name: 'Perecíveis', unitCost: 20.0, taxRate: 0.12, agingPenaltyRate: 0.2, marketStock: 1000 },
      { name: 'Mercearia', unitCost: 30.0, taxRate: 0.07, agingPenaltyRate: 0.05, marketStock: 1500 },
      { name: 'Eletro', unitCost: 500.0, taxRate: 0.25, agingPenaltyRate: 0.03, marketStock: 200 },
      { name: 'Hipel', unitCost: 45.0, taxRate: 0.17, agingPenaltyRate: 0.05, marketStock: 800 },
    ],
  });

  // 3. Criar Lojas (Usando cashBalance em vez de initialCash)
  await prisma.store.create({
    data: { name: 'Nossa Loja (Cencosud)', cashBalance: 700000, playerId: adminPlayer.id },
  });

  console.log('✅ Seed finalizado!');
}

main().catch(console.error).finally(() => prisma.$disconnect());