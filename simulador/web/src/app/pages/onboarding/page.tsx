"use client";

import React, { useState, useEffect, useRef, useCallback } from "react";
import { useRouter } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import {
  Settings2,
  ShoppingCart,
  Users,
  BarChart3,
  CheckCircle2,
  Timer,
  AlertTriangle,
  XCircle,
} from "lucide-react";
import { io, Socket } from "socket.io-client";
import toast, { Toaster } from "react-hot-toast";

import SetupStep from "./components/SetupStep";
import ComercialStep from "./components/ComercialStep";
import SummaryStep from "./components/SummaryStep";
import EmployeeStep from "./components/EmployeeStep";

// ─── Types ─────────────────────────────────────────────

interface CategoriaConfig {
  estoque: number;
  margem: number;
}

interface AppConfig {
  capex: Record<string, number>;
  comercial: {
    pereciveis: CategoriaConfig;
    mercearia: CategoriaConfig;
    eletro: CategoriaConfig;
    hipel: CategoriaConfig;
  };
  operadores: number;
}

interface RoundData {
  roundId: string;
  roundNumber: number;
  duration: number;
  endTime: string;
}

interface PlayerData {
  id: string;
  name: string;
  storeName: string;
  sessionId: string;
  store?: { id: string };
}

// ─── Helpers ───────────────────────────────────────────

function buildStockInputs(config: AppConfig) {
  const map: Record<string, string> = {
    pereciveis: "cat_pereciveis",
    mercearia: "cat_mercearia",
    eletro: "cat_eletro",
    hipel: "cat_hipel",
  };

  return Object.entries(config.comercial).map(([key, val]) => ({
    categoryId: map[key] ?? key,
    buyQty: val.estoque,
  }));
}

function buildCapexSelections(config: AppConfig) {
  return Object.entries(config.capex)
    .filter(([, qty]) => qty > 0)
    .map(([capexId]) => ({ capexId }));
}

// ─── Component ─────────────────────────────────────────

