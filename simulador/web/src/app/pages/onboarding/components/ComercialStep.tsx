"use client";

import React, { useMemo } from "react";
import { motion, HTMLMotionProps } from "framer-motion";
import {
  Computer,
  Droplets,
  Minus,
  Package,
  Plus,
  ShoppingBasket,
  TrendingUp,
  DollarSign,
  Percent,
} from "lucide-react";
import type { LucideIcon } from "lucide-react";

import { useOnboarding, COMERCIAL_PRICES } from "../context/OnboardingContext";
import type { CategoriaKey } from "../types/onboarding";

interface Categoria {
  id: CategoriaKey;
  label: string;
  Icon: LucideIcon;
  cor: string;
  bg: string;
  descricao: string;
}

const CATEGORIAS_BASE: Categoria[] = [
  {
    id: "pereciveis",
    label: "Perecíveis",
    Icon: ShoppingBasket,
    cor: "text-rose-400",
    bg: "bg-rose-500/10",
    descricao: "Alta rotatividade e sensível à ruptura de estoque.",
  },
  {
    id: "mercearia",
    label: "Mercearia",
    Icon: Package,
    cor: "text-blue-400",
    bg: "bg-blue-500/10",
    descricao: "Demanda estável e previsível no dia a dia.",
  },
  {
    id: "eletro",
    label: "Eletrodomésticos",
    Icon: Computer,
    cor: "text-emerald-400",
    bg: "bg-emerald-500/10",
    descricao: "Ticket alto com forte impacto na margem de lucro.",
  },
  {
    id: "hipel",
    label: "Higiene & Limpeza",
    Icon: Droplets,
    cor: "text-amber-400",
    bg: "bg-amber-500/10",
    descricao: "Compra recorrente com alta elasticidade de preço.",
  },
];

const STOCK_STEP = 100;
const MARGIN_STEP = 5;

