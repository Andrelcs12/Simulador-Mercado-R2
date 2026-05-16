"use client";

import React, { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Settings2,
  ShoppingCart,
  Users,
  BarChart3,
  CheckCircle2,
  Timer,
  AlertTriangle,
} from "lucide-react";
import toast, { Toaster } from "react-hot-toast";

import { useOnboardingSession } from "./hooks/useOnboardingSession";
import SetupStep from "./components/SetupStep";
import ComercialStep from "./components/ComercialStep";
import EmployeeStep from "./components/EmployeeStep";
import SummaryStep from "./components/SummaryStep";

import { AppConfig } from "./types/onboarding";

const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:4000";
const STEP_LABELS = ["Configuração", "Comercial", "Operadores", "Resumo"];

const initialConfig: AppConfig = {
  capex: {
    seguranca: false,
    equipamentos: false,
    redes: false,
    site: false,
    selfcheckout: false,
    melhoria: false,
  },

  comercial: {
    pereciveis: { estoque: 0, margem: 0 },
    mercearia: { estoque: 0, margem: 0 },
    eletro: { estoque: 0, margem: 0 },
    hipel: { estoque: 0, margem: 0 },
  },

  operadoresCaixa: 0,
  operadoresAtendimento: 0,
  quizScore: 0,
};

