import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '@/prisma.service';
import { Prisma } from '@/generated/prisma/client';

@Injectable()
export class CapexService {
  constructor(private prisma: PrismaService) {}

  private getExecutor(tx?: Prisma.TransactionClient) {
    return tx ?? this.prisma;
  }

  async getMasterCapex() {
    return this.prisma.capexMaster.findMany({
      orderBy: { name: 'asc' },
    });
  }

  async activateInvestments(
    configId: string,
    capexSelections: Array<{ capexId: string }>,
    tx?: Prisma.TransactionClient,
  ) {
    const prisma = this.getExecutor(tx);

    for (const item of capexSelections) {
      const capex = await prisma.capexMaster.findUnique({
        where: { id: item.capexId },
      });

      if (!capex) {
        throw new NotFoundException('Investimento de capex não encontrado.');
      }

      await prisma.storeCapex.create({
        data: {
          configId,
          capexId: item.capexId,
          isApproved: true,
        },
      });
    }

    return prisma.storeCapex.findMany({
      where: { configId },
      include: { capexMaster: true },
      orderBy: { capexId: 'asc' },
    });
  }
}
