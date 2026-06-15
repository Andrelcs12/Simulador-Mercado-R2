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
export class RoundHandler {
  // Controle de estado volátil dos timers mantidos isolados por contexto
  private timers = new Map<string, NodeJS.Timeout>();
  private endTimes = new Map<string, number>();

  constructor(private readonly minigameService: MinigameService) {}

  private clearTimer(sessionId: string) {
    const timer = this.timers.get(sessionId);
    if (timer) clearTimeout(timer);
    this.timers.delete(sessionId);
  }

  private scheduleFinish(server: Server, sessionId: string, remainingMs: number) {
    this.clearTimer(sessionId);
    if (remainingMs > 0) {
      this.timers.set(
        sessionId,
        setTimeout(() => {
          this.finishRoundInternal(server, sessionId, "TIME_UP");
        }, remainingMs)
      );
    }
  }

  private async finishRoundInternal(
    server: Server,
    sessionId: string,
    reason: "TIME_UP" | "ADMIN_STOP" | "MANUAL"
  ) {
    this.clearTimer(sessionId);
    this.endTimes.delete(sessionId);

    const result = await this.minigameService.finishRound(sessionId, reason);
    const session = await this.minigameService.getSessionById(sessionId);
    if (!session) return result;

    server.to(sessionId).emit("round:finished", {
      sessionId,
      roundId: result.roundId,
      roundNumber: session.currentRound,
      reason,
      results: result.results,
    });

    server.to(sessionId).emit("session:state", session);

    if (session.currentRound >= session.totalRounds) {
      let ranking: any[] = [];
      try {
        const final: any = await this.minigameService.finalizeSession(sessionId);
        ranking = Array.isArray(final?.ranking) ? final.ranking : [];
      } catch (e) {
        console.error("Falha ao finalizar sessão:", e);
      }
      // Emite sempre — a tela final busca o ranking do endpoint como fonte da verdade.
      server.to(sessionId).emit("session:finalized", {
        sessionId,
        ranking,
      });
    }

    return result;
  }

  async handleStartRound(
    server: Server,
    data: {
      sessionId: string;
      duration: number;
      maxStock?: RoundMaxStockConfig;
    }
  ) {
    const round = await this.minigameService.startRound(
      data.sessionId,
      data.duration
    );

    const session = await this.minigameService.getSessionById(data.sessionId);
    if (!session) throw new Error("Session not found on startRound");

    const startTime = Date.now();
    const endTime = startTime + data.duration * 1000;

    this.endTimes.set(data.sessionId, endTime);
    this.scheduleFinish(server, data.sessionId, data.duration * 1000);

    const payload = {
      sessionId: data.sessionId,
      roundId: round.roundId,
      roundNumber: session.currentRound,
      duration: data.duration,
      startTime,
      endTime,
      maxStock: data.maxStock,
    };

    server.to(data.sessionId).emit("round:started", payload);

    const updatedSession = await this.minigameService.getSessionById(data.sessionId);
    if (updatedSession) {
      server.to(data.sessionId).emit("session:state", updatedSession);
    }

    return payload;
  }

  async handleStartNextRound(server: Server, data: { sessionId: string }) {
    const result = await this.minigameService.startNextRound(data.sessionId);
    const session = await this.minigameService.getSessionById(data.sessionId);
    if (!session) throw new Error("Session not found on startNextRound");

    const duration = 300;
    const startTime = Date.now();
    const endTime = startTime + duration * 1000;

    this.endTimes.set(data.sessionId, endTime);
    this.scheduleFinish(server, data.sessionId, duration * 1000);

    const payload = {
      sessionId: data.sessionId,
      roundId: result.roundId,
      roundNumber: session.currentRound,
      duration,
      startTime,
      endTime,
    };

    server.to(data.sessionId).emit("round:started", payload);

    const updatedSession = await this.minigameService.getSessionById(data.sessionId);
    if (updatedSession) {
      server.to(data.sessionId).emit("session:state", updatedSession);
    }

    return payload;
  }

  async handleForceStop(server: Server, data: { sessionId: string }) {
    return this.finishRoundInternal(server, data.sessionId, "ADMIN_STOP");
  }

  async handleUpdateTime(server: Server, data: { sessionId: string; minutesDelta: number }) {
    const currentEndTime = this.endTimes.get(data.sessionId);
    if (!currentEndTime) return { success: false, reason: "No active round" };

    const adjustmentMs = data.minutesDelta * 60 * 1000;
    const novoEndTime = currentEndTime + adjustmentMs;

    this.endTimes.set(data.sessionId, novoEndTime);
    this.scheduleFinish(server, data.sessionId, Math.max(0, novoEndTime - Date.now()));

    await this.minigameService.updateTime(data.sessionId, novoEndTime);

    server.to(data.sessionId).emit("round:time_updated", {
      endTime: novoEndTime,
      duration: Math.max(0, novoEndTime - Date.now()) / 1000,
    });

    return { success: true, newEndTime: novoEndTime };
  }

  async handleFinishRoundManually(server: Server, data: { sessionId: string }) {
    return this.finishRoundInternal(server, data.sessionId, "MANUAL");
  }
}