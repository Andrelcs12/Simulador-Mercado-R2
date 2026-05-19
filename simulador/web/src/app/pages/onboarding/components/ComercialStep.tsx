"use client";

import React, { useMemo } from "react";
import { motion } from "framer-motion";
import {
  ShoppingBasket,
  Package,
  Computer,
  Droplets,
  Minus,
  Plus,
  LucideIcon,
  TrendingUp,
} from "lucide-react";

import { AppConfig, CategoriaKey } from "../types/onboarding";
import { useOnboarding } from "../context/OnboardingContext";

interface Props {
  config: AppConfig;
  setConfig: React.Dispatch<React.SetStateAction<AppConfig>>;
}

interface Categoria {
  id: CategoriaKey;
  label: string;
  Icon: LucideIcon;
  custoUn: number;
  cor: string;
  bg: string;
  borderColor: string;
  descricao: string;
  maxEstoque: number;
}

const CATEGORIAS: Categoria[] = [
  {
    id: "pereciveis",
    label: "Perecíveis",
    Icon: ShoppingBasket,
    custoUn: 20.0,
    cor: "text-rose-500",
    bg: "bg-rose-50/50",
    borderColor: "focus-within:border-rose-400",
    descricao: "Alta rotatividade e sensível à ruptura de estoque.",
    maxEstoque: 5000,
  },
  {
    id: "mercearia",
    label: "Mercearia",
    Icon: Package,
    custoUn: 30.0,
    cor: "text-blue-500",
    bg: "bg-blue-50/50",
    borderColor: "focus-within:border-blue-400",
    descricao: "Demanda estável e previsível no dia a dia.",
    maxEstoque: 12000,
  },
  {
    id: "eletro",
    label: "Eletrodomésticos",
    Icon: Computer,
    custoUn: 500.0,
    cor: "text-emerald-500",
    bg: "bg-emerald-50/50",
    borderColor: "focus-within:border-emerald-400",
    descricao: "Ticket alto com forte impacto na margem de lucro.",
    maxEstoque: 2000,
  },
  {
    id: "hipel",
    label: "Higiene & Limpeza",
    Icon: Droplets,
    custoUn: 45.0,
    cor: "text-amber-500",
    bg: "bg-amber-50/50",
    borderColor: "focus-within:border-amber-400",
    descricao: "Compra recorrente com alta elasticidade de preço.",
    maxEstoque: 8000,
  },
];

// Fórmulas de projeção sincronizadas com o SimulationService (NestJS Backend)
function calcCSAT(opCaixa: number, quizScore: number): number {
  const operatorFactor = Math.min(opCaixa / 10, 1);
  const quizFactor = Math.min(Math.max(quizScore / 100, 0), 1);
  return Math.round(operatorFactor * quizFactor * 100);
}

function calcSLA(serviceOperatorsQty: number): number {
  if (serviceOperatorsQty >= 8) return 95;
  if (serviceOperatorsQty >= 6) return 85;
  if (serviceOperatorsQty >= 4) return 75;
  if (serviceOperatorsQty >= 2) return 60;
  return 40;
}

const STOCK_STEP = 100;
const MARGIN_STEP = 5;

