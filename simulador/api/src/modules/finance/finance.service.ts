import { PrismaService } from '@/prisma.service';
import { Injectable } from '@nestjs/common';
import { CheckBudgetDto } from './dto/check-budget.dto';

@Injectable()
export class FinanceService {
    constructor(private prisma: PrismaService) {}

    async processarDadosIniciais(dto: CheckBudgetDto) {
        const LIMITE_CAIXA = 700_000;
        const TAXA_JUROS = 0.12;

        const gastoTotal = dto.totalEstoque + dto.totalCapex + dto.totalSalarios;

        let jurosAplicados = 0;
        if (gastoTotal > LIMITE_CAIXA) {
            const excesso = gastoTotal - LIMITE_CAIXA;
            jurosAplicados = excesso * TAXA_JUROS;
        }

        return this.prisma.configuration.upsert({
            where: { id: dto.configId },
            update: {
                totalSpent: gastoTotal,
                interestPaid: jurosAplicados,
            },
            create: {
                id: dto.configId,
                storeId: dto.storeId,
                roundNumber: dto.roundNumber,
                totalSpent: gastoTotal,
                interestPaid: jurosAplicados,
            }
        })
    }

    getJurosPagos(interestPaid: number) {
        return interestPaid;
    }
}
