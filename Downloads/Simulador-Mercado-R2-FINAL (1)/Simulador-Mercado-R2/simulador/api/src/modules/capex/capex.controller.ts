import { Controller } from '@nestjs/common';
import { CapexService } from './capex.service';

@Controller('capex')
export class CapexController {
  constructor(private readonly capexService: CapexService) {}
}
