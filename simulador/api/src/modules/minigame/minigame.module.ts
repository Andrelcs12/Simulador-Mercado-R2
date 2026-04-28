import { Module } from '@nestjs/common';
import { MinigameService } from './minigame.service';
import { MinigameController } from './minigame.controller';
import { MinigameGateway } from './minigame.gateway';
import { PrismaService } from '@/prisma.service';
import { FinanceModule } from '../finance/finance.module';
import { InventoryModule } from '../inventory/inventory.module';
import { PricingModule } from '../pricing/pricing.module';
import { CapexModule } from '../capex/capex.module';


@Module({
  imports: [FinanceModule, InventoryModule, PricingModule, CapexModule],
  controllers: [MinigameController],
  providers: [MinigameService, MinigameGateway, PrismaService], // Adicione o Gateway e o Prisma
})
export class MinigameModule {}