const OnboardingPage = () => {
  const router = useRouter();
  const socketRef = useRef<Socket | null>(null);
  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null);

  const [roundData, setRoundData] = useState<RoundData | null>(null);
  const [playerData, setPlayerData] = useState<PlayerData | null>(null);

  const [timeLeft, setTimeLeft] = useState(0);
  const [timeExpired, setTimeExpired] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [roundStopped, setRoundStopped] = useState(false);
  const [step, setStep] = useState(1);

  const [config, setConfig] = useState<AppConfig>({
    capex: {
      seguranca: 0,
      ti: 0,
      logistica: 0,
      marketing: 0,
    },
    comercial: {
      pereciveis: { estoque: 0, margem: 0 },
      mercearia: { estoque: 0, margem: 0 },
      eletro: { estoque: 0, margem: 0 },
      hipel: { estoque: 0, margem: 0 },
    },
    operadores: 0,
  });

  const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:4000";

  // ─── TIMER ───────────────────────────────────────────
  const startTimer = useCallback((endTime: string) => {
    if (timerRef.current) clearInterval(timerRef.current);

    const tick = () => {
      const diff = Math.max(
        0,
        Math.floor((new Date(endTime).getTime() - Date.now()) / 1000)
      );

      setTimeLeft(diff);

      if (diff <= 0) {
        setTimeExpired(true);
        if (timerRef.current) clearInterval(timerRef.current);
      }
    };

    tick();
    timerRef.current = setInterval(tick, 1000);
  }, []);

  // ─── INIT ────────────────────────────────────────────
  useEffect(() => {
    const savedPlayer = localStorage.getItem("player_data");
    const savedRound = localStorage.getItem("round_data");

    if (!savedPlayer || !savedRound) {
      router.push("/pages/registro-do-usuario");
      return;
    }

    const player: PlayerData = JSON.parse(savedPlayer);
    const round: RoundData = JSON.parse(savedRound);

    setPlayerData(player);
    setRoundData(round);

    startTimer(round.endTime);

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

    socket.on("round:time_up", () => {
      setTimeExpired(true);
      setTimeLeft(0);
      toast.error("⏰ Tempo esgotado!");
    });

    socket.on("round:stopped", () => {
      setRoundStopped(true);
      setTimeExpired(true);
      toast("🛑 Rodada encerrada", { icon: "⚠️" });
    });

    socket.on("session:finished", () => {
      router.push("/pages/resultado");
    });

    socket.on("round:started", (data: RoundData) => {
      localStorage.setItem("round_data", JSON.stringify(data));

      setRoundData(data);

      setSubmitted(false);
      setTimeExpired(false);
      setRoundStopped(false);
      setStep(1);

      setConfig({
        capex: {
          seguranca: 0,
          ti: 0,
          logistica: 0,
          marketing: 0,
        },
        comercial: {
          pereciveis: { estoque: 0, margem: 0 },
          mercearia: { estoque: 0, margem: 0 },
          eletro: { estoque: 0, margem: 0 },
          hipel: { estoque: 0, margem: 0 },
        },
        operadores: 0,
      });

      startTimer(data.endTime);

      toast.success(`🚀 Rodada ${data.roundNumber} iniciada!`);
    });

    socket.on("submit:success", () => {
      setSubmitting(false);
      setSubmitted(true);
      toast.success("Enviado com sucesso!");
    });

    socket.on("submit:error", ({ message }) => {
      setSubmitting(false);
      toast.error(message);
    });

    return () => {
      socket.disconnect();
      if (timerRef.current) clearInterval(timerRef.current);
    };
  }, [router, API_URL, startTimer]);

  // ─── ACTION ─────────────────────────────────────────
  const handleFinalize = () => {
    if (!socketRef.current || !playerData || !roundData) return;
    if (timeExpired || submitted) return;

    setSubmitting(true);

    socketRef.current.emit("player:submit_config", {
      playerId: playerData.id,
      storeId: playerData.store?.id ?? "",
      sessionId: playerData.sessionId,
      roundId: roundData.roundId,
      stockInputs: buildStockInputs(config),
      capexSelections: buildCapexSelections(config),
    });
  };

  const nextStep = () => setStep((p) => Math.min(p + 1, 4));
  const prevStep = () => setStep((p) => Math.max(p - 1, 1));

  const formatTime = (s: number) => {
    const m = Math.floor(s / 60);
    const sec = s % 60;
    return `${String(m).padStart(2, "0")}:${String(sec).padStart(2, "0")}`;
  };

  const timerColor =
    timeLeft <= 60
      ? "text-red-500"
      : timeLeft <= 180
      ? "text-yellow-500"
      : "text-white";

  // ─── UI STATES ──────────────────────────────────────
  if (timeExpired && !submitted) {
    return (
      <div className="min-h-screen bg-[#0B1220] flex items-center justify-center">
        <Toaster />
        <div className="bg-[#1A2235] p-12 rounded-3xl text-center">
          <AlertTriangle className="text-red-500 mx-auto" size={64} />
          <h2 className="text-white font-black text-2xl">Tempo esgotado</h2>
        </div>
      </div>
    );
  }

  if (submitted) {
    return (
      <div className="min-h-screen bg-[#0B1220] flex items-center justify-center">
        <Toaster />
        <div className="bg-[#1A2235] p-12 rounded-3xl text-center">
          <CheckCircle2 className="text-emerald-500 mx-auto" size={64} />
          <h2 className="text-white font-black text-2xl">
            Configuração enviada
          </h2>
          <div className={`font-mono text-3xl ${timerColor}`}>
            {formatTime(timeLeft)}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#F8FAFC] flex flex-col">
      <Toaster />

      <nav className="bg-white border-b px-8 py-5 flex justify-between">
        <h1 className="font-black text-blue-900 uppercase">
          Planejamento Operacional
        </h1>

        <div className={`font-mono font-black ${timerColor}`}>
          {formatTime(timeLeft)}
        </div>
      </nav>

      <main className="flex-1 flex items-center justify-center p-6">
        <div className="w-full max-w-5xl">
          <AnimatePresence mode="wait">
            <motion.div
              key={step}
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
            >
              {step === 1 && <SetupStep config={config} setConfig={setConfig} />}
              {step === 2 && <ComercialStep config={config} setConfig={setConfig} />}
              {step === 3 && <EmployeeStep config={config} setConfig={setConfig} />}
              {step === 4 && <SummaryStep config={config} />}
            </motion.div>
          </AnimatePresence>
        </div>
      </main>

      <footer className="bg-white border-t p-6 flex justify-between">
        <button onClick={prevStep} disabled={step === 1}>
          Voltar
        </button>

        {step < 4 ? (
          <button onClick={nextStep}>Próximo</button>
        ) : (
          <button onClick={handleFinalize} disabled={submitting || timeExpired}>
            Enviar
          </button>
        )}
      </footer>
    </div>
  );
};

export default OnboardingPage;