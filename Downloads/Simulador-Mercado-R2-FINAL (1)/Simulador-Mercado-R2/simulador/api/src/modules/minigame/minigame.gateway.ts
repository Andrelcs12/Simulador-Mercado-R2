import { 
  WebSocketGateway, 
  SubscribeMessage, 
  MessageBody, 
  WebSocketServer, 
  ConnectedSocket 
} from '@nestjs/websockets';
import { Server, Socket } from 'socket.io';
import { MinigameService } from './minigame.service';

@WebSocketGateway({ 
  cors: { origin: '*' }, 
  namespace: 'simulation' 
})
export class MinigameGateway {
  @WebSocketServer() server: Server;

  constructor(private minigameService: MinigameService) {}

  @SubscribeMessage('join_session')
  async handleJoinSession(
    @ConnectedSocket() client: Socket, 
    @MessageBody() data: { sessionId: string; playerId?: string; name: string; isAdmin?: boolean }
  ) {
    client.join(data.sessionId);
    
    if (data.playerId) {
      try {
        const player = await this.minigameService.getPlayerById(data.playerId); 
        await this.minigameService.updateSocketId(data.playerId, client.id);
        this.server.to(data.sessionId).emit('lobby:player_entered', player);
      } catch (e) {
        console.error("Erro ao processar join de player:", e.message);
      }
    }

    console.log(`${data.isAdmin ? 'MESTRE' : 'Player'} ${data.name} conectado à sala ${data.sessionId}`);
  }

  // ✅ CORRIGIDO: agora envia endTime (ISO string) em vez de startTime
  @SubscribeMessage('admin:start_round')
  handleStartRound(@MessageBody() data: { sessionId: string; duration: number; round: number }) {
    const endTime = new Date(Date.now() + data.duration * 1000).toISOString();

    this.server.to(data.sessionId).emit('round:started', {
      round: data.round,
      duration: data.duration,
      endTime, // ← o frontend usa isso para calcular o timer sincronizado
    });

    // Agenda o evento de tempo esgotado automaticamente
    setTimeout(() => {
      this.server.to(data.sessionId).emit('round:time_up', {
        message: 'O tempo da rodada esgotou.',
      });
    }, data.duration * 1000);

    console.log(`Rodada ${data.round} iniciada na sessão ${data.sessionId}. Termina em: ${endTime}`);
  }

  // ✅ NOVO: Player confirmou envio → notifica o admin
  @SubscribeMessage('player:submit_confirmation')
  handlePlayerSubmitConfirmation(
    @MessageBody() data: { sessionId: string; playerId: string; storeName: string }
  ) {
    // Emite para o admin que esse player enviou as decisões
    this.server.to(data.sessionId).emit('admin:player_submitted', {
      playerId: data.playerId,
      storeName: data.storeName,
    });

    console.log(`Player ${data.storeName} enviou decisões na sessão ${data.sessionId}`);
  }

  // ✅ NOVO: Admin força encerramento da rodada
  @SubscribeMessage('admin:force_stop_round')
  handleForceStopRound(@MessageBody() data: { sessionId: string }) {
    this.server.to(data.sessionId).emit('round:time_up', {
      message: 'Rodada encerrada pelo administrador.',
    });

    console.log(`Rodada encerrada manualmente na sessão ${data.sessionId}`);
  }

  // ✅ NOVO: Admin encerra a simulação → redireciona todos para ranking
  @SubscribeMessage('admin:finish_simulation')
  async handleFinishSimulation(@MessageBody() data: { sessionId: string }) {
    try {
      const rankData = await this.minigameService.getSessionResults(data.sessionId);
      this.server.to(data.sessionId).emit('simulation:finished', { rankData });
      console.log(`Simulação encerrada na sessão ${data.sessionId}`);
    } catch (e) {
      console.error('Erro ao encerrar simulação:', e.message);
      this.server.to(data.sessionId).emit('simulation:finished', { rankData: [] });
    }
  }

  @SubscribeMessage('player:ready')
  async handlePlayerReady(@MessageBody() data: { sessionId: string; playerId: string }) {
    await this.minigameService.setPlayerReady(data.playerId);
    this.server.to(data.sessionId).emit('lobby:player_ready', {
      playerId: data.playerId
    });
  }

  @SubscribeMessage('admin:update_config')
  handleUpdateConfig(
    @ConnectedSocket() client: Socket,
    @MessageBody() data: { sessionId: string; duration: number; round: number; adminName: string }
  ) {
    this.server.to(data.sessionId).emit('simulation:config_update', {
      duration: data.duration,
      round: data.round,
      adminName: data.adminName
    });
  }
}
