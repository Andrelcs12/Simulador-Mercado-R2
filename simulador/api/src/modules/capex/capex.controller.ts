import { Body, Controller, Delete, Get, Param, Post } from '@nestjs/common';
import { CapexService } from './capex.service';
import { DemoDTO } from './dto/demo.dto';

@Controller('capex')
export class CapexController {
  constructor(private readonly capexService: CapexService) {}



  @Post('teste')
async testeController(@Body() dto: DemoDTO) {
  // CORREÇÃO: Adicionado () e o parâmetro dto
  return await this.capexService.TesteSimulacao(dto);
}

  @Get('pegar')
  async pegarDados() {
    return this.capexService.pegarDados();
  }

  @Delete("deletar")
  async deletarUsuario() {
    return this.capexService.deletarDados()
  }

  @Delete(":id")
  async DeletarUmUsuario(@Param('id') id: string) {
    return this.capexService.DeletarUmUsuario(id);
  }

}
