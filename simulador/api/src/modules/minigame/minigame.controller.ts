import { Body, Controller, Get, Param, Post } from '@nestjs/common';
import { MinigameService } from './minigame.service';

@Controller('minigame')
export class MinigameController {
  constructor(private readonly service: MinigameService) {}

  @Post('create-session')
  createSession() {
    return this.service.createSession();
  }

  @Get('session/:id')
  getSession(@Param('id') id: string) {
    return this.service.getSessionById(id);
  }

  @Post('session/:id/start')
  start(
    @Param('id') id: string,
    @Body() body: { duration: number },
  ) {
    return this.service.startRound(id, body.duration);
  }

  @Post('session/:id/next')
  next(@Param('id') id: string) {
    return this.service.startNextRound(id);
  }

  @Post('register')
  register(@Body() body: any) {
    return this.service.registerPlayer(body);
  }

  @Get('players/:sessionId')
  players(@Param('sessionId') id: string) {
    return this.service.getPlayersBySession(id);
  }

  @Post('submit-config')
  submit(@Body() body: any) {
    return this.service.submitConfiguration(body);
  }

  // 🔥 NOVO: fechar rodada manualmente (admin/backend tools)
  @Post('session/:id/finish-round')
  finishRound(@Param('id') id: string) {
    return this.service.finishRound(id, 'MANUAL');
  }
}