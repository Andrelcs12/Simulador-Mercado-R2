import { Body, Controller, Get, Param, Post } from '@nestjs/common';
import { MinigameService } from './minigame.service';

@Controller('minigame')
export class MinigameController {
  constructor(private readonly minigameService: MinigameService) {}

  @Post('create-session')
  async createSession() {
    return this.minigameService.createSession();
  }

  @Post('register')
  async register(@Body() body: { name: string; email: string; storeName: string; sessionCode: string }) {
    return this.minigameService.registerPlayer(body);
  }

  @Get('master-data')
  async getMasterData() {
    return this.minigameService.getMasterData();
  }

  @Post('session/:id/start')
  async startRound(@Param('id') sessionId: string, @Body() body: { duration: number }) {
    return this.minigameService.startRound(sessionId, body.duration);
  }

  @Post('session/:id/next')
  async nextRound(@Param('id') sessionId: string) {
    return this.minigameService.nextRound(sessionId);
  }

  @Get('session/:id')
  async getSession(@Param('id') id: string) {
    return this.minigameService.getSessionById(id);
  }

  @Get('players/:sessionId')
  async getPlayers(@Param('sessionId') sessionId: string) {
    return this.minigameService.getPlayersBySession(sessionId);
  }

  @Post('submit-config')
  async submitConfig(@Body() data: any) {
    return this.minigameService.submitConfiguration(data);
  }

  @Get('store-status/:playerId')
  async getStoreStatus(@Param('playerId') playerId: string) {
    return this.minigameService.getStoreStatus(playerId);
  }
}
