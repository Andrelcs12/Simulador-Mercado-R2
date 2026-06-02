"use client";

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
  isMounted: boolean; // Retornado para ajudar a evitar erros de hidratação na tela
}

export const useLobbySocket = (API_URL: string): UseLobbySocketReturn => {
  const router = useRouter();
  const socketRef = useRef<Socket | null>(null);

  const [isMounted, setIsMounted] = useState(false);
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
    setIsMounted(true); // Indica que o código agora roda 100% no cliente

    const savedData = typeof window !== "undefined" ? localStorage.getItem("player_data") : null;
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

    socket.on("connect", () => {
      setConnected(true);
      socket.emit("join_session", {
        sessionId: player.sessionId,
        playerId: player.id,
      });
    });

    socket.on("disconnect", () => setConnected(false));

    socket.on("simulation:config_update", (newConfig: GameConfig) => {
      setConfig(newConfig);
      if (newConfig.duration) setTempoRestante(newConfig.duration);
    });

    const normalize = (p: any): Player => ({
      ...p,
      storeName: p.storeName ?? p.store?.name ?? "Sem loja",
    });

    socket.on("session:players_updated", (list: any[]) => {
      const normalized = (list ?? []).map(normalize);
      setPlayers(normalized);
      const me = normalized.find((p) => p.id === player.id);
      if (me?.isReady) setIsReady(true);
    });

    socket.on("player:joined", (newPlayer: any) => {
      const normalized = normalize(newPlayer);
      setPlayers((prev) =>
        prev.some((p) => p.id === normalized.id) ? prev : [...prev, normalized]
      );
    });

    socket.on("player:ready_update", (data: { playerId: string }) => {
      setPlayers((prev) =>
        prev.map((p) => (p.id === data.playerId ? { ...p, isReady: true } : p))
      );
    });

    socket.on("session:all_ready", () => setRoundLabel("Todos prontos"));

    // CORREÇÃO: Usando localStorage e Evento para comunicar com o Contexto
    socket.on("round:started", (data: any) => {
      if (data.maxStock) {
        localStorage.setItem("round_config_max_stock", JSON.stringify(data.maxStock));
        window.dispatchEvent(new Event("round_config_max_stock_updated"));
      }

      localStorage.setItem(
        "round_data",
        JSON.stringify({
          roundId: data.roundId,
          roundNumber: data.roundNumber,
          duration: data.duration,
          endTime: data.endTime,
          maxStock: data.maxStock,
        })
      );
      
      setEndTime(data.endTime);
      setTempoRestante(data.duration);
      setRoundLabel(`Rodada ${data.roundNumber}`);
      setIsGameStarted(true);
      setTimeout(() => router.push("/pages/onboarding"), 2200);
    });


    // Carga HTTP inicial
fetch(`${API_URL}/minigame/session/${player.sessionId}`)
  .then((r) => {
    if (!r.ok) throw new Error("Erro na requisição da sessão");
    return r.json();
  })
  .then((data) => {
    if (!data) return;

    if (data.players && Array.isArray(data.players)) {
      const normalizedPlayers = data.players.map(normalize);

      setPlayers(normalizedPlayers);

      const me = normalizedPlayers.find(
        (p: Player) => p.id === player.id
      );

      if (me?.isReady) setIsReady(true);
    }

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
  })
  .catch((err) =>
    console.error("Erro ao buscar sessão inicial:", err)
  );

    return () => {
      socket.disconnect();
    };
  }, [API_URL, router]);

  useEffect(() => {
    if (!isGameStarted || !endTime) return;
    const id = setInterval(() => {
      const diff = Math.max(0, Math.floor((endTime - Date.now()) / 1000));
      setTempoRestante(diff);
      if (diff <= 0) clearInterval(id);
    }, 1000);
    return () => clearInterval(id);
  }, [isGameStarted, endTime]);

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
    isMounted,
  };
};