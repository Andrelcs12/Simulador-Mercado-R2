"use client";

import { useEffect, useRef, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
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
import { Toaster } from "react-hot-toast";

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

  return `${String(Math.floor(s / 60)).padStart(2, "0")}:${String(
    s % 60
  ).padStart(2, "0")}`;
}

// 🚨 ALTERAÇÃO: Separamos o miolo da página em um componente interno 
// para que ele possa disparar o hook `useOnboarding()` sem dar erro de escopo.
function OnboardingContent() {
  const router = useRouter();

  const {
    config,
    setConfig,
    round,
    timeLeft,
    submitted,
    submitting,
    budget,
    player,
    remainingBudget
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
      return;
    }

    await submit({
      playerId: player.id,
      sessionId: player.sessionId,
      roundId: round.roundId,
      storeId: undefined,
    });
  };

  useEffect(() => {
    if (!round?.roundId) return;
    if (timeLeft > 0) return;
    if (redirectedRef.current) return;

    redirectedRef.current = true;

    router.replace(
      submitted
        ? "/pages/dashboard"
        : "/pages/onboarding/processing"
    );
  }, [timeLeft, submitted, round, router]);

  useEffect(() => {
    if (!submitted) return;
    if (redirectedRef.current) return;

    redirectedRef.current = true;
    router.replace("/pages/dashboard");
  }, [submitted, router]);

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

  const activeStep = (i: number) => step === i + 1;
  const doneStep = (i: number) => step > i + 1;

  return (
    <>
      <Toaster
        position="top-center"
        toastOptions={{
          style: {
            background: "#fff",
            color: "#0f172a",
            border: "1px solid #e2e8f0",
          },
        }}
      />

      {/* HEADER */}
      <header className="sticky top-0 z-40 bg-white border-b border-slate-200">
        <div className="max-w-6xl mx-auto px-6 py-5">
          <div className="flex flex-col gap-5">

            {/* TOP */}
            <div className="flex items-center justify-between">
              <div>
                <h1 className="text-2xl font-black text-slate-900">
                  Configuração da Rodada
                </h1>
                <p className="text-[11px] uppercase tracking-[0.25em] text-slate-500 font-bold mt-1">
                  Onboarding da simulação operational
                </p>
              </div>

              <div className="flex items-center gap-3">
                {/* ROUND */}
                <div className="flex items-center gap-2 px-4 py-2 rounded-2xl border border-slate-200 bg-slate-50">
                  <Layers3 size={15} className="text-orange-500" />
                  <div className="flex flex-col leading-none">
                    <span className="text-[10px] uppercase font-black text-slate-400">
                      Rodada
                    </span>
                    <span className="text-sm font-black text-slate-900">
                      {round?.roundNumber || "--"}
                    </span>
                  </div>
                </div>

                {/* TIMER */}
                <div className={`flex items-center gap-2 font-black text-lg ${timerColor}`}>
                  <Timer size={18} />
                  {formatTime(timeLeft)}
                </div>
              </div>
            </div>

            {/* PROGRESS */}
            <div className="h-2 bg-slate-200 rounded-full overflow-hidden">
              <motion.div
                className={`h-full ${barColor}`}
                animate={{ width: `${pct}%` }}
                transition={{ duration: 0.6, ease: "linear" }}
              />
            </div>

            {/* ORÇAMENTO (HERO CENTER CARD) */}
            <div className="flex justify-center">
              <div className="w-full max-w-md">
                <div className="flex items-center justify-between px-6 py-4 bg-gradient-to-r from-orange-500 to-orange-600 rounded-2xl shadow-lg shadow-orange-500/20">
                  <div className="flex items-center gap-3">
                    <Wallet size={20} className="text-white" />
                    <div className="flex flex-col leading-none">
                      <span className="text-[10px] uppercase text-orange-100 font-black tracking-widest">
                        Orçamento da Loja
                      </span>
                      <span className="text-lg font-black text-white">
                        Capital Disponível
                      </span>
                    </div>
                  </div>

                  <div className="text-right">
                    <div className="text-xl font-black text-white">
                      R$ {remainingBudget?.toLocaleString("pt-BR") ?? "0"}
                    </div>
                    <div className="text-[10px] text-orange-100 uppercase font-bold tracking-widest">
                      Base inicial: R$ {budget?.toLocaleString("pt-BR") ?? "0"}
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

                return (
                  <div key={s.label} className="flex flex-col gap-1.5 flex-1">
                    <span className={`text-[12px] font-bold uppercase tracking-wider ${
                      isActive ? "text-orange-500" : isDone ? "text-emerald-600" : "text-slate-400"
                    }`}>
                      Etapa {i + 1}
                    </span>

                    <button
                      type="button"
                      onClick={() => {
                        if (isDone) {
                          setStep(i + 1);
                        }
                      }}
                      className={`px-4 py-3 w-full justify-center rounded-xl text-xs font-black uppercase border transition flex items-center gap-2 shadow-sm
                        ${
                          isActive
                            ? "bg-orange-500 text-white border-orange-500"
                            : isDone
                            ? "bg-emerald-50 text-emerald-700 border-emerald-200 hover:bg-emerald-100/50"
                            : "bg-gray-300 text-slate-400 border-slate-200 cursor-not-allowed"
                        }`}
                    >
                      {isDone ? <CheckCircle2 size={14} /> : null }
                      {s.label}
                    </button>
                  </div>
                );
              })}
            </div>

          </div>
        </div>
      </header>
      </div>

      {/* STEPS */}
