import {
  ConnectedSocket,
  MessageBody,
  SubscribeMessage,
  WebSocketGateway,
  WebSocketServer,
} from '@nestjs/websockets';
import { Server, Socket } from 'socket.io';
import { MinigameService } from './minigame.service';

@WebSocketGateway({
  cors: { origin: '*' },
  namespace: 'simulation',
})
export class MinigameGateway {
  @WebSocketServer() server: Server;
  private readonly timeoutHandles = new Map<string, NodeJS.Timeout>();

  constructor(private minigameService: MinigameService) {}

  private clearRoundTimeout(sessionId: string) {
    const handle = this.timeoutHandles.get(sessionId);
    if (handle) {
      clearTimeout(handle);
      this.timeoutHandles.delete(sessionId);
    }
  }

  @SubscribeMessage('join_room')
  @SubscribeMessage('join_session')
  async handleJoinSession(
    @ConnectedSocket() client: Socket,
    @MessageBody() data: { sessionId: string; playerId?: string; name: string; isAdmin?: boolean },
  ) {
    client.join(data.sessionId);

    if (data.playerId) {
      try {
        const player = await this.minigameService.getPlayerById(data.playerId);
        await this.minigameService.ensureStoreExists(player.id, player.storeName);
        await this.minigameService.updateSocketId(data.playerId, client.id);
        this.server.to(data.sessionId).emit('lobby:player_entered', player);
      } catch (e) {
        console.error('Erro ao processar join de player:', e.message);
      }
    }

    console.log(`${data.isAdmin ? 'MESTRE' : 'Player'} ${data.name} conectado à sala ${data.sessionId}`);
  }

  @SubscribeMessage('admin:trigger_round')
  @SubscribeMessage('admin:start_round')
  async handleStartRound(@MessageBody() data: { sessionId: string; duration: number }) {
    const roundData = await this.minigameService.startRound(data.sessionId, data.duration);
    this.clearRoundTimeout(data.sessionId);

    const timeoutMs = Math.max(roundData.endTime.getTime() - Date.now(), 0);
    const timeout = setTimeout(() => {
      this.server.to(data.sessionId).emit('round:time_up', {
        message: 'O tempo acabou! As submissões foram bloqueadas.',
      });
      this.timeoutHandles.delete(data.sessionId);
    }, timeoutMs);

    this.timeoutHandles.set(data.sessionId, timeout);

    this.server.to(data.sessionId).emit('round:started', {
      roundNumber: roundData.roundNumber,
      duration: roundData.duration,
      endTime: roundData.endTime,
    });
  }

  @SubscribeMessage('player:ready')
  async handlePlayerReady(@MessageBody() data: { sessionId: string; playerId: string }) {
    await this.minigameService.setPlayerReady(data.playerId);

    this.server.to(data.sessionId).emit('lobby:player_ready', {
      playerId: data.playerId,
    });
  }

  @SubscribeMessage('player:submit_config')
  async handlePlayerSubmit(@ConnectedSocket() client: Socket, @MessageBody() data: any) {
    try {
      const result = await this.minigameService.submitConfiguration(data);

      client.emit('player:submit_success', {
        message: 'Decisões salvas com sucesso!',
        payload: result,
      });

      this.server.to(data.sessionId).emit('admin:player_submitted', {
        playerId: data.playerId,
        storeName: result?.store?.name ?? data.storeName,
        timestamp: new Date(),
      });
    } catch (error) {
      client.emit('player:submit_error', {
        message: error.message,
      });
    }
  }

  @SubscribeMessage('player:submit_confirmation')
  handlePlayerSubmitConfirmation(
    @MessageBody() data: { sessionId: string; playerId: string; storeName: string },
  ) {
    this.server.to(data.sessionId).emit('admin:player_submitted', {
      playerId: data.playerId,
      storeName: data.storeName,
      timestamp: new Date(),
    });
  }

  @SubscribeMessage('admin:finish_session')
  async handleFinishSession(@MessageBody() data: { sessionId: string }) {
    this.clearRoundTimeout(data.sessionId);
    await this.minigameService.finishSession(data.sessionId);

    this.server.to(data.sessionId).emit('simulation:finished', {
      message: 'Simulação encerrada! Verifiquem os resultados finais.',
      finishedAt: new Date(),
    });
  }

  @SubscribeMessage('admin:force_stop_round')
  handleForceStop(@MessageBody() data: { sessionId: string }) {
    this.clearRoundTimeout(data.sessionId);
    this.server.to(data.sessionId).emit('round:time_up', {
      message: 'O tempo acabou! As submissões foram bloqueadas.',
    });
    console.log(`Rodada interrompida na sessão ${data.sessionId}`);
  }

  @SubscribeMessage('admin:update_config')
  handleUpdateConfig(
    @ConnectedSocket() client: Socket,
    @MessageBody() data: { sessionId: string; duration: number; round: number; adminName: string },
  ) {
    this.server.to(data.sessionId).emit('simulation:config_update', {
      duration: data.duration,
      round: data.round,
      adminName: data.adminName,
    });

    console.log(`Configuração da sessão ${data.sessionId} atualizada pelo mestre.`);
  }
}
