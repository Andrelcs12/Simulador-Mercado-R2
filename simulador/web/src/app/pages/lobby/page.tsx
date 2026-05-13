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
  Hash,
  ShieldCheck,
  Wifi,
  WifiOff,
  Users,
} from "lucide-react";
import { io, Socket } from "socket.io-client";
import { useRouter } from "next/navigation";

interface Player {
  id: string;
  name: string;
  storeName: string;
  sessionId: string;
  role?: string;
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
  const [roundLabel, setRoundLabel] = useState("Aguardando rodada");

  const [connected, setConnected] = useState(false);
  const [sessionCode, setSessionCode] = useState("");
  const [tempoRestante, setTempoRestante] = useState(0);
  const [endTime, setEndTime] = useState<number | null>(null);

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

    const API_URL =
      process.env.NEXT_PUBLIC_API_URL || "http://localhost:4000";

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

    socket.on("disconnect", () => {
      setConnected(false);
    });

    // CONFIG
    socket.on("simulation:config_update", (newConfig) => {
      setConfig(newConfig);

      if (newConfig.duration) {
        setTempoRestante(newConfig.duration);
      }
    });

    // PLAYERS UPDATE
    socket.on("lobby:players_updated", (playersList) => {
      setPlayers(playersList);

      const me = playersList.find(
        (p: Player) => p.id === player.id
      );

      if (me?.isReady) {
        setIsReady(true);
      }
    });

    // READY UPDATE
    socket.on("player:ready_update", (data: any) => {
      setPlayers((prev) =>
        prev.map((p) =>
          p.id === data.playerId
            ? { ...p, isReady: true }
            : p
        )
      );
    });

    // ALL READY
    socket.on("session:all_ready", () => {
      setRoundLabel("Todos prontos");
    });

    // ROUND START
    socket.on("round:started", (data) => {
      localStorage.setItem(
        "round_data",
        JSON.stringify({
          roundId: data.roundId,
          roundNumber: data.roundNumber,
          duration: data.duration,
          endTime: data.endTime,
        })
      );

      setEndTime(data.endTime);

      setTempoRestante(data.duration);

      setRoundLabel(`Rodada ${data.roundNumber}`);

      setIsGameStarted(true);

      setTimeout(() => {
        router.push("/pages/onboarding");
      }, 2200);
    });

    // INITIAL LOAD
    fetch(`${API_URL}/minigame/session/${player.sessionId}`)
      .then((res) => res.json())
      .then((data) => {
        if (data.players) {
          setPlayers(data.players);
        }

        if (data.code) {
          setSessionCode(data.code);
        }

        if (data.adminName) {
          setConfig((prev) => ({
            ...prev,
            adminName: data.adminName,
          }));
        }

        if (data.currentRound) {
          setRoundLabel(
            `Rodada ${data.currentRound}`
          );
        }

        const me = data.players?.find(
          (p: Player) => p.id === player.id
        );

        if (me?.isReady) {
          setIsReady(true);
        }
      })
      .catch(console.error);

