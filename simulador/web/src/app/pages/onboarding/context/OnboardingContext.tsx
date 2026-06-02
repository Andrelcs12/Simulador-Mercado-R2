"use client";

import React, {
  createContext,
  useContext,
  useEffect,
  useState,
  useCallback,
  useMemo,
} from "react";

import type { 
  AppConfig, 
  PlayerData, 
  RoundData, 
  CapexKey, 
  CategoriaKey 
} from "../types/onboarding";

// ============================================================================
// CAMADA 1: REGRAS DE NEGÓCIO ESTÁTICAS E PREMISSAS DA DOCUMENTAÇÃO
// ============================================================================
const GAME_RULES = {
  budget: 700000,
  idealCaixaOperators: 10,
  salarioOperadorCaixa: 1500,     
  salarioOperadorServico: 1600,   
  custoLicencaPlataformaBase: 500,
  custoManutencaoPadraoBalanca: 400,
  quantidadeSelfCheckouts: 4,
  custoLicencaPorSelf: 80,
  taxaJurosExcedente: 0.12, // 12% ao mês
};

export const COMERCIAL_PRICES: Record<string, number> = {
  pereciveis: 20,
  mercearia: 30,
  eletro: 500,
  hipel: 45,
};

export const TAX_RATES: Record<string, number> = {
  pereciveis: 0.18,
  mercearia: 0.18,
  eletro: 0.25,
  hipel: 0.18,
};

