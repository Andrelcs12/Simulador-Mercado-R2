import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config'; // <-- Importe necessário
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { PrismaService } from './prisma.service';
import { ModeloBaseModule } from './modules/modelo-base/modelo-base.module';

@Module({
  imports: [
    // Configuração Global para ler o .env em todo o projeto
    ConfigModule.forRoot({ 
      isGlobal: true,
    }),
    ModeloBaseModule,
  ],
  controllers: [AppController],
  providers: [AppService, PrismaService],
})
export class AppModule {}