    return () => {
      socket.disconnect();
    };
  }, [router]);

  // TIMER
  useEffect(() => {
    if (!isGameStarted || !endTime) return;

    const interval = setInterval(() => {
      const diff = Math.max(
        0,
        Math.floor((endTime - Date.now()) / 1000)
      );

      setTempoRestante(diff);

      if (diff <= 0) {
        clearInterval(interval);
      }
    }, 1000);

    return () => clearInterval(interval);
  }, [isGameStarted, endTime]);

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
    <div className="min-h-screen bg-[#F4F7FB] relative overflow-hidden">
      {/* BG */}
      <div className="absolute inset-0 opacity-[0.03] pointer-events-none">
        <div
          className="w-full h-full"
          style={{
            backgroundImage:
              "radial-gradient(#001F3F 1px, transparent 1px)",
            backgroundSize: "28px 28px",
          }}
        />
      </div>

      {/* ROUND START */}
      <AnimatePresence>
        {isGameStarted && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 flex items-center justify-center bg-[#001B36]/90 backdrop-blur-md"
          >
            <motion.div
              initial={{ scale: 0.8, y: 30 }}
              animate={{ scale: 1, y: 0 }}
              className="text-center"
            >
              <div className="text-8xl mb-6">🚀</div>

              <h2 className="text-5xl font-black uppercase italic text-white tracking-tight">
                Rodada Iniciada
              </h2>

              <p className="text-orange-500 font-black uppercase tracking-[0.4em] mt-4">
                {roundLabel}
              </p>

              <div className="mt-10 flex justify-center">
                <div className="bg-white/10 border border-white/10 px-10 py-5 rounded-3xl">
                  <div className="text-xs uppercase tracking-widest text-white/50 font-black mb-2">
                    Tempo disponível
                  </div>

                  <div className="text-6xl font-black text-white font-mono">
                    {formatTime(tempoRestante)}
                  </div>
                </div>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      <div className="relative z-10 max-w-7xl mx-auto px-4 lg:px-8 py-8">
        {/* HEADER */}
        <div className="flex flex-col xl:flex-row justify-between gap-6 mb-8">
          {/* ROOM */}
          <div className="bg-white rounded-[2.5rem] p-8 border border-slate-100 shadow-sm flex-1">
            <div className="flex items-center justify-between">
              <div>
                <div className="text-[11px] uppercase tracking-[0.3em] text-slate-400 font-black mb-3">
                  Código da Sala
                </div>

                <div className="text-6xl font-black tracking-[0.25em] text-[#001F3F]">
                  {sessionCode || "----"}
                </div>

                <div className="mt-4 text-sm text-slate-500 font-medium">
                  Compartilhe este código com os participantes
                </div>
              </div>

              <div className="hidden lg:flex w-24 h-24 rounded-[2rem] bg-orange-500 items-center justify-center">
                <Hash className="text-white" size={42} />
              </div>
            </div>
          </div>

          {/* TIMER */}
          <div className="bg-[#001F3F] min-w-[340px] rounded-[2.5rem] px-10 py-8 border-b-[10px] border-orange-500 shadow-2xl flex items-center justify-between">
            <div className="flex items-center gap-5">
              <div className="w-16 h-16 rounded-3xl bg-white/10 flex items-center justify-center">
                <Timer className="text-orange-500" size={34} />
              </div>

              <div>
                <div className="text-[10px] uppercase tracking-[0.3em] text-white/50 font-black mb-2">
                  {isGameStarted
                    ? "Rodada em andamento"
                    : "Aguardando início"}
                </div>

                <div className="text-6xl font-black text-white font-mono tracking-tighter">
                  {formatTime(tempoRestante)}
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* INFO GRID */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-8">
          {/* PLAYER */}
          <div className="bg-white rounded-[2rem] p-6 border border-slate-100 shadow-sm">
            <div className="flex items-center gap-4 mb-5">
              <div className="w-14 h-14 rounded-2xl bg-orange-100 flex items-center justify-center">
                <User className="text-orange-500" size={28} />
              </div>

              <div>
                <div className="text-[10px] uppercase tracking-widest text-slate-400 font-black">
                  Participante
                </div>

                <div className="text-xl font-black text-[#001F3F] uppercase italic">
                  {myPlayerData?.name}
                </div>
              </div>
            </div>

            <div className="space-y-3">
              <div className="bg-slate-50 rounded-2xl p-4">
                <div className="text-[10px] uppercase font-black tracking-widest text-slate-400 mb-1">
                  Loja
                </div>

                <div className="font-black text-[#001F3F]">
                  {myPlayerData?.storeName}
                </div>
              </div>

              <div className="bg-slate-50 rounded-2xl p-4">
                <div className="text-[10px] uppercase font-black tracking-widest text-slate-400 mb-1">
                  Cargo
                </div>

                <div className="font-black text-[#001F3F]">
                  {myPlayerData?.role || "Participante"}
                </div>
              </div>
            </div>
          </div>

          {/* FACILITATOR */}
          <div className="bg-white rounded-[2rem] p-6 border border-slate-100 shadow-sm">
            <div className="flex items-center gap-4 mb-5">
              <div className="w-14 h-14 rounded-2xl bg-blue-100 flex items-center justify-center">
                <ShieldCheck
                  className="text-[#001F3F]"
                  size={28}
                />
              </div>

              <div>
                <div className="text-[10px] uppercase tracking-widest text-slate-400 font-black">
                  Facilitador
                </div>

                <div className="text-xl font-black text-[#001F3F] uppercase italic">
                  {config.adminName}
                </div>
              </div>
            </div>

            <div className="bg-[#001F3F] rounded-2xl p-5 text-white">
              <div className="text-[10px] uppercase tracking-widest font-black text-white/50 mb-2">
                Status da Sessão
              </div>

              <div className="flex items-center gap-3">
                <div
                  className={`w-3 h-3 rounded-full animate-pulse ${
                    connected
                      ? "bg-emerald-400"
                      : "bg-red-400"
                  }`}
                />

                <div className="font-black uppercase">
                  {connected
                    ? "Conectado"
                    : "Reconectando"}
                </div>
              </div>
            </div>
          </div>

          {/* ROUND */}
          <div className="bg-white rounded-[2rem] p-6 border border-slate-100 shadow-sm">
            <div className="text-[10px] uppercase tracking-widest text-slate-400 font-black mb-5">
              Informações da Rodada
            </div>

            <div className="space-y-4">
              <div className="bg-orange-50 rounded-2xl p-4 border border-orange-100">
                <div className="text-[10px] uppercase tracking-widest text-orange-500 font-black mb-1">
                  Rodada Atual
                </div>

                <div className="text-3xl font-black text-orange-500">
                  {roundLabel}
                </div>
              </div>

              <div className="bg-slate-50 rounded-2xl p-4">
                <div className="text-[10px] uppercase tracking-widest text-slate-400 font-black mb-1">
                  Seu Status
                </div>

                <div
                  className={`font-black uppercase ${
                    isReady
                      ? "text-emerald-500"
                      : "text-orange-500"
                  }`}
                >
                  {isReady
                    ? "Pronto para jogar"
                    : "Aguardando confirmação"}
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* METRICS */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <div className="bg-white rounded-[2rem] p-6 border border-slate-100 shadow-sm">
            <div className="flex items-center gap-4">
              <div className="w-14 h-14 rounded-2xl bg-emerald-100 flex items-center justify-center">
                <Users
                  className="text-emerald-500"
                  size={28}
                />
              </div>

              <div>
                <div className="text-[10px] uppercase tracking-widest text-slate-400 font-black">
                  Jogadores
                </div>

                <div className="text-3xl font-black text-[#001F3F]">
                  {players.length}
                </div>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-[2rem] p-6 border border-slate-100 shadow-sm">
            <div className="flex items-center gap-4">
              <div className="w-14 h-14 rounded-2xl bg-orange-100 flex items-center justify-center">
                <CheckCircle2
                  className="text-orange-500"
                  size={28}
                />
              </div>

              <div>
                <div className="text-[10px] uppercase tracking-widest text-slate-400 font-black">
                  Confirmados
                </div>

                <div className="text-3xl font-black text-[#001F3F]">
                  {
                    players.filter((p) => p.isReady)
                      .length
                  }
                </div>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-[2rem] p-6 border border-slate-100 shadow-sm">
            <div className="flex items-center gap-4">
              <div
                className={`w-14 h-14 rounded-2xl flex items-center justify-center ${
                  connected
                    ? "bg-emerald-100"
                    : "bg-red-100"
                }`}
              >
                {connected ? (
                  <Wifi
                    className="text-emerald-500"
                    size={28}
                  />
                ) : (
                  <WifiOff
                    className="text-red-500"
                    size={28}
                  />
                )}
              </div>

              <div>
                <div className="text-[10px] uppercase tracking-widest text-slate-400 font-black">
                  Conexão
                </div>

                <div
                  className={`text-xl font-black uppercase ${
                    connected
                      ? "text-emerald-500"
                      : "text-red-500"
                  }`}
                >
                  {connected ? "ONLINE" : "OFFLINE"}
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* READY AREA */}
        <div
          className={`rounded-[2.8rem] border-b-[10px] p-8 lg:p-10 transition-all ${
            isReady
              ? "bg-emerald-500 border-emerald-700"
              : "bg-[#001F3F] border-orange-500"
          }`}
        >
          <div className="flex flex-col xl:flex-row items-center justify-between gap-8">
            <div className="flex items-center gap-6">
              <div className="w-20 h-20 rounded-[2rem] bg-white flex items-center justify-center shadow-xl">
                {isReady ? (
                  <CheckCircle2
                    className="text-emerald-500"
                    size={42}
                  />
                ) : (
                  <Activity
                    className="text-orange-500"
                    size={42}
                  />
                )}
              </div>

              <div>
                <h3 className="text-3xl font-black uppercase italic text-white mb-2">
                  {isReady
                    ? "Pronto para iniciar"
                    : "Confirmar participação"}
                </h3>

                <p className="text-white/60 uppercase tracking-[0.2em] text-xs font-black">
                  {isReady
                    ? "Aguardando o facilitador iniciar a rodada"
                    : "Clique abaixo para entrar oficialmente"}
                </p>
              </div>
            </div>

            {!isReady ? (
              <button
                onClick={handleConfirmReady}
                className="group bg-white text-[#001F3F] hover:bg-orange-500 hover:text-white transition-all px-12 py-6 rounded-[2rem] font-black uppercase flex items-center gap-4 shadow-2xl"
              >
                Confirmar Entrada

                <ArrowRight
                  size={22}
                  className="group-hover:translate-x-1 transition-transform"
                />
              </button>
            ) : (
              <div className="bg-white/10 border border-white/10 px-8 py-5 rounded-3xl">
                <div className="text-white font-black uppercase text-sm tracking-widest">
                  Entrada confirmada
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default LobbyPage;