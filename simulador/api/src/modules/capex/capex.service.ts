import { PrismaService } from '@/prisma.service';
import { Injectable } from '@nestjs/common';
import { DemoDTO } from './dto/demo.dto';

@Injectable()
export class CapexService {

    constructor(private readonly prisma: PrismaService) {}

    async processarSimulacao(dto: DemoDTO) {


    }

   async TesteSimulacao(dto: DemoDTO) {
  // PERSISTÊNCIA NO BANCO
  return this.prisma.demoFinanceiro.create({
    data: {
      responsavel: dto.responsavel,
      descricao: dto.descricao,
      saldoAnterior: dto.saldoDisponivel, // Mapeando saldoDisponivel para o banco
      valorGasto: dto.valorGasto,
      saldoAtual: dto.saldoAtual,
      csatResult: dto.csat, // Mapeando csat para csatResult
    },
  });



    }



    async pegarDados() {
        return this.prisma.demoFinanceiro.findMany();
    }


    async deletarDados() {
        return this.prisma.demoFinanceiro.deleteMany(
        )
    }


    async DeletarUmUsuario( id: string) {
        const userExist = await this.prisma.demoFinanceiro.findUnique({
            where: {id}
        })

        if (!userExist) {
            throw new Error("Usuário não existe")
        }

        return await this.prisma.demoFinanceiro.delete({
            where: {id}
        })


    }



}
