import { PrismaService } from '@/prisma.service';
import { Injectable, NotFoundException, ConflictException } from '@nestjs/common';
import { CreateUserDto, UpdateUserDto } from './dto/user.dto';

@Injectable()
export class UserService {
  constructor(private prisma: PrismaService) {}

  // CREATE com validação de e-mail único
  async criar(data: CreateUserDto) {
    const emailExists = await this.prisma.user.findUnique({ where: { email: data.email } });
    if (emailExists) throw new ConflictException('Este e-mail já está em uso!');

    return this.prisma.user.create({
        data: {
            name: data.name,
            email: data.email,
            password: data.password
        }
    });
  }

  // READ ALL
  async listarTodos() {
    return this.prisma.user.findMany();
  }

  // READ ONE com validação
  async buscarPorId(id: string) {
    const user = await this.prisma.user.findUnique({ where: { id } });
    if (!user) throw new NotFoundException('Usuário não encontrado!');
    return user;
  }

  // UPDATE com validação
  async atualizar(id: string, data: UpdateUserDto) {
    await this.buscarPorId(id); // Reutiliza a validação acima
    return this.prisma.user.update({
      where: { id },
      data,
    });
  }

  // DELETE
  async deletar(id: string) {
    await this.buscarPorId(id);
    return this.prisma.user.delete({ where: { id } });
  }
}