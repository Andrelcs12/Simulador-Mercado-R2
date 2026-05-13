import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config'; // <-- Importe necessário
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { PrismaService } from './prisma.service';
import { MinigameModule } from './modules/minigame/minigame.module';

@Module({
  imports: [
    // Configuração Global para ler o .env em todo o projeto
    ConfigModule.forRoot({ 
      isGlobal: true,
    }),
    MinigameModule,
  ],
  controllers: [AppController],
  providers: [AppService, PrismaService],
})
export class AppModule {} 