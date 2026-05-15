import { useCallback, useRef, useState } from "react";
import { io, Socket } from "socket.io-client";
import toast from "react-hot-toast";
import { Player, Session } from "../types";

type JoinedPlayerEvent = {
  id: string;
  name: string;
  role: string;
  sessionId: string;
  storeName?: string;
  store?: { name: string };
};

// Normaliza qualquer shape de player que o backend possa enviar:
//   { storeName: "Loja X" }          → player:joined
//   { store: { name: "Loja X" } }    → getPlayersSnapshot (Prisma select)
function normalizePlayer(p: any): Player {
  return {
    id: p.id,
    name: p.name,
    storeName: p.storeName ?? p.store?.name ?? "Sem loja",
    isReady: p.isReady ?? false,
    submittedAt: p.submittedAt,
  };
}

export const useAdminSocket = (API_URL: string) => {
  const socketRef = useRef<Socket | null>(null);
  const playersRef = useRef<Player[]>([]);

  const [connected, setConnected] = useState(false);
  const [players, setPlayers] = useState<Player[]>([]);
  const [gameStarted, setGameStarted] = useState(false);
  const [endTime, setEndTime] = useState<number | null>(null);
  const [session, setSession] = useState<Session | null>(null);

  const syncPlayers = useCallback((data: Player[]) => {
    playersRef.current = data;
    setPlayers([...data]);
  }, []);

  const conectar = useCallback(
    (sessionId: string, onRoundFinished?: () => void) => {
      if (socketRef.current?.connected) return;

      const socket = io(`${API_URL}/simulation`, {
        reconnection: true,
        transports: ["websocket"],
      });

      socketRef.current = socket;

      socket.on("connect", () => {
        setConnected(true);
        socket.emit("join_session", {
          sessionId,
          playerId: "ADMIN",
          isAdmin: true,
        });
      });

      socket.on("disconnect", () => setConnected(false));

      // Lista completa — emitida pelo backend após join/kick
      socket.on("session:players_updated", (data: any[]) => {
        syncPlayers((data ?? []).map(normalizePlayer));
      });

      // Novo jogador entrou
      socket.on("player:joined", (player: JoinedPlayerEvent) => {
        const normalized = normalizePlayer(player);
        toast(`🎮 ${normalized.storeName} entrou`);
        const exists = playersRef.current.some((p) => p.id === player.id);
        if (!exists) {
          syncPlayers([...playersRef.current, normalized]);
        }
      });

      // CORRIGIDO: backend emite "player:ready_update", não "player:ready"
      socket.on("player:ready_update", ({ playerId }: { playerId: string }) => {
        syncPlayers(
          playersRef.current.map((p) =>
            p.id === playerId ? { ...p, isReady: true } : p
          )
        );
      });

      socket.on("player:submitted", ({ playerId }: { playerId: string }) => {
        const now = new Date().toLocaleTimeString("pt-BR");
        syncPlayers(
          playersRef.current.map((p) =>
            p.id === playerId ? { ...p, submittedAt: now } : p
          )
        );
      });

      socket.on("player:kicked", ({ playerId }: { playerId: string }) => {
        syncPlayers(playersRef.current.filter((p) => p.id !== playerId));
      });

      socket.on("round:started", (data: any) => {
        setGameStarted(true);
        setEndTime(data.endTime);
        setSession((prev) =>
          prev
            ? { ...prev, currentRound: data.roundNumber, status: "IN_PROGRESS" }
            : prev
        );
        toast.success(`▶ Rodada ${data.roundNumber} iniciada`);
      });

      socket.on("round:stopped", () => {
        setGameStarted(false);
        setEndTime(null);
        toast("🛑 Rodada encerrada");
      });

      socket.on("round:finished", () => {
        setGameStarted(false);
        setEndTime(null);
        onRoundFinished?.();
      });
    },
    [API_URL, syncPlayers]
  );

  const emit = useCallback((event: string, data: object) => {
    socketRef.current?.emit(event, data);
  }, []);

  const disconnect = useCallback(() => {
    socketRef.current?.removeAllListeners();
    socketRef.current?.disconnect();
    socketRef.current = null;
    playersRef.current = [];
    setPlayers([]);
  }, []);

  return {
    connected,
    players,
    setPlayers,
    gameStarted,
    endTime,
    session,
    setSession,
    conectar,
    emit,
    disconnect,
  };
};