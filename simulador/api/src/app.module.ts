import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config'; // <-- Importe necessário
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { CapexModule } from './modules/capex/capex.module';
import { PrismaService } from './prisma.service';
import { AuthModule } from './modules/auth/auth.module';

@Module({
  imports: [
    // Configuração Global para ler o .env em todo o projeto
    ConfigModule.forRoot({ 
      isGlobal: true,
    }),
    CapexModule,
    AuthModule,
  ],
  controllers: [AppController],
  providers: [AppService, PrismaService],
})
export class AppModule {}