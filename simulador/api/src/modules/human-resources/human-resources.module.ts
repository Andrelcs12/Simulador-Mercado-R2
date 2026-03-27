import { Module } from '@nestjs/common';
import { HumanResourcesService } from './human-resources.service';
import { HumanResourcesController } from './human-resources.controller';
import { PrismaService } from '@/prisma.service';

@Module({
  controllers: [HumanResourcesController],
  providers: [HumanResourcesService,PrismaService],
})
export class HumanResourcesModule {}
