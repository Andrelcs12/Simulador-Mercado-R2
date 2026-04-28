
import { Injectable, BadRequestException, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../../prisma.service';
import { CreateStockInputDto } from './dto/create-stock-input.dto';

@Injectable()
export class InventoryService {
  constructor(private prisma: PrismaService) {}

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
} 

