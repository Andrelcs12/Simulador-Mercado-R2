"use client";

import React, { useState, useEffect, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Trophy,
  Timer,
  User,
  Signal,
  CheckCircle2,
  ArrowRight,
  Activity,
} from "lucide-react";
import { io, Socket } from "socket.io-client";
import { useRouter } from "next/navigation";

interface Player {
  id: string;
  name: string;
  storeName: string;
  sessionId: string;
  isReady?: boolean;
}

interface GameConfig {
  duration: number;
  round: number;
  adminName: string;
}

const LobbyPage = () => {
  const router = useRouter();
  const socketRef = useRef<Socket | null>(null);

  const [players, setPlayers] = useState<Player[]>([]);
  const [isGameStarted, setIsGameStarted] = useState(false);
  const [myPlayerData, setMyPlayerData] = useState<Player | null>(null);
  const [isReady, setIsReady] = useState(false);
  const [roundLabel, setRoundLabel] = useState("");

  const [config, setConfig] = useState<GameConfig>({
    duration: 2700,
    round: 1,
    adminName: "Aguardando Mestre...",
  });

  const [tempoRestante, setTempoRestante] = useState(2700);

  useEffect(() => {
    const savedData = localStorage.getItem("player_data");

    if (!savedData) {
      router.push("/pages/registro-do-usuario");
      return;
    }

    const player: Player = JSON.parse(savedData);
    setMyPlayerData(player);

    const API_URL =
      process.env.NEXT_PUBLIC_API_URL || "http://localhost:4000";

    const socket = io(`${API_URL}/simulation`, {
      reconnection: true,
      reconnectionAttempts: Infinity,
      reconnectionDelay: 1000,
    });

    socketRef.current = socket;

    socket.emit("join_session", {
      sessionId: player.sessionId,
      playerId: player.id,
    });

    // CONFIG (compatível com backend antigo)
    socket.on("simulation:config_update", (newConfig) => {
      setConfig(newConfig);
      setTempoRestante(newConfig.duration);
    });

    // PLAYERS (se existir no backend)
    socket.on("lobby:players_updated", (playersList) => {
      setPlayers(playersList);
    });

    // ROUND START
    // LobbyPage.tsx — corrigir o listener round:started
socket.on("round:started", (data) => {
  localStorage.setItem("round_data", JSON.stringify({
    roundId: data.roundId,        // ← era data.round (undefined)
    roundNumber: data.roundNumber, // ← era data.round
    duration: data.duration,
    endTime: data.endTime,
  }));
  setIsGameStarted(true);
  setRoundLabel(`Rodada ${data.roundNumber} iniciando`);
  setTimeout(() => router.push("/pages/onboarding"), 1800);
});

    // READY UPDATE (INDIVIDUAL)
    socket.on("player:ready_update", (data: any) => {
      setPlayers((prev) =>
        prev.map((p) =>
          p.id === data.playerId ? { ...p, isReady: true } : p
        )
      );
    });

    // ALL READY
    socket.on("session:all_ready", () => {
      setRoundLabel("Todos prontos — aguardando início");
    });

    // LOAD INITIAL STATE
    fetch(`${API_URL}/minigame/session/${player.sessionId}`)
      .then((res) => res.json())
      .then((data) => {
        if (data.players) setPlayers(data.players);

        const me = data.players?.find((p: Player) => p.id === player.id);
        if (me?.isReady) setIsReady(true);

        if (data.adminName) {
          setConfig((prev) => ({
            ...prev,
            adminName: data.adminName,
          }));
        }
      })
      .catch(console.error);

    return () => {
      socket.disconnect();
    };
  }, [router]);

  useEffect(() => {
    if (!isGameStarted) return;

    const interval = setInterval(() => {
      setTempoRestante((t) => Math.max(0, t - 1));
    }, 1000);

    return () => clearInterval(interval);
  }, [isGameStarted]);

  const formatTime = (seconds: number) => {
    const m = Math.floor(seconds / 60);
    const s = seconds % 60;

    return `${m.toString().padStart(2, "0")}:${s
      .toString()
      .padStart(2, "0")}`;
  };

  const handleConfirmReady = () => {
    if (!myPlayerData || !socketRef.current) return;

    socketRef.current.emit("player:ready", {
      sessionId: myPlayerData.sessionId,
      playerId: myPlayerData.id,
    });

    setIsReady(true);
  };

  return (
    <div className="min-h-screen bg-[#F8FAFC] p-4 lg:p-8">
      <AnimatePresence>
        {isGameStarted && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 flex items-center justify-center bg-[#002350]/90"
          >
            <div className="text-center space-y-4">
              <div className="text-7xl">🚀</div>

              <h2 className="text-4xl font-black text-white uppercase italic">
                Prepare-se
              </h2>

              <p className="text-orange-500 font-black uppercase tracking-widest">
                {roundLabel}
              </p>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      <div className="max-w-7xl mx-auto mb-8 flex flex-col lg:flex-row justify-between items-center gap-6">
        <div className="bg-white px-6 py-4 rounded-3xl border border-gray-100 shadow-sm">
          <div className="text-[10px] font-black uppercase tracking-widest text-gray-400">
            Sala
          </div>

          <div className="text-blue-900 font-black text-xl italic">
            #{myPlayerData?.sessionId?.slice(-6).toUpperCase()}
          </div>
        </div>

        <div className="bg-blue-900 text-white px-10 py-5 rounded-[2.5rem] flex items-center gap-5 shadow-2xl border-b-8 border-orange-500">
          <Timer className="text-orange-500" size={36} />

          <div>
            <div className="text-[10px] uppercase tracking-widest opacity-70 font-black">
              {isGameStarted ? "Rodada em andamento" : "Aguardando início"}
            </div>

            <div className="text-5xl font-black font-mono tracking-tighter">
              {formatTime(tempoRestante)}
            </div>
          </div>
        </div>

        <div className="bg-white px-6 py-4 rounded-3xl border border-gray-100 shadow-sm flex items-center gap-4">
          <div className="bg-orange-100 p-3 rounded-2xl">
            <User className="text-orange-500" size={20} />
          </div>

          <div>
            <div className="text-[10px] uppercase tracking-widest font-black text-gray-400">
              Facilitador
            </div>

            <div className="font-black text-blue-900 uppercase italic text-sm">
              {config.adminName}
            </div>
          </div>
        </div>
      </div>

      {/* READY BUTTON */}
      <div className="max-w-7xl mx-auto">
        <div
          className={`mt-10 p-8 rounded-[2.5rem] border-b-8 flex flex-col md:flex-row items-center justify-between gap-6 ${
            isReady
              ? "bg-emerald-500 border-emerald-700"
              : "bg-[#002350] border-orange-500"
          }`}
        >
          <div className="flex items-center gap-5">
            <div className="w-14 h-14 rounded-2xl bg-white flex items-center justify-center">
              {isReady ? (
                <CheckCircle2 className="text-emerald-500" size={30} />
              ) : (
                <Activity className="text-orange-500" size={30} />
              )}
            </div>

            <div>
              <h4 className="font-black text-white text-xl uppercase italic">
                {isReady ? "Pronto para iniciar" : "Aguardando confirmação"}
              </h4>

              <p className="text-white/60 text-[10px] uppercase tracking-widest font-black">
                {isReady
                  ? "Aguardando o mestre iniciar a rodada"
                  : "Confirme sua entrada na rodada"}
              </p>
            </div>
          </div>

          {!isReady && (
            <button
              onClick={handleConfirmReady}
              className="group bg-white text-blue-900 px-10 py-5 rounded-2xl font-black uppercase text-sm flex items-center gap-3 hover:bg-orange-500 hover:text-white transition-all"
            >
              Confirmar Entrada
              <ArrowRight
                size={18}
                className="group-hover:translate-x-1 transition-transform"
              />
            </button>
          )}
        </div>
      </div>
    </div>
  );
};

export default LobbyPage;