import { PrismaClient } from '../src/generated/prisma/client'
import { PrismaPg } from '@prisma/adapter-pg'
import { Pool } from 'pg'

const pool = new Pool({ connectionString: process.env.DATABASE_URL })
const adapter = new PrismaPg(pool)

const prisma = new PrismaClient({ adapter })

async function main() {
console.log('🚀 Iniciando Seed de Dados Mestres...');
// 1. Limpar dados antigos (Cuidado: limpa tudo para não duplicar)
await prisma.stockInput.deleteMany();
await prisma.storeCapex.deleteMany();
await prisma.configuration.deleteMany();
await prisma.categoryMaster.deleteMany();
await prisma.capexMaster.deleteMany();
await prisma.store.deleteMany();
// 2. Popular Categorias (Dados do PDF)
const categories = await Promise.all([
prisma.categoryMaster.create({
data: { name: 'Perecíveis', unitCost: 20.0, taxRate: 0.12, agingPenaltyRate: 0.20, marketStock: 1000 }
}),
prisma.categoryMaster.create({
data: { name: 'Mercearia', unitCost: 30.0, taxRate: 0.07, agingPenaltyRate: 0.05, marketStock: 1500 }
}),
prisma.categoryMaster.create({
data: { name: 'Eletro', unitCost: 500.0, taxRate: 0.25, agingPenaltyRate: 0.03, marketStock: 200 }
}),
prisma.categoryMaster.create({
data: { name: 'Hipel', unitCost: 45.0, taxRate: 0.17, agingPenaltyRate: 0.05, marketStock: 800 }
}),
]);
// 3. Popular CAPEX (Investimentos e Licenças)
const capex = await Promise.all([
prisma.capexMaster.create({
data: { name: 'Segurança', description: 'Monitoramento e prevenção de perdas', cost: 15000.0, baseLicense: 500.0, upgradeImpact: 1.20 }
}),
prisma.capexMaster.create({
data: { name: 'Redes', description: 'Infraestrutura de TI e Wi-Fi', cost: 10000.0, baseLicense: 500.0, upgradeImpact: 1.15 }
}),
prisma.capexMaster.create({
data: { name: 'Site', description: 'Plataforma de E-commerce', cost: 20000.0, baseLicense: 500.0, upgradeImpact: 1.30 }
}),
]);
// 4. Criar as Lojas (A sua e as concorrentes)
await prisma.store.createMany({
data: [
{ name: 'Nossa Loja (Cencosud)' },
{ name: 'Concorrente A' },
{ name: 'Concorrente B' },
{ name: 'Concorrente C' },
],
});
console.log('✅ Seed finalizado com sucesso!');
}
main()
.catch((e) => {
console.error(e);
process.exit(1);
})
.finally(async () => {
await prisma.$disconnect();
});