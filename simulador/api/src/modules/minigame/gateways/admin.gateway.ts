import { Injectable } from "@nestjs/common";
import { Server } from "socket.io";
import { MinigameService } from "../minigame.service";

@Injectable()
export class AdminGateway {
  constructor(
    private readonly minigameService: MinigameService,
  ) {}

  server: Server;

  async forceStopRound(data: { sessionId: string }) {
    const result = await this.minigameService.finishRound(
      data.sessionId,
      "ADMIN_STOP",
    );

    this.server.to(data.sessionId).emit("round:stopped", result);
    this.server.to(data.sessionId).emit("round:finished", result);

    return result;
  }

  async startNextRound(data: { sessionId: string }) {
    const result = await this.minigameService.startNextRound(
      data.sessionId,
    );

    this.server.to(data.sessionId).emit(
      "round:next_started",
      result,
    );

    return result;
  }

  async finishSession(data: { sessionId: string }) {
    await this.minigameService.finishRound(
      data.sessionId,
      "MANUAL",
    );

    const session = await this.minigameService.finishSession(
      data.sessionId,
    );

    this.server.to(data.sessionId).emit("session:finished", {
      sessionId: data.sessionId,
      status: "FINISHED",
      session,
    });

    return session;
  }

  async kickPlayer(data: { sessionId: string; playerId: string }) {
    const result = await this.minigameService.kickPlayer(
      data.playerId, // ✅ CORREÇÃO: assinatura correta
    );

    this.server.to(data.sessionId).emit("player:kicked", result);

    const players = await this.minigameService.getPlayersBySession(
      data.sessionId,
    );

    this.server.to(data.sessionId).emit(
      "session:players_updated",
      players,
    );

    return result;
  }

  async getState(client: any, data: { sessionId: string }) {
    const session = await this.minigameService.getSessionById(
      data.sessionId,
    );

    client.emit("session:state", session);

    return session;
  }
}