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
import { PlayerGateway } from "./gateways/player.gateway";
import { RoundGateway } from "./gateways/round.gateway";
import { AdminGateway } from "./gateways/admin.gateway";
import { SessionService } from "./services/session.service";

@Injectable()
@WebSocketGateway({
  cors: { origin: "*" },
  namespace: "simulation",
})
export class MinigameGateway implements OnGatewayInit {
  @WebSocketServer()
  server: Server;

  private readonly logger = new Logger(MinigameGateway.name);

  constructor(
    private readonly playerGateway: PlayerGateway,
    private readonly roundGateway: RoundGateway,
    private readonly adminGateway: AdminGateway,
    private readonly sessionService: SessionService,
  ) {}

  afterInit(server: Server) {
    this.server = server;
    this.playerGateway.server = server;
    this.roundGateway.server = server;
    this.adminGateway.server = server;
    this.sessionService.setServer(server);
    this.logger.log("Simulation websocket initialized");
  }

  handleConnection(client: Socket) {
    this.logger.log(`Socket connected: ${client.id}`);
  }

  handleDisconnect(client: Socket) {
    this.logger.log(`Socket disconnected: ${client.id}`);
  }

  @SubscribeMessage("join_session")
  async join(@ConnectedSocket() client: Socket, @MessageBody() data: any) {
    return this.playerGateway.join(client, data);
  }

  @SubscribeMessage("player:submit_config")
  async submitConfig(@ConnectedSocket() client: Socket, @MessageBody() data: any) {
    return this.playerGateway.submitConfiguration(client, data);
  }

  @SubscribeMessage("player:ready")
  async playerReady(@MessageBody() data: any) {
    return this.playerGateway.ready(data);
  }

  @SubscribeMessage("admin:start_round")
  async startRound(@MessageBody() data: any) {
    return this.roundGateway.startRound(data);
  }

  @SubscribeMessage("admin:start_next_round")
  async startNextRound(@MessageBody() data: any) {
    return this.roundGateway.startNextRound(data);
  }

  @SubscribeMessage("admin:force_stop_round")
  async forceStopRound(@MessageBody() data: any) {
    return this.roundGateway.forceStop(data);
  }

  @SubscribeMessage("round:update_time")
  async updateRoundTime(@MessageBody() data: { sessionId: string; minutesDelta: number }) {
    const { sessionId, minutesDelta } = data;
    
    if (!sessionId || minutesDelta === undefined) {
      return { success: false, error: "Dados inválidos." };
    }

    // Repassa o objeto com a assinatura idêntica ao que o RoundGateway espera
    const result = await this.roundGateway.updateTime({ sessionId, minutesDelta });

    if (!result.success) {
      return { success: false, error: result.reason };
    }

    return { success: true, endTime: result.newEndTime };
  }

  @SubscribeMessage("admin:finish_session")
  async finishSession(@MessageBody() data: any) {
    return this.adminGateway.finishSession(data);
  }

  @SubscribeMessage("admin:kick_player")
  async kickPlayer(@MessageBody() data: any) {
    return this.adminGateway.kickPlayer(data);
  }

  @SubscribeMessage("session:get_state")
  async getState(@ConnectedSocket() client: Socket, @MessageBody() data: any) {
    return this.playerGateway.getState(client, data);
  }
}