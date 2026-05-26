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

// gateways (Tratados estritamente como Providers de lógica pelo NestJS)
import { PlayerGateway } from "./gateways/player.gateway";
import { RoundGateway } from "./gateways/round.gateway";
import { AdminGateway } from "./gateways/admin.gateway";
import { PlayerHandler } from "./handlers/player.handler";
import { RoundHandler } from "./handlers/round.handler";
import { AdminHandler } from "./handlers/admin.handler";

@Module({
  imports: [],

  controllers: [MinigameController],

  providers: [
    // core
    MinigameService,

    // gateway principal (o único que expõe a porta/namespace WS)
    MinigameGateway,

    // gateways secundários (funcionando como provedores isolados de lógica)
    PlayerGateway,
    RoundGateway,
    AdminGateway,

    PlayerHandler,
    RoundHandler,
    AdminHandler,

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