import { Injectable } from "@nestjs/common";
import { Server, Socket } from "socket.io";
import { MinigameService } from "../minigame.service";

@Injectable()
export class PlayerGateway {
  constructor(private readonly minigameService: MinigameService) {}

  server: Server;

  async join(
    client: Socket,
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
      return { success: true, admin: true };
    }

    if (!data.playerId) {
      client.emit("join:error", {
        success: false,
        message: "playerId obrigatório",
      });
      return { success: false };
    }

    const player = await this.minigameService.getPlayerById(data.playerId);

    if (!player || player.sessionId !== data.sessionId) {
      client.emit("join:error", {
        success: false,
        message: "Player inválido",
      });
      return { success: false };
    }

    await this.minigameService.updateSocketId(player.id, client.id);

    const session = await this.minigameService.getSessionById(data.sessionId);

    client.emit("session:joined", {
      success: true,
      sessionId: data.sessionId,
      playerId: player.id,
      storeId: player.storeId,
      role: player.role,
      sessionStatus: session.status,
      currentRound: session.currentRound,
    });

    this.server.to(data.sessionId).emit("player:joined", {
      id: player.id,
      name: player.name,
      storeName: player.store?.name ?? "Sem loja",
      role: player.role,
      sessionId: data.sessionId,
    });

    const players = await this.minigameService.getPlayersSnapshot(data.sessionId);
    this.server.to(data.sessionId).emit("session:players_updated", players);

    return { success: true, playerId: player.id };
  }


  async submitConfiguration(client: Socket, data: any) {
  try {
    await this.minigameService.validateSubmissionWindow(data.roundId);

    const result = await this.minigameService.submitConfiguration(data);

    const submittedAt = new Date().toISOString();

    client.emit("player:config_submitted", {
      success: true,
      configId: result.configId,
      roundId: data.roundId,
      submittedAt,
    });

    // ✅ Inclui submittedAt para o admin atualizar a linha do player
    this.server.to(data.sessionId).emit("player:submitted", {
      playerId: data.playerId,
      roundId: data.roundId,
      submittedAt,
    });

    return result;
  } catch (error) {
    client.emit("player:submit_error", {
      success: false,
      message:
        error instanceof Error
          ? error.message
          : "Erro ao enviar configuração",
    });
    return { success: false };
  }
}

  async ready(data: { sessionId: string; playerId: string }) {
    const result = await this.minigameService.markPlayerReady(
      data.sessionId,
      data.playerId,
    );

    this.server.to(data.sessionId).emit("player:ready_update", result);

    const allReady = await this.minigameService.allPlayersReady(data.sessionId);

    if (allReady) {
      this.server.to(data.sessionId).emit("all_players_ready", {
        sessionId: data.sessionId,
      });
    }

    return result;
  }

  async getState(client: Socket, data: { sessionId: string }) {
    const session = await this.minigameService.getSessionById(data.sessionId);

    if (!session) {
      client.emit("session:state", {
        error: true,
        message: "Sessão não encontrada",
        rounds: [],
        activeRound: null,
      });
      return null;
    }

    const activeRound = session.rounds?.find((r) => r.status === "OPEN");

    const enriched = {
      ...session,
      activeRound: activeRound
        ? {
            ...activeRound,
            endTime: activeRound.endsAt
              ? new Date(activeRound.endsAt).getTime()
              : null,
          }
        : null,
    };

    client.emit("session:state", enriched);
    return enriched;
  }
}