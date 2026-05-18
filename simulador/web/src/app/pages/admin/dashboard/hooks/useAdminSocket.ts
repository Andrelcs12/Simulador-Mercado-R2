import { useCallback, useRef, useState } from "react";
import { io, Socket } from "socket.io-client";
import toast from "react-hot-toast";
import { Player, Session } from "../types";

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

  const conectar = useCallback((sessionId: string) => {
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

      socket.emit("session:get_state", { sessionId });
    });

    socket.on("disconnect", () => setConnected(false));

    // =========================
    // PLAYERS
    // =========================
    socket.on("session:players_updated", (data: any[]) => {
      syncPlayers((data ?? []).map(normalizePlayer));
    });

    socket.on("player:joined", (player: any) => {
      const normalized = normalizePlayer(player);

      if (!playersRef.current.find((p) => p.id === normalized.id)) {
        syncPlayers([...playersRef.current, normalized]);
      }

      toast(`🎮 ${normalized.storeName} entrou`);
    });

    socket.on("player:ready_update", ({ playerId }) => {
      syncPlayers(
        playersRef.current.map((p) =>
          p.id === playerId ? { ...p, isReady: true } : p
        )
      );
    });

    socket.on("player:submitted", ({ playerId }) => {
      syncPlayers(
        playersRef.current.map((p) =>
          p.id === playerId
            ? {
                ...p,
                submittedAt: new Date().toLocaleTimeString("pt-BR"),
              }
            : p
        )
      );
    });

    socket.on("player:kicked", ({ playerId }) => {
      syncPlayers(playersRef.current.filter((p) => p.id !== playerId));
    });

    // =========================
    // ROUND START (UNIFICADO)
    // =========================
    const handleRoundStart = (data: any) => {
      setGameStarted(true);
      setEndTime(data.endTime);

      setSession((prev) =>
        prev
          ? {
              ...prev,
              currentRound: data.roundNumber,
              status: "IN_PROGRESS",
            }
          : prev
      );

      toast.success(`▶ Rodada ${data.roundNumber} iniciada`);
    };

    socket.on("round:started", handleRoundStart);
    socket.on("round:next_started", handleRoundStart);

    // =========================
    // ROUND END (UNIFICADO)
    // =========================
    const handleRoundEnd = () => {
      setGameStarted(false);
      setEndTime(null);
    };

    socket.on("round:finished", handleRoundEnd);
    socket.on("round:stopped", handleRoundEnd);

    // =========================
    // SESSION STATE (UNIFICADO)
    // =========================
    socket.on("session:state", (sessionData: any) => {
      const session = sessionData?.activeRound
        ? {
            ...sessionData,
            rounds: sessionData.rounds,
          }
        : sessionData;

      setSession(session);
    });
  }, [API_URL, syncPlayers]);

  const emit = useCallback((event: string, data: any) => {
    socketRef.current?.emit(event, data);
  }, []);

  const disconnect = useCallback(() => {
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