export const CAPEX_CONSEQUENCES = {
  seguranca: { diasParadosTotal: 2, escopo: "Parada total da loja (Ataque Cibernético)" },
  equipamentos: { diasParadosTotal: 3, escopo: "Fica sem vender Perecíveis (Defeito Balança/Freezer)" },
  redes: { diasParadosTotal: 1, escopo: "Parada total da loja (Oscilação de Rede/PDV)" },
  site: { diasParadosTotal: 2, escopo: "Fica sem vender no canal digital (Instabilidade)" },
  selfcheckout: { perdaVendaProporcional: "Proporcional aos dias de pico", escopo: "Perda de vendas por filas" },
  melhoria: { restricaoExpansao: true, escopo: "Sobrecarga do time e gargalo operacional" }
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

type OnboardingAction = 
  | { type: "UPDATE_CAPEX"; payload: { id: CapexKey; value: number } }
  | { type: "UPDATE_STOCK"; payload: { cat: CategoriaKey; value: number } }
  | { type: "UPDATE_MARGEM"; payload: { cat: CategoriaKey; value: number } };

type DetalheMapeado = {
  area: string;
  impacto: string;
  status: "Protegido" | "Exposto";
};

type OnboardingContextType = {
  config: AppConfig;
  setConfig: React.Dispatch<React.SetStateAction<AppConfig>>;
  
  // Estados de Estoque (Acessadores)
  maxStockPericiveis: number;
  maxStockMercearia: number;
  maxStockEletro: number;
  maxStockHipel: number;
  // Setter para atualização em bloco (evita erro de tipo no hook)
  setMaxStockConfig: React.Dispatch<React.SetStateAction<MaxStockConfig>>;
  
  budget: number;
  idealOperators: number;
  capexTotal: number;
  comercialTotal: number;
  remainingBudget: number;
  estoqueAnalysis: Record<string, {
    qtd: number;
    maxDisponivel: number;
    pctGasto: number;
    custoTotal: number;
  }>;
  faturamentoAnalysis: Record<string, {
    faturamentoBruto: number;
    impostoDedução: number;
    faturamentoLiquido: number;
  }>;
  faturamentoBrutoTotal: number;
  faturamentoLiquidoTotal: number;
  lucroAnalysis: Record<string, {
    lucroBruto: number;
    lucroLiquidoPrevisto: number;
  }>;
  lucroPrevistoTotal: number;
  ebitdaPrevistoProjecao: number;
  performanceMetrics: {
    csat: number;
    sla: number;
    margemMedia: number;
    opexEstimado: number;
    custoFinanceiroExcedente: number;
  };
  riscosEConsequencias: {
    segurancaAtaqueRisco: boolean;
    equipamentosDefeitoRisco: boolean;
    redesQuedaRisco: boolean;
    siteIndisponivelRisco: boolean;
    selfCheckoutGargaloRisco: boolean;
    produtividadeGargaloRisco: boolean;
    detalhesMapeados: DetalheMapeado[];
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
  dispatch: (action: OnboardingAction) => void;
  toggleCapex: (id: CapexKey, custo: number) => void;
  updateStock: (cat: CategoriaKey, value: number) => void;
  changeStock: (cat: CategoriaKey, delta: number) => void;
  updateMargem: (cat: CategoriaKey, value: number) => void;
  changeMargemStep: (cat: CategoriaKey, delta: number) => void;
  updateOperators: (field: "operadoresCaixa" | "operadoresAtendimento", value: number) => void;
  updateQuizScore: (value: number) => void;
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

function sanitizeMaxStock(value: unknown, fallback: number): number {
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

  // ... dentro do OnboardingProvider
  useEffect(() => {
    // Esta função lê o que o socket acabou de salvar no localStorage
    const handleMaxStockUpdate = () => {
      const novoEstoque = readStoredMaxStockConfig();
      setMaxStockConfig(novoEstoque);
    };

    const handleStorage = (e: StorageEvent) => {
      if (e.key === "round_config_max_stock") {
        handleMaxStockUpdate();
      }
    };

    window.addEventListener("storage", handleStorage);
    window.addEventListener("round_config_max_stock_updated", handleMaxStockUpdate);
    
    return () => {
      window.removeEventListener("storage", handleStorage);
      window.removeEventListener("round_config_max_stock_updated", handleMaxStockUpdate);
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
      const aliquotaImposto = TAX_RATES[key] || 0;
      
      const precoVenda = custoUn * (1 + margem / 100);
      const faturamentoBruto = estoque * precoVenda;
      const impostoDedução = faturamentoBruto * aliquotaImposto;
      const faturamentoLiquido = faturamentoBruto - impostoDedução;

      acc[key] = {
        faturamentoBruto,
        impostoDedução,
        faturamentoLiquido
      };
      return acc;
    }, {} as Record<string, { faturamentoBruto: number; impostoDedução: number; faturamentoLiquido: number }>);
  }, [config.comercial]);

  const faturamentoBrutoTotal = useMemo(() => {
    return Object.values(faturamentoAnalysis).reduce((acc, val) => acc + val.faturamentoBruto, 0);
  }, [faturamentoAnalysis]);

  const faturamentoLiquidoTotal = useMemo(() => {
    return Object.values(faturamentoAnalysis).reduce((acc, val) => acc + val.faturamentoLiquido, 0);
  }, [faturamentoAnalysis]);

  const lucroAnalysis = useMemo(() => {
    const categoriasKeys = ["pereciveis", "mercearia", "eletro", "hipel"];
    return categoriasKeys.reduce((acc, key) => {
      const itemFaturamento = faturamentoAnalysis[key];
      const custoTotal = estoqueAnalysis[key]?.custoTotal || 0;
      
      const lucroBruto = Math.max(0, (itemFaturamento?.faturamentoBruto || 0) - custoTotal);
      const lucroLiquidoPrevisto = Math.max(0, (itemFaturamento?.faturamentoLiquido || 0) - custoTotal);

      acc[key] = { lucroBruto, lucroLiquidoPrevisto };
      return acc;
    }, {} as Record<string, { lucroBruto: number; lucroLiquidoPrevisto: number }>);
  }, [faturamentoAnalysis, estoqueAnalysis]);

  const lucroPrevistoTotal = useMemo(() => {
    return Object.values(lucroAnalysis).reduce((acc, val) => acc + val.lucroLiquidoPrevisto, 0);
  }, [lucroAnalysis]);

  const performanceMetrics = useMemo(() => {
    const opCaixa = config.operadoresCaixa ?? 5;
    const opAtendimento = config.operadoresAtendimento ?? 3;
    const quiz = config.quizScore ?? 100;

    const operatorFactor = Math.min(opCaixa / GAME_RULES.idealCaixaOperators, 1);
    const quizFactor = Math.min(Math.max(quiz / 100, 0), 1);
    const csat = Math.round(operatorFactor * quizFactor * 100);

    let sla = 20;
    if (opAtendimento >= 10) sla = 100;
    else if (opAtendimento === 9) sla = 95;
    else if (opAtendimento === 8) sla = 90;
    else if (opAtendimento === 7) sla = 85;
    else if (opAtendimento === 6) sla = 80;
    else if (opAtendimento === 5) sla = 70;
    else if (opAtendimento === 4) sla = 60;
    else if (opAtendimento === 3) sla = 50;
    else if (opAtendimento === 2) sla = 40;
    else if (opAtendimento === 1) sla = 30;

    const categoriasKeys = ["pereciveis", "mercearia", "eletro", "hipel"];
    const margemMedia = categoriasKeys.reduce((acc, key) => acc + (config.comercial?.[key as keyof typeof config.comercial]?.margem ?? 0), 0) / categoriasKeys.length;

    const custoFolhaCaixa = opCaixa * GAME_RULES.salarioOperadorCaixa;
    const custoFolhaServico = opAtendimento * GAME_RULES.salarioOperadorServico;

    const licencaSeguranca = (config.capex?.seguranca ?? 0) > 0 ? (GAME_RULES.custoLicencaPlataformaBase * 0.20) : 0;
    const licencaSite = (config.capex?.site ?? 0) > 0 ? (GAME_RULES.custoLicencaPlataformaBase * 0.30) : 0;
    const licencaSelfCheckout = (config.capex?.selfcheckout ?? 0) > 0 ? (GAME_RULES.quantidadeSelfCheckouts * GAME_RULES.custoLicencaPorSelf) : 0;
    const reducaoManutencaoBalanca = (config.capex?.equipamentos ?? 0) > 0 ? -GAME_RULES.custoManutencaoPadraoBalanca : 0;

    const totalSoftwareEManutencao = 
      GAME_RULES.custoLicencaPlataformaBase + 
      GAME_RULES.custoManutencaoPadraoBalanca + 
      licencaSeguranca + 
      licencaSite + 
      licencaSelfCheckout + 
      reducaoManutencaoBalanca;

    const opexEstimado = custoFolhaCaixa + custoFolhaServico + totalSoftwareEManutencao;
    const custoFinanceiroExcedente = remainingBudget < 0 ? Math.abs(remainingBudget) * GAME_RULES.taxaJurosExcedente : 0;

    return { csat, sla, margemMedia, opexEstimado, custoFinanceiroExcedente };
  }, [config.operadoresCaixa, config.operadoresAtendimento, config.quizScore, config.capex, remainingBudget]);

  const ebitdaPrevistoProjecao = useMemo(() => {
    return faturamentoLiquidoTotal - comercialTotal - performanceMetrics.opexEstimado - performanceMetrics.custoFinanceiroExcedente;
  }, [faturamentoLiquidoTotal, comercialTotal, performanceMetrics]);

  const riscosEConsequencias = useMemo(() => {
    const checkSeguranca = !(config.capex?.seguranca && config.capex.seguranca > 0);
    const checkEquipamentos = !(config.capex?.equipamentos && config.capex.equipamentos > 0);
    const checkRedes = !(config.capex?.redes && config.capex.redes > 0);
    const checkSite = !(config.capex?.site && config.capex.site > 0);
    const checkSelf = !(config.capex?.selfcheckout && config.capex.selfcheckout > 0);
    const checkMelhoria = !(config.capex?.melhoria && config.capex.melhoria > 0);

    const detalhes: DetalheMapeado[] = [
      { area: "Segurança Cibernética", impacto: checkSeguranca ? `Risco de ficar ${CAPEX_CONSEQUENCES.seguranca.diasParadosTotal} dias sem operar em caso de ataque.` : "Protegido (+20% taxa licença adicionado)", status: checkSeguranca ? "Exposto" : "Protegido" },
      { area: "Equipamentos (Balança/Freezer)", impacto: checkEquipamentos ? `Risco de ficar ${CAPEX_CONSEQUENCES.equipamentos.diasParadosTotal} dias sem vender Perecíveis se quebrar. Taxa de R$400 ativa.` : "Garantia ativada (Taxa de R$400 zerada no OPEX)", status: checkEquipamentos ? "Exposto" : "Protegido" },
      { area: "Infraestrutura de Redes", impacto: checkRedes ? `Risco de ficar ${CAPEX_CONSEQUENCES.redes.diasParadosTotal} dia sem operar se houver oscilação no PDV/Cartão.` : "Infraestrutura robusta e migrada", status: checkRedes ? "Exposto" : "Protegido" },
      { area: "Melhorias no Site", impacto: checkSite ? `Risco de perder vendas por lentidão ou ${CAPEX_CONSEQUENCES.site.diasParadosTotal} dias fora do ar.` : "Plataforma robusta (+30% taxa licença adicionado)", status: checkSite ? "Exposto" : "Protegido" },
      { area: "Self Checkout", impacto: checkSelf ? "Filas longas em picos de clientes causarão perdas proporcionais de vendas." : "4 Máquinas ativas (+R$320/mês de custo fixo mapeado)", status: checkSelf ? "Exposto" : "Protegido" },
      { area: "Melhoria Contínua (Processos)", impacto: checkMelhoria ? "Gargalo operacional: relatórios demorados (2h) e time sem braço para expansão." : "Automação com Robôs/IA implantada com sucesso", status: checkMelhoria ? "Exposto" : "Protegido" }
    ];

    return {
      segurancaAtaqueRisco: checkSeguranca,
      equipamentosDefeitoRisco: checkEquipamentos,
      redesQuedaRisco: checkRedes,
      siteIndisponivelRisco: checkSite,
      selfCheckoutGargaloRisco: checkSelf,
      produtividadeGargaloRisco: checkMelhoria,
      detalhesMapeados: detalhes
    };
  }, [config.capex]);

  // ============================================================================
  // CAMADA 5: CALLBACKS DE MUTAÇÃO DE ESTADO (Corrigidos contra mutação fantasma)
  // ============================================================================
  const toggleCapex = useCallback((id: CapexKey, custo: number) => {
    setConfig((prev) => {
      const isSelected = (prev.capex?.[id] ?? 0) > 0;
      return {
        ...prev,
        capex: { ...prev.capex, [id]: isSelected ? 0 : custo },
      };
    });
  }, []);

  const getMaxStockLimit = useCallback((cat: CategoriaKey) => {
    if (cat === "pereciveis") return maxStockPericiveis;
    if (cat === "mercearia") return maxStockMercearia;
    if (cat === "eletro") return maxStockEletro;
    return maxStockHipel;
  }, [maxStockPericiveis, maxStockMercearia, maxStockEletro, maxStockHipel]);

  const updateStock = useCallback((cat: CategoriaKey, value: number) => {
    const maxEstoque = getMaxStockLimit(cat);
    const sanitizedValue = Number.isNaN(value) ? 0 : Math.abs(value);
    const safeValue = Math.min(sanitizedValue, maxEstoque);

    setConfig((prev) => ({
      ...prev,
      comercial: {
        ...prev.comercial,
        [cat]: {
          ...prev.comercial?.[cat],
          estoque: safeValue,
          margem: prev.comercial?.[cat]?.margem ?? 0,
        },
      },
    }));
  }, [getMaxStockLimit]);

  const changeStock = useCallback((cat: CategoriaKey, delta: number) => {
    setConfig((prev) => {
      const current = prev.comercial?.[cat]?.estoque ?? 0;
      const maxEstoque = getMaxStockLimit(cat);
      const safeValue = Math.max(0, Math.min(current + delta, maxEstoque));
      return {
        ...prev,
        comercial: {
          ...prev.comercial,
          [cat]: {
            ...prev.comercial?.[cat],
            estoque: safeValue,
            margem: prev.comercial?.[cat]?.margem ?? 0,
          },
        },
      };
    });
  }, [getMaxStockLimit]);

  const updateMargem = useCallback((cat: CategoriaKey, value: number) => {
    const sanitizedValue = Number.isNaN(value) ? 0 : Math.abs(value);
    const safeMargem = Math.max(0, Math.min(95, sanitizedValue));

    setConfig((prev) => ({
      ...prev,
      comercial: {
        ...prev.comercial,
        [cat]: {
          ...prev.comercial?.[cat],
          estoque: prev.comercial?.[cat]?.estoque ?? 0,
          margem: safeMargem,
        },
      },
    }));
  }, []);

  const changeMargemStep = useCallback((cat: CategoriaKey, delta: number) => {
    setConfig((prev) => {
      const current = prev.comercial?.[cat]?.margem ?? 0;
      const safeMargem = Math.max(0, Math.min(95, current + delta));
      return {
        ...prev,
        comercial: {
          ...prev.comercial,
          [cat]: {
            ...prev.comercial?.[cat],
            estoque: prev.comercial?.[cat]?.estoque ?? 0,
            margem: safeMargem,
          },
        },
      };
    });
  }, []);

  const updateOperators = useCallback((field: "operadoresCaixa" | "operadoresAtendimento", value: number) => {
    setConfig((prev) => ({
      ...prev,
      [field]: Math.max(0, Math.min(20, value)),
    }));
  }, []);

  const updateQuizScore = useCallback((value: number) => {
    setConfig((prev) => ({
      ...prev,
      quizScore: Math.max(0, Math.min(100, value)),
    }));
  }, []);

  const dispatch = useCallback((action: OnboardingAction) => {
    switch (action.type) {
      case "UPDATE_CAPEX":
        toggleCapex(action.payload.id, action.payload.value);
        break;
      case "UPDATE_STOCK":
        updateStock(action.payload.cat, action.payload.value);
        break;
      case "UPDATE_MARGEM":
        updateMargem(action.payload.cat, action.payload.value);
        break;
    }
  }, [toggleCapex, updateStock, updateMargem]);

  return (
    <OnboardingContext.Provider
      value={{
        config, 
        setConfig, 
        budget, 
        idealOperators,
        // Estados individuais de estoque (mantidos para compatibilidade)
        maxStockPericiveis, 
        maxStockMercearia, 
        maxStockEletro, 
        maxStockHipel,
        // O setter que faltava para permitir a atualização no Hook
        setMaxStockConfig, 
        capexTotal, 
        comercialTotal, 
        remainingBudget, 
        estoqueAnalysis,
        faturamentoAnalysis, 
        faturamentoBrutoTotal, 
        faturamentoLiquidoTotal,
        lucroAnalysis, 
        lucroPrevistoTotal, 
        ebitdaPrevistoProjecao, 
        performanceMetrics,
        riscosEConsequencias,
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
        dispatch,
        toggleCapex, 
        updateStock, 
        changeStock, 
        updateMargem, 
        changeMargemStep, 
        updateOperators, 
        updateQuizScore
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