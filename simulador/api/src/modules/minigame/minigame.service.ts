import { Injectable } from "@nestjs/common";

import { SessionService } from "./services/session.service";
import { RoundService } from "./services/round.service";
import { PlayerService } from "./services/player.service";
import { SubmissionService } from "./services/submission.service";
import { DashboardService } from "./services/dashboard.service";
import { SimulationService } from "./simulation.service";

import { PlayerRole } from "@/generated/prisma/enums";
import { SubmitConfigurationDTO } from "./contracts/submission.dto";
import { RoundSimulationInput } from "./types/round-simulation-input";

@Injectable()
export class MinigameService {
  constructor(
    private readonly sessionService: SessionService,
    private readonly roundService: RoundService,
    private readonly playerService: PlayerService,
    private readonly submissionService: SubmissionService,
    private readonly dashboardService: DashboardService,
    private readonly simulationService: SimulationService,
  ) {}

  // ================= SESSION =================

  createSession(totalRounds?: number) {
    return this.sessionService.createSession(totalRounds);
  }

  getSessionById(sessionId: string) {
    return this.sessionService.getSessionById(sessionId);
  }

  getSessionByCode(code: string) {
    return this.sessionService.getSessionByCode(code);
  }

  finishSession(sessionId: string) {
    return this.sessionService.finishSession(sessionId);
  }

  // ================= PLAYERS =================

  registerPlayer(data: {
    name: string;
    email: string;
    sessionCode: string;
    role: PlayerRole;
    storeName: string;
  }) {
    return this.playerService.registerPlayer(data);
  }

  getPlayersBySession(sessionId: string) {
    return this.playerService.getPlayersBySession(sessionId);
  }

  getPlayersSnapshot(sessionId: string) {
    return this.playerService.getPlayersSnapshot(sessionId);
  }

  getPlayerById(playerId: string) {
    return this.playerService.getPlayerById(playerId);
  }

  updateSocketId(playerId: string, socketId: string) {
    return this.playerService.updateSocketId(playerId, socketId);
  }

  kickPlayer(playerId: string) {
    return this.playerService.kickPlayer(playerId);
  }

  // ================= ROUND =================

  startRound(sessionId: string, duration: number) {
    return this.roundService.startRound(sessionId, duration);
  }

  finishRound(
    sessionId: string,
    reason: "TIME_UP" | "ADMIN_STOP" | "MANUAL" = "MANUAL",
  ) {
    return this.roundService.finishRound(sessionId, reason);
  }

  startNextRound(sessionId: string) {
    return this.roundService.startNextRound(sessionId);
  }

  // ================= SUBMISSION =================

  submitConfiguration(data: SubmitConfigurationDTO) {
    return this.submissionService.submitConfiguration(data);
  }

  markPlayerReady(sessionId: string, playerId: string) {
    return this.submissionService.markPlayerReady(sessionId, playerId);
  }

  allPlayersReady(sessionId: string) {
    return this.submissionService.allPlayersReady(sessionId);
  }

  clearReady(sessionId: string) {
    return this.submissionService.clearReady(sessionId);
  }

  validateSubmissionWindow(roundId: string) {
    return this.submissionService.validateSubmissionWindow(roundId);
  }

  // ================= DASHBOARD =================

  getDashboard(sessionId: string, roundId: string, storeId?: string) {
    return this.dashboardService.getRoundDashboard(sessionId, roundId, storeId);
  }

  // ================= SIMULATION (TIPADO FORTE) =================

  calculateBaseMetrics(input: {
    categories: any[];
    stockInputs: any[];
    operatorsQty: number;
    serviceOperatorsQty: number;
    quizScore: number;
  }) {
    return this.simulationService.calculateBaseMetrics(input);
  }

  calculateRoundResult(input: RoundSimulationInput) {
    return this.simulationService.calculateRoundResult(input);
  }

  finalizeSession(sessionId: string) {
    return this.sessionService.finalizeSession(sessionId);
  }
}