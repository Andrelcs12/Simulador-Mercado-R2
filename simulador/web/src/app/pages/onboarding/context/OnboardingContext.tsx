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

const GAME_RULES = {
  budget: 700000,
  idealCaixaOperators: 10,
  custoOperadorMensal: 2400,
  pctOpexSobreInvestimento: 0.08,
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
  return Number.isFinite(parsedValue) ? Math.max(0, Math.floor(parsedValue)) : fallback;
}

function readStoredMaxStockConfig(): MaxStockConfig {
  if (typeof window === "undefined") return DEFAULT_MAX_STOCK_CONFIG;
  try {
    const stored = window.localStorage.getItem(MAX_STOCK_STORAGE_KEY);
    if (!stored) return DEFAULT_MAX_STOCK_CONFIG;
    const parsed = JSON.parse(stored) as Partial<MaxStockConfig>;
    return {
      pereciveis: sanitizeMaxStock(parsed.pereciveis, DEFAULT_MAX_STOCK_CONFIG.pereciveis),
      mercearia: sanitizeMaxStock(parsed.mercearia, DEFAULT_MAX_STOCK_CONFIG.mercearia),
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

export const COMERCIAL_PRICES: Record<string, number> = {
  pereciveis: 20,
  mercearia: 30,
  eletro: 500,
  hipel: 45,
};

type OnboardingContextType = {
  config: AppConfig;
  setConfig: React.Dispatch<React.SetStateAction<AppConfig>>;
  updateConfig: (partial: Partial<AppConfig>) => void;
  budget: number;
  idealOperators: number;
  maxStockPericiveis: number;
  setMaxStockPericiveis: (v: number) => void;
  maxStockMercearia: number;
  setMaxStockMercearia: (v: number) => void;
  maxStockEletro: number;
  setMaxStockEletro: (v: number) => void;
  maxStockHipel: number;
  setMaxStockHipel: (v: number) => void;
  capexTotal: number;
  comercialTotal: number;
  remainingBudget: number;
  estoqueAnalysis: Record<string, {
    qtd: number;
    maxDisponivel: number;
    pctGasto: number;
    custoTotal: number;
  }>;
  faturamentoAnalysis: Record<string, number>;
  faturamentoPrevistoTotal: number;
  lucroAnalysis: Record<string, number>;
  lucroPrevistoTotal: number;
  performanceMetrics: {
    csat: number;
    sla: number;
    margemMedia: number;
    opexEstimado: number;
    ebitdaPrevisto: number;
    ebitdaMargin: number;
  };
  round: RoundData | null;
  setRound: React.Dispatch<React.SetStateAction<RoundData | null>>;
  timeLeft: number;
  setTimeLeft: React.Dispatch<React.SetStateAction<number>>;
  player: PlayerData | null;
  setPlayer: React.Dispatch<React.SetStateAction<PlayerData | null>>;
  submitted: boolean;
  setSubmitted: React.Dispatch<React.SetStateAction<boolean>>;
  submitting: boolean;
  setSubmitting: React.Dispatch<React.SetStateAction<boolean>>;
};

const OnboardingContext = createContext<OnboardingContextType | null>(null);

const initialConfig: AppConfig = {
  capex: { seguranca: 0, equipamentos: 0, redes: 0, site: 0, selfcheckout: 0, melhoria: 0 },
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

export function OnboardingProvider({ children }: { children: React.ReactNode }) {
  const [config, setConfig] = useState<AppConfig>(initialConfig);
  const [maxStockConfig, setMaxStockConfig] = useState<MaxStockConfig>(readStoredMaxStockConfig);
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
    setMaxStockConfig((prev) => ({ ...prev, pereciveis: sanitizeMaxStock(v, prev.pereciveis) }));
  }, []);
  const setMaxStockMercearia = useCallback((v: number) => {
    setMaxStockConfig((prev) => ({ ...prev, mercearia: sanitizeMaxStock(v, prev.mercearia) }));
  }, []);
  const setMaxStockEletro = useCallback((v: number) => {
    setMaxStockConfig((prev) => ({ ...prev, eletro: sanitizeMaxStock(v, prev.eletro) }));
  }, []);
  const setMaxStockHipel = useCallback((v: number) => {
    setMaxStockConfig((prev) => ({ ...prev, hipel: sanitizeMaxStock(v, prev.hipel) }));
  }, []);

  useEffect(() => {
    window.localStorage.setItem(MAX_STOCK_STORAGE_KEY, JSON.stringify(maxStockConfig));
  }, [maxStockConfig]);

  useEffect(() => {
    const handleMaxStockUpdate = () => setMaxStockConfig(readStoredMaxStockConfig());
    const handleStorage = (e: StorageEvent) => {
      if (e.key !== MAX_STOCK_STORAGE_KEY || !e.newValue) return;
      handleMaxStockUpdate();
    };
    window.addEventListener("storage", handleStorage);
    window.addEventListener(MAX_STOCK_UPDATED_EVENT, handleMaxStockUpdate);
    return () => {
      window.removeEventListener("storage", handleStorage);
      window.removeEventListener(MAX_STOCK_UPDATED_EVENT, handleMaxStockUpdate);
    };
  }, []);

  const budget = useMemo(() => GAME_RULES.budget, []);
  const idealOperators = useMemo(() => GAME_RULES.idealCaixaOperators, []);

  const capexTotal = useMemo(() => {
    if (!config.capex) return 0;
    return Object.values(config.capex).reduce((acc, v) => acc + (v || 0), 0);
  }, [config.capex]);

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

  const comercialTotal = useMemo(() => {
    return Object.values(estoqueAnalysis).reduce((acc, item) => acc + item.custoTotal, 0);
  }, [estoqueAnalysis]);

  const remainingBudget = useMemo(() => {
    return budget - (capexTotal + comercialTotal);
  }, [budget, capexTotal, comercialTotal]);

  const faturamentoAnalysis = useMemo(() => {
    const categoriasKeys = ["pereciveis", "mercearia", "eletro", "hipel"];
    return categoriasKeys.reduce((acc, key) => {
      const estoque = config.comercial?.[key as keyof typeof config.comercial]?.estoque ?? 0;
      const margem = config.comercial?.[key as keyof typeof config.comercial]?.margem ?? 0;
      const custoUn = COMERCIAL_PRICES[key] || 0;
      const precoVenda = margem >= 100 ? 0 : custoUn / (1 - margem / 100);
      acc[key] = estoque * precoVenda;
      return acc;
    }, {} as Record<string, number>);
  }, [config.comercial]);

  const faturamentoPrevistoTotal = useMemo(() => {
    return Object.values(faturamentoAnalysis).reduce((acc, val) => acc + val, 0);
  }, [faturamentoAnalysis]);

  const lucroAnalysis = useMemo(() => {
    const categoriasKeys = ["pereciveis", "mercearia", "eletro", "hipel"];
    return categoriasKeys.reduce((acc, key) => {
      const faturamento = faturamentoAnalysis[key] || 0;
      const custoTotal = estoqueAnalysis[key]?.custoTotal || 0;
      acc[key] = Math.max(0, faturamento - custoTotal);
      return acc;
    }, {} as Record<string, number>);
  }, [faturamentoAnalysis, estoqueAnalysis]);

  const lucroPrevistoTotal = useMemo(() => {
    return Object.values(lucroAnalysis).reduce((acc, val) => acc + val, 0);
  }, [lucroAnalysis]);

  const performanceMetrics = useMemo(() => {
    const opCaixa = config.operadoresCaixa ?? 5;
    const opAtendimento = config.operadoresAtendimento ?? 3;
    const quiz = config.quizScore ?? 100;

    // CSAT centralizado
    const operatorFactor = Math.min(opCaixa / GAME_RULES.idealCaixaOperators, 1);
    const quizFactor = Math.min(Math.max(quiz / 100, 0), 1);
    const csat = Math.round(operatorFactor * quizFactor * 100);

    // Mapeamento correto do SLA conforme as regras do PDF anexado
    let sla = 20; // fallback base se for 0
    if (opAtendimento >= 10) sla = 100;
    else if (opAtendimento === 9) sla = 95;
    else if (opAtendimento === 8) sla = 90;
    else if (opAtendimento === 7) sla = 85;
    else if (opAtendimento === 6) sla = 80;
    else if (opAtendimento === 5) sla = 70;
    else if (opAtendimento === 4) sla = 60;
    else if (opAtendimento === 3) sla = 50; // Alinhado com o seu print (3 funcionários = 50% SLA)
    else if (opAtendimento === 2) sla = 40;
    else if (opAtendimento === 1) sla = 30;

    const categoriasKeys = ["pereciveis", "mercearia", "eletro", "hipel"];
    const margemMedia = categoriasKeys.reduce((acc, key) => acc + (config.comercial?.[key as keyof typeof config.comercial]?.margem ?? 0), 0) / categoriasKeys.length;

    const investimentoTotal = capexTotal + comercialTotal;
    const opexEstimado = (investimentoTotal * GAME_RULES.pctOpexSobreInvestimento) + ((opCaixa + opAtendimento) * GAME_RULES.custoOperadorMensal);
    const ebitdaPrevisto = faturamentoPrevistoTotal - opexEstimado;
    const ebitdaMargin = faturamentoPrevistoTotal > 0 ? (ebitdaPrevisto / faturamentoPrevistoTotal) * 100 : 0;

    return { csat, sla, margemMedia, opexEstimado, ebitdaPrevisto, ebitdaMargin };
  }, [config.operadoresCaixa, config.operadoresAtendimento, config.quizScore, config.comercial, capexTotal, comercialTotal, faturamentoPrevistoTotal]);

  const updateConfig = useCallback((partial: Partial<AppConfig>) => {
    setConfig((prev) => ({ ...prev, ...partial }));
  }, []);

  return (
    <OnboardingContext.Provider
      value={{
        config, setConfig, updateConfig, budget, idealOperators,
        maxStockPericiveis, setMaxStockPericiveis, maxStockMercearia, setMaxStockMercearia,
        maxStockEletro, setMaxStockEletro, maxStockHipel, setMaxStockHipel,
        capexTotal, comercialTotal, remainingBudget, estoqueAnalysis,
        faturamentoAnalysis, faturamentoPrevistoTotal,
        lucroAnalysis, lucroPrevistoTotal, performanceMetrics,
        round, setRound, timeLeft, setTimeLeft, player, setPlayer, submitted, setSubmitted, submitting, setSubmitting
      }}
    >
      {children}
    </OnboardingContext.Provider>
  );
}

export function useOnboarding() {
  const ctx = useContext(OnboardingContext);
  if (!ctx) throw new Error("useOnboarding must be used within OnboardingProvider");
  return ctx;
}