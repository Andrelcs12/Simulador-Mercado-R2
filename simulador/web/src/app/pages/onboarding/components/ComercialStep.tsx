"use client";

import React from "react";
import { motion } from "framer-motion";
import {
  ShoppingBasket, Package, Computer,
  Droplets, TrendingUp, AlertTriangle, LucideIcon,
} from "lucide-react";
import { AppConfig, CapexKey, CategoriaKey } from "../types/onboarding";

interface Props {
  config: AppConfig;
  setConfig: React.Dispatch<React.SetStateAction<AppConfig>>;
}

interface CapexItem {
  id: CapexKey;
  value: number;
}

interface Categoria {
  id: CategoriaKey;
  label: string;
  Icon: LucideIcon;
  custoUn: number;
  cor: string;
  bg: string;
  descricao: string;
}

const CATEGORIAS: Categoria[] = [
  {
    id: "pereciveis",
    label: "Perecíveis",
    Icon: ShoppingBasket,
    custoUn: 15.5,
    cor: "text-red-400",
    bg: "bg-red-500/10 border-red-500/20",
    descricao: "FLV, frios, laticínios — alta rotatividade, margem sensível.",
  },
  {
    id: "mercearia",
    label: "Mercearia",
    Icon: Package,
    custoUn: 8.9,
    cor: "text-blue-400",
    bg: "bg-blue-500/10 border-blue-500/20",
    descricao: "Secos e molhados — volume alto, margem estável.",
  },
  {
    id: "eletro",
    label: "Eletrônicos",
    Icon: Computer,
    custoUn: 12.4,
    cor: "text-emerald-400",
    bg: "bg-emerald-500/10 border-emerald-500/20",
    descricao: "Linha branca e eletrodomésticos — ticket alto.",
  },
  {
    id: "hipel",
    label: "Higiene & Limpeza",
    Icon: Droplets,
    custoUn: 5.4, // 100% CORRIGIDO: Adicionado a propriedade que estava faltando
    cor: "text-orange-400",
    bg: "bg-orange-500/10 border-orange-500/20",
    descricao: "HIPEL — compra de conveniência, giro constante.",
  },
];

const ORCAMENTO = 700000;

