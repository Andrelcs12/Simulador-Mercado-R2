import {
  ConnectedSocket,
  MessageBody,
  SubscribeMessage,
  WebSocketGateway,
  WebSocketServer,
} from "@nestjs/websockets";

import { Server, Socket } from "socket.io";

import { PlayerGateway } from "./gateways/player.gateway";
import { RoundGateway } from "./gateways/round.gateway";
import { AdminGateway } from "./gateways/admin.gateway";

@WebSocketGateway({
  cors: { origin: "*" },
  namespace: "simulation",
})
export class MinigameGateway {
  @WebSocketServer()
  server: Server;

  constructor(
    private readonly playerGateway: PlayerGateway,
    private readonly roundGateway: RoundGateway,
    private readonly adminGateway: AdminGateway,
  ) {}

  // ======================================================
  // SOCKET LIFECYCLE
  // ======================================================

  handleConnection(client: Socket) {
    // opcional: logs, auth handshake etc
  }

  handleDisconnect(client: Socket) {
    console.log("Socket disconnected:", client.id);
  }

  // ======================================================
  // JOIN SESSION (ENTRY POINT ÚNICO)
  // ======================================================

  @SubscribeMessage("join_session")
  async join(
    @ConnectedSocket() client: Socket,
    @MessageBody()
    data: {
      sessionId: string;
      playerId?: string;
      isAdmin?: boolean;
    },
  ) {
    client.join(data.sessionId);

    client.emit("server:time_sync", {
      serverTime: Date.now(),
    });

    // 👉 delega lógica para PlayerGateway
    return this.playerGateway.join(client, data);
  }

  // ======================================================
  // PLAYER EVENTS → DELEGATE
  // ======================================================

  @SubscribeMessage("player:submit_config")
  async submitConfig(
    @ConnectedSocket() client: Socket,
    @MessageBody() data: any,
  ) {
    return this.playerGateway.submitConfiguration(client, data);
  }

  @SubscribeMessage("player:ready")
  async playerReady(@MessageBody() data: any) {
    return this.playerGateway.ready(data);
  }

  // ======================================================
  // ROUND EVENTS → DELEGATE
  // ======================================================

  @SubscribeMessage("admin:start_round")
  async startRound(@MessageBody() data: any) {
    return this.roundGateway.startRound(data);
  }

  @SubscribeMessage("admin:force_stop_round")
  async forceStopRound(@MessageBody() data: any) {
    return this.roundGateway.forceStop(data);
  }

  @SubscribeMessage("admin:start_next_round")
  async nextRound(@MessageBody() data: any) {
    return this.roundGateway.startNextRound(data);
  }

  // ======================================================
  // ADMIN EVENTS → DELEGATE
  // ======================================================

  @SubscribeMessage("admin:finish_session")
  async finishSession(@MessageBody() data: any) {
    return this.adminGateway.finishSession(data);
  }

  @SubscribeMessage("admin:kick_player")
  async kickPlayer(@MessageBody() data: any) {
    return this.adminGateway.kickPlayer(data);
  }

  // ======================================================
  // STATE (shared)
  // ======================================================

  @SubscribeMessage("session:get_state")
  async getState(
    @ConnectedSocket() client: Socket,
    @MessageBody() data: any,
  ) {
    return this.playerGateway.getState(client, data);
  }
}