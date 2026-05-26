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
  // ✅ Rastreia o endTime atual por sessão
  private endTimes = new Map<string, number>();

  private clearTimer(sessionId: string) {
    const timer = this.timers.get(sessionId);
    if (timer) clearTimeout(timer);
    this.timers.delete(sessionId);
  }

  private scheduleFinish(sessionId: string, remainingMs: number) {
    this.clearTimer(sessionId);
    if (remainingMs > 0) {
      this.timers.set(
        sessionId,
        setTimeout(() => {
          this.finishRoundInternal(sessionId, "TIME_UP");
        }, remainingMs)
      );
    }
  }

  async startRound(data: {
    sessionId: string;
    duration: number;
    maxStock?: RoundMaxStockConfig;
  }) {
    const round = await this.minigameService.startRound(
      data.sessionId,
      data.duration
    );

    const session = await this.minigameService.getSessionById(data.sessionId);
    if (!session) throw new Error("Session not found on startRound");

    const startTime = Date.now();
    const endTime = startTime + data.duration * 1000;

    // ✅ Salva o endTime
    this.endTimes.set(data.sessionId, endTime);
    this.scheduleFinish(data.sessionId, data.duration * 1000);

    const payload = {
      sessionId: data.sessionId,
      roundId: round.roundId,
      roundNumber: session.currentRound,
      duration: data.duration,
      startTime,
      endTime,
      maxStock: data.maxStock,
    };

    this.server.to(data.sessionId).emit("round:started", payload);

    const updatedSession = await this.minigameService.getSessionById(data.sessionId);
    if (updatedSession) {
      this.server.to(data.sessionId).emit("session:state", updatedSession);
    }

    return payload;
  }

  private async finishRoundInternal(
    sessionId: string,
    reason: "TIME_UP" | "ADMIN_STOP" | "MANUAL"
  ) {
    this.clearTimer(sessionId);
    this.endTimes.delete(sessionId); // ✅ limpa

    const result = await this.minigameService.finishRound(sessionId, reason);
    const session = await this.minigameService.getSessionById(sessionId);
    if (!session) return result;

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

  async forceStop(data: { sessionId: string }) {
    return this.finishRoundInternal(data.sessionId, "ADMIN_STOP");
  }

  async startNextRound(data: { sessionId: string }) {
    const result = await this.minigameService.startNextRound(data.sessionId);
    const session = await this.minigameService.getSessionById(data.sessionId);
    if (!session) throw new Error("Session not found on startNextRound");

    const duration = 300;
    const startTime = Date.now();
    const endTime = startTime + duration * 1000;

    // ✅ Salva o endTime
    this.endTimes.set(data.sessionId, endTime);
    this.scheduleFinish(data.sessionId, duration * 1000);

    const payload = {
      sessionId: data.sessionId,
      roundId: result.roundId,
      roundNumber: session.currentRound,
      duration,
      startTime,
      endTime,
    };

    this.server.to(data.sessionId).emit("round:started", payload);

    const updatedSession = await this.minigameService.getSessionById(data.sessionId);
    if (updatedSession) {
      this.server.to(data.sessionId).emit("session:state", updatedSession);
    }

    return payload;
  }

  // ✅ Corrigido: ajusta sobre o endTime real, não Date.now() + delta
  async updateTime(data: { sessionId: string; minutesDelta: number }) {
    const currentEndTime = this.endTimes.get(data.sessionId);

    if (!currentEndTime) {
      // Rodada não está ativa
      return { success: false, reason: "No active round" };
    }

    const adjustmentMs = data.minutesDelta * 60 * 1000;
    const novoEndTime = currentEndTime + adjustmentMs;

    // Não deixa o timer ir abaixo de 5 segundos restantes
    const remainingMs = novoEndTime - Date.now();
    if (remainingMs < 5000 && data.minutesDelta < 0) {
      return { success: false, reason: "Cannot reduce below 5 seconds" };
    }

    // ✅ Atualiza o endTime salvo
    this.endTimes.set(data.sessionId, novoEndTime);
    this.scheduleFinish(data.sessionId, Math.max(0, remainingMs));

    // ✅ Emite para todos (admin + jogadores) com o endTime correto
    this.server.to(data.sessionId).emit("round:time_updated", {
      endTime: novoEndTime,
      duration: Math.max(0, remainingMs) / 1000,
    });

    return { success: true, newEndTime: novoEndTime };
  }

  async finishRoundManually(sessionId: string) {
    return this.finishRoundInternal(sessionId, "MANUAL");
  }
}