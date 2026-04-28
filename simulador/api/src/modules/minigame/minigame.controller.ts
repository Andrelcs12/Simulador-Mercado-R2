import { Controller, Post, Body, Get, Param, HttpCode, HttpStatus } from '@nestjs/common';
import { MinigameService } from './minigame.service';

@Controller('minigame')
export class MinigameController {
  constructor(private readonly minigameService: MinigameService) {}

  // Criar sessão (Admin)
  @Post('create-session')
  async createSession() {
    return this.minigameService.createSession();
  }

  // Registrar player
  @Post('register')
  async register(@Body() body: { name: string; email: string; storeName: string; sessionCode: string }) {
    return this.minigameService.registerPlayer(body);
  }

  // Buscar sessão com players
  @Get('session/:id')
  async getSession(@Param('id') id: string) {
    return this.minigameService.getSessionById(id);
  }

  // Buscar players de uma sessão
  @Get('players/:sessionId')
  async getPlayers(@Param('sessionId') sessionId: string) {
    return this.minigameService.getPlayersBySession(sessionId);
  }

  // ✅ Dados mestres: categorias + capex (alimenta o formulário do jogador)
  @Get('master-data')
  async getMasterData() {
    return this.minigameService.getMasterData();
  }

  // ✅ Status financeiro do jogador (saldo atual)
  @Get('store-status/:playerId')
  async getStoreStatus(@Param('playerId') playerId: string) {
    return this.minigameService.getStoreStatus(playerId);
  }

  // ✅ Submissão de decisões do jogador
  @Post('submit-config')
  @HttpCode(HttpStatus.CREATED)
  async submitConfig(
    @Body() body: {
      storeId: string;
      sessionId: string;
      roundNumber: number;
      stockInputs: { categoryId: string; buyQty: number; appliedMargin: number }[];
      capexSelections: { capexId: string }[];
    }
  ) {
    return this.minigameService.submitConfig(body);
  }

  // ✅ Ranking final da sessão
  @Get('results/:sessionId')
  async getResults(@Param('sessionId') sessionId: string) {
    return this.minigameService.getSessionResults(sessionId);
  }

  // ✅ Avança para a próxima rodada
  @Post('next-round')
  async nextRound(@Body() body: { sessionId: string }) {
    return this.minigameService.nextRound(body.sessionId);
  }
}
