import { useCallback, useEffect, useRef, useState } from "react";
import { io, Socket } from "socket.io-client";
import { useRouter } from "next/navigation";
import { Player, GameConfig } from "../types";

interface UseLobbySocketReturn {
  connected: boolean;
  players: Player[];
  isReady: boolean;
  isGameStarted: boolean;
  tempoRestante: number;
  endTime: number | null;
  roundLabel: string;
  sessionCode: string;
  config: GameConfig;
  myPlayerData: Player | null;
  confirmarPronto: () => void;
}

export const useLobbySocket = (API_URL: string): UseLobbySocketReturn => {
  const router = useRouter();
  const socketRef = useRef<Socket | null>(null);

  const [connected, setConnected] = useState(false);
  const [players, setPlayers] = useState<Player[]>([]);
  const [isReady, setIsReady] = useState(false);
  const [isGameStarted, setIsGameStarted] = useState(false);
  const [tempoRestante, setTempoRestante] = useState(0);
  const [endTime, setEndTime] = useState<number | null>(null);
  const [roundLabel, setRoundLabel] = useState("Aguardando rodada");
  const [sessionCode, setSessionCode] = useState("");
  const [myPlayerData, setMyPlayerData] = useState<Player | null>(null);

  const [config, setConfig] = useState<GameConfig>({
    duration: 2700,
    round: 1,
    adminName: "Aguardando Mestre...",
  });

  useEffect(() => {
    const savedData = localStorage.getItem("player_data");

    if (!savedData) {
      router.push("/pages/registro-do-usuario");
      return;
    }

    const player: Player = JSON.parse(savedData);
    setMyPlayerData(player);

    const socket = io(`${API_URL}/simulation`, {
      reconnection: true,
      reconnectionAttempts: Infinity,
      reconnectionDelay: 1000,
    });

    socketRef.current = socket;

    // =========================
    // CONNECT
    // =========================
    socket.on("connect", () => {
      setConnected(true);

      socket.emit("join_session", {
        sessionId: player.sessionId,
        playerId: player.id,
      });
    });

    socket.on("disconnect", () => {
      setConnected(false);
    });

    // =========================
    // JOIN ERRORS / INVALID STATE
    // =========================
    const forceExit = () => {
      localStorage.removeItem("player_data");
      router.push("/pages/registro-do-usuario");
    };

    socket.on("join:error", forceExit);

    socket.on("session:finished", forceExit);

    // =========================
    // SESSION JOINED
    // =========================
    socket.on("session:joined", (data: any) => {
      if (data?.success === false) {
        forceExit();
      }
    });

    // =========================
    // PLAYERS UPDATE
    // =========================
    socket.on("session:players_updated", (list: Player[]) => {
      setPlayers(list);

      const me = list.find((p) => p.id === player.id);

      if (!me) {
        forceExit();
        return;
      }

      if (me.isReady) setIsReady(true);
    });

    socket.on("player:joined", (newPlayer: Player) => {
      setPlayers((prev) =>
        prev.some((p) => p.id === newPlayer.id)
          ? prev
          : [...prev, newPlayer]
      );
    });

    socket.on("player:ready_update", (data: { playerId: string }) => {
      setPlayers((prev) =>
        prev.map((p) =>
          p.id === data.playerId ? { ...p, isReady: true } : p
        )
      );
    });

    // =========================
    // ROUND START
    // =========================
    socket.on("round:started", (data: any) => {
      setEndTime(data.endTime);
      setTempoRestante(data.duration);
      setRoundLabel(`Rodada ${data.roundNumber}`);
      setIsGameStarted(true);

      setTimeout(() => {
        router.push("/pages/onboarding");
      }, 2200);
    });

    // =========================
    // HTTP INIT
    // =========================
    fetch(`${API_URL}/minigame/session/${player.sessionId}`)
      .then((r) => r.json())
      .then((data) => {
        if (!data || data.error) {
          forceExit();
          return;
        }

        if (data.players) setPlayers(data.players);
        if (data.code) setSessionCode(data.code);

        if (data.adminName) {
          setConfig((prev) => ({
            ...prev,
            adminName: data.adminName,
          }));
        }

        if (data.currentRound) {
          setRoundLabel(`Rodada ${data.currentRound}`);
        }

        const me = data.players?.find(
          (p: Player) => p.id === player.id
        );

        if (!me) {
          forceExit();
          return;
        }

        if (me.isReady) setIsReady(true);
      })
      .catch(forceExit);

    // =========================
    // CLEANUP CORRETO
    // =========================
    return () => {
      socket.removeAllListeners();
      socket.disconnect();
    };
  }, [API_URL, router]);

  // =========================
  // READY ACTION
  // =========================
  const confirmarPronto = useCallback(() => {
    if (!myPlayerData || !socketRef.current) return;

    socketRef.current.emit("player:ready", {
      sessionId: myPlayerData.sessionId,
      playerId: myPlayerData.id,
    });

    setIsReady(true);
  }, [myPlayerData]);

  return {
    connected,
    players,
    isReady,
    isGameStarted,
    tempoRestante,
    endTime,
    roundLabel,
    sessionCode,
    config,
    myPlayerData,
    confirmarPronto,
  };
};