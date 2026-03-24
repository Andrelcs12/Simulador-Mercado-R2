import { Module } from '@nestjs/common';
import { HumanResourcesService } from './human-resources.service';
import { HumanResourcesController } from './human-resources.controller';

@Module({
  controllers: [HumanResourcesController],
  providers: [HumanResourcesService],
})
export class HumanResourcesModule {}
