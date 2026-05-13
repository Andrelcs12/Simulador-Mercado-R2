import { PrismaService } from '@/prisma.service';
import { Injectable, NotFoundException } from '@nestjs/common';
import { Prisma } from '@/generated/prisma/client';
import { CheckBudgetDto } from './dto/check-budget.dto';

@Injectable()
export class FinanceService {
  constructor(private prisma: PrismaService) {}

  private getExecutor(tx?: Prisma.TransactionClient) {
    return tx ?? this.prisma;
  }

  async processarDadosIniciais(dto: CheckBudgetDto) {
    const LIMITE_CAIXA = 700000;
    const TAXA_JUROS = 0.12;

    const gastoTotal = dto.totalEstoque + dto.totalCapex + dto.totalSalarios;

    let jurosAplicados = 0;
    if (gastoTotal > LIMITE_CAIXA) {
      const excesso = gastoTotal - LIMITE_CAIXA;
      jurosAplicados = excesso * TAXA_JUROS;
    }

    return this.prisma.configuration.upsert({
      where: { storeId_roundId: { storeId: dto.storeId, roundId: dto.roundId } }, // Usando a Unique Composta do Schema
      update: {
        totalSpent: gastoTotal,
        interestPaid: jurosAplicados,
      },
      create: {
        id: dto.configId,
        storeId: dto.storeId,
        sessionId: dto.sessionId,
        roundId: dto.roundId,
        totalSpent: gastoTotal,
        interestPaid: jurosAplicados,
      },
    });
  }

  async getStoreBalance(storeId: string, tx?: Prisma.TransactionClient) {
    const prisma = this.getExecutor(tx);
    const store = await prisma.store.findUnique({
      where: { id: storeId },
    });

    if (!store) throw new NotFoundException('Loja não encontrada.');

    return store.cashBalance; // CORRIGIDO: Era initialCash
  }

  async registerTransaction(storeId: string, amount: number, tx?: Prisma.TransactionClient) {
    const prisma = this.getExecutor(tx);

    return prisma.store.update({
      where: { id: storeId },
      data: {
        cashBalance: { // CORRIGIDO: Era initialCash
          increment: amount,
        },
      },
    });
  }
}