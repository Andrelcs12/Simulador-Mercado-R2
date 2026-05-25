"use client";

import { motion } from "framer-motion";
import {
  Computer,
  Droplets,
  Minus,
  Package,
  Plus,
  ShoppingBasket,
  TrendingUp,
  DollarSign,
} from "lucide-react";
import type { LucideIcon } from "lucide-react";
import { useEffect, useMemo } from "react";
import type { Dispatch, SetStateAction } from "react";

import { useOnboarding, COMERCIAL_PRICES } from "../context/OnboardingContext";
import type { AppConfig, CategoriaKey } from "../types/onboarding";

interface Props {
  config: AppConfig;
  setConfig: Dispatch<SetStateAction<AppConfig>>;
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

const CATEGORIAS_BASE: Omit<Categoria, "maxEstoque" | "custoUn">[] = [
  {
    id: "pereciveis",
    label: "Perecíveis",
    Icon: ShoppingBasket,
    cor: "text-rose-400",
    bg: "bg-rose-500/10",
    borderColor: "focus-within:border-rose-500/50",
    descricao: "Alta rotatividade e sensível à ruptura de estoque.",
  },
  {
    id: "mercearia",
    label: "Mercearia",
    Icon: Package,
    cor: "text-blue-400",
    bg: "bg-blue-500/10",
    borderColor: "focus-within:border-blue-500/50",
    descricao: "Demanda estável e previsível no dia a dia.",
  },
  {
    id: "eletro",
    label: "Eletrodomésticos",
    Icon: Computer,
    cor: "text-emerald-400",
    bg: "bg-emerald-500/10",
    borderColor: "focus-within:border-emerald-500/50",
    descricao: "Ticket alto com forte impacto na margem de lucro.",
  },
  {
    id: "hipel",
    label: "Higiene & Limpeza",
    Icon: Droplets,
    cor: "text-amber-400",
    bg: "bg-amber-500/10",
    borderColor: "focus-within:border-amber-500/50",
    descricao: "Compra recorrente com alta elasticidade de preço.",
  },
];

const STOCK_STEP = 100;
const MARGIN_STEP = 5;
const MAX_MARGIN = 95;

export default function ComercialStep({ config, setConfig }: Props) {
  const {
    remainingBudget,
    maxStockPericiveis,
    maxStockMercearia,
    maxStockEletro,
    maxStockHipel,
    estoqueAnalysis,        // 🟢 Consumindo estrutura reativa de custos do Context
    faturamentoAnalysis,    // 🟢 Consumindo faturamento oficial
    lucroAnalysis,          // 🟢 Consumindo lucro oficial injetado
  } = useOnboarding();

  const categorias = useMemo<Categoria[]>(
    () =>
      CATEGORIAS_BASE.map((categoria) => ({
        ...categoria,
        custoUn: COMERCIAL_PRICES[categoria.id] ?? 0,
        maxEstoque:
          categoria.id === "pereciveis"
            ? maxStockPericiveis
            : categoria.id === "mercearia"
              ? maxStockMercearia
              : categoria.id === "eletro"
                ? maxStockEletro
                : maxStockHipel,
      })),
    [maxStockPericiveis, maxStockMercearia, maxStockEletro, maxStockHipel]
  );

  const saldoFinal = remainingBudget;

  const getMaxAllowed = (c: Categoria, currentStock: number) => {
    const disponivelTeorico = saldoFinal + currentStock * c.custoUn;
    const budgetLimit = Math.floor(disponivelTeorico / c.custoUn);
    return Math.max(0, Math.min(c.maxEstoque, budgetLimit));
  };

  useEffect(() => {
    setConfig((prev) => {
      let changed = false;
      const comercial = { ...prev.comercial };

      for (const categoria of categorias) {
        const current = comercial[categoria.id]?.estoque ?? 0;
        if (current > categoria.maxEstoque) {
          changed = true;
          comercial[categoria.id] = {
            ...comercial[categoria.id],
            estoque: categoria.maxEstoque,
            margem: comercial[categoria.id]?.margem ?? 0,
          };
        }
      }
      return changed ? { ...prev, comercial } : prev;
    });
  }, [categorias, setConfig]);

  const updateStock = (cat: CategoriaKey, value: number) => {
    const c = categorias.find((x) => x.id === cat);
    if (!c) return;

    const current = config.comercial?.[cat]?.estoque ?? 0;
    const maxAllowed = getMaxAllowed(c, current);
    
    const sanitizedValue = Number.isNaN(value) ? 0 : Math.abs(value);
    const safeValue = Math.max(0, Math.min(sanitizedValue, maxAllowed));

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
    const sanitizedValue = Number.isNaN(value) ? 0 : Math.abs(value);
    const safeMargem = Math.max(0, Math.min(MAX_MARGIN, sanitizedValue));

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
      <div className="flex flex-col md:flex-row justify-between items-start md:items-end gap-6 pb-2">
        <div className="border-l-4 border-orange-500 pl-5">
          <p className="text-[11px] uppercase tracking-[0.3em] font-black text-orange-500">
            Etapa 2 de 4
          </p>
          <h2 className="text-3xl font-black text-white tracking-tight">
            Planejamento Comercial de <span className="text-orange-500">Gôndola</span>
          </h2>
          <p className="text-sm text-slate-400 mt-2">
            Determine a quantidade comprada e o markup de saída de cada departamento da loja.
          </p>
        </div>

        <div className="text-right">
          <p className="text-[10px] uppercase text-slate-500 font-black tracking-wider">
            Saldo Disponível Corrente
          </p>
          <p className={`text-2xl font-black transition-colors ${saldoFinal < 0 ? "text-red-500" : "text-emerald-400"}`}>
            R$ {saldoFinal.toLocaleString("pt-BR")}
          </p>
        </div>
      </div>

      <div className="grid gap-5">
        {categorias.map((c, i) => {
          const estoque = config.comercial?.[c.id]?.estoque ?? 0;
          const margem = config.comercial?.[c.id]?.margem ?? 0;
          
          // 🟢 Dados extraídos de forma limpa diretamente das chaves do Context
          const subtotal = estoqueAnalysis[c.id]?.custoTotal ?? 0;
          const faturamentoPrevisto = faturamentoAnalysis[c.id] ?? 0;
          const lucroPrevisto = lucroAnalysis[c.id] ?? 0;

          const maxAllowed = getMaxAllowed(c, estoque);
          const blocked = estoque >= maxAllowed || saldoFinal < c.custoUn;
          const precoVenda = margem >= 100 ? 0 : c.custoUn / (1 - margem / 100);

          const stockInputId = `estoque-${c.id}`;
          const marginInputId = `margem-${c.id}`;

          return (
            <motion.div
              key={c.id}
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.04, ease: "easeOut" }}
              className="border border-white/10 rounded-2xl bg-white/5 overflow-hidden transition-all duration-200 hover:border-white/20"
            >
              <div className="flex flex-col sm:flex-row justify-between sm:items-center p-4 border-b border-white/10 bg-white/[0.02] gap-3">
                <div className="flex items-center gap-3">
                  <div className={`w-10 h-10 flex items-center justify-center rounded-xl shrink-0 ${c.bg}`}>
                    <c.Icon size={18} className={c.cor} />
                  </div>
                  <div>
                    <h3 className="font-bold text-white text-sm sm:text-base">{c.label}</h3>
                    <p className="text-xs text-slate-400 line-clamp-1">{c.descricao}</p>
                  </div>
                </div>
                <div className="text-left sm:text-right shrink-0">
                  <span className="text-[11px] font-black text-slate-400 bg-white/5 border border-white/10 px-2.5 py-1.5 rounded-xl uppercase tracking-wider">
                    Custo Un: R$ {c.custoUn.toFixed(2)}
                  </span>
                </div>
              </div>

              <div className="p-5 grid grid-cols-1 lg:grid-cols-12 gap-6 items-center">
                <div className="space-y-2 lg:col-span-4">
                  <label htmlFor={stockInputId} className="text-[10px] uppercase font-black text-slate-400 tracking-wider flex justify-between">
                    <span>Comprar Estoque (Qtd)</span>
                    <span className={estoque >= c.maxEstoque ? "text-orange-400 font-black" : "text-slate-500 font-bold"}>
                      {estoque >= c.maxEstoque ? "Limite Gôndola" : `Máx: ${c.maxEstoque.toLocaleString("pt-BR")} un`}
                    </span>
                  </label>

                  <div className="flex items-center gap-2">
                    <button
                      type="button"
                      disabled={estoque <= 0}
                      onClick={() => changeStock(c, -STOCK_STEP)}
                      className="w-10 h-10 cursor-pointer flex items-center justify-center rounded-xl border border-white/10 bg-white/5 hover:bg-white/10 text-slate-300 disabled:opacity-20 active:scale-95 transition-all shrink-0"
                    >
                      <Minus size={14} />
                    </button>

                    <input
                      id={stockInputId}
                      type="number"
                      min={0}
                      max={maxAllowed}
                      value={estoque === 0 ? "" : estoque}
                      placeholder="0"
                      onChange={(e) => updateStock(c.id, Number(e.target.value))}
                      className="w-full text-center border border-white/10 bg-white/5 focus:border-white/30 focus:outline-none rounded-xl py-2 font-black text-white"
                    />

                    <button
                      type="button"
                      disabled={blocked}
                      onClick={() => changeStock(c, STOCK_STEP)}
                      className={`w-10 h-10 cursor-pointer flex items-center justify-center rounded-xl text-white shadow-sm active:scale-95 transition-all shrink-0 ${
                        blocked ? "bg-white/5 text-slate-600 border-white/5 cursor-not-allowed" : "bg-orange-500 hover:bg-orange-600"
                      }`}
                    >
                      <Plus size={14} />
                    </button>
                  </div>
                </div>

                <div className="space-y-2 lg:col-span-4">
                  <label htmlFor={marginInputId} className="text-[10px] uppercase font-black text-slate-400 tracking-wider">
                    Margem Comercial (%)
                  </label>

                  <div className="flex items-center gap-2">
                    <button
                      type="button"
                      disabled={margem <= 0}
                      onClick={() => changeMargemStep(c.id, -MARGIN_STEP)}
                      className="w-10 h-10 flex cursor-pointer items-center justify-center rounded-xl border border-white/10 bg-white/5 hover:bg-white/10 text-slate-300 disabled:opacity-20 active:scale-95 transition-all shrink-0"
                    >
                      <Minus size={14} />
                    </button>

                    <input
                      id={marginInputId}
                      type="number"
                      min={0}
                      max={MAX_MARGIN}
                      value={margem}
                      onChange={(e) => updateMargem(c.id, Number(e.target.value))}
                      className="w-full text-center border border-white/10 bg-white/5 focus:border-white/30 focus:outline-none rounded-xl py-2 font-black text-white"
                    />

                    <button
                      type="button"
                      disabled={margem >= MAX_MARGIN}
                      onClick={() => changeMargemStep(c.id, MARGIN_STEP)}
                      className="w-10 h-10 cursor-pointer flex items-center justify-center rounded-xl bg-slate-100 hover:bg-white text-slate-900 shadow-sm active:scale-95 transition-all shrink-0"
                    >
                      <Plus size={14} />
                    </button>
                  </div>
                </div>

                <div className="flex sm:flex-row lg:flex-col justify-between lg:justify-center items-center lg:items-start p-4 lg:p-0 bg-white/[0.02] lg:bg-transparent rounded-xl lg:col-span-2 gap-2 h-full lg:pl-4">
                  <div>
                    <p className="text-[9px] uppercase font-black text-slate-500 tracking-wider">Investido total</p>
                    <p className="font-bold text-slate-300 text-sm">
                      R$ {subtotal.toLocaleString("pt-BR", { minimumFractionDigits: 2 })}
                    </p>
                  </div>

                  <div className="flex items-center gap-1.5 text-slate-400 mt-1">
                    <TrendingUp size={13} className="text-slate-500" />
                    <p className="text-xs">
                      Preço Saída:{" "}
                      <span className="font-bold text-white">
                        R$ {precoVenda.toLocaleString("pt-BR", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                      </span>
                    </p>
                  </div>
                </div>

                <div className="lg:col-span-2 flex flex-col gap-2 h-full justify-between">
                  <div className="bg-blue-500/10 border border-blue-500/20 p-2.5 rounded-xl flex flex-col justify-center items-center lg:items-end text-center lg:text-right w-full">
                    <p className="text-[9px] uppercase font-black text-blue-400 tracking-wider">Faturamento Ideal</p>
                    <p className="font-black text-blue-400 text-base tracking-tight mt-0.5">
                      R$ {faturamentoPrevisto.toLocaleString("pt-BR", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                    </p>
                  </div>

                  <div className="bg-emerald-500/10 border border-emerald-500/20 p-2.5 rounded-xl flex flex-col justify-center items-center lg:items-end text-center lg:text-right w-full">
                    <p className="text-[9px] uppercase font-black text-emerald-400 tracking-wider flex items-center gap-1">
                      <DollarSign size={10} /> Lucro Previsto
                    </p>
                    <p className="font-black text-emerald-400 text-base tracking-tight mt-0.5">
                      R$ {lucroPrevisto.toLocaleString("pt-BR", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
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