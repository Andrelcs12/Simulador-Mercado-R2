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
      // Busca o player completo para enviar storeName, name, etc.
      const player = await this.minigameService.getPlayerById(data.playerId); 
      await this.minigameService.updateSocketId(data.playerId, client.id);
      
      // Notifica todos na sala que o objeto player completo entrou
      this.server.to(data.sessionId).emit('lobby:player_entered', player);
    } catch (e) {
      console.error("Erro ao processar join de player:", e.message);
    }
  }

  console.log(`${data.isAdmin ? 'MESTRE' : 'Player'} ${data.name} conectado à sala ${data.sessionId}`);
}


  @SubscribeMessage('admin:start_round')
  handleStartRound(@MessageBody() data: { sessionId: string; duration: number; round: number }) {
    // Dispara o evento de início apenas para os jogadores daquela sessão
    this.server.to(data.sessionId).emit('round:started', {
      duration: data.duration,
      round: data.round,
      startTime: new Date()
    });
  }

  @SubscribeMessage('player:ready') // Nome que vem do seu botão no Frontend
async handlePlayerReady(@MessageBody() data: { sessionId: string; playerId: string }) {
  await this.minigameService.setPlayerReady(data.playerId);
  
  // Notifica a sala que o player X está pronto
  this.server.to(data.sessionId).emit('lobby:player_ready', {
    playerId: data.playerId
  });
}   

    // Adicione este SubscribeMessage dentro do MinigameGateway
@SubscribeMessage('admin:update_config')
handleUpdateConfig(
  @ConnectedSocket() client: Socket,
  @MessageBody() data: { sessionId: string; duration: number; round: number; adminName: string }
) {
  // O servidor envia para TODOS na sala (incluindo players) o novo estado da config
  this.server.to(data.sessionId).emit('simulation:config_update', {
    duration: data.duration,
    round: data.round,
    adminName: data.adminName
  });

  console.log(`Configuração da sessão ${data.sessionId} atualizada pelo mestre.`);
}


  
}