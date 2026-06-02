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
    submittedAt: p.submittedAt ?? undefined,
  };
}

export const useAdminSocket = (API_URL: string) => {
  const socketRef = useRef<Socket | null>(null);
  const playersRef = useRef<Player[]>([]);

  const [connected, setConnected] = useState(false);
  const [players, setPlayersState] = useState<Player[]>([]);
  const [gameStarted, setGameStarted] = useState(false);
  const [endTime, setEndTime] = useState<number | null>(null);
  const [session, setSessionState] = useState<Session | null>(null);

  const setPlayers = useCallback(
    (updater: Player[] | ((prev: Player[]) => Player[])) => {
      if (typeof updater === "function") {
        setPlayersState((prev) => {
          const next = updater(prev);
          playersRef.current = next;
          return next;
        });
      } else {
        playersRef.current = updater;
        setPlayersState(updater);
      }
    },
    []
  );

  const setSession = useCallback(
    (s: Session | null | ((prev: Session | null) => Session | null)) => {
      if (typeof s === "function") {
        setSessionState(s);
      } else {
        setSessionState(s);
      }
    },
    []
  );

  const syncPlayers = useCallback((data: Player[]) => {
    playersRef.current = data;
    setPlayersState([...data]);
  }, []);

  const conectar = useCallback(
    (sessionId: string) => {
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

      const handleRoundStateUpdate = (data: any) => {
        if (data.endTime) {
          setGameStarted(true);
          setEndTime(
            typeof data.endTime === "number"
              ? data.endTime
              : new Date(data.endTime).getTime()
          );
        }
      };

      socket.on("round:started", handleRoundStateUpdate);
      socket.on("round:next_started", handleRoundStateUpdate);
      socket.on("round:time_updated", handleRoundStateUpdate);

      socket.on("round:finished", () => {
        setGameStarted(false);
        setEndTime(null);
        toast("⏱️ Rodada finalizada");
      });

      socket.on("session:state", (sessionData: any) => {
        setSessionState(sessionData);
        if (sessionData?.activeRound?.endTime) {
          setEndTime(sessionData.activeRound.endTime);
          setGameStarted(true);
        }
      });

      // ✅ Lista completa de players (snapshot)
      socket.on("session:players_updated", (data: any[]) =>
        syncPlayers((data ?? []).map(normalizePlayer))
      );

      socket.on("player:joined", (p: any) => {
        const n = normalizePlayer(p);
        if (!playersRef.current.find((pl) => pl.id === n.id)) {
          syncPlayers([...playersRef.current, n]);
        }
      });

      // ✅ Atualiza submittedAt do player quando ele submete
      socket.on(
        "player:submitted",
        (data: { playerId: string; roundId: string; submittedAt: string }) => {
          setPlayersState((prev) => {
            const next = prev.map((p) =>
              p.id === data.playerId
                ? { ...p, submittedAt: data.submittedAt }
                : p
            );
            playersRef.current = next;
            return next;
          });
        }
      );

      // ✅ Atualiza isReady quando um player marca ready
      socket.on(
        "player:ready_update",
        (data: { playerId: string; sessionId: string; totalReady: number }) => {
          setPlayersState((prev) => {
            const next = prev.map((p) =>
              p.id === data.playerId ? { ...p, isReady: true } : p
            );
            playersRef.current = next;
            return next;
          });
        }
      );
    },
    [API_URL, syncPlayers]
  );

  const alterarTempoRodada = useCallback(
    (minutes: number, sessionId: string) => {
      socketRef.current?.emit("round:update_time", {
        sessionId,
        minutesDelta: minutes,
      });
    },
    []
  );

  const emit = useCallback((event: string, data: any) => {
    socketRef.current?.emit(event, data);
  }, []);

  const disconnect = useCallback(() => {
    socketRef.current?.disconnect();
    socketRef.current = null;
    setPlayersState([]);
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
    alterarTempoRodada,
  };
};