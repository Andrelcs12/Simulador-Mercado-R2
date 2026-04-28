import { Module } from '@nestjs/common';
import { CapexService } from './capex.service';
import { CapexController } from './capex.controller';

@Module({
  controllers: [CapexController],
  providers: [CapexService],
})
export class CapexModule {}
