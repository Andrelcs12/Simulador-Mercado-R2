"use client";

import React, { useState } from "react";
import { useOnboardingSession } from "./hooks/useOnboardingSession";

import SetupStep from "./components/SetupStep";
import ComercialStep from "./components/ComercialStep";
import EmployeeStep from "./components/EmployeeStep";
import SummaryStep from "./components/SummaryStep";

import { AppConfig } from "./types/onboarding";

const API_URL =
  process.env.NEXT_PUBLIC_API_URL || "http://localhost:4000";

const STEP_LABELS = [
  "Configuração",
  "Comercial",
  "Operadores",
  "Resumo",
];

// 🔥 estado inicial 100% alinhado com AppConfig
const initialConfig: AppConfig = {
  capex: {},
  operadores: 0,
  comercial: {
    pereciveis: { estoque: 0, margem: 0 },
    mercearia: { estoque: 0, margem: 0 },
    eletro: { estoque: 0, margem: 0 },
    hipel: { estoque: 0, margem: 0 },
  },
};

export default function OnboardingPage() {
  const {
    player,
    round,
    timeLeft,
    submitted,
    submitting,
    timeUp,
    submit,
  } = useOnboardingSession(API_URL);

  const [step, setStep] = useState<number>(1);
  const [config, setConfig] = useState<AppConfig>(initialConfig);

  const handleSubmit = () => {
    if (!player || !round) return;

    submit({
      playerId: player.id,
      sessionId: player.sessionId,
      roundId: round.roundId,
      storeId: player.store?.id,
      config,
    });
  };

  return (
    <div className="flex flex-col min-h-screen">

      {/* HEADER */}
      <header className="p-3 border-b text-sm font-bold">
        Rodada: {round?.roundNumber ?? "-"} | Tempo: {timeLeft}s
      </header>

      {/* STEPS NAV */}
      <div className="flex gap-2 p-2 border-b">
        {STEP_LABELS.map((label, i) => (
          <button
            key={i}
            onClick={() => setStep(i + 1)}
            className={`px-3 py-1 rounded text-sm font-bold border ${
              step === i + 1
                ? "bg-black text-white"
                : "bg-white"
            }`}
          >
            {label}
          </button>
        ))}
      </div>

      {/* CONTENT */}
      <main className="flex-1 p-4">
        {step === 1 && (
          <SetupStep
            config={config}
            setConfig={setConfig}
          />
        )}

        {step === 2 && (
          <ComercialStep
            config={config}
            setConfig={setConfig}
          />
        )}

        {step === 3 && (
          <EmployeeStep
            config={config}
            setConfig={setConfig}
          />
        )}

        {step === 4 && (
          <SummaryStep config={config} />
        )}
      </main>

      {/* FOOTER */}
      <footer className="p-3 border-t flex justify-between">
        <button
          onClick={() =>
            setStep((s) => Math.max(1, s - 1))
          }
          className="px-3 py-1 border rounded"
        >
          Voltar
        </button>

        {step < 4 ? (
          <button
            onClick={() =>
              setStep((s) => Math.min(4, s + 1))
            }
            className="px-3 py-1 border rounded bg-black text-white"
          >
            Próximo
          </button>
        ) : (
          <button
            onClick={handleSubmit}
            disabled={
              submitting || timeUp || submitted
            }
            className="px-3 py-1 border rounded bg-green-600 text-white disabled:opacity-50"
          >
            Enviar
          </button>
        )}
      </footer>
    </div>
  );
}