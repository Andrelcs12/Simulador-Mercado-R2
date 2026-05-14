"use client";

import React, { useState, useEffect, useRef, useCallback } from "react";
import { useRouter } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import { io, Socket } from "socket.io-client";
import toast, { Toaster } from "react-hot-toast";
import SetupStep from "./components/SetupStep";
import ComercialStep from "./components/ComercialStep";
import SummaryStep from "./components/SummaryStep";
import EmployeeStep from "./components/EmployeeStep";

// ─────────────────────────────────────────────
// TIPOS
// ─────────────────────────────────────────────
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

// endTime vem como número (ms epoch) do backend
interface RoundData {
  roundId: string;
  roundNumber: number;
  duration: number;
  endTime: number | null; // timestamp em ms
}

interface PlayerData {
  id: string;
  name: string;
  storeName: string;
  sessionId: string;
  store?: { id: string };
}

// ─────────────────────────────────────────────
// HELPERS
// ─────────────────────────────────────────────
const CATEGORY_MAP: Record<string, string> = {
  pereciveis: "cat_pereciveis",
  mercearia: "cat_mercearia",
  eletro: "cat_electro",
  hipel: "cat_hipel",
};

function buildStockInputs(config: AppConfig) {
  return Object.entries(config.comercial).map(([key, val]) => ({
    categoryId: CATEGORY_MAP[key],
    buyQty: val.estoque,
  }));
}

function buildCapexSelections(config: AppConfig) {
  return Object.entries(config.capex)
    .filter(([, qty]) => qty > 0)
    .map(([capexId]) => ({ capexId }));
}

function formatTime(seconds: number): string {
  const m = Math.floor(seconds / 60);
  const s = seconds % 60;
  return `${String(m).padStart(2, "0")}:${String(s).padStart(2, "0")}`;
}

// ─────────────────────────────────────────────
// COMPONENTE
// ─────────────────────────────────────────────
const STEP_LABELS = ["Configuração", "Comercial", "Operadores", "Resumo"];

