import { Injectable } from "@nestjs/common";
import { Server } from "socket.io";
import { MinigameService } from "../minigame.service";

@Injectable()
export class RoundGateway {
  constructor(private readonly minigameService: MinigameService) {}

  server: Server;

  private timers = new Map<string, NodeJS.Timeout>();

  private clearTimer(sessionId: string) {
    const timer = this.timers.get(sessionId);
    if (timer) clearTimeout(timer);
    this.timers.delete(sessionId);
  }

  // =========================
  // START ROUND
  // =========================
  async startRound(data: { sessionId: string; duration: number }) {
    const round = await this.minigameService.startRound(
      data.sessionId,
      data.duration,
    );

    this.clearTimer(data.sessionId);

    const session = await this.minigameService.getSessionById(
      data.sessionId,
    );

    const startTime = Date.now();
    const endTime = startTime + data.duration * 1000;

    const payload = {
      sessionId: data.sessionId,
      roundId: round.roundId,
      roundNumber: session.currentRound,
      duration: data.duration,
      startTime,
      endTime,
    };

    const timeout = setTimeout(async () => {
      await this.finishRoundInternal(data.sessionId, "TIME_UP");
    }, data.duration * 1000);

    this.timers.set(data.sessionId, timeout);

    this.server.to(data.sessionId).emit("round:started", payload);
    this.server.to(data.sessionId).emit("session:state", session);

    return payload;
  }

  // =========================
  // CENTRAL FINISH
  // =========================
  private async finishRoundInternal(
    sessionId: string,
    reason: "TIME_UP" | "ADMIN_STOP" | "MANUAL",
  ) {
    this.clearTimer(sessionId);

    const result = await this.minigameService.finishRound(
      sessionId,
      reason,
    );

    const session = await this.minigameService.getSessionById(sessionId);

    this.server.to(sessionId).emit("round:finished", {
      sessionId,
      roundId: result.roundId,
      roundNumber: session.currentRound,
      reason,
      results: result.results,
    });

    this.server.to(sessionId).emit("session:state", session);

    if (session.currentRound >= session.totalRounds) {
      const final =
        await this.minigameService.finalizeSession(sessionId);

      this.server.to(sessionId).emit("session:finalized", {
        sessionId,
        ranking: final.ranking,
      });
    }

    return result;
  }

  // =========================
  // FORCE STOP
  // =========================
  async forceStop(data: { sessionId: string }) {
    return this.finishRoundInternal(data.sessionId, "ADMIN_STOP");
  }

  // =========================
  // NEXT ROUND
  // =========================
  async startNextRound(data: { sessionId: string }) {
    const result = await this.minigameService.startNextRound(
      data.sessionId,
    );

    const session = await this.minigameService.getSessionById(
      data.sessionId,
    );

    this.server.to(data.sessionId).emit("round:started", {
      sessionId: data.sessionId,
      ...result,
      roundNumber: session.currentRound,
      duration: 0,
      startTime: Date.now(),
      endTime: null,
    });

    this.server.to(data.sessionId).emit("session:state", session);

    return result;
  }

  // =========================
  // MANUAL FINISH
  // =========================
  async finishRoundManually(sessionId: string) {
    return this.finishRoundInternal(sessionId, "MANUAL");
  }
}