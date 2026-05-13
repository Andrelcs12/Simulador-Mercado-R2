import { Injectable } from "@nestjs/common";
import { SimulationService } from "./simulation.service";
import { SessionService } from "./services/session.service";
import { RoundService } from "./services/round.service";
import { PlayerService } from "./services/player.service";
import { SubmissionService } from "./services/submission.service";
import { PlayerRole } from "@/generated/prisma/enums";

@Injectable()
export class MinigameService {
  constructor(
    private sessionService: SessionService,
    private roundService: RoundService,
    private playerService: PlayerService,
    private submissionService: SubmissionService,
    private simulationService: SimulationService,
  ) {}

  // ======================================================
  // SESSION
  // ======================================================

  createSession() {
    return this.sessionService.createSession();
  }

  getSessionById(sessionId: string) {
    return this.sessionService.getSessionById(sessionId);
  }

  finishSession(sessionId: string) {
    return this.sessionService.finishSession(sessionId);
  }

  // ======================================================
  // PLAYERS
  // ======================================================

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

  kickPlayer(sessionId: string, playerId: string) {
    return this.playerService.kickPlayer(playerId);
  }

  // ======================================================
  // ROUND
  // ======================================================

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

  // ======================================================
  // SUBMISSION (PLAYER ACTIONS)
  // ======================================================

  submitConfiguration(data: {
    playerId: string;
    storeId: string;
    sessionId: string;
    roundId: string;
    stockInputs: { categoryId: string; buyQty: number }[];
    capexSelections: { capexId: string }[];
  }) {
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

  // ======================================================
  // SIMULATION
  // ======================================================

  runRoundSimulation(data: {
  categories: any[];
  capex: any[];
  stockInputs: any[];
  capexSelections: any[];
  storeCash: number;
  marketShare: number;
}) {
  return this.simulationService.calculateRound(data);
}
}