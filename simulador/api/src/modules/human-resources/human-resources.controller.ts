import { Body, Controller, Patch } from '@nestjs/common';
import { HumanResourcesService } from './human-resources.service';
import { UpdatePerformanceDto } from './dto/update-performance.dto';

@Controller('human-resources')
export class HumanResourcesController {
  constructor(private readonly humanResourcesService: HumanResourcesService) {}
  @Patch('configurar')
  async configurar(@Body() dto:UpdatePerformanceDto){
    return this.humanResourcesService.calcularPerformance(dto)

  }
}
