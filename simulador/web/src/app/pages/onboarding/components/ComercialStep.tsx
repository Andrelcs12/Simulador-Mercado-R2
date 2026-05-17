"use client";

import React from "react";
import { motion } from "framer-motion";
import {
  ShoppingBasket,
  Package,
  Computer,
  Droplets,
  Minus,
  Plus,
  LucideIcon,
} from "lucide-react";
import { AppConfig, CategoriaKey } from "../types/onboarding";

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
  descricao: string;
}

const CATEGORIAS: Categoria[] = [
  {
    id: "pereciveis",
    label: "Perecíveis",
    Icon: ShoppingBasket,
    custoUn: 15.5,
    cor: "text-red-500",
    bg: "bg-red-50",
    descricao: "Alta rotatividade. Sensível à ruptura de estoque.",
  },
  {
    id: "mercearia",
    label: "Mercearia",
    Icon: Package,
    custoUn: 8.9,
    cor: "text-blue-500",
    bg: "bg-blue-50",
    descricao: "Volume alto e previsível de demanda.",
  },
  {
    id: "eletro",
    label: "Eletrodomésticos",
    Icon: Computer,
    custoUn: 12.4,
    cor: "text-emerald-500",
    bg: "bg-emerald-50",
    descricao: "Ticket alto. Impacto forte em margem.",
  },
  {
    id: "hipel",
    label: "Higiene & Limpeza",
    Icon: Droplets,
    custoUn: 6.2,
    cor: "text-orange-500",
    bg: "bg-orange-50",
    descricao: "Compra recorrente. Alta elasticidade.",
  },
];

const ORCAMENTO = 700_000;
const STEP = 100;

export default function ComercialStep({ config, setConfig }: Props) {
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

  const changeStock = (cat: CategoriaKey, delta: number) => {
    const current = config.comercial[cat]?.estoque ?? 0;
    update(cat, "estoque", current + delta);
  };

  const estoqueTotal = CATEGORIAS.reduce(
    (acc, c) =>
      acc + (config.comercial[c.id]?.estoque ?? 0) * c.custoUn,
    0
  );

  const saldo = ORCAMENTO - estoqueTotal;

  const margemMedia =
    CATEGORIAS.reduce(
      (a, c) => a + (config.comercial[c.id]?.margem ?? 0),
      0
    ) / CATEGORIAS.length;

  return (
    <div className="space-y-8">

      {/* HEADER */}
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-4">

        <div>
          <p className="text-[11px] uppercase tracking-[0.3em] font-black text-orange-500">
            Planejamento Comercial
          </p>

          <h2 className="text-3xl font-black text-slate-900 mt-1">
            Definição de{" "}
            <span className="text-orange-500">Estoque e Margem</span>
          </h2>

          <p className="text-sm text-slate-500 mt-2 max-w-xl">
            Estoque representa volume de compra (buyQty). Margem define o preço final da venda.
          </p>
        </div>

        <div
          className={`rounded-2xl border px-6 py-4 text-right ${
            saldo < 0 ? "bg-red-50 border-red-200" : "bg-white border-slate-200"
          }`}
        >
          <p className="text-[10px] uppercase tracking-widest font-black text-slate-400">
            Caixa disponível
          </p>
          <p className={`text-2xl font-black ${saldo < 0 ? "text-red-500" : "text-slate-900"}`}>
            R$ {saldo.toLocaleString("pt-BR")}
          </p>
        </div>
      </div>

      {/* LISTA */}
      <div className="space-y-4">

        {CATEGORIAS.map(({ id, label, Icon, custoUn, cor, bg, descricao }, idx) => {
          const estoque = config.comercial[id]?.estoque ?? 0;
          const margem = config.comercial[id]?.margem ?? 0;

          const subtotal = estoque * custoUn;
          const precoVenda = custoUn * (1 + margem / 100);

          return (
            <motion.div
              key={id}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: idx * 0.05 }}
              className="bg-white border border-slate-200 rounded-2xl p-6"
            >

              {/* HEADER CAT */}
              <div className="flex items-start justify-between mb-4">

                <div className="flex items-center gap-3">
                  <div className={`w-11 h-11 rounded-xl ${bg} flex items-center justify-center`}>
                    <Icon size={20} className={cor} />
                  </div>

                  <div>
                    <p className="font-black text-slate-900">{label}</p>
                    <p className="text-xs text-slate-500">{descricao}</p>
                  </div>
                </div>

                <div className="text-right">
                  <p className="text-[10px] uppercase text-slate-400">Custo unitário</p>
                  <p className="font-black text-slate-900">
                    R$ {custoUn.toFixed(2)}
                  </p>
                </div>
              </div>

              {/* CONTROLES */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">

                {/* ESTOQUE */}
                <div className="space-y-2">
                  <p className="text-[10px] uppercase font-black text-slate-400">
                    Estoque (compra)
                  </p>

                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => changeStock(id, -STEP)}
                      className="w-10 h-10 rounded-xl bg-slate-100 hover:bg-slate-200 flex items-center justify-center"
                    >
                      <Minus size={14} />
                    </button>

                    <input
                      type="number"
                      value={estoque}
                      onChange={(e) => update(id, "estoque", Number(e.target.value))}
                      className="w-full text-center border rounded-xl py-2 font-black"
                    />

                    <button
                      onClick={() => changeStock(id, STEP)}
                      className="w-10 h-10 rounded-xl bg-orange-500 text-white hover:bg-orange-400 flex items-center justify-center"
                    >
                      <Plus size={14} />
                    </button>
                  </div>
                </div>

                {/* MARGEM */}
                <div className="space-y-2">
                  <p className="text-[10px] uppercase font-black text-slate-400">
                    Margem (% venda)
                  </p>

                  <input
                    type="number"
                    min={0}
                    max={100}
                    value={margem}
                    onChange={(e) =>
                      update(id, "margem", Number(e.target.value))
                    }
                    className="w-full text-center border rounded-xl py-2 font-black"
                  />
                </div>

                {/* RESULTADO */}
                <div className="space-y-2 text-right">
                  <p className="text-[10px] uppercase font-black text-slate-400">
                    Impacto financeiro
                  </p>

                  <p className="text-sm font-black text-slate-900">
                    Compra: R$ {subtotal.toLocaleString("pt-BR")}
                  </p>

                  <p className="text-xs text-slate-500">
                    Venda estimada: R$ {precoVenda.toFixed(2)}
                  </p>
                </div>

              </div>
            </motion.div>
          );
        })}
      </div>

      {/* FOOTER KPIs */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">

        <div className="bg-slate-900 text-white p-5 rounded-2xl">
          <p className="text-xs text-white/60">Total investido</p>
          <p className="text-xl font-black">
            R$ {estoqueTotal.toLocaleString("pt-BR")}
          </p>
        </div>

        <div className="bg-white border p-5 rounded-2xl">
          <p className="text-xs text-slate-400">Margem média</p>
          <p className="text-xl font-black">
            {margemMedia.toFixed(1)}%
          </p>
        </div>

        <div
          className={`p-5 rounded-2xl border ${
            saldo < 0
              ? "bg-red-50 border-red-200"
              : "bg-emerald-50 border-emerald-200"
          }`}
        >
          <p className="text-xs text-slate-500">Status financeiro</p>
          <p className="font-black">
            {saldo < 0 ? "Déficit de caixa" : "Dentro do orçamento"}
          </p>
        </div>

      </div>
    </div>
  );
}