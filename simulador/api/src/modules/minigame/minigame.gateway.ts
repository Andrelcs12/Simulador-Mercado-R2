import {
  ConnectedSocket,
  MessageBody,
  OnGatewayInit,
  SubscribeMessage,
  WebSocketGateway,
  WebSocketServer,
} from "@nestjs/websockets";
import { Injectable, Logger } from "@nestjs/common";
import { Server, Socket } from "socket.io";
import { PlayerHandler } from "./handlers/player.handler";
import { AdminHandler } from "./handlers/admin.handler";
import { RoundHandler } from "./handlers/round.handler";

@WebSocketGateway({ cors: { origin: "*" }, namespace: "simulation" })
@Injectable()
export class MinigameGateway implements OnGatewayInit {
  @WebSocketServer() server: Server;
  private readonly logger = new Logger(MinigameGateway.name);

  constructor(
    private readonly playerHandler: PlayerHandler,
    private readonly adminHandler: AdminHandler,
    private readonly roundHandler: RoundHandler,
  ) {}

  afterInit(server: Server) {
    this.logger.log("Simulation websocket initialized cleanly");
  }

  handleConnection(client: Socket) {
    this.logger.log(`Socket connected: ${client.id}`);
  }

  handleDisconnect(client: Socket) {
    this.logger.log(`Socket disconnected: ${client.id}`);
  }

  // === PLAYER ACTIONS ===
  @SubscribeMessage("join_session")
  async join(@ConnectedSocket() client: Socket, @MessageBody() data: any) {
    return this.playerHandler.handleJoin(client, this.server, data);
  }

  @SubscribeMessage("player:submit_config")
  async submitConfig(@ConnectedSocket() client: Socket, @MessageBody() data: any) {
    return this.playerHandler.handleSubmitConfig(client, this.server, data);
  }

  @SubscribeMessage("player:ready")
  async playerReady(@MessageBody() data: any) {
    return this.playerHandler.handleReady(this.server, data);
  }

  @SubscribeMessage("session:get_state")
  async getState(@ConnectedSocket() client: Socket, @MessageBody() data: any) {
    return this.playerHandler.handleGetState(client, data);
  }

  // === ADMIN & ROUND ACTIONS ===
  @SubscribeMessage("admin:start_round")
  async startRound(@MessageBody() data: any) {
    return this.roundHandler.handleStartRound(this.server, data);
  }

  @SubscribeMessage("admin:start_next_round")
  async startNextRound(@MessageBody() data: any) {
    return this.roundHandler.handleStartNextRound(this.server, data);
  }

  @SubscribeMessage("admin:force_stop_round")
  async forceStopRound(@MessageBody() data: any) {
    return this.roundHandler.handleForceStop(this.server, data);
  }

  @SubscribeMessage("round:update_time")
  async updateRoundTime(@MessageBody() data: any) {
    return this.roundHandler.handleUpdateTime(this.server, data);
  }

  @SubscribeMessage("admin:finish_session")
  async finishSession(@MessageBody() data: any) {
    return this.adminHandler.handleFinishSession(this.server, data);
  }

  @SubscribeMessage("admin:kick_player")
  async kickPlayer(@MessageBody() data: any) {
    return this.adminHandler.handleKickPlayer(this.server, data);
  }

  @SubscribeMessage("admin:get_state")
  async adminGetState(@ConnectedSocket() client: Socket, @MessageBody() data: any) {
    return this.adminHandler.handleGetState(client, data);
  }
}