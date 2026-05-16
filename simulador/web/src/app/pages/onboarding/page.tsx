"use client";

import React, { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Settings2,
  ShoppingCart,
  Users,
  BarChart3,
  Timer,
  CheckCircle2,
  AlertTriangle,
} from "lucide-react";
import { Toaster } from "react-hot-toast";

import { useOnboardingSession } from "./hooks/useOnboardingSession";
import SetupStep from "./components/SetupStep";
import ComercialStep from "./components/ComercialStep";
import EmployeeStep from "./components/EmployeeStep";
import SummaryStep from "./components/SummaryStep";
import { AppConfig } from "./types/onboarding";

const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:4000";

const initialConfig: AppConfig = {
  capex: {
    seguranca: 0,
    equipamentos: 0,
    redes: 0,
    site: 0,
    selfcheckout: 0,
    melhoria: 0,
  },
  comercial: {
    pereciveis: { estoque: 0, margem: 30 },
    mercearia: { estoque: 0, margem: 20 },
    eletro: { estoque: 0, margem: 25 },
    hipel: { estoque: 0, margem: 18 },
  },
  operadoresCaixa: 5,
  operadoresAtendimento: 3,
  quizScore: 100,
};

const STEPS = [
  { label: "CAPEX", Icon: Settings2 },
  { label: "Comercial", Icon: ShoppingCart },
  { label: "Operadores", Icon: Users },
  { label: "Resumo", Icon: BarChart3 },
];

function formatTime(s: number) {
  if (!s || s <= 0) return "00:00";
  return `${String(Math.floor(s / 60)).padStart(2, "0")}:${String(
    s % 60
  ).padStart(2, "0")}`;
}

