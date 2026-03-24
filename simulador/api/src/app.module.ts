import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config'; // <-- Importe necessário
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { PrismaService } from './prisma.service';
import { ModeloBaseModule } from './modules/modelo-base/modelo-base.module';
import { InventoryModule } from './modules/inventory/inventory.module';
import { PricingModule } from './modules/pricing/pricing.module';
import { FinanceModule } from './modules/finance/finance.module';
import { CapexModule } from './modules/capex/capex.module';
import { HumanResourcesModule } from './modules/human-resources/human-resources.module';
import { EngineModule } from './modules/engine/engine.module';

@Module({
  imports: [
    // Configuração Global para ler o .env em todo o projeto
    ConfigModule.forRoot({ 
      isGlobal: true,
    }),
    ModeloBaseModule,
    InventoryModule,
    PricingModule,
    FinanceModule,
    CapexModule,
    HumanResourcesModule,
    EngineModule,
  ],
  controllers: [AppController],
  providers: [AppService, PrismaService],
})
export class AppModule {}