export default function ComercialStep({ config, setConfig }: Props) {
  const CAPEX_ITEMS: CapexItem[] = [
    { id: "seguranca", value: 50000 },
    { id: "equipamentos", value: 75000 },
    { id: "redes", value: 80000 },
    { id: "site", value: 65000 },
    { id: "selfcheckout", value: 80000 },
    { id: "melhoria", value: 45000 },
  ];

  const update = (
    cat: CategoriaKey,
    field: "estoque" | "margem",
    value: number
  ) => {
    setConfig((prev) => ({
      ...prev,
      comercial: {
        ...prev.comercial,
        [cat]: {
          ...prev.comercial[cat],
          [field]: Math.max(0, value),
        },
      },
    }));
  };

  const capexTotal = CAPEX_ITEMS
    .filter((item) => config.capex[item.id])
    .reduce((acc, item) => acc + item.value, 0);

  const estoqueTotal = CATEGORIAS.reduce(
    (acc, c) => acc + (config.comercial[c.id]?.estoque ?? 0) * c.custoUn,
    0
  );

  const totalGasto = capexTotal + estoqueTotal;
  const saldo = ORCAMENTO - totalGasto;

  const margemMedia =
    CATEGORIAS.reduce((acc, c) => acc + (config.comercial[c.id]?.margem ?? 0), 0) /
    CATEGORIAS.length;

  return (
    <div className="space-y-6 md:space-y-8">
      {/* ── HEADER DA ETAPA ── */}
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 border-b border-white/[0.04] pb-6">
        <div className="border-l-4 border-orange-500 pl-4 md:pl-5">
          <p className="text-[10px] md:text-[11px] font-black uppercase tracking-[0.25em] text-orange-500 mb-1">
            Passo 2 de 4
          </p>
          <h2 className="text-2xl md:text-3xl font-black uppercase text-white leading-tight">
            Planejamento <span className="text-orange-500">Comercial</span>
          </h2>
          <p className="text-xs md:text-sm text-slate-400 font-medium mt-1">
            Defina o volume de compra e a margem estratégica por categoria.
          </p>
        </div>

        <div className={`rounded-2xl border transition-all px-5 py-3.5 text-left lg:text-right min-w-[220px] ${
          saldo < 0 
            ? "bg-red-500/10 border-red-500/30 shadow-lg shadow-red-500/5" 
            : "bg-white/[0.02] border-white/[0.08]"
        }`}>
          <p className="text-[10px] uppercase tracking-widest font-black text-slate-400">
            Saldo Disponível
          </p>
          <p className={`text-xl md:text-2xl font-black font-mono tabular-nums mt-0.5 ${
            saldo < 0 ? "text-red-400" : "text-white"
          }`}>
            R$ {saldo.toLocaleString("pt-BR")}
          </p>
        </div>
      </div>

      {/* ── CABEÇALHO DA TABELA (HIDDEN ON MOBILE) ── */}
      <div className="hidden lg:grid grid-cols-12 gap-4 px-6 text-[10px] font-black uppercase tracking-widest text-slate-400">
        <div className="col-span-4">Categoria</div>
        <div className="col-span-3 text-center">Qtd. Compra (un)</div>
        <div className="col-span-3 text-center">Margem (%)</div>
        <div className="col-span-2 text-right">Subtotal</div>
      </div>

      {/* ── LISTA DE CATEGORIAS (LINHAS) ── */}
      <div className="space-y-4">
        {CATEGORIAS.map(({ id, label, Icon, custoUn, cor, bg, descricao }, idx) => {
          const estoque = config.comercial[id]?.estoque ?? 0;
          const margem  = config.comercial[id]?.margem  ?? 0;
          const subtotal = estoque * custoUn;
          const precoVenda = custoUn * (1 + margem / 100);

          return (
            <motion.div
              key={id}
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: idx * 0.05 }}
              className="bg-white/[0.02] border border-white/[0.06] rounded-2xl p-4 md:p-5 lg:p-6 hover:border-white/[0.12] transition-all"
            >
              <div className="grid grid-cols-1 lg:grid-cols-12 gap-4 lg:items-center">
                
                {/* 1. Meta Informações Categoria */}
                <div className="lg:col-span-4 flex items-center gap-3">
                  <div className={`w-10 h-10 rounded-xl flex items-center justify-center shrink-0 border ${bg}`}>
                    <Icon size={18} className={cor} />
                  </div>
                  <div>
                    <h3 className="font-black text-white text-sm tracking-wide">{label}</h3>
                    <p className="text-[11px] text-slate-400 font-medium mt-0.5">
                      Custo Unitário: <span className="font-mono text-slate-300">R$ {custoUn.toFixed(2)}</span>
                    </p>
                  </div>
                </div>

                {/* 2. Controle de Qtd Estoque */}
                <div className="lg:col-span-3">
                  <label className="lg:hidden text-[10px] font-black text-slate-400 uppercase tracking-widest block mb-1.5">
                    Qtd. Compra (un)
                  </label>
                  <div className="flex items-center bg-white/[0.03] border border-white/[0.08] rounded-xl p-1 max-w-full sm:max-w-xs lg:max-w-none">
                    <button
                      type="button"
                      onClick={() => update(id, "estoque", estoque - 100)}
                      className="w-8 h-8 rounded-lg bg-white/5 hover:bg-white/10 active:scale-95 text-white font-black flex items-center justify-center transition-all text-sm"
                    >
                      −
                    </button>
                    <input
                      type="number"
                      min={0}
                      value={estoque === 0 ? "" : estoque}
                      placeholder="0"
                      onChange={(e) => update(id, "estoque", Number(e.target.value))}
                      className="flex-1 min-w-0 bg-transparent text-center font-black font-mono text-white text-sm focus:outline-none [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none"
                    />
                    <button
                      type="button"
                      onClick={() => update(id, "estoque", estoque + 100)}
                      className="w-8 h-8 rounded-lg bg-white/5 hover:bg-white/10 active:scale-95 text-white font-black flex items-center justify-center transition-all text-sm"
                    >
                      +
                    </button>
                  </div>
                </div>

                {/* 3. Controle de Margem de Lucro */}
                <div className="lg:col-span-3">
                  <label className="lg:hidden text-[10px] font-black text-slate-400 uppercase tracking-widest block mb-1.5">
                    Margem (%)
                  </label>
                  <div className="flex items-center bg-white/[0.03] border border-white/[0.08] rounded-xl px-3 py-1.5 max-w-full sm:max-w-xs lg:max-w-none">
                    <input
                      type="number"
                      min={0}
                      max={200}
                      step={1}
                      value={margem === 0 ? "" : margem}
                      placeholder="0"
                      onChange={(e) => update(id, "margem", Number(e.target.value))}
                      className="w-full bg-transparent text-center lg:text-right font-black font-mono text-white text-sm focus:outline-none [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none"
                    />
                    <span className="text-slate-500 font-black text-sm ml-1">%</span>
                  </div>
                  {estoque > 0 && (
                    <p className="text-[10px] text-orange-400 mt-1 font-semibold text-left lg:text-center">
                      Preço de Venda: R$ {precoVenda.toFixed(2)}/un
                    </p>
                  )}
                </div>

                {/* 4. Subtotal Dinâmico */}
                <div className="lg:col-span-2 text-left lg:text-right pt-2 lg:pt-0 border-t border-white/[0.04] lg:border-none flex lg:flex-col justify-between items-center lg:items-end">
                  <label className="lg:hidden text-[10px] font-black text-slate-400 uppercase tracking-widest">
                    Subtotal
                  </label>
                  <p className="font-black text-white font-mono tracking-wide">
                    R$ {subtotal.toLocaleString("pt-BR", { minimumFractionDigits: 0 })}
                  </p>
                </div>
              </div>

              {/* Descrição Otimizada */}
              <p className="text-[11px] text-slate-400 font-medium mt-3 lg:pl-[52px] border-t border-white/[0.02] pt-2.5 lg:border-none lg:pt-0 hidden sm:block">
                {descricao}
              </p>
            </motion.div>
          );
        })}
      </div>

      {/* ── WIDGETS DE RESUMO INFERIOR ── */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 pt-2">
        <div className="bg-white/[0.02] border border-white/[0.06] rounded-2xl p-4">
          <p className="text-[10px] uppercase tracking-widest font-black text-slate-400 mb-1">
            Custo em Estoque
          </p>
          <p className="text-lg md:text-xl font-black font-mono text-white">
            R$ {estoqueTotal.toLocaleString("pt-BR")}
          </p>
        </div>

        <div className="bg-white/[0.02] border border-white/[0.06] rounded-2xl p-4">
          <div className="flex items-center gap-1.5 mb-1">
            <TrendingUp size={14} className="text-orange-400" />
            <p className="text-[10px] uppercase tracking-widest font-black text-slate-400">
              Margem Média
            </p>
          </div>
          <p className="text-lg md:text-xl font-black font-mono text-orange-400">
            {margemMedia.toFixed(1)}%
          </p>
        </div>

        <div className={`rounded-2xl p-4 border transition-colors ${
          saldo < 0 ? "bg-red-500/10 border-red-500/20" : "bg-emerald-500/10 border-emerald-500/20"
        }`}>
          <p className="text-[10px] uppercase tracking-widest font-black mb-1 text-slate-400">
            Status do Orçamento
          </p>
          <div className="flex items-center justify-between">
            <p className={`text-lg md:text-xl font-black uppercase ${saldo < 0 ? "text-red-400" : "text-emerald-400"}`}>
              {saldo < 0 ? "⚠ Déficit" : "✓ OK"}
            </p>
          </div>
          {saldo < 0 && (
            <p className="text-[11px] text-red-400/90 font-medium mt-0.5 font-mono">
              Excedido: R$ {Math.abs(saldo).toLocaleString("pt-BR")}
            </p>
          )}
        </div>
      </div>
    </div>
  );
}