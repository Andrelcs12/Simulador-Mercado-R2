import { Controller, Post, Body } from '@nestjs/common';
import { FinanceService } from './finance.service';
import { CheckBudgetDto } from './dto/check-budget.dto';

@Controller('finance')
export class FinanceController {
  constructor(private readonly financeService: FinanceService) {}

  @Post('fechar-caixa')
  fecharCaixa(@Body() dto: CheckBudgetDto)  {
    return this.financeService.processarDadosIniciais(dto);
  }
}
