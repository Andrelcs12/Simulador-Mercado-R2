import { Injectable } from "@nestjs/common";
import { Server, Socket } from "socket.io";
import { MinigameService } from "../minigame.service";

@Injectable()
export class AdminHandler {
  constructor(private readonly minigameService: MinigameService) {}

  // 1. ADICIONADO: Forçar parada da rodada atual
  async handleForceStopRound(server: Server, data: { sessionId: string }) {
    const result = await this.minigameService.finishRound(
      data.sessionId,
      "ADMIN_STOP",
    );

    server.to(data.sessionId).emit("round:stopped", result);
    server.to(data.sessionId).emit("round:finished", result);

    return result;
  }

  // 2. ADICIONADO: Iniciar a próxima rodada
  async handleStartNextRound(server: Server, data: { sessionId: string }) {
    const result = await this.minigameService.startNextRound(data.sessionId);

    server.to(data.sessionId).emit("round:next_started", result);

    return result;
  }

  // 3. MANTIDO: Finalizar a sessão completa
  async handleFinishSession(server: Server, data: { sessionId: string }) {
    await this.minigameService.finishRound(data.sessionId, "MANUAL");
    const session = await this.minigameService.finishSession(data.sessionId);

    server.to(data.sessionId).emit("session:finished", { 
      sessionId: data.sessionId, 
      status: "FINISHED", 
      session 
    });
    return session;
  }

  // 4. MANTIDO: Expulsar jogador da sessão
  async handleKickPlayer(server: Server, data: { sessionId: string; playerId: string }) {
    const result = await this.minigameService.kickPlayer(data.playerId);
    server.to(data.sessionId).emit("player:kicked", result);

    const players = await this.minigameService.getPlayersBySession(data.sessionId);
    server.to(data.sessionId).emit("session:players_updated", players);
    return result;
  }

  // 5. MANTIDO: Buscar estado atual da sessão para o Admin
  async handleGetState(client: Socket, data: { sessionId: string }) {
    const session = await this.minigameService.getSessionById(data.sessionId);
    client.emit("session:state", session);
    return session;
  }
}