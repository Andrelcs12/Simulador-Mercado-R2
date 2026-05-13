import {
  ConnectedSocket,
  MessageBody,
  SubscribeMessage,
} from "@nestjs/websockets";

import { Server } from "socket.io";
import { MinigameService } from "../minigame.service";

export class RoundGateway {
  constructor(private readonly minigameService: MinigameService) {}

  server: Server;

  private timers = new Map<string, NodeJS.Timeout>();

  // ======================================================
  // UTILS
  // ======================================================

  private clear(sessionId: string) {
    const timer = this.timers.get(sessionId);

    if (timer) {
      clearTimeout(timer);
    }

    this.timers.delete(sessionId);
  }

  // ======================================================
  // START ROUND
  // ======================================================

  @SubscribeMessage("admin:start_round")
  async startRound(
    @MessageBody()
    data: {
      sessionId: string;
      duration: number;
    },
  ) {
    const round = await this.minigameService.startRound(
      data.sessionId,
      data.duration,
    );

    this.clear(data.sessionId);

    const startTime = Date.now();
    const endTime = startTime + data.duration * 1000;

    // ======================================================
    // AUTO FINISH
    // ======================================================

    const timeout = setTimeout(async () => {
      try {
        const result = await this.minigameService.finishRound(
          data.sessionId,
          "TIME_UP",
        );

        this.server.to(data.sessionId).emit("round:finished", result);
        this.server.to(data.sessionId).emit("round:time_up", result);
      } catch (error) {
        console.error(error);
      } finally {
        this.timers.delete(data.sessionId);
      }
    }, data.duration * 1000);

    this.timers.set(data.sessionId, timeout);

    this.server.to(data.sessionId).emit("round:started", {
      sessionId: round.sessionId,
      roundId: round.roundId,
      roundNumber: round.roundNumber,
      duration: data.duration,
      startTime,
      endTime,
    });

    return { success: true };
  }

  // ======================================================
  // FORCE STOP ROUND
  // ======================================================

  @SubscribeMessage("admin:force_stop_round")
  async forceStop(
    @MessageBody()
    data: {
      sessionId: string;
    },
  ) {
    this.clear(data.sessionId);

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
  // SESSION END ROUND (optional hook)
  // ======================================================

  async finishRoundManually(sessionId: string) {
    this.clear(sessionId);

    const result = await this.minigameService.finishRound(
      sessionId,
      "MANUAL",
    );

    this.server.to(sessionId).emit("round:finished", result);

    return result;
  }
}