import {
  Body,
  Controller,
  Get,
  Param,
  ParseUUIDPipe,
  Patch,
  Post,
} from '@nestjs/common';
import { CapexService } from './capex.service';
import { ApplyCapexFailureDto } from './dto/apply-capex-failure.dto';
import { UpdateCapexTriggersDto } from './dto/update-capex-triggers.dto';

@Controller('capex')
export class CapexController {
  constructor(private readonly capexService: CapexService) {}

  @Patch('gatilhos')
  async configurarGatilhos(@Body() dto: UpdateCapexTriggersDto) {
    return this.capexService.atualizarGatilhos(dto);
  }

  @Get('gatilhos/:configId')
  async buscarGatilhos(@Param('configId', ParseUUIDPipe) configId: string) {
    return this.capexService.buscarGatilhos(configId);
  }

  @Post('consequencias/falha')
  async aplicarConsequenciaFalha(@Body() dto: ApplyCapexFailureDto) {
    return this.capexService.aplicarConsequenciaFalha(dto);
  }
}
