import { Controller, Post, Body, Get, Param } from '@nestjs/common';
import { MinigameService } from './minigame.service';

@Controller('minigame')
export class MinigameController {
  constructor(private readonly minigameService: MinigameService) {}

  // Endpoint para o Admin criar a sala e gerar o CODE
  @Post('create-session')
  async createSession() {
    return this.minigameService.createSession();
  }

  // Endpoint para o Player se registrar usando o CODE da sala
  @Post('register')
  async register(@Body() body: { name: string; email: string; storeName: string; sessionCode: string }) {
    return this.minigameService.registerPlayer(body);
  }

  @Get('session/:id')
async getSession(@Param('id') id: string) {
  return this.minigameService.getSessionById(id);
}

  // Endpoint para buscar todos os jogadores de uma sessão específica (Lobby)
  @Get('players/:sessionId')
  async getPlayers(@Param('sessionId') sessionId: string) {
    return this.minigameService.getPlayersBySession(sessionId);
  }

  // fPróxmas funções
  // 1. Começar rodada
  // 2. Buscar Se a rodada já começou
  // 3. Função de tempo ercerrado da rodada
  
}