import { Module } from '@nestjs/common';
import { CapexService } from './capex.service';
import { CapexController } from './capex.controller';
import { PrismaService } from '@/prisma.service';

@Module({
  controllers: [CapexController],
  providers: [CapexService, PrismaService],
})
export class CapexModule {}
