import { Controller, Post, Get, Patch, Delete, Body, Param } from '@nestjs/common';
import { UserService } from './modelo-base.service';
import { CreateUserDto, UpdateUserDto } from './dto/user.dto';

/**
 * DOCUMENTAÇÃO RÁPIDA (Porta 4000):
 * POST   /usuarios     -> Criar (201)
 * GET    /usuarios     -> Listar todos (200)
 * GET    /usuarios/:id -> Buscar um (200/404)
 * PATCH  /usuarios/:id -> Atualizar (200)
 * DELETE /usuarios/:id -> Remover (200)
 */


@Controller('usuarios')
export class UserController {
  constructor(private readonly userService: UserService) {}

  @Post()
  criar(@Body() dto: CreateUserDto) {
    return this.userService.criar(dto);
  }

  @Get()
  listar() {
    return this.userService.listarTodos();
  }

  @Get(':id')
  buscarUm(@Param('id') id: string) {
    return this.userService.buscarPorId(id);
  }

  @Patch(':id') // PATCH é melhor que PUT para atualizações parciais
  atualizar(@Param('id') id: string, @Body() dto: UpdateUserDto) {
    return this.userService.atualizar(id, dto);
  }

  @Delete(':id')
  remover(@Param('id') id: string) {
    return this.userService.deletar(id);
  }


  /* 


  */
}