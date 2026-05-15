import { Module } from "@nestjs/common";

import { MinigameService } from "./minigame.service";
import { MinigameController } from "./minigame.controller";
import { MinigameGateway } from "./minigame.gateway";

import { PrismaService } from "@/prisma.service";

// services
import { SessionService } from "./services/session.service";
import { RoundService } from "./services/round.service";
import { PlayerService } from "./services/player.service";
import { SubmissionService } from "./services/submission.service";
import { DashboardService } from "./services/dashboard.service";
import { RankingService } from "./services/ranking.service";

import { SimulationService } from "./simulation.service";

// gateways
import { PlayerGateway } from "./gateways/player.gateway";
import { RoundGateway } from "./gateways/round.gateway";
import { AdminGateway } from "./gateways/admin.gateway";

@Module({
  imports: [],

  controllers: [MinigameController],

  providers: [
    // core
    MinigameService,

    // gateways
    MinigameGateway,
    PlayerGateway,
    RoundGateway,
    AdminGateway,

    // services
    SessionService,
    RoundService,
    PlayerService,
    SubmissionService,
    DashboardService,
    RankingService,
    SimulationService,

    // infra
    PrismaService,
  ],

  exports: [
    RankingService,
    DashboardService,
  ],
})
export class MinigameModule {}