export default function OnboardingPage() {
  const { player, round, timeLeft, submitted, submitting, timeUp, submit } =
    useOnboardingSession(API_URL);

  const [step, setStep] = useState(1);
  const [config, setConfig] = useState<AppConfig>(initialConfig);

  const handleFinalize = () => {
    if (!player || !round || submitted || timeUp || submitting) return;

    submit({
      playerId: player.id,
      sessionId: player.sessionId,
      roundId: round.roundId,
      storeId: player.store?.id,
      config,
    });
  };

  const pct = round?.duration
    ? Math.min((timeLeft / round.duration) * 100, 100)
    : 0;

  const timerColor =
    timeLeft > 120
      ? "text-emerald-600"
      : timeLeft > 30
      ? "text-amber-500"
      : "text-red-500";

  const barColor =
    timeLeft > 120
      ? "bg-emerald-500"
      : timeLeft > 30
      ? "bg-amber-400"
      : "bg-red-500";

  return (
    <div className="min-h-screen bg-white flex flex-col font-sans">

      <Toaster
        position="top-right"
        toastOptions={{
          style: {
            background: "#fff",
            color: "#001F3F",
            border: "1px solid #E2E8F0",
          },
        }}
      />

      {/* HEADER */}
      <header className="sticky top-0 z-30 bg-white border-b border-slate-200">
        <div className="px-6 py-4 flex items-center justify-between gap-6">

          {/* LEFT */}
          <div className="flex items-center gap-4">

            <div className="bg-[#001F3F] text-white px-5 py-3 rounded-2xl shadow-sm">
              <div className="text-[10px] uppercase text-white/60 tracking-widest font-black">
                Rodada
              </div>
              <div className="text-xl font-black leading-none">
                {round?.roundNumber ?? "—"}
              </div>
            </div>

            {player && (
              <div className="flex items-center gap-3 px-4 py-2 rounded-2xl border border-slate-200 bg-white">
                <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
                <div className="leading-tight">
                  <div className="text-[10px] uppercase text-slate-400 font-black tracking-widest">
                    Loja
                  </div>
                  <div className="text-sm font-black text-[#001F3F]">
                    {player.storeName ?? player.store?.name}
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* RIGHT TIMER */}
          <div className="flex flex-col items-end">
            <div className={`flex items-center gap-2 font-black ${timerColor}`}>
              <Timer size={16} />
              {formatTime(timeLeft)}
            </div>

            <div className="w-44 h-1.5 bg-slate-200 rounded-full overflow-hidden mt-1">
              <motion.div
                className={`h-full ${barColor}`}
                animate={{ width: `${pct}%` }}
                transition={{ duration: 1, ease: "linear" }}
              />
            </div>
          </div>

        </div>

        {/* STEPS */}
        <div className="px-6 pb-3 flex items-center gap-2">
          {STEPS.map((s, i) => {
            const num = i + 1;
            const active = step === num;
            const done = step > num;

            return (
              <div key={s.label} className="flex items-center gap-2">
                <button
                  onClick={() => done && setStep(num)}
                  className={`px-4 py-2 rounded-xl text-xs font-black uppercase border transition ${
                    active
                      ? "bg-[#FF6D00] text-white border-[#FF6D00]"
                      : done
                      ? "bg-emerald-50 text-emerald-700 border-emerald-200"
                      : "bg-white text-slate-400 border-slate-200"
                  }`}
                >
                  {done ? "✓" : num} {s.label}
                </button>

                {i < STEPS.length - 1 && (
                  <div className={`w-10 h-[2px] rounded-full ${done ? "bg-emerald-300" : "bg-slate-200"}`} />
                )}
              </div>
            );
          })}
        </div>
      </header>

      {/* ALERTS */}
      <AnimatePresence>
        {submitted && (
          <motion.div className="bg-emerald-50 text-emerald-700 text-center py-2 text-xs font-bold flex justify-center gap-2">
            <CheckCircle2 size={14} /> Configuração enviada
          </motion.div>
        )}

        {timeUp && !submitted && (
          <motion.div className="bg-red-50 text-red-600 text-center py-2 text-xs font-bold flex justify-center gap-2">
            <AlertTriangle size={14} /> Tempo esgotado
          </motion.div>
        )}
      </AnimatePresence>

      {/* MAIN */}
      <main className="flex-1 flex justify-center p-6">
        <div className="w-full max-w-5xl">
          <AnimatePresence mode="wait">
            <motion.div
              key={step}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              className="bg-white rounded-3xl border border-slate-200 p-6 md:p-10 shadow-sm"
            >
              {step === 1 && <SetupStep config={config} setConfig={setConfig} />}
              {step === 2 && <ComercialStep config={config} setConfig={setConfig} />}
              {step === 3 && <EmployeeStep config={config} setConfig={setConfig} />}
              {step === 4 && <SummaryStep config={config} />}
            </motion.div>
          </AnimatePresence>
        </div>
      </main>

      {/* FOOTER */}
      <footer className="sticky bottom-0 bg-white border-t border-slate-200 px-6 py-4 flex justify-between items-center">

        <button
          disabled={step === 1}
          onClick={() => setStep((s) => Math.max(1, s - 1))}
          className="px-4 py-2 rounded-xl bg-slate-100 text-slate-700 font-bold disabled:opacity-40"
        >
          Voltar
        </button>

        <span className="text-xs font-bold text-slate-400">
          {step} / {STEPS.length}
        </span>

        {step < STEPS.length ? (
          <button
            onClick={() => setStep((s) => Math.min(STEPS.length, s + 1))}
            className="px-5 py-2 rounded-xl bg-[#FF6D00] text-white font-black"
          >
            Próximo →
          </button>
        ) : (
          <button
            onClick={handleFinalize}
            disabled={submitting || timeUp || submitted}
            className="px-5 py-2 rounded-xl bg-emerald-500 text-white font-black disabled:opacity-40"
          >
            {submitting ? "Enviando..." : submitted ? "Enviado" : "Enviar"}
          </button>
        )}
      </footer>
    </div>
  );
}