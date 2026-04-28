import { PrismaService } from '@/prisma.service';
import { Injectable } from '@nestjs/common';
import { UpdatePerformanceDto } from './dto/update-performance.dto';


@Injectable()
export class HumanResourcesService {
    constructor(private readonly prisma:PrismaService){}
    async calcularPerformance(dto: UpdatePerformanceDto) {


    // 1. REGRA DO PDF: Cálculo do CSAT
    // Fórmula: (Operadores / 10) * (% Acerto Quiz)
    const notaQuizDecimal = dto.quizScore / 100;
    const csatFinal = (dto.operatorsQty / 10) * notaQuizDecimal;
    // 2. REGRA DO PDF: SLA de Serviços (Dias de Parada)
    // Se >= 5: 0 dias | 4: 1 dia | 3: 2 dias | < 3: 5 dias
    let diasDeParada = 0;
    if (dto.serviceOperatorsQty >= 5) {
        diasDeParada = 0;
    } else if (dto.serviceOperatorsQty === 4) {
        diasDeParada = 1;
    } else if (dto.serviceOperatorsQty === 3) {
        diasDeParada = 2;
    } else {
        diasDeParada = 5;
    }
    // 3. Cálculo da Folha Salarial (Custos do Seed)
    // Operador: 1.200 | Técnico: 1.500 | Gerente: 3.000 (Fixo)
    const custoOperadores = dto.operatorsQty * 1200;
    const custoTecnicos = dto.serviceOperatorsQty * 1500;
    const totalFolha = custoOperadores + custoTecnicos + 3000;
    // 4. Atualiza a configuração da rodada
    await this.prisma.configuration.update({

        where: { id: dto.configId },
        data: {
        operatorsQty: dto.operatorsQty,
        serviceOperatorsQty: dto.serviceOperatorsQty,
        quizScore: dto.quizScore,
        finalCSAT: csatFinal,
        finalSLA: diasDeParada,
    },
    });
    return {
        csat: csatFinal.toFixed(2),
        diasDeParada,
        custoTotalFolha: totalFolha,
    };
    }
    
}

