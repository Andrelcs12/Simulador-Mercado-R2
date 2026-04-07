import { Module } from '@nestjs/common';
import { MinigameService } from './minigame.service';
import { MinigameController } from './minigame.controller';
import { MinigameGateway } from './minigame.gateway';
import { PrismaService } from '@/prisma.service';


@Module({
  controllers: [MinigameController],
  providers: [MinigameService, MinigameGateway, PrismaService], // Adicione o Gateway e o Prisma
})
export class MinigameModule {}