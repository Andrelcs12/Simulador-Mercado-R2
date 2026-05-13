import {
  ConnectedSocket,
  MessageBody,
  SubscribeMessage,
} from "@nestjs/websockets";

import { Server } from "socket.io";
import { MinigameService } from "../minigame.service";

export class AdminGateway {
  constructor(private readonly minigameService: MinigameService) {}

  server: Server;

  // ======================================================
  // FORCE STOP ROUND
  // ======================================================

  @SubscribeMessage("admin:force_stop_round")
  async forceStopRound(
    @MessageBody()
    data: {
      sessionId: string;
    },
  ) {
    const result = await this.minigameService.finishRound(
      data.sessionId,
      "ADMIN_STOP",
    );

    this.server.to(data.sessionId).emit("round:stopped", result);
    this.server.to(data.sessionId).emit("round:finished", result);

    return result;
  }

  // ======================================================
  // NEXT ROUND
  // ======================================================

  @SubscribeMessage("admin:start_next_round")
  async startNextRound(
    @MessageBody()
    data: {
      sessionId: string;
    },
  ) {
    const result = await this.minigameService.startNextRound(
      data.sessionId,
    );

    this.server.to(data.sessionId).emit("round:next_started", result);

    return result;
  }

  // ======================================================
  // FINISH SESSION
  // ======================================================

  @SubscribeMessage("admin:finish_session")
  async finishSession(
    @MessageBody()
    data: {
      sessionId: string;
    },
  ) {
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

  // ======================================================
  // KICK PLAYER
  // ======================================================

  @SubscribeMessage("admin:kick_player")
  async kickPlayer(
    @MessageBody()
    data: {
      sessionId: string;
      playerId: string;
    },
  ) {
    const result = await this.minigameService.kickPlayer(
      data.sessionId,
      data.playerId,
    );

    this.server.to(data.sessionId).emit("player:kicked", result);

    const players = await this.minigameService.getPlayersBySession(
      data.sessionId,
    );

    this.server.to(data.sessionId).emit("session:players_updated", players);

    return result;
  }

  // ======================================================
  // SESSION STATE (ADMIN VIEW)
  // ======================================================

  @SubscribeMessage("session:get_state")
  async getState(
    @ConnectedSocket() client: any,
    @MessageBody()
    data: {
      sessionId: string;
    },
  ) {
    const session = await this.minigameService.getSessionById(
      data.sessionId,
    );

    client.emit("session:state", session);

    return session;
  }
}