export default function ComercialStep({ config, setConfig }: Props) {
  // Consome o estado orçamentário compartilhado
  const { remainingBudget } = useOnboarding();

  const opCaixa = config.operadoresCaixa ?? 5;
  const opAtendimento = config.operadoresAtendimento ?? 3;
  const quiz = config.quizScore ?? 100;

  const csat = calcCSAT(opCaixa, quiz);
  const sla = calcSLA(opAtendimento);

  // Calcula o somatório do capital investido em estoque baseado no estado atual
  const estoqueTotal = useMemo(() => {
    return CATEGORIAS.reduce((acc, c) => {
      const qtd = config.comercial?.[c.id]?.estoque ?? 0;
      return acc + (qtd * c.custoUn);
    }, 0);
  }, [config.comercial]);

  // Calcula o caixa final líquido (o remainingBudget do contexto já desconta o CAPEX fixado)
  const saldoFinal = remainingBudget - estoqueTotal;

  // Retorna o teto matemático e financeiro absoluto para compra da categoria
  const getMaxAllowed = (c: Categoria, currentStock: number) => {
    const disponivelTeorico = saldoFinal + (currentStock * c.custoUn);
    const budgetLimit = Math.floor(disponivelTeorico / c.custoUn);
    return Math.max(0, Math.min(c.maxEstoque, budgetLimit));
  };

  const updateStock = (cat: CategoriaKey, value: number) => {
    const c = CATEGORIAS.find((x) => x.id === cat)!;
    const current = config.comercial?.[cat]?.estoque ?? 0;
    const maxAllowed = getMaxAllowed(c, current);

    const safeValue = Math.max(0, Math.min(value, maxAllowed));

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
  };

  const changeStock = (c: Categoria, delta: number) => {
    const current = config.comercial?.[c.id]?.estoque ?? 0;
    updateStock(c.id, current + delta);
  };

  const updateMargem = (cat: CategoriaKey, value: number) => {
    const safeMargem = Math.max(0, Math.min(200, value || 0));

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
  };

  const changeMargemStep = (cat: CategoriaKey, delta: number) => {
    const current = config.comercial?.[cat]?.margem ?? 0;
    updateMargem(cat, current + delta);
  };

  return (
    <div className="space-y-8">
      {/* HEADER DA SEÇÃO */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6 border-b border-slate-100 pb-6">
        <div className="border-l-4 border-orange-500 pl-4">
          <p className="text-[11px] uppercase tracking-wider font-black text-orange-500">
            Etapa 2 — Gestão e Estratégia
          </p>
          <h2 className="text-2xl font-black text-slate-900 tracking-tight">
            Planejamento Comercial de Gôndola
          </h2>
        </div>

        {/* VALIDADOR DE SALDO LOCAL */}
        <div className="px-5 py-3 border border-slate-200/80 rounded-2xl bg-white min-w-[200px] shadow-sm">
          <p className="text-[10px] uppercase text-slate-400 font-extrabold tracking-wider">
            Saldo Disponível da Loja
          </p>
          <p
            className={`text-xl font-black transition-colors ${
              saldoFinal < 0 ? "text-red-600 animate-pulse" : "text-slate-900"
            }`}
          >
            R$ {saldoFinal.toLocaleString("pt-BR")}
          </p>
        </div>
      </div>


      {/* CARDS DE CATEGORIAS */}
      <div className="grid gap-5">
        {CATEGORIAS.map((c, i) => {
          const estoque = config.comercial?.[c.id]?.estoque ?? 0;
          const margem = config.comercial?.[c.id]?.margem ?? 0;
          const subtotal = estoque * c.custoUn;

          const maxAllowed = getMaxAllowed(c, estoque);
          const blocked = estoque >= maxAllowed || saldoFinal < c.custoUn;
          const precoVenda = c.custoUn * (1 + margem / 100);

          return (
            <motion.div
              key={c.id}
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.04, ease: "easeOut" }}
              className={`border border-slate-200/80 rounded-2xl bg-white shadow-sm hover:shadow-md transition-all overflow-hidden ${c.borderColor}`}
            >
              {/* CATEGORY BAR HEADER */}
              <div className="flex flex-col sm:flex-row justify-between sm:items-center p-4 border-b border-slate-100 bg-slate-50/70 gap-3">
                <div className="flex items-center gap-3">
                  <div
                    className={`w-10 h-10 flex items-center justify-center rounded-xl shrink-0 ${c.bg}`}
                  >
                    <c.Icon size={18} className={c.cor} />
                  </div>
                  <div>
                    <h3 className="font-bold text-slate-900 text-sm sm:text-base">
                      {c.label}
                    </h3>
                    <p className="text-xs text-slate-500 line-clamp-1">
                      {c.descricao}
                    </p>
                  </div>
                </div>
                <div className="text-left sm:text-right shrink-0">
                  <span className="text-[11px] font-bold text-slate-400 bg-white border border-slate-200 px-2.5 py-1 rounded-lg">
                    Custo Unitário: R$ {c.custoUn.toFixed(2)}
                  </span>
                </div>
              </div>

              {/* CARD CONTROLS BODY */}
              <div className="p-5 grid grid-cols-1 md:grid-cols-3 gap-6 items-center">
                {/* CONTROL: ESTOQUE */}
                <div className="space-y-2">
                  <label className="text-[10px] uppercase font-black text-slate-400 tracking-wider flex justify-between">
                    <span>Comprar Estoque (Qtd)</span>
                    <span className="text-slate-400 font-normal">
                      Máx: {c.maxEstoque.toLocaleString("pt-BR")} un
                    </span>
                  </label>

                  <div className="flex items-center gap-2">
                    <button
                      type="button"
                      disabled={estoque <= 0}
                      onClick={() => changeStock(c, -STOCK_STEP)}
                      className="w-10 h-10 cursor-pointer flex items-center justify-center rounded-xl border border-slate-200 hover:bg-slate-50 text-slate-600 disabled:opacity-40 active:scale-95 transition-all shrink-0"
                    >
                      <Minus size={14} />
                    </button>

                    <input
                      type="number"
                      min={0}
                      max={maxAllowed}
                      value={estoque === 0 ? "" : estoque}
                      placeholder="0"
                      onChange={(e) =>
                        updateStock(c.id, Math.abs(Number(e.target.value)))
                      }
                      className="w-full text-center border border-slate-200 focus:border-slate-400 focus:outline-none rounded-xl py-2 font-black text-slate-800"
                    />

                    <button
                      type="button"
                      disabled={blocked}
                      onClick={() => changeStock(c, STOCK_STEP)}
                      className={`w-10 h-10 cursor-pointer flex items-center justify-center rounded-xl text-white shadow-sm active:scale-95 transition-all shrink-0 ${
                        blocked
                          ? "bg-slate-200 text-slate-400 border-transparent cursor-not-allowed"
                          : "bg-orange-500 hover:bg-orange-600 border-transparent"
                      }`}
                    >
                      <Plus size={14} />
                    </button>
                  </div>
                </div>

                {/* CONTROL: MARGEM */}
                <div className="space-y-2">
                  <label className="text-[10px] uppercase font-black text-slate-400 tracking-wider">
                    Margem Comercial (%)
                  </label>

                  <div className="flex items-center gap-2">
                    <button
                      type="button"
                      disabled={margem <= 0}
                      onClick={() => changeMargemStep(c.id, -MARGIN_STEP)}
                      className="w-10 h-10 flex cursor-pointer items-center justify-center rounded-xl border border-slate-200 hover:bg-slate-50 text-slate-600 disabled:opacity-40 active:scale-95 transition-all shrink-0"
                    >
                      <Minus size={14} />
                    </button>

                    <input
                      type="number"
                      min={0}
                      max={200}
                      value={margem}
                      onChange={(e) =>
                        updateMargem(c.id, Math.abs(Number(e.target.value)))
                      }
                      className="w-full text-center border border-slate-200 focus:border-slate-400 focus:outline-none rounded-xl py-2 font-black text-slate-800"
                    />

                    <button
                      type="button"
                      disabled={margem >= 200}
                      onClick={() => changeMargemStep(c.id, MARGIN_STEP)}
                      className="w-10 h-10 cursor-pointer flex items-center justify-center rounded-xl bg-slate-900 hover:bg-slate-800 text-white shadow-sm active:scale-95 transition-all shrink-0"
                    >
                      <Plus size={14} />
                    </button>
                  </div>
                </div>

                {/* VISUALIZAÇÃO DE IMPACTO FINANCEIRO */}
                <div className="flex md:flex-col justify-between md:justify-center items-center md:items-end p-3 md:p-0 bg-slate-50 md:bg-transparent rounded-xl md:rounded-none gap-1">
                  <div className="md:text-right">
                    <p className="text-[10px] uppercase font-black text-slate-400 tracking-wider">
                      Subtotal Investido
                    </p>
                    <p className="font-extrabold text-slate-900 text-base md:text-lg">
                      R$ {subtotal.toLocaleString("pt-BR")}
                    </p>
                  </div>

                  <div className="md:text-right md:mt-1 flex items-center gap-1.5 text-slate-500">
                    <TrendingUp size={13} className="text-emerald-500" />
                    <p className="text-xs font-medium">
                      Preço de Gôndola:{" "}
                      <span className="font-bold text-slate-800">
                        R$ {precoVenda.toLocaleString("pt-BR", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                      </span>
                    </p>
                  </div>
                </div>
              </div>
            </motion.div>
          );
        })}
      </div>
    </div>
  );
}