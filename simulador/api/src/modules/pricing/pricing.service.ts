import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../../prisma.service';
import { Prisma } from '@/generated/prisma/client';
import { UpdateMarginDto } from './dto/update-margin.dto';

@Injectable()
export class PricingService {
  
  constructor(private prisma: PrismaService) {}

  private getExecutor(tx?: Prisma.TransactionClient) {
    return tx ?? this.prisma;
  }

  async definirPrecoVenda(dto: UpdateMarginDto) {
    // 1. Busca o Input de Estoque + Dados da Categoria (Impostos)
    const stockInput = await this.prisma.stockInput.findUnique({
      where: { id: dto.stockInputId },
      include: { category: true },
    });

    if (!stockInput) {
      throw new NotFoundException('Registro de estoque não encontrado!');
    }

    // 2. Fórmula do Preço de Venda (Markup)
    const custo = stockInput.category.unitCost;
    const imposto = stockInput.category.taxRate;
    const margem = dto.appliedMargin / 100;

    const divisor = 1 - imposto - margem;

    if (divisor <= 0) {
      throw new Error('Margem muito alta! O preço de venda seria infinito.');
    }

    const precoVenda = custo / divisor;

    // 3. Atualiza o registro
    await this.prisma.stockInput.update({
      where: { id: dto.stockInputId },
      data: { appliedMargin: dto.appliedMargin },
    });

    return {
      categoria: stockInput.category.name,
      custoUnitario: custo,
      impostoAplicado: `${imposto * 100}%`,
      margemEscolhida: `${dto.appliedMargin}%`,
      precoSugerido: precoVenda.toFixed(2),
    };
  }

  calcularFaturamento(qtdVendida: number, precoVenda: number) {
    return qtdVendida * precoVenda;
  }

  async updateStoreMargins(
    configId: string,
    stockInputs: Array<{ categoryId: string; appliedMargin: number }>,
    tx?: Prisma.TransactionClient,
  ) {
    const prisma = this.getExecutor(tx);

    for (const item of stockInputs) {
      const stockInput = await prisma.stockInput.findFirst({
        where: {
          configId,
          categoryId: item.categoryId,
        },
        include: { category: true },
      });

      if (!stockInput) {
        throw new NotFoundException('Registro de estoque não encontrado para aplicar margem.');
      }

      const custo = stockInput.category.unitCost;
      const imposto = stockInput.category.taxRate;
      const margem = item.appliedMargin / 100;
      const divisor = 1 - imposto - margem;

      if (divisor <= 0) {
        throw new Error('Margem muito alta! O preço de venda seria infinito.');
      }

      await prisma.stockInput.update({
        where: { id: stockInput.id },
        data: { appliedMargin: item.appliedMargin },
      });
    }

    return prisma.stockInput.findMany({
      where: { configId },
      include: { category: true },
      orderBy: { categoryId: 'asc' },
    });
  }
}
