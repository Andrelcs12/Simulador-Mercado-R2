import { Body, Controller, Get, Param, Post } from "@nestjs/common";
import { MinigameService } from "./minigame.service";

@Controller("minigame")
export class MinigameController {
  constructor(private readonly service: MinigameService) {}

  // ================= SESSION =================

  @Post("create-session")
  createSession() {
    return this.service.createSession();
  }

  @Get("session/:id")
  getSession(@Param("id") id: string) {
    return this.service.getSessionById(id);
  }

  @Post("session/:id/start")
  start(
    @Param("id") id: string,
    @Body() body: { duration: number },
  ) {
    return this.service.startRound(id, body.duration);
  }

  @Post("session/:id/finalize")
  finalizeSession(@Param("id") id: string) {
    return this.service.finalizeSession(id);
  }

  @Post("session/:id/next")
  next(@Param("id") id: string) {
    return this.service.startNextRound(id);
  }

  @Post("session/:id/finish-round")
  finishRound(@Param("id") id: string) {
    return this.service.finishRound(id, "MANUAL");
  }

  // ================= PLAYERS =================

  @Post("register")
  register(@Body() body: any) {
    return this.service.registerPlayer(body);
  }

  @Get("players/:sessionId")
  players(@Param("sessionId") id: string) {
    return this.service.getPlayersBySession(id);
  }

  // ================= SUBMISSION =================

  @Post("submit-config")
  submit(@Body() body: any) {
    return this.service.submitConfiguration(body);
  }

  // ================= DASHBOARD =================

  // 🔥 FIX PRINCIPAL (não depende de roundId)
  @Get("session/:id/dashboard/latest")
  getLatestDashboard(@Param("id") id: string) {
    return this.service.getLatestDashboard(id);
  }

  // (opcional ainda manter)
  @Get("session/:id/dashboard/:roundId")
  getDashboard(
    @Param("id") id: string,
    @Param("roundId") roundId: string,
  ) {
    return this.service.getDashboard(id, roundId);
  }
}