"use client";

import React, { useEffect, useRef, useState } from "react";
import { motion, AnimatePresence, HTMLMotionProps } from "framer-motion";
import {
  Settings2,
  ShoppingCart,
  Users,
  BarChart3,
  Timer,
  CheckCircle2,
  Layers3,
  Wallet,
} from "lucide-react";
import toast, { Toaster } from "react-hot-toast";

import { useOnboardingSession } from "./hooks/useOnboardingSession";
import { useOnboarding } from "./context/OnboardingContext";

import SetupStep from "./components/SetupStep";
import ComercialStep from "./components/ComercialStep";
import EmployeeStep from "./components/EmployeeStep";
import SummaryStep from "./components/SummaryStep";

import { useRouter } from "next/navigation";

const STEPS = [
  { label: "CAPEX", Icon: Settings2 },
  { label: "Comercial", Icon: ShoppingCart },
  { label: "Operação", Icon: Users },
  { label: "Resumo", Icon: BarChart3 },
];

function formatTime(s: number) {
  if (!s || s <= 0) return "00:00";
  return `${String(Math.floor(s / 60)).padStart(2, "0")}:${String(s % 60).padStart(2, "0")}`;
}

export default function OnboardingPage() {
  const router = useRouter();

  const {
    config,
    round,
    timeLeft,
    submitted,
    submitting,
    budget,
    player,
    remainingBudget,
    setSubmitting,
  } = useOnboarding();

  const { submit, categoriesLoaded } = useOnboardingSession(
    process.env.NEXT_PUBLIC_API_URL || "http://localhost:4000"
  );

  const [step, setStep] = useState(1);
  const redirectedRef = useRef(false);

  const handleFinalize = async () => {
  if (!round?.roundId) return;
  if (!player?.id || !player?.sessionId) return;
  if (submitted || submitting) return;
  if (!categoriesLoaded) {
    toast.error("Aguarde o carregamento das categorias.");
    return;
  }

  setSubmitting(true);
  try {
    await submit({
      playerId: player.id,
      sessionId: player.sessionId,
      roundId: round.roundId,
      storeId: undefined,
    });
    // submitted é setado dentro do hook via evento socket
    // o useEffect de redirecionamento cuida do router.replace
  } catch (error: any) {
    console.error("Erro ao finalizar:", error);
    toast.error(error.message || "Erro ao enviar configurações.");
    setSubmitting(false); // só reseta em erro — sucesso vem pelo socket
  }
};

  // Redirecionamento por estouro de tempo
  useEffect(() => {
    if (!round?.roundId) return;
    if (timeLeft > 0) return;
    if (redirectedRef.current) return;

    redirectedRef.current = true;
    router.replace(
      submitted ? "/pages/dashboard" : "/pages/onboarding/processing"
    );
  }, [timeLeft, submitted, round, router]);

  // Redirecionamento por sucesso no envio
  useEffect(() => {
    if (!submitted) return;
    if (redirectedRef.current) return;

    redirectedRef.current = true;
    router.replace("/pages/dashboard");
  }, [submitted, router]);

  // timeLeft em segundos, round.duration em segundos
  const pct = round?.duration
    ? Math.min((timeLeft / round.duration) * 100, 100)
    : 0;

  const timerColor =
    timeLeft > 120
      ? "text-emerald-400"
      : timeLeft > 30
      ? "text-amber-400"
      : "text-red-400";

  const barColor =
    timeLeft > 120
      ? "bg-emerald-500"
      : timeLeft > 30
      ? "bg-amber-400"
      : "bg-red-500";

  const activeStep = (i: number) => step === i + 1;
  const doneStep = (i: number) => step > i + 1;

  return (
    <div className="min-h-screen bg-[#080D17] flex flex-col font-sans text-white">
      <Toaster
        position="top-center"
        toastOptions={{
          style: {
            background: "#1e2a3a",
            color: "#ffffff",
            border: "1px solid rgba(255,255,255,0.1)",
          },
        }}
      />

      {/* HEADER */}
      <header className="sticky top-0 z-40 bg-[#080D17] border-b border-white/10">
        <div className="max-w-6xl mx-auto px-6 py-5">
          <div className="flex flex-col gap-5">

            {/* TOP */}
            <div className="flex items-center justify-between">
              <div>
                <h1 className="text-2xl font-black text-white">
                  Configuração da Rodada
                </h1>
                <p className="text-[11px] uppercase tracking-[0.25em] text-slate-400 font-bold mt-1">
                  Onboarding da simulação operacional
                </p>
              </div>

              <div className="flex items-center gap-3">
                {/* ROUND */}
                <div className="flex items-center gap-2 px-4 py-2 rounded-2xl border border-white/10 bg-white/5">
                  <Layers3 size={15} className="text-orange-500" />
                  <div className="flex flex-col leading-none">
                    <span className="text-[10px] uppercase font-black text-slate-400">
                      Rodada
                    </span>
                    <span className="text-sm font-black text-white">
                      {round?.roundNumber || "--"}
                    </span>
                  </div>
                </div>

                {/* TIMER */}
                <div
                  className={`flex items-center gap-2 font-black text-lg ${timerColor}`}
                >
                  <Timer size={18} />
                  {formatTime(timeLeft)}
                </div>
              </div>
            </div>

            {/* PROGRESS BAR */}
            <div className="h-2 bg-white/10 rounded-full overflow-hidden">
              <motion.div
                {...({
                  className: `h-full ${barColor}`,
                } as HTMLMotionProps<"div">)}
                animate={{ width: `${pct}%` }}
                transition={{ duration: 0.6, ease: "linear" }}
              />
            </div>

            {/* ORÇAMENTO */}
            <div className="flex justify-center">
              <div className="w-full max-w-md">
                <div
                  className={`flex items-center justify-between px-6 py-4 rounded-2xl shadow-lg transition-colors duration-300 ${
                    remainingBudget < 0
                      ? "bg-gradient-to-r from-red-600 to-red-700 shadow-red-500/20"
                      : "bg-gradient-to-r from-orange-500 to-orange-600 shadow-orange-500/20"
                  }`}
                >
                  <div className="flex items-center gap-3">
                    <Wallet size={20} className="text-white" />
                    <div className="flex flex-col leading-none">
                      <span className="text-[10px] uppercase text-orange-100 font-black tracking-widest">
                        Orçamento da Loja
                      </span>
                      <span className="text-lg font-black text-white">
                        {remainingBudget < 0
                          ? "Caixa Negativo (Juros 12%)"
                          : "Capital Disponível"}
                      </span>
                    </div>
                  </div>
                  <div className="text-right">
                    <div className="text-xl font-black text-white">
                      R$ {remainingBudget.toLocaleString("pt-BR")}
                    </div>
                    <div className="text-[10px] text-orange-100 uppercase font-bold tracking-widest">
                      Base inicial: R$ {budget.toLocaleString("pt-BR")}
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* STEPS */}
            <div className="flex gap-4 w-full">
              {STEPS.map((s, i) => {
                const isActive = activeStep(i);
                const isDone = doneStep(i);
                const isAccessible = i + 1 <= step || remainingBudget >= 0;

                return (
                  <div key={s.label} className="flex flex-col gap-1.5 flex-1">
                    <span
                      className={`text-[12px] font-bold uppercase tracking-wider ${
                        isActive
                          ? "text-orange-400"
                          : isDone
                          ? "text-emerald-400"
                          : "text-slate-500"
                      }`}
                    >
                      Etapa {i + 1}
                    </span>
                    <button
                      type="button"
                      onClick={() => {
                        if (isAccessible) setStep(i + 1);
                      }}
                      className={`px-4 py-3 w-full justify-center rounded-xl text-xs font-black uppercase border transition flex items-center gap-2 shadow-sm cursor-pointer
                        ${
                          isActive
                            ? "bg-orange-500 text-white border-orange-500"
                            : isDone
                            ? "bg-emerald-500/20 text-emerald-400 border-emerald-500/30 hover:bg-emerald-500/30"
                            : "bg-white/5 text-slate-400 border-white/10 hover:bg-white/10"
                        }`}
                    >
                      {isDone ? <CheckCircle2 size={14} /> : null}
                      {s.label}
                    </button>
                  </div>
                );
              })}
            </div>

          </div>
        </div>
      </header>

      {/* ALERTS */}
      <AnimatePresence>
        {submitted && (
          <motion.div
            {...({
              className:
                "bg-emerald-500/20 text-emerald-400 text-center py-2 text-xs font-bold border-b border-emerald-500/20",
            } as HTMLMotionProps<"div">)}
          >
            Configuração enviada com sucesso
          </motion.div>
        )}
        {timeLeft <= 0 && !submitted && (
          <motion.div
            {...({
              className:
                "bg-red-500/20 text-red-400 text-center py-2 text-xs font-bold border-b border-red-500/20",
            } as HTMLMotionProps<"div">)}
          >
            Tempo esgotado! Processando decisões...
          </motion.div>
        )}
      </AnimatePresence>

      {/* MAIN */}
      <main className="flex-1 flex justify-center p-6">
        <div className="w-full max-w-6xl">
          <AnimatePresence mode="wait">
            <motion.div
              key={step}
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -12 }}
              {...({
                className:
                  "bg-white/5 border border-white/10 rounded-3xl p-6 md:p-10 shadow-sm",
              } as HTMLMotionProps<"div">)}
            >
              {step === 1 && <SetupStep />}
              {step === 2 && <ComercialStep />}
              {step === 3 && <EmployeeStep />}
              {step === 4 && <SummaryStep />}
            </motion.div>
          </AnimatePresence>
        </div>
      </main>

      {/* FOOTER */}
      <footer className="sticky bottom-0 bg-[#080D17] border-t border-white/10">
        <div className="max-w-6xl mx-auto px-6 py-4 flex items-center justify-between">
          <button
            disabled={step === 1}
            onClick={() => setStep((s) => Math.max(1, s - 1))}
            className="px-5 py-2 rounded-xl bg-white/10 text-white font-bold disabled:opacity-40 hover:bg-white/15 transition cursor-pointer"
          >
            Voltar
          </button>

          <span className="text-xs font-bold text-slate-500">
            {step} / {STEPS.length}
          </span>

          {step < STEPS.length ? (
            <button
              onClick={() => setStep((s) => Math.min(STEPS.length, s + 1))}
              className="px-6 cursor-pointer py-2 rounded-xl bg-orange-500 hover:bg-orange-400 text-white font-black transition"
            >
              Próximo →
            </button>
          ) : (
            <button
              onClick={handleFinalize}
              disabled={
                submitting || timeLeft <= 0 || submitted || !categoriesLoaded
              }
              className={`px-6 py-2 cursor-pointer rounded-xl font-black transition disabled:opacity-40 disabled:cursor-not-allowed ${
                remainingBudget < 0
                  ? "bg-red-600 hover:bg-red-500 text-white"
                  : "bg-emerald-500 hover:bg-emerald-400 text-white"
              }`}
            >
              {submitting
                ? "Enviando..."
                : submitted
                ? "Enviado"
                : remainingBudget < 0
                ? "Finalizar com Juros"
                : "Finalizar"}
            </button>
          )}
        </div>
      </footer>
    </div>
  );
}