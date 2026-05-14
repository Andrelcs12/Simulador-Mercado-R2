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
};

export const useAdminSocket = (API_URL: string) => {
  const socketRef = useRef<Socket | null>(null);
  const playersRef = useRef<Player[]>([]);

  const [connected, setConnected] = useState(false);
  const [players, setPlayers] = useState<Player[]>([]);
  const [gameStarted, setGameStarted] = useState(false);
  const [endTime, setEndTime] = useState<number | null>(null);
  const [session, setSession] = useState<Session | null>(null);

  const syncPlayers = (data: Player[]) => {
    playersRef.current = data;
    setPlayers(data);
  };

  const conectar = useCallback(
    (sessionId: string, onRoundFinished?: () => void) => {
      if (socketRef.current?.connected) return;

      const socket = io(`${API_URL}/simulation`, {
        reconnection: true,
        transports: ["websocket"],
      });

      socketRef.current = socket;

      // CONNECT
      socket.on("connect", () => {
        setConnected(true);

        socket.emit("join_session", {
          sessionId,
          playerId: "ADMIN",
          isAdmin: true,
        });
      });

      socket.on("disconnect", () => {
        setConnected(false);
      });

      // SNAPSHOT
      socket.on("session:players_updated", (data: Player[]) => {
        syncPlayers(data || []);
      });

      // PLAYER JOINED
      socket.on("player:joined", (player: JoinedPlayerEvent) => {
        const storeName = player.storeName ?? "Loja não definida";

        toast(`🎮 ${storeName} entrou na sala`);

        const exists = playersRef.current.some((p) => p.id === player.id);

        if (!exists) {
          const newPlayer: Player = {
            id: player.id,
            name: player.name,
            storeName,
          };

          syncPlayers([...playersRef.current, newPlayer]);
        }
      });

      // SUBMIT
      socket.on("player:submitted", ({ playerId }: { playerId: string }) => {
        const now = new Date().toISOString();

        const updated = playersRef.current.map((p) =>
          p.id === playerId ? { ...p, submittedAt: now } : p
        );

        syncPlayers(updated);
      });

      // KICK
      socket.on("player:kicked", ({ playerId }: { playerId: string }) => {
        syncPlayers(playersRef.current.filter((p) => p.id !== playerId));
      });

      // ROUND START
      socket.on("round:started", (data: any) => {
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
      });

      // ROUND STOP
      socket.on("round:stopped", () => {
        setGameStarted(false);
        setEndTime(null);

        toast("🛑 Rodada encerrada");
      });

      // ROUND FINISHED
      socket.on("round:finished", () => {
        setGameStarted(false);
        setEndTime(null);

        onRoundFinished?.();
      });
    },
    [API_URL]
  );

  const emit = useCallback((event: string, data: object) => {
    socketRef.current?.emit(event, data);
  }, []);

  const disconnect = useCallback(() => {
    socketRef.current?.disconnect();
    socketRef.current = null;

    playersRef.current = [];
    setPlayers([]);
    setConnected(false);
    setGameStarted(false);
    setEndTime(null);
    setSession(null);
  }, []);

  return {
    socketRef,
    connected,
    players,
    setPlayers,
    gameStarted,
    setGameStarted,
    endTime,
    setEndTime,
    session,
    setSession,
    conectar,
    emit,
    disconnect,
  };
};