export default function OnboardingPage() {
  const router = useRouter();
  const socketRef = useRef<Socket | null>(null);
  const timerRef = useRef<NodeJS.Timeout | null>(null);

  const [player, setPlayer] = useState<PlayerData | null>(null);
  const [round, setRound] = useState<RoundData | null>(null);
  const [timeLeft, setTimeLeft] = useState(0);
  const [submitted, setSubmitted] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [timeUp, setTimeUp] = useState(false);
  const [step, setStep] = useState(1);

  const [config, setConfig] = useState<AppConfig>({
    capex: { seguranca: 0, ti: 0, logistica: 0, marketing: 0 },
    comercial: {
      pereciveis: { estoque: 0, margem: 0 },
      mercearia: { estoque: 0, margem: 0 },
      eletro: { estoque: 0, margem: 0 },
      hipel: { estoque: 0, margem: 0 },
    },
    operadores: 0,
  });

  const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:4000";

  // ── Timer: recebe timestamp numérico em ms ────────────────
  const startTimer = useCallback((endTimeMs: number) => {
    if (timerRef.current) clearInterval(timerRef.current);

    const tick = () => {
      const diff = Math.max(0, Math.floor((endTimeMs - Date.now()) / 1000));
      setTimeLeft(diff);
      if (diff <= 0) {
        clearInterval(timerRef.current!);
        setTimeUp(true);
      }
    };

    tick(); // imediato
    timerRef.current = setInterval(tick, 1000);
  }, []);

  // ── Socket + carga ────────────────────────────────────────
  useEffect(() => {
    const savedPlayer = localStorage.getItem("player_data");
    if (!savedPlayer) {
      router.push("/pages/registro-do-usuario");
      return;
    }

    const p: PlayerData = JSON.parse(savedPlayer);
    setPlayer(p);

    // Tenta restaurar dados da rodada do localStorage
    const savedRound = localStorage.getItem("round_data");
    if (savedRound) {
      const r: RoundData = JSON.parse(savedRound);
      setRound(r);
      if (r.endTime) startTimer(r.endTime);
    }

    const socket = io(`${API_URL}/simulation`, {
      reconnection: true,
      reconnectionDelay: 1000,
    });
    socketRef.current = socket;

    socket.on("connect", () => {
      socket.emit("join_session", {
        sessionId: p.sessionId,
        playerId: p.id,
      });
      // Pede estado atual da sessão para sincronizar
      socket.emit("session:get_state", { sessionId: p.sessionId });
    });

    // ── round:started — nova rodada: reseta estado e garante que está no onboarding ──
    socket.on("round:started", (data: any) => {
      const endTimeMs: number =
        typeof data.endTime === "number"
          ? data.endTime
          : new Date(data.endTime).getTime();

      const normalized: RoundData = {
        roundId: data.roundId,
        roundNumber: data.roundNumber,
        duration: data.duration,
        endTime: endTimeMs,
      };

      localStorage.setItem("round_data", JSON.stringify(normalized));

      // Reseta estado para nova rodada
      setRound(normalized);
      setSubmitted(false);
      setSubmitting(false);
      setTimeUp(false);
      setStep(1);
      setConfig({
        capex: { seguranca: 0, ti: 0, logistica: 0, marketing: 0 },
        comercial: {
          pereciveis: { estoque: 0, margem: 0 },
          mercearia: { estoque: 0, margem: 0 },
          eletro: { estoque: 0, margem: 0 },
          hipel: { estoque: 0, margem: 0 },
        },
        operadores: 0,
      });
      startTimer(endTimeMs);
      toast.success(`▶ Rodada ${normalized.roundNumber} iniciada!`);

      // Se o player não está no onboarding (estava no dashboard/processing),
      // redireciona de volta para cá
      // O router.push é seguro mesmo se já estiver na página — Next.js não recarrega
      router.push("/pages/onboarding");
    });

    // ── session:state — sincroniza rodada ativa + endTime para reiniciar timer ──
    socket.on("session:state", (session: any) => {
      if (!session) return;

      // Extrai rodada OPEN do array rounds (getSessionById inclui rounds)
      const activeRound = Array.isArray(session.rounds)
        ? session.rounds.find((r: any) => r.status === "OPEN")
        : null;

      // endsAt vem como string ISO do Prisma
      const endsAtMs = activeRound?.endsAt
        ? new Date(activeRound.endsAt).getTime()
        : null;

      setRound((prev) => ({
        roundId: activeRound?.id ?? prev?.roundId ?? "",
        roundNumber: session.currentRound ?? prev?.roundNumber ?? 0,
        duration: activeRound
          ? Math.round((new Date(activeRound.endsAt).getTime() - new Date(activeRound.startsAt).getTime()) / 1000)
          : prev?.duration ?? 0,
        endTime: endsAtMs ?? prev?.endTime ?? null,
      }));

      // Reinicia o timer se a rodada ainda está ativa
      if (endsAtMs && endsAtMs > Date.now()) {
        startTimer(endsAtMs);
      }
    });

    socket.on("round:time_up", () => {
      setTimeUp(true);
      setTimeLeft(0);
      if (timerRef.current) clearInterval(timerRef.current);
      toast.error("⏱ Tempo esgotado");
    });

    socket.on("round:stopped", () => {
      setTimeUp(true);
      setSubmitting(false);
      toast("Rodada encerrada pelo facilitador", { icon: "⚠️" });
    });

    socket.on("round:finished", () => {
      setSubmitting(false);
      if (timerRef.current) clearInterval(timerRef.current);
      // Rodada encerrada pelo admin (time up ou force stop) sem o player ter enviado
      // Vai pro processing que mostra o loading e depois redireciona pro dashboard
      router.replace("/pages/onboarding/processing");
    });

    socket.on("submit:success", () => {
      setSubmitted(true);
      setSubmitting(false);
      toast.success("✅ Configuração enviada!");
      // Após enviar, vai pro processing (loading + cálculos)
      setTimeout(() => {
        router.push("/pages/onboarding/processing");
      }, 800);
    });

    socket.on("submit:error", ({ message }: { message: string }) => {
      setSubmitting(false);
      toast.error(message || "Erro ao enviar");
    });

    return () => {
      socket.disconnect();
      if (timerRef.current) clearInterval(timerRef.current);
    };
  }, [API_URL, router, startTimer]);

  // ── Submit via socket (player:submit_config) ──────────────
  const handleFinalize = () => {
    if (!socketRef.current || !player || !round) return;
    if (submitted || timeUp || submitting) return;

    setSubmitting(true);

    socketRef.current.emit("player:submit_config", {
      playerId: player.id,
      storeId: player.store?.id,
      sessionId: player.sessionId,
      roundId: round.roundId,
      stockInputs: buildStockInputs(config),
      capexSelections: buildCapexSelections(config),
    });
  };

  // ── Progresso do timer ────────────────────────────────────
  const progressPercent =
    round?.duration && round.duration > 0
      ? (timeLeft / round.duration) * 100
      : 0;

  const timerColor =
    timeLeft > 120 ? "text-emerald-400" : timeLeft > 30 ? "text-yellow-400" : "text-red-400";

  // ─────────────────────────────────────────────
  // RENDER
  // ─────────────────────────────────────────────
  return (
    <div className="min-h-screen bg-[#0B1220] text-white flex flex-col">
      <Toaster
        position="top-right"
        toastOptions={{
          style: { background: "#1A2235", color: "#fff", border: "1px solid rgba(255,255,255,0.08)" },
        }}
      />

      {/* ── HEADER ── */}
      <header className="sticky top-0 z-30 bg-[#0B1220]/95 backdrop-blur border-b border-white/[0.06] px-4 md:px-8 py-3 flex items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          {/* Número da rodada */}
          <div className="flex items-center gap-2 bg-white/[0.06] border border-white/[0.08] rounded-xl px-4 py-2">
            <span className="text-[10px] uppercase tracking-widest text-slate-500 font-black">
              Rodada
            </span>
            <span className="text-lg font-black text-white tabular-nums">
              {round?.roundNumber ?? "—"}
            </span>
          </div>

          {/* Loja */}
          {player && (
            <div className="hidden sm:flex items-center gap-2 text-sm text-slate-400 font-semibold">
              <span className="w-2 h-2 rounded-full bg-orange-500" />
              {player.storeName}
            </div>
          )}
        </div>

        {/* Timer */}
        <div className="flex flex-col items-end gap-1">
          <div className={`text-3xl md:text-4xl font-black font-mono tabular-nums ${timerColor}`}>
            {formatTime(timeLeft)}
          </div>
          {/* Barra de progresso do timer */}
          <div className="w-32 md:w-48 h-1.5 bg-white/10 rounded-full overflow-hidden">
            <motion.div
              className={`h-full rounded-full ${
                timeLeft > 120 ? "bg-emerald-400" : timeLeft > 30 ? "bg-yellow-400" : "bg-red-400"
              }`}
              animate={{ width: `${progressPercent}%` }}
              transition={{ ease: "linear", duration: 1 }}
            />
          </div>
        </div>
      </header>

      {/* ── STEPS INDICATOR ── */}
      <div className="border-b border-white/[0.06] bg-[#0D1528] px-4 md:px-8 py-3">
        <div className="max-w-4xl mx-auto flex items-center gap-1 md:gap-2">
          {STEP_LABELS.map((label, i) => {
            const num = i + 1;
            const isActive = step === num;
            const isDone = step > num;
            return (
              <React.Fragment key={num}>
                <div
                  className={`flex items-center gap-2 px-3 py-1.5 rounded-xl text-xs font-black uppercase tracking-wider transition-all ${
                    isActive
                      ? "bg-orange-500 text-white"
                      : isDone
                      ? "bg-emerald-500/20 text-emerald-400 border border-emerald-500/20"
                      : "text-slate-600"
                  }`}
                >
                  <span
                    className={`w-5 h-5 rounded-full flex items-center justify-center text-[10px] font-black ${
                      isActive ? "bg-white/20" : isDone ? "bg-emerald-500/30" : "bg-white/5"
                    }`}
                  >
                    {isDone ? "✓" : num}
                  </span>
                  <span className="hidden sm:inline">{label}</span>
                </div>
                {i < STEP_LABELS.length - 1 && (
                  <div className={`flex-1 h-px ${isDone ? "bg-emerald-500/30" : "bg-white/[0.06]"}`} />
                )}
              </React.Fragment>
            );
          })}
        </div>
      </div>

      {/* ── STATUS BANNERS ── */}
      <AnimatePresence>
        {submitted && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: "auto", opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            className="bg-emerald-500/10 border-b border-emerald-500/20 px-8 py-3 text-emerald-400 text-sm font-bold text-center"
          >
            ✅ Configuração enviada — aguardando próxima rodada
          </motion.div>
        )}
        {timeUp && !submitted && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: "auto", opacity: 1 }}
            className="bg-red-500/10 border-b border-red-500/20 px-8 py-3 text-red-400 text-sm font-bold text-center"
          >
            ⏱ Tempo esgotado
          </motion.div>
        )}
      </AnimatePresence>

      {/* ── MAIN ── */}
      <main className="flex-1 flex items-start justify-center p-4 md:p-8">
        <div className="w-full max-w-4xl">
          <AnimatePresence mode="wait">
            <motion.div
              key={step}
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              transition={{ duration: 0.2 }}
              className="bg-[#111827] border border-white/[0.06] rounded-3xl p-6 md:p-8"
            >
              {step === 1 && <SetupStep config={config} setConfig={setConfig} />}
              {step === 2 && <ComercialStep config={config} setConfig={setConfig} />}
              {step === 3 && <EmployeeStep config={config} setConfig={setConfig} />}
              {step === 4 && <SummaryStep config={config} />}
            </motion.div>
          </AnimatePresence>
        </div>
      </main>

      {/* ── FOOTER NAV ── */}
      <footer className="sticky bottom-0 bg-[#0B1220]/95 backdrop-blur border-t border-white/[0.06] px-4 md:px-8 py-4 flex justify-between items-center">
        <button
          disabled={step === 1}
          onClick={() => setStep((s) => Math.max(1, s - 1))}
          className="px-5 py-2.5 rounded-xl bg-white/5 hover:bg-white/10 text-slate-300 font-bold text-sm transition-all disabled:opacity-30 disabled:cursor-not-allowed"
        >
          ← Voltar
        </button>

        <span className="text-xs text-slate-600 font-bold uppercase tracking-widest">
          {step} / {STEP_LABELS.length}
        </span>

        {step < 4 ? (
          <button
            onClick={() => setStep((s) => Math.min(4, s + 1))}
            className="px-5 py-2.5 rounded-xl bg-orange-500 hover:bg-orange-400 text-white font-bold text-sm transition-all"
          >
            Próximo →
          </button>
        ) : (
          <button
            onClick={handleFinalize}
            disabled={submitting || timeUp || submitted}
            className="px-6 py-2.5 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-white font-black text-sm transition-all disabled:opacity-40 disabled:cursor-not-allowed flex items-center gap-2"
          >
            {submitting ? (
              <>
                <span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                Enviando...
              </>
            ) : submitted ? (
              "✅ Enviado"
            ) : (
              "Enviar Configuração →"
            )}
          </button>
        )}
      </footer>
    </div>
  );
}