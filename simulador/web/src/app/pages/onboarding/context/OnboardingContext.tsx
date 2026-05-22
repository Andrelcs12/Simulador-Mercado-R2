"use client";

import type React from "react";
import {
  createContext,
  useContext,
  useEffect,
  useState,
  useCallback,
  useMemo,
} from "react";

import type { AppConfig, PlayerData, RoundData } from "../types/onboarding";

// ─────────────────────────────────────────────
// GAME RULES & CONSTANTS (BASEADO NA DOC)
// ─────────────────────────────────────────────

const GAME_RULES = {
  budget: 700000,           // Caixa inicial de R$ 700 mil
  idealCaixaOperators: 10,   // Quadro ideal de operados de caixa para o CSAT
};

export type MaxStockConfig = {
  pereciveis: number;
  mercearia: number;
  eletro: number;
  hipel: number;
};

export const MAX_STOCK_STORAGE_KEY = "round_config_max_stock";
export const MAX_STOCK_UPDATED_EVENT = "round_config_max_stock_updated";

const DEFAULT_MAX_STOCK_CONFIG: MaxStockConfig = {
  pereciveis: 5000,
  mercearia: 4000,
  eletro: 400,
  hipel: 3000,
};

function sanitizeMaxStock(value: unknown, fallback: number) {
  const parsedValue = Number(value);

  return Number.isFinite(parsedValue)
    ? Math.max(0, Math.floor(parsedValue))
    : fallback;
}

function readStoredMaxStockConfig(): MaxStockConfig {
  if (typeof window === "undefined") {
    return DEFAULT_MAX_STOCK_CONFIG;
  }

  try {
    const stored = window.localStorage.getItem(MAX_STOCK_STORAGE_KEY);

    if (!stored) {
      return DEFAULT_MAX_STOCK_CONFIG;
    }

    const parsed = JSON.parse(stored) as Partial<MaxStockConfig>;

    return {
      pereciveis: sanitizeMaxStock(
        parsed.pereciveis,
        DEFAULT_MAX_STOCK_CONFIG.pereciveis
      ),
      mercearia: sanitizeMaxStock(
        parsed.mercearia,
        DEFAULT_MAX_STOCK_CONFIG.mercearia
      ),
      eletro: sanitizeMaxStock(parsed.eletro, DEFAULT_MAX_STOCK_CONFIG.eletro),
      hipel: sanitizeMaxStock(parsed.hipel, DEFAULT_MAX_STOCK_CONFIG.hipel),
    };
  } catch {
    return DEFAULT_MAX_STOCK_CONFIG;
  }
}

export function persistMaxStockConfig(config: Partial<MaxStockConfig>) {
  if (typeof window === "undefined") return;

  const current = readStoredMaxStockConfig();
  const next: MaxStockConfig = {
    pereciveis: sanitizeMaxStock(config.pereciveis, current.pereciveis),
    mercearia: sanitizeMaxStock(config.mercearia, current.mercearia),
    eletro: sanitizeMaxStock(config.eletro, current.eletro),
    hipel: sanitizeMaxStock(config.hipel, current.hipel),
  };

  window.localStorage.setItem(MAX_STOCK_STORAGE_KEY, JSON.stringify(next));
  window.dispatchEvent(new Event(MAX_STOCK_UPDATED_EVENT));
}

