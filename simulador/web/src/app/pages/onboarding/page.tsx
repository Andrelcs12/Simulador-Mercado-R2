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
  <div className="min-h-screen bg-[#F5F7FB] text-[#0F172A] flex flex-col">
    <Toaster
      position="top-right"
      toastOptions={{
        style: {
          background: "#FFFFFF",
          color: "#0F172A",
          border: "1px solid #E2E8F0",
          boxShadow: "0 10px 30px rgba(15,23,42,0.08)",
        },
      }}
    />

    {/* ── HEADER ── */}
    <header className="sticky top-0 z-30 bg-white/90 backdrop-blur-xl border-b border-slate-200 px-4 md:px-8 py-4 flex items-center justify-between gap-4 shadow-sm">
      <div className="flex items-center gap-3">
        {/* Rodada */}
        <div className="flex items-center gap-3 bg-gradient-to-r from-orange-500 to-orange-400 text-white rounded-2xl px-5 py-3 shadow-lg shadow-orange-500/20">
          <div>
            <div className="text-[10px] uppercase tracking-[0.25em] font-black text-white/70">
              Rodada
            </div>

            <div className="text-2xl font-black tabular-nums leading-none">
              {round?.roundNumber ?? "—"}
            </div>
          </div>
        </div>

        {/* Loja */}
        {player && (
          <div className="hidden md:flex items-center gap-3 bg-white border border-slate-200 rounded-2xl px-4 py-3 shadow-sm">
            <div className="w-3 h-3 rounded-full bg-emerald-500 animate-pulse" />

            <div>
              <div className="text-[10px] uppercase tracking-widest font-bold text-slate-400">
                Loja
              </div>

              <div className="text-sm font-bold text-slate-700">
                {player.storeName}
              </div>
            </div>
          </div>
        )}
      </div>

      {/* TIMER */}
      <div className="flex flex-col items-end gap-2">
        <div
          className={`text-4xl md:text-5xl font-black font-mono tabular-nums leading-none ${timerColor}`}
        >
          {formatTime(timeLeft)}
        </div>

        <div className="w-40 md:w-56 h-2 bg-slate-200 rounded-full overflow-hidden shadow-inner">
          <motion.div
            className={`h-full rounded-full ${
              timeLeft > 120
                ? "bg-emerald-500"
                : timeLeft > 30
                ? "bg-yellow-400"
                : "bg-red-500"
            }`}
            animate={{ width: `${progressPercent}%` }}
            transition={{ ease: "linear", duration: 1 }}
          />
        </div>
      </div>
    </header>

    {/* ── STEPS ── */}
    <div className="border-b border-slate-200 bg-white px-4 md:px-8 py-4 shadow-sm">
      <div className="max-w-5xl mx-auto flex items-center gap-2">
        {STEP_LABELS.map((label, i) => {
          const num = i + 1;
          const isActive = step === num;
          const isDone = step > num;

          return (
            <React.Fragment key={num}>
              <div
                className={`flex items-center gap-3 px-4 py-2 rounded-2xl text-xs font-black uppercase tracking-wider transition-all duration-200 ${
                  isActive
                    ? "bg-orange-500 text-white shadow-lg shadow-orange-500/20 scale-[1.02]"
                    : isDone
                    ? "bg-emerald-50 text-emerald-600 border border-emerald-200"
                    : "bg-slate-100 text-slate-400 border border-slate-200"
                }`}
              >
                <span
                  className={`w-6 h-6 rounded-full flex items-center justify-center text-[11px] font-black ${
                    isActive
                      ? "bg-white/20"
                      : isDone
                      ? "bg-emerald-100"
                      : "bg-white"
                  }`}
                >
                  {isDone ? "✓" : num}
                </span>

                <span className="hidden sm:inline">{label}</span>
              </div>

              {i < STEP_LABELS.length - 1 && (
                <div
                  className={`flex-1 h-1 rounded-full ${
                    isDone ? "bg-emerald-300" : "bg-slate-200"
                  }`}
                />
              )}
            </React.Fragment>
          );
        })}
      </div>
    </div>

    {/* ── STATUS ── */}
    <AnimatePresence>
      {submitted && (
        <motion.div
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0 }}
          className="mx-4 md:mx-8 mt-4 bg-emerald-50 border border-emerald-200 rounded-2xl px-6 py-4 text-emerald-700 font-bold shadow-sm"
        >
          ✅ Configuração enviada com sucesso
        </motion.div>
      )}

      {timeUp && !submitted && (
        <motion.div
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          className="mx-4 md:mx-8 mt-4 bg-red-50 border border-red-200 rounded-2xl px-6 py-4 text-red-600 font-bold shadow-sm"
        >
          ⏱ Tempo esgotado
        </motion.div>
      )}
    </AnimatePresence>

    {/* ── MAIN ── */}
    <main className="flex-1 flex items-start justify-center p-4 md:p-8">
      <div className="w-full max-w-5xl">
        <AnimatePresence mode="wait">
          <motion.div
            key={step}
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -15 }}
            transition={{ duration: 0.2 }}
            className="bg-white border border-slate-200 rounded-[2rem] p-6 md:p-10 shadow-xl shadow-slate-200/60"
          >
            {step === 1 && (
              <SetupStep config={config} setConfig={setConfig} />
            )}

            {step === 2 && (
              <ComercialStep config={config} setConfig={setConfig} />
            )}

            {step === 3 && (
              <EmployeeStep config={config} setConfig={setConfig} />
            )}

            {step === 4 && <SummaryStep config={config} />}
          </motion.div>
        </AnimatePresence>
      </div>
    </main>

    {/* ── FOOTER ── */}
    <footer className="sticky bottom-0 bg-white/95 backdrop-blur-xl border-t border-slate-200 px-4 md:px-8 py-4 flex justify-between items-center shadow-[0_-4px_20px_rgba(15,23,42,0.04)]">
      <button
        disabled={step === 1}
        onClick={() => setStep((s) => Math.max(1, s - 1))}
        className="px-5 py-3 rounded-2xl bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold text-sm transition-all disabled:opacity-40 disabled:cursor-not-allowed"
      >
        ← Voltar
      </button>

      <span className="text-xs text-slate-400 font-black uppercase tracking-[0.25em]">
        {step} / {STEP_LABELS.length}
      </span>

      {step < 4 ? (
        <button
          onClick={() => setStep((s) => Math.min(4, s + 1))}
          className="px-6 py-3 rounded-2xl bg-orange-500 hover:bg-orange-400 text-white font-black text-sm transition-all shadow-lg shadow-orange-500/20"
        >
          Próximo →
        </button>
      ) : (
        <button
          onClick={handleFinalize}
          disabled={submitting || timeUp || submitted}
          className="px-7 py-3 rounded-2xl bg-emerald-500 hover:bg-emerald-400 text-white font-black text-sm transition-all disabled:opacity-40 disabled:cursor-not-allowed flex items-center gap-2 shadow-lg shadow-emerald-500/20"
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