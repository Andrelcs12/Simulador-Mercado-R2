import { Injectable } from "@nestjs/common";

import { SessionService } from "./services/session.service";
import { RoundService } from "./services/round.service";
import { PlayerService } from "./services/player.service";
import { SubmissionService } from "./services/submission.service";


import { PlayerRole } from "@/generated/prisma/enums";
import { SimulationService } from "./simulation.service";
import { DashboardService } from "./services/dashboard.service";

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

  // ======================================================
  // SIMULATION
  // ======================================================

  calculateRoundResult(data: {
  categories: any[];
  capex: any[];

  stockInputs: any[];
  capexSelections: any[];

  storeCash: number;

  marketShare: number;

  operatorsQty: number;
  serviceOperatorsQty: number;

  quizScore: number;

  totalMarketCustomers: number;
}) {
  return this.simulationService.calculateRound(data);
}

  // ======================================================
  // SESSION
  // ======================================================

  createSession() {
    return this.sessionService.createSession();
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
    return this.playerService.updateSocketId(
      playerId,
      socketId,
    );
  }

  kickPlayer(playerId: string) {
    return this.playerService.kickPlayer(playerId);
  }

  // ======================================================
  // ROUND
  // ======================================================

  startRound(sessionId: string, duration: number) {
    return this.roundService.startRound(
      sessionId,
      duration,
    );
  }

  finishRound(
    sessionId: string,
    reason:
      | "TIME_UP"
      | "ADMIN_STOP"
      | "MANUAL" = "MANUAL",
  ) {
    return this.roundService.finishRound(
      sessionId,
      reason,
    );
  }

  startNextRound(sessionId: string) {
    return this.roundService.startNextRound(
      sessionId,
    );
  }

  // ======================================================
  // SUBMISSIONS
  // ======================================================

  submitConfiguration(data: {
    playerId: string;
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
  }) {
    return this.submissionService.submitConfiguration(
      data,
    );
  }

  getDashboard(sessionId: string, roundId: string, storeId?: string) {
  return this.dashboardService.getRoundDashboard(sessionId, roundId, storeId);
}

  markPlayerReady(
    sessionId: string,
    playerId: string,
  ) {
    return this.submissionService.markPlayerReady(
      sessionId,
      playerId,
    );
  }

  allPlayersReady(sessionId: string) {
    return this.submissionService.allPlayersReady(
      sessionId,
    );
  }

  clearReady(sessionId: string) {
    return this.submissionService.clearReady(
      sessionId,
    );
  }

  validateSubmissionWindow(roundId: string) {
    return this.submissionService.validateSubmissionWindow(
      roundId,
    );
  }

  finalizeSession(sessionId: string) {
  return this.simulationService.finalizeSession(sessionId);
}


}