// Custos unitários exatos por categoria retirados da documentação
export const COMERCIAL_PRICES: Record<string, number> = {
  pereciveis: 20,
  mercearia: 30,
  eletro: 500,
  hipel: 45,
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

  // MAX STOCK DINÂMICO POR CATEGORIA
  maxStockPericiveis: number;
  setMaxStockPericiveis: (v: number) => void;
  maxStockMercearia: number;
  setMaxStockMercearia: (v: number) => void;
  maxStockEletro: number;
  setMaxStockEletro: (v: number) => void;
  maxStockHipel: number;
  setMaxStockHipel: (v: number) => void;

  // DERIVADOS REATIVOS
  capexTotal: number;
  comercialTotal: number;
  remainingBudget: number;
  
  // ANÁLISE DE ESTOQUE INTEGRADA
  estoqueAnalysis: Record<string, {
    qtd: number;
    maxDisponivel: number;
    pctGasto: number;
    custoTotal: number;
  }>;

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
  const [maxStockConfig, setMaxStockConfig] = useState<MaxStockConfig>(
    readStoredMaxStockConfig
  );
  const [round, setRound] = useState<RoundData | null>(null);
  const [timeLeft, setTimeLeft] = useState(0);
  const [player, setPlayer] = useState<PlayerData | null>(null);
  const [submitted, setSubmitted] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  const maxStockPericiveis = maxStockConfig.pereciveis;
  const maxStockMercearia = maxStockConfig.mercearia;
  const maxStockEletro = maxStockConfig.eletro;
  const maxStockHipel = maxStockConfig.hipel;

  const setMaxStockPericiveis = useCallback((v: number) => {
    setMaxStockConfig((prev) => ({
      ...prev,
      pereciveis: sanitizeMaxStock(v, prev.pereciveis),
    }));
  }, []);

  const setMaxStockMercearia = useCallback((v: number) => {
    setMaxStockConfig((prev) => ({
      ...prev,
      mercearia: sanitizeMaxStock(v, prev.mercearia),
    }));
  }, []);

  const setMaxStockEletro = useCallback((v: number) => {
    setMaxStockConfig((prev) => ({
      ...prev,
      eletro: sanitizeMaxStock(v, prev.eletro),
    }));
  }, []);

  const setMaxStockHipel = useCallback((v: number) => {
    setMaxStockConfig((prev) => ({
      ...prev,
      hipel: sanitizeMaxStock(v, prev.hipel),
    }));
  }, []);

  useEffect(() => {
    window.localStorage.setItem(
      MAX_STOCK_STORAGE_KEY,
      JSON.stringify(maxStockConfig)
    );
  }, [maxStockConfig]);

  useEffect(() => {
    const handleMaxStockUpdate = () => {
      setMaxStockConfig(readStoredMaxStockConfig());
    };

    const handleStorage = (event: StorageEvent) => {
      if (event.key !== MAX_STOCK_STORAGE_KEY || !event.newValue) return;
      handleMaxStockUpdate();
    };

    window.addEventListener("storage", handleStorage);
    window.addEventListener(MAX_STOCK_UPDATED_EVENT, handleMaxStockUpdate);

    return () => {
      window.removeEventListener("storage", handleStorage);
      window.removeEventListener(
        MAX_STOCK_UPDATED_EVENT,
        handleMaxStockUpdate
      );
    };
  }, []);

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
  // 🔥 ANÁLISE DETALHADA E REATIVA DO ESTOQUE
  // ─────────────────────────────

  const estoqueAnalysis = useMemo(() => {
    const categorias = [
      { key: "pereciveis", maxStock: maxStockPericiveis },
      { key: "mercearia", maxStock: maxStockMercearia },
      { key: "eletro", maxStock: maxStockEletro },
      { key: "hipel", maxStock: maxStockHipel },
    ];
    
    return categorias.reduce((acc, { key, maxStock }) => {
      const qtd = config.comercial?.[key as keyof typeof config.comercial]?.estoque ?? 0;
      const custoUnitario = COMERCIAL_PRICES[key] || 0;
      
      acc[key] = {
        qtd,
        maxDisponivel: maxStock,
        pctGasto: maxStock > 0 ? (qtd / maxStock) * 100 : 0,
        custoTotal: qtd * custoUnitario,
      };
      return acc;
    }, {} as Record<string, { qtd: number; maxDisponivel: number; pctGasto: number; custoTotal: number }>);
  }, [config.comercial, maxStockPericiveis, maxStockMercearia, maxStockEletro, maxStockHipel]);

  // ─────────────────────────────
  // 🔥 COMERCIAL TOTAL (ESTOQUE REALTIME)
  // ─────────────────────────────

  const comercialTotal = useMemo(() => {
    return Object.values(estoqueAnalysis).reduce((acc, item) => acc + item.custoTotal, 0);
  }, [estoqueAnalysis]);

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

        maxStockPericiveis,
        setMaxStockPericiveis,
        maxStockMercearia,
        setMaxStockMercearia,
        maxStockEletro,
        setMaxStockEletro,
        maxStockHipel,
        setMaxStockHipel,

        capexTotal,
        comercialTotal,
        remainingBudget,
        estoqueAnalysis,

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