<div className="flex gap-4 w-full">
  {STEPS.map((s, i) => {
    const isActive = activeStep(i);
    const isDone = doneStep(i);
    
    // ✅ Permite clicar se já passou pela etapa, se for a etapa atual,
    // ou se o orçamento não estourou (permitindo ir até o resumo)
    const isAccessible = i + 1 <= step || remainingBudget >= 0;

    return (
      <div key={s.label} className="flex flex-col gap-1.5 flex-1">
        {/* Indicador de Etapa Superior */}
        <span className={`text-[12px] font-bold uppercase tracking-wider ${
          isActive ? "text-orange-500" : isDone ? "text-emerald-600" : "text-slate-400"
        }`}>
          Etapa {i + 1}
        </span>

        {/* Card/Botão Individual */}
        <button
          type="button"
          onClick={() => {
            if (isAccessible) {
              setStep(i + 1);
            }
          }}
          className={`px-4 py-3 w-full justify-center rounded-xl text-xs font-black uppercase border transition flex items-center gap-2 shadow-sm
            ${
              isActive
                ? "bg-orange-500 text-white border-orange-500"
                : isDone
                ? "bg-emerald-50 text-emerald-700 border-emerald-200 hover:bg-emerald-100/50"
                : "bg-slate-50 text-slate-600 border-slate-200 hover:bg-slate-100" // 💡 Ajustado: Visual limpo e clicável
            }`}
        >
          {isDone ? <CheckCircle2 size={14} /> : null }
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
          <motion.div className="bg-emerald-50 text-emerald-700 text-center py-2 text-xs font-bold border-b border-emerald-200">
            Configuração enviada com sucesso
          </motion.div>
        )}

        {timeLeft <= 0 && !submitted && (
          <motion.div className="bg-red-50 text-red-600 text-center py-2 text-xs font-bold border-b border-red-200">
            Tempo esgotado
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
              className="bg-white border border-slate-200 rounded-3xl p-6 md:p-10 shadow-sm"
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

      {/* FOOTER */}
      <footer className="sticky bottom-0 bg-white border-t border-slate-200">
        <div className="max-w-6xl mx-auto px-6 py-4 flex items-center justify-between">
          <button
            type="button"
            disabled={step === 1}
            onClick={() => setStep((s) => Math.max(1, s - 1))}
            className="px-5 py-2 rounded-xl bg-slate-100 text-slate-700 font-bold disabled:opacity-40"
          >
            Voltar
          </button>

          <span className="text-xs font-bold text-slate-400">
            {step} / {STEPS.length}
          </span>

          {step < STEPS.length ? (
            <button
              type="button"
              onClick={() => setStep((s) => Math.min(STEPS.length, s + 1))}
              className="px-6 cursor-pointer py-2 rounded-xl bg-orange-500 text-white font-black"
            >
              Próximo →
            </button>
          ) : (
            <button
              type="button"
              onClick={handleFinalize}
              disabled={submitting || timeLeft <= 0 || submitted}
              className="px-6 py-2 cursor-pointer rounded-xl bg-emerald-500 text-white font-black disabled:opacity-40"
            >
              {submitting
                ? "Enviando..."
                : submitted
                ? "Enviado"
                : "Finalizar"}
            </button>
          )}
        </div>
      </footer>
    </>
  );
}

export default function OnboardingPage() {
  return (
    <div className="min-h-screen bg-white flex flex-col font-sans text-slate-900">
      <OnboardingContent />
    </div>
  );
}
