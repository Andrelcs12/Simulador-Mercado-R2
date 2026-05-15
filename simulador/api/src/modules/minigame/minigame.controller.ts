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

  @Post("session/:id/finalize")
finalizeSession(@Param("id") sessionId: string) {
  return this.service.finalizeSession(sessionId);
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

  @Get("session/:id/dashboard/:roundId")
getDashboard(
  @Param("id") id: string,
  @Param("roundId") roundId: string,
) {
  return this.service.getDashboard(id, roundId);
}

  // 🔥 NOVO: fechar rodada manualmente (admin/backend tools)
  @Post('session/:id/finish-round')
  finishRound(@Param('id') id: string) {
    return this.service.finishRound(id, 'MANUAL');
  }

  
  
}