import { Module } from "@nestjs/common";
import { MinigameService } from "./minigame.service";
import { MinigameController } from "./minigame.controller";
import { MinigameGateway } from "./minigame.gateway";

import { PrismaService } from "@/prisma.service";

// services internos
import { SessionService } from "./services/session.service";
import { RoundService } from "./services/round.service";
import { PlayerService } from "./services/player.service";
import { SubmissionService } from "./services/submission.service";
import { SimulationService } from "./simulation.service";

// gateways delegados
import { PlayerGateway } from "./gateways/player.gateway";
import { RoundGateway } from "./gateways/round.gateway";
import { AdminGateway } from "./gateways/admin.gateway";

@Module({
  imports: [],
  controllers: [MinigameController],

  providers: [
    // core service
    MinigameService,

    // gateways
    MinigameGateway,
    PlayerGateway,
    RoundGateway,
    AdminGateway,

    // domain services (ESSENCIAL)
    SessionService,
    RoundService,
    PlayerService,
    SubmissionService,
    SimulationService,

    // infra
    PrismaService,
  ],
})
export class MinigameModule {}