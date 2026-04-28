import { Injectable, BadRequestException, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../../prisma.service';
import { Prisma } from '@/generated/prisma/client';
import { CreateStockInputDto } from './dto/create-stock-input.dto';

@Injectable()
export class InventoryService {
  constructor(private prisma: PrismaService) {}

  private getExecutor(tx?: Prisma.TransactionClient) {
    return tx ?? this.prisma;
  }

  async registrarCompra(dto: CreateStockInputDto) {
    const category = await this.prisma.categoryMaster.findUnique({
      where: { id: dto.categoryId },
    });

    if (!category) throw new NotFoundException('Categoria não encontrada!');

    if (dto.buyQty > category.marketStock) {
      throw new BadRequestException(`Ruptura de Estoque! Mercado possui apenas ${category.marketStock} unidades.`);
    }

    return this.prisma.stockInput.create({
      data: {
        configId: dto.configId,
        categoryId: dto.categoryId,
        buyQty: dto.buyQty,
        appliedMargin: 0,
      },
    });
  }

  async calcularPenalidadeAging(stockInputId: string, qtdNaoVendida: number) {
    const input = await this.prisma.stockInput.findUnique({
      where: { id: stockInputId },
      include: { category: true }
    });

    if (!input) throw new NotFoundException('Registro não encontrado!');

    return qtdNaoVendida * input.category.unitCost * input.category.agingPenaltyRate;
  }

  async addStockToStore(
    configId: string,
    stockInputs: Array<{ categoryId: string; buyQty: number; appliedMargin: number }>,
    tx?: Prisma.TransactionClient,
  ) {
    const prisma = this.getExecutor(tx);

    for (const item of stockInputs) {
      const category = await prisma.categoryMaster.findUnique({
        where: { id: item.categoryId },
      });

      if (!category) {
        throw new NotFoundException('Categoria não encontrada!');
      }

      if (item.buyQty > category.marketStock) {
        throw new BadRequestException(
          `Ruptura de Estoque! Mercado possui apenas ${category.marketStock} unidades.`,
        );
      }

      await prisma.stockInput.create({
        data: {
          configId,
          categoryId: item.categoryId,
          buyQty: item.buyQty,
          appliedMargin: 0,
        },
      });

      await prisma.categoryMaster.update({
        where: { id: item.categoryId },
        data: {
          marketStock: {
            decrement: item.buyQty,
          },
        },
      });
    }

    return prisma.stockInput.findMany({
      where: { configId },
      include: { category: true },
      orderBy: { categoryId: 'asc' },
    });
  }
} 

