import {
  ConnectedSocket,
  MessageBody,
  SubscribeMessage,
} from "@nestjs/websockets";

import { Server, Socket } from "socket.io";
import { MinigameService } from "../minigame.service";

export class PlayerGateway {
  constructor(private readonly minigameService: MinigameService) {}

  // será injetado pelo gateway principal
  server: Server;

  // ======================================================
  // JOIN SESSION (PLAYER FLOW)
  // ======================================================

  @SubscribeMessage("join_session")
  async join(
    @ConnectedSocket() client: Socket,
    @MessageBody()
    data: {
      sessionId: string;
      playerId?: string;
      isAdmin?: boolean;
    },
  ) {
    client.join(data.sessionId);

    client.emit("server:time_sync", {
      serverTime: Date.now(),
    });

    if (data.isAdmin) {
      client.emit("session:joined", {
        sessionId: data.sessionId,
        role: "ADMIN",
      });
      return;
    }

    if (!data.playerId) {
      client.emit("join:error", {
        message: "PlayerId obrigatório",
      });
      return;
    }

    const player = await this.minigameService.getPlayerById(
      data.playerId,
    );

    await this.minigameService.updateSocketId(
      player.id,
      client.id,
    );

    client.emit("session:joined", {
      sessionId: data.sessionId,
      playerId: player.id,
      storeId: player.storeId,
    });

    this.server.to(data.sessionId).emit("player:joined", {
      id: player.id,
      name: player.name,
    });
  }

  @SubscribeMessage("player:submit_config")
async submitConfiguration(
  @ConnectedSocket() client: Socket,
  @MessageBody()
  data: {
    playerId: string;
    storeId: string;
    sessionId: string;
    roundId: string;

    stockInputs: {
      categoryId: string;
      buyQty: number;
      commercialMargin: number;
      expectedSellPrice: number;
    }[];

    capexSelections: {
      capexId: string;
    }[];
  },
) {
  try {
    const result =
      await this.minigameService.submitConfiguration(data);

    client.emit("submit:success", {
      success: true,
      configId: result.configId,
      roundId: data.roundId,
    });

    this.server.to(data.sessionId).emit("player:submitted", {
      playerId: data.playerId,
      roundId: data.roundId,
    });

    return result;
  } catch (error) {
    client.emit("submit:error", {
      success: false,
      message:
        error instanceof Error
          ? error.message
          : "Erro ao enviar configuração",
    });
  }
}
  // ======================================================
  // PLAYER READY
  // ======================================================

  @SubscribeMessage("player:ready")
  async ready(
    @MessageBody()
    data: {
      sessionId: string;
      playerId: string;
    },
  ) {
    const result = await this.minigameService.markPlayerReady(
      data.sessionId,
      data.playerId,
    );

    this.server.to(data.sessionId).emit("player:ready_update", result);

    const allReady = await this.minigameService.allPlayersReady(
      data.sessionId,
    );

    if (allReady) {
      this.server.to(data.sessionId).emit("all_players_ready", {
        sessionId: data.sessionId,
      });
    }

    return result;
  }

  // ======================================================
  // SESSION STATE
  // ======================================================

  @SubscribeMessage("session:get_state")
  async getState(
    @ConnectedSocket() client: Socket,
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