function formatTime(seconds: number): string {
  const m = Math.floor(seconds / 60);
  const s = seconds % 60;
  return `${String(m).padStart(2, "0")}:${String(s).padStart(2, "0")}`;
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

  const nextStep = () => setStep((p) => Math.min(p + 1, 4));
  const prevStep = () => setStep((p) => Math.max(p - 1, 1));

  const progressPercent =
    round?.duration && round.duration > 0
      ? (timeLeft / round.duration) * 100
      : 0;

  const timerColor =
    timeLeft > 120
      ? "text-emerald-400"
      : timeLeft > 30
      ? "text-yellow-400"
      : "text-red-400";

  const stepIcons = [
    <Settings2 key="s1" size={14} />,
    <ShoppingCart key="s2" size={14} />,
    <Users key="s3" size={14} />,
    <BarChart3 key="s4" size={14} />,
  ];

  return (
    <div className="min-h-screen bg-[#0B1220] text-white flex flex-col font-sans antialiased">
      <Toaster
        position="top-right"
        toastOptions={{
          style: {
            background: "#1A2235",
            color: "#fff",
            border: "1px solid rgba(255,255,255,0.08)",
          },
        }}
      />

      {/* ── HEADER PREMIUM CENCOSUD ── */}
      <header className="sticky top-0 z-30 bg-[#0B1220]/95 backdrop-blur border-b border-white/[0.06] px-4 md:px-8 py-4 flex items-center justify-between gap-4">
        <div className="flex items-center gap-4">
          <div className="flex items-center gap-2.5 bg-white/[0.04] border border-white/[0.08] rounded-2xl px-4 py-2 shadow-inner">
            <span className="text-[10px] uppercase tracking-widest text-slate-400 font-black">
              Rodada
            </span>
            <span className="text-xl font-black text-orange-500 tabular-nums">
              {round?.roundNumber ?? "—"}
            </span>
          </div>

          {player && (
            <div className="hidden sm:flex items-center gap-2 text-xs text-slate-300 font-bold uppercase tracking-wider bg-white/[0.02] border border-white/[0.04] px-3 py-2 rounded-xl">
              <span className="w-2 h-2 rounded-full bg-orange-500 animate-pulse" />
              {player.storeName || "Loja Cencosud"}
            </div>
          )}
        </div>

        {/* Cronômetro Dinâmico */}
        <div className="flex items-center gap-4 bg-white/[0.02] border border-white/[0.05] p-2 px-4 rounded-2xl">
          <div className="flex flex-col items-end gap-0.5">
            <div className={`text-2xl md:text-3xl font-black font-mono tabular-nums flex items-center gap-2 ${timerColor}`}>
              <Timer size={20} className="opacity-80" />
              {formatTime(timeLeft)}
            </div>
            <div className="w-28 md:w-36 h-1 bg-white/10 rounded-full overflow-hidden mt-1">
              <motion.div
                className={`h-full rounded-full ${
                  timeLeft > 120 ? "bg-emerald-400" : timeLeft > 30 ? "bg-yellow-400" : "bg-red-400"
                }`}
                animate={{ width: `${progressPercent}%` }}
                transition={{ ease: "linear", duration: 1 }}
              />
            </div>
          </div>
        </div>
      </header>

      {/* ── STEPPER HORIZONTAL ── */}
      <div className="border-b border-white/[0.06] bg-[#0D1528] px-4 md:px-8 py-3.5 shadow-md">
        <div className="max-w-4xl mx-auto flex items-center justify-between gap-2 overflow-x-auto no-scrollbar">
          {STEP_LABELS.map((label, i) => {
            const num = i + 1;
            const isActive = step === num;
            const isDone = step > num;

            return (
              <React.Fragment key={num}>
                <button
                  onClick={() => setStep(num)}
                  className={`flex items-center gap-2.5 px-4 py-2 rounded-2xl text-xs font-black uppercase tracking-wider transition-all border ${
                    isActive
                      ? "bg-orange-500 text-white border-orange-400 shadow-lg shadow-orange-500/20"
                      : isDone
                      ? "bg-emerald-500/10 text-emerald-400 border-emerald-500/20"
                      : "bg-white/[0.02] text-slate-500 border-white/[0.04] hover:text-slate-300 hover:border-white/[0.08]"
                  }`}
                >
                  <span
                    className={`w-5 h-5 rounded-full flex items-center justify-center text-[10px] font-black border transition-colors ${
                      isActive 
                        ? "bg-white/20 border-white/30 text-white" 
                        : isDone 
                        ? "bg-emerald-500/20 border-emerald-500/30 text-emerald-400" 
                        : "bg-white/5 border-white/10 text-slate-400"
                    }`}
                  >
                    {isDone ? "✓" : num}
                  </span>
                  <span className="flex items-center gap-1.5">
                    <span className="opacity-60">{stepIcons[i]}</span>
                    {label}
                  </span>
                </button>
                {i < STEP_LABELS.length - 1 && (
                  <div className={`flex-1 h-[2px] rounded-full min-w-[20px] ${isDone ? "bg-emerald-500/30" : "bg-white/[0.06]"}`} />
                )}
              </React.Fragment>
            );
          })}
        </div>
      </div>

      {/* ── ALERTS DE STATUS EM TEMPO REAL ── */}
      <AnimatePresence>
        {submitted && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: "auto", opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            className="bg-emerald-500/10 border-b border-emerald-500/20 px-8 py-3 text-emerald-400 text-xs font-black tracking-wider uppercase text-center flex items-center justify-center gap-2"
          >
            <CheckCircle2 size={14} /> Configuração enviada — aguardando encerramento da rodada
          </motion.div>
        )}
        {timeUp && !submitted && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: "auto", opacity: 1 }}
            className="bg-red-500/10 border-b border-red-500/20 px-8 py-3 text-red-400 text-xs font-black tracking-wider uppercase text-center flex items-center justify-center gap-2"
          >
            <AlertTriangle size={14} /> Tempo Limite Atingido — Fechando planejamento
          </motion.div>
        )}
      </AnimatePresence>

      {/* ── CORPO DO MINI-JOGO ── */}
      <main className="flex-1 flex items-start justify-center p-4 md:p-8 overflow-y-auto">
        <div className="w-full max-w-6xl mt-2">
          <AnimatePresence mode="wait">
            <motion.div
              key={step}
              initial={{ opacity: 0, x: 15 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -15 }}
              transition={{ duration: 0.2, ease: "easeOut" }}
              className="bg-[#111827] border border-white/[0.06] rounded-3xl p-6 md:p-10 shadow-2xl shadow-black/40"
            >
              {step === 1 && <SetupStep config={config} setConfig={setConfig} />}
              {step === 2 && <ComercialStep config={config} setConfig={setConfig} />}
              {step === 3 && <EmployeeStep config={config} setConfig={setConfig} />}
              {step === 4 && <SummaryStep config={config} />}
            </motion.div>
          </AnimatePresence>
        </div>
      </main>

      {/* ── FOOTER DE NAVEGAÇÃO ── */}
      <footer className="sticky bottom-0 bg-[#0B1220]/95 backdrop-blur border-t border-white/[0.06] px-4 md:px-8 py-4 flex justify-between items-center z-40 shadow-xl">
        <button
          disabled={step === 1}
          onClick={prevStep}
          className="px-5 py-3 rounded-2xl bg-white/5 hover:bg-white/10 border border-white/[0.05] text-slate-300 font-bold text-sm transition-all disabled:opacity-20 disabled:cursor-not-allowed active:scale-95"
        >
          ← Voltar
        </button>

        <span className="text-xs text-slate-500 font-black tracking-widest bg-white/[0.03] px-3 py-1.5 rounded-xl border border-white/[0.04]">
          PASSO {step} DE {STEP_LABELS.length}
        </span>

        {step < 4 ? (
          <button
            onClick={nextStep}
            className="px-6 py-3 rounded-2xl bg-orange-500 hover:bg-orange-400 text-white font-black text-sm transition-all shadow-lg shadow-orange-500/10 active:scale-95"
          >
            Próximo →
          </button>
          ) : (
          <button
            onClick={handleFinalize}
            disabled={submitting || timeUp || submitted}
            className="px-6 py-3 rounded-2xl bg-emerald-500 hover:bg-emerald-400 text-white font-black text-sm transition-all disabled:opacity-40 disabled:cursor-not-allowed flex items-center gap-2 shadow-lg shadow-emerald-500/10 active:scale-95"
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