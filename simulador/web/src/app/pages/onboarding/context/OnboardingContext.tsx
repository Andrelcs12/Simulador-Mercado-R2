"use client";

import React, {
  createContext,
  useContext,
  useState,
  useCallback,
  useMemo,
} from "react";

import { AppConfig, PlayerData, RoundData } from "../types/onboarding";

// ─────────────────────────────────────────────
// GAME RULES & CONSTANTS (BASEADO NA DOC)
// ─────────────────────────────────────────────

const GAME_RULES = {
  budget: 700000,            // Caixa inicial de R$ 700 mil
  idealCaixaOperators: 10,   // Quadro ideal de operados de caixa para o CSAT
};

// Custos unitários exatos por categoria retirados da documentação
export const COMERCIAL_PRICES: Record<string, number> = {
  pereciveis: 20,
  mercearia: 30,
  eletro: 500,
  hipel: 45,
};

// Limites máximos de estoque por categoria retirados da documentação
export const COMERCIAL_MAX_STOCK: Record<string, number> = {
  pereciveis: 5000,
  mercearia: 4000,
  eletro: 400,
  hipel: 3000,
};

// ─────────────────────────────────────────────
// CONTEXT TYPE
// ─────────────────────────────────────────────

type OnboardingContextType = {
  // CONFIG
  config: AppConfig;
  setConfig: React.Dispatch<React.SetStateAction<AppConfig>>;
  updateConfig: (partial: Partial<AppConfig>) => void;

  // GAME RULES
  budget: number;
  idealOperators: number;

  // DERIVADOS REATIVOS
  capexTotal: number;
  comercialTotal: number;
  remainingBudget: number;

  // ROUND
  round: RoundData | null;
  setRound: React.Dispatch<React.SetStateAction<RoundData | null>>; // ✅ CORRIGIDO: Agora aceita (prev => ...)

  // TIMER
  timeLeft: number;
  setTimeLeft: React.Dispatch<React.SetStateAction<number>>;

  // PLAYER
  player: PlayerData | null;
  setPlayer: React.Dispatch<React.SetStateAction<PlayerData | null>>;

  // FLOW STATE
  submitted: boolean;
  setSubmitted: React.Dispatch<React.SetStateAction<boolean>>;

  submitting: boolean;
  setSubmitting: React.Dispatch<React.SetStateAction<boolean>>;
};

// ─────────────────────────────────────────────
// CONTEXT
// ─────────────────────────────────────────────

const OnboardingContext = createContext<OnboardingContextType | null>(null);

// ─────────────────────────────────────────────
// INITIAL CONFIG
// ─────────────────────────────────────────────

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

// ─────────────────────────────────────────────
// PROVIDER
// ─────────────────────────────────────────────

export function OnboardingProvider({
  children,
}: {
  children: React.ReactNode;
}) {
  const [config, setConfig] = useState<AppConfig>(initialConfig);
  const [round, setRound] = useState<RoundData | null>(null);
  const [timeLeft, setTimeLeft] = useState(0);
  const [player, setPlayer] = useState<PlayerData | null>(null);
  const [submitted, setSubmitted] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  // ─────────────────────────────
  // REGRAS FIXAS
  // ─────────────────────────────

  const budget = useMemo(() => GAME_RULES.budget, []);
  const idealOperators = useMemo(
    () => GAME_RULES.idealCaixaOperators,
    []
  );

  // ─────────────────────────────
  // 🔥 CAPEX TOTAL (REATIVO)
  // ─────────────────────────────

  const capexTotal = useMemo(() => {
    if (!config.capex) return 0;
    return Object.values(config.capex).reduce(
      (acc, v) => acc + (v || 0),
      0
    );
  }, [config.capex]);

  // ─────────────────────────────
  // 🔥 COMERCIAL TOTAL (ESTOQUE REALTIME)
  // ─────────────────────────────

  const comercialTotal = useMemo(() => {
    if (!config.comercial) return 0;
    return Object.entries(config.comercial).reduce((acc, [key, item]) => {
      const custoUnitario = COMERCIAL_PRICES[key] || 0;
      const quantidade = item?.estoque || 0;
      return acc + (quantidade * custoUnitario);
    }, 0);
  }, [config.comercial]);

  // ─────────────────────────────
  // 🔥 SALDO REAL INTEGRADO (GLOBAL)
  // ─────────────────────────────

  const remainingBudget = useMemo(() => {
    // Deduz o CAPEX e o Estoque Comercial do Orçamento Total de R$ 700k
    return budget - (capexTotal + comercialTotal);
  }, [budget, capexTotal, comercialTotal]);

  // ─────────────────────────────
  // UPDATE CONFIG
  // ─────────────────────────────

  const updateConfig = useCallback((partial: Partial<AppConfig>) => {
    setConfig((prev) => ({
      ...prev,
      ...partial,
    }));
  }, []);

  return (
    <OnboardingContext.Provider
      value={{
        config,
        setConfig,
        updateConfig,

        budget,
        idealOperators,

        capexTotal,
        comercialTotal,
        remainingBudget,

        round,
        setRound,

        timeLeft,
        setTimeLeft,

        player,
        setPlayer,

        submitted,
        setSubmitted,

        submitting,
        setSubmitting,
      }}
    >
      {children}
    </OnboardingContext.Provider>
  );
}

// ─────────────────────────────────────────────
// HOOK
// ─────────────────────────────────────────────

export function useOnboarding() {
  const ctx = useContext(OnboardingContext);

  if (!ctx) {
    throw new Error("useOnboarding must be used within OnboardingProvider");
  }

  return ctx;
}