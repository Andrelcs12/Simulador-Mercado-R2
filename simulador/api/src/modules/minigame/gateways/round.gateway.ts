import { Injectable } from "@nestjs/common";
import { Server } from "socket.io";
import { MinigameService } from "../minigame.service";

type RoundMaxStockConfig = {
  pereciveis?: number;
  mercearia?: number;
  eletro?: number;
  hipel?: number;
};

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
  async startRound(data: {
    sessionId: string;
    duration: number;
    maxStock?: RoundMaxStockConfig;
  }) {
    const round = await this.minigameService.startRound(
      data.sessionId,
      data.duration,
    );

    this.clearTimer(data.sessionId);

    const session = await this.minigameService.getSessionById(
      data.sessionId,
    );

    if (!session) {
      throw new Error("Session not found on startRound");
    }

    const startTime = Date.now();
    const endTime = startTime + data.duration * 1000;

    const payload = {
      sessionId: data.sessionId,
      roundId: round.roundId,
      roundNumber: session.currentRound,
      duration: data.duration,
      startTime,
      endTime,
      maxStock: data.maxStock,
    };

    this.timers.set(
      data.sessionId,
      setTimeout(() => {
        this.finishRoundInternal(data.sessionId, "TIME_UP");
      }, data.duration * 1000),
    );

    this.server.to(data.sessionId).emit("round:started", payload);

    const updatedSession = await this.minigameService.getSessionById(
      data.sessionId,
    );

    if (updatedSession) {
      this.server
        .to(data.sessionId)
        .emit("session:state", updatedSession);
    }

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

    if (!session) {
      return result;
    }

    this.server.to(sessionId).emit("round:finished", {
      sessionId,
      roundId: result.roundId,
      roundNumber: session.currentRound,
      reason,
      results: result.results,
    });

    this.server.to(sessionId).emit("session:state", session);

    if (session.currentRound >= session.totalRounds) {
      const final = await this.minigameService.finalizeSession(sessionId);

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

    if (!session) {
      throw new Error("Session not found on startNextRound");
    }

    const duration = 300;

    const startTime = Date.now();
    const endTime = startTime + duration * 1000;

    this.clearTimer(data.sessionId);

    this.timers.set(
      data.sessionId,
      setTimeout(() => {
        this.finishRoundInternal(data.sessionId, "TIME_UP");
      }, duration * 1000),
    );

    const payload = {
      sessionId: data.sessionId,
      roundId: result.roundId,
      roundNumber: session.currentRound,
      duration,
      startTime,
      endTime,
    };

    this.server.to(data.sessionId).emit("round:started", payload);

    const updatedSession = await this.minigameService.getSessionById(
      data.sessionId,
    );

    if (updatedSession) {
      this.server
        .to(data.sessionId)
        .emit("session:state", updatedSession);
    }

    return payload;
  }

  // =========================
  // MANUAL FINISH
  // =========================
  async finishRoundManually(sessionId: string) {
    return this.finishRoundInternal(sessionId, "MANUAL");
  }
}
