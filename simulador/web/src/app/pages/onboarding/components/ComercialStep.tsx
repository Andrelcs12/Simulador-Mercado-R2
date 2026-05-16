"use client";

import React from "react";
import { motion } from "framer-motion";
import {
  ShoppingBasket, Package, Computer,
  Droplets, TrendingUp, LucideIcon,
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
    descricao: "FLV, frios, laticínios — alta rotatividade, margem sensível.",
  },
  {
    id: "mercearia",
    label: "Mercearia",
    Icon: Package,
    custoUn: 8.9,
    cor: "text-blue-500",
    bg: "bg-blue-50",
    descricao: "Secos e molhados — volume alto, margem estável.",
  },
  {
    id: "eletro",
    label: "Eletrônicos",
    Icon: Computer,
    custoUn: 12.4,
    cor: "text-emerald-500",
    bg: "bg-emerald-50",
    descricao: "Linha branca e eletrodomésticos — ticket alto.",
  },
  {
    id: "hipel",
    label: "Higiene & Limpeza",
    Icon: Droplets,
    custoUn: 6.2,
    cor: "text-[#FF6D00]",
    bg: "bg-orange-50",
    descricao: "HIPEL — compra de conveniência, giro constante.",
  },
];

const ORCAMENTO = 700_000;

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

  // ✔ SOMENTE ESTOQUE (CAPEX NÃO ENTRA AQUI)
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
      <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4">
        <div className="border-l-4 border-[#001F3F] pl-5">
          <p className="text-[11px] font-black uppercase tracking-[0.25em] text-[#FF6D00] mb-1">
            Passo 2 de 4
          </p>
          <h2 className="text-3xl md:text-4xl font-black italic uppercase text-[#001F3F]">
            Planejamento <span className="text-[#FF6D00]">Comercial</span>
          </h2>
          <p className="text-sm text-slate-500 font-medium mt-2">
            Defina o volume de compra e a margem por categoria.
          </p>
        </div>

        <div
          className={`rounded-2xl border px-6 py-4 text-right ${
            saldo < 0
              ? "bg-red-50 border-red-200"
              : "bg-white border-slate-200"
          }`}
        >
          <p className="text-[10px] uppercase tracking-widest font-black text-slate-400">
            Saldo disponível
          </p>
          <p
            className={`text-2xl font-black ${
              saldo < 0 ? "text-red-500" : "text-[#001F3F]"
            }`}
          >
            R$ {saldo.toLocaleString("pt-BR")}
          </p>
        </div>
      </div>

      {/* LISTA */}
      <div className="space-y-3">
        {CATEGORIAS.map(
          ({ id, label, Icon, custoUn, cor, bg, descricao }, idx) => {
            const estoque = config.comercial[id]?.estoque ?? 0;
            const margem = config.comercial[id]?.margem ?? 0;
            const subtotal = estoque * custoUn;
            const precoVenda = custoUn * (1 + margem / 100);

            return (
              <motion.div
                key={id}
                initial={{ opacity: 0, y: 8 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: idx * 0.06 }}
                className="bg-white border rounded-2xl p-5"
              >
                <div className="grid grid-cols-1 md:grid-cols-12 gap-4">

                  {/* categoria */}
                  <div className="md:col-span-4 flex items-center gap-3">
                    <div className={`w-10 h-10 rounded-xl ${bg} flex items-center justify-center`}>
                      <Icon size={20} className={cor} />
                    </div>
                    <div>
                      <p className="font-black text-[#001F3F] text-sm">
                        {label}
                      </p>
                      <p className="text-[10px] text-slate-400">
                        Custo: R$ {custoUn.toFixed(2)}
                      </p>
                    </div>
                  </div>

                  {/* estoque */}
                  <div className="md:col-span-3">
                    <input
                      type="number"
                      min={0}
                      value={estoque}
                      onChange={(e) =>
                        update(id, "estoque", Number(e.target.value))
                      }
                      className="w-full text-center border rounded-xl py-2"
                    />
                  </div>

                  {/* margem */}
                  <div className="md:col-span-3">
                    <input
                      type="number"
                      min={0}
                      max={100}
                      value={margem}
                      onChange={(e) =>
                        update(id, "margem", Number(e.target.value))
                      }
                      className="w-full text-center border rounded-xl py-2"
                    />
                  </div>

                  {/* subtotal */}
                  <div className="md:col-span-2 text-right font-black">
                    R$ {subtotal.toLocaleString("pt-BR")}
                  </div>
                </div>

                <p className="text-xs text-slate-400 mt-3">
                  Venda estimada: R$ {precoVenda.toFixed(2)}
                </p>
              </motion.div>
            );
          }
        )}
      </div>

      {/* FOOTER */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="bg-[#001F3F] text-white p-5 rounded-2xl">
          <p className="text-xs">Custo estoque</p>
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
          <p className="text-xs">Status</p>
          <p className="font-black">
            {saldo < 0 ? "Déficit" : "OK"}
          </p>
        </div>
      </div>
    </div>
  );
}