export default function ComercialStep() {
  const {
    config,
    updateStock,
    changeStock,
    updateMargem,
    changeMargemStep,
    remainingBudget,
    estoqueAnalysis,
    faturamentoAnalysis,
    lucroAnalysis,
  } = useOnboarding();

  return (
    <div className="space-y-8">
      {/* HEADER */}
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
          <p
            className={`text-2xl font-black transition-colors ${
              remainingBudget < 0 ? "text-red-500" : "text-emerald-400"
            }`}
          >
            R$ {remainingBudget.toLocaleString("pt-BR")}
          </p>
        </div>
      </div>

      {/* LISTA DE CATEGORIAS */}
      <div className="grid gap-5">
        {CATEGORIAS_BASE.map((c, i) => {
          const itemComercial = config.comercial?.[c.id] || { estoque: 0, margem: 0 };
          
          // Fallbacks seguros extraídos da infraestrutura do Context
          const analiseEstoque = estoqueAnalysis?.[c.id] || { maxDisponivel: 0, pctGasto: 0, custoTotal: 0 };
          const faturamentoPrevisto = faturamentoAnalysis?.[c.id]?.faturamentoBruto || 0;
          const lucroPrevisto = lucroAnalysis?.[c.id]?.lucroLiquidoPrevisto || 0;

          const precoCustoUn = COMERCIAL_PRICES[c.id] || 0;
          
          // Cálculo seguro do Markup de saída baseado em margem sobre preço de venda
          const precoVenda = itemComercial.margem >= 100 
            ? 0 
            : precoCustoUn / (1 - itemComercial.margem / 100);

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
              {/* SUBHEADER INTERNO DA CATEGORIA */}
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
                  <span className="text-[11px] font-black text-slate-400 bg-black/20 border border-white/10 px-2.5 py-1.5 rounded-xl uppercase tracking-wider font-mono">
                    Custo Un: R$ {precoCustoUn.toFixed(2)}
                  </span>
                </div>
              </div>

              {/* GRID OPERACIONAL */}
              <div className="p-5 grid grid-cols-1 lg:grid-cols-12 gap-6 items-center">
                
                {/* COMPRA DE ESTOQUE */}
                <div className="space-y-2 lg:col-span-4">
                  <label htmlFor={stockInputId} className="text-[10px] uppercase font-black text-slate-400 tracking-wider flex justify-between">
                    <span>Comprar Estoque (Qtd)</span>
                    <span className={itemComercial.estoque >= analiseEstoque.maxDisponivel ? "text-orange-400 font-black" : "text-slate-500 font-bold"}>
                      {itemComercial.estoque >= analiseEstoque.maxDisponivel ? "Limite Gôndola" : `Máx: ${analiseEstoque.maxDisponivel.toLocaleString("pt-BR")} un`}
                    </span>
                  </label>

                  <div className="flex items-center gap-2">
                    <button
                      type="button"
                      disabled={itemComercial.estoque <= 0}
                      onClick={() => changeStock(c.id, -STOCK_STEP)}
                      className="w-10 h-10 cursor-pointer flex items-center justify-center rounded-xl border border-white/10 bg-white/5 hover:bg-white/10 text-slate-300 disabled:opacity-20 active:scale-95 transition-all shrink-0"
                    >
                      <Minus size={14} />
                    </button>

                    <input
                      id={stockInputId}
                      type="number"
                      min={0}
                      max={analiseEstoque.maxDisponivel}
                      value={itemComercial.estoque === 0 ? "" : itemComercial.estoque}
                      placeholder="0"
                      onChange={(e) => updateStock(c.id, parseInt(e.target.value) || 0)}
                      className="w-full text-center border border-white/10 bg-black/20 focus:border-orange-500 focus:outline-none rounded-xl py-2 font-black text-white font-mono"
                    />

                    <button
                      type="button"
                      disabled={itemComercial.estoque >= analiseEstoque.maxDisponivel || remainingBudget < precoCustoUn}
                      onClick={() => changeStock(c.id, STOCK_STEP)}
                      className="w-10 h-10 cursor-pointer flex items-center justify-center rounded-xl bg-orange-500 hover:bg-orange-600 disabled:bg-white/5 disabled:text-slate-600 text-white shadow-sm active:scale-95 transition-all shrink-0"
                    >
                      <Plus size={14} />
                    </button>
                  </div>
                </div>

                {/* MARGEM COMERCIAL */}
                <div className="space-y-2 lg:col-span-4">
                  <label htmlFor={marginInputId} className="text-[10px] uppercase font-black text-slate-400 tracking-wider">
                    Margem Comercial (%)
                  </label>

                  <div className="flex items-center gap-2">
                    <button
                      type="button"
                      disabled={itemComercial.margem <= 0}
                      onClick={() => changeMargemStep(c.id, -MARGIN_STEP)}
                      className="w-10 h-10 flex cursor-pointer items-center justify-center rounded-xl border border-white/10 bg-white/5 hover:bg-white/10 text-slate-300 disabled:opacity-20 active:scale-95 transition-all shrink-0"
                    >
                      <Minus size={14} />
                    </button>

                    <div className="relative w-full flex items-center">
                      <input
                        id={marginInputId}
                        type="number"
                        min={0}
                        max={95}
                        value={itemComercial.margem || ""}
                        placeholder="0"
                        onChange={(e) => updateMargem(c.id, parseInt(e.target.value) || 0)}
                        className="w-full text-center border border-white/10 bg-black/20 focus:border-orange-500 focus:outline-none rounded-xl py-2 font-black text-orange-400 font-mono pr-6"
                      />
                      <span className="absolute right-3 text-xs font-bold text-slate-500 font-mono pointer-events-none">%</span>
                    </div>

                    <button
                      type="button"
                      disabled={itemComercial.margem >= 95}
                      onClick={() => changeMargemStep(c.id, MARGIN_STEP)}
                      className="w-10 h-10 cursor-pointer flex items-center justify-center rounded-xl bg-slate-100 hover:bg-white text-slate-900 shadow-sm active:scale-95 transition-all shrink-0"
                    >
                      <Plus size={14} />
                    </button>
                  </div>
                </div>

                {/* CUSTO E PREÇO DE SAÍDA */}
                <div className="flex sm:flex-row lg:flex-col justify-between lg:justify-center items-center lg:items-start p-4 lg:p-0 bg-white/[0.02] lg:bg-transparent rounded-xl lg:col-span-2 gap-2 h-full lg:pl-4">
                  <div>
                    <p className="text-[9px] uppercase font-black text-slate-500 tracking-wider">Investido total</p>
                    <p className="font-bold text-slate-300 text-sm font-mono">
                      R$ {analiseEstoque.custoTotal.toLocaleString("pt-BR", { minimumFractionDigits: 2 })}
                    </p>
                  </div>

                  <div className="flex items-center gap-1.5 text-slate-400 mt-1">
                    <TrendingUp size={13} className="text-slate-500" />
                    <p className="text-xs">
                      Preço Saída:{" "}
                      <span className="font-bold text-white font-mono">
                        R$ {precoVenda.toLocaleString("pt-BR", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                      </span>
                    </p>
                  </div>
                </div>

                {/* PROJEÇÕES FINANCEIRAS (FATURAMENTO / LUCRO) */}
                <div className="lg:col-span-2 flex flex-col gap-2 h-full justify-between">
                  <div className="bg-blue-500/10 border border-blue-500/20 p-2.5 rounded-xl flex flex-col justify-center items-center lg:items-end text-center lg:text-right w-full">
                    <p className="text-[9px] uppercase font-black text-blue-400 tracking-wider">Faturamento Ideal</p>
                    <p className="font-black text-blue-400 text-base tracking-tight mt-0.5 font-mono">
                      R$ {faturamentoPrevisto.toLocaleString("pt-BR", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                    </p>
                  </div>

                  <div className="bg-emerald-500/10 border border-emerald-500/20 p-2.5 rounded-xl flex flex-col justify-center items-center lg:items-end text-center lg:text-right w-full">
                    <p className="text-[9px] uppercase font-black text-emerald-400 tracking-wider flex items-center gap-1">
                      <DollarSign size={10} /> Lucro Previsto
                    </p>
                    <p className="font-black text-emerald-400 text-base tracking-tight mt-0.5 font-mono">
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