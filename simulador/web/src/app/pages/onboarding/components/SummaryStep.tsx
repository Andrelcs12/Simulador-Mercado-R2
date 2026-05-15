"use client";

import React from "react";
import { motion } from "framer-motion";
import {
  ShieldAlert,
  HardDrive,
  Monitor,
  Wrench,
  ReceiptText,
  RefreshCw,
  ShoppingBasket,
  Package,
  Droplets,
  CheckCircle2,
  ClipboardList,
  AlertTriangle,
  Computer,
} from "lucide-react";

interface CategoriaConfig {
  estoque: number;
  margem: number;
}

interface AppConfig {
  capex: Record<string, number>;
  comercial: {
    pereciveis: CategoriaConfig;
    mercearia: CategoriaConfig;
    eletro: CategoriaConfig;
    hipel: CategoriaConfig;
  };
  operadores: number;
}

interface SummaryProps {
  config: AppConfig;
}

const capexMeta: Record<string, { label: string; Icon: any; value: number }> =
  {
    seguranca: { label: "Segurança", Icon: ShieldAlert, value: 50000 },
    equipamentos: { label: "Equipamentos", Icon: Wrench, value: 75000 },
    redes: { label: "Redes", Icon: HardDrive, value: 80000 },
    site: { label: "Site", Icon: Monitor, value: 65000 },
    "self-checkout": {
      label: "Self Checkout",
      Icon: ReceiptText,
      value: 80000,
    },
    melhorias: { label: "Melhoria Contínua", Icon: RefreshCw, value: 45000 },
  };

const categoriaMeta = [
  { id: "pereciveis", label: "Perecíveis", Icon: ShoppingBasket, custoUn: 15.5 },
  { id: "mercearia", label: "Mercearia", Icon: Package, custoUn: 8.9 },
  { id: "eletro", label: "Eletrônicos", Icon: Computer, custoUn: 12.4 },
  { id: "hipel", label: "Higiene e Limpeza", Icon: Droplets, custoUn: 6.2 },
] as const;

const SummaryStep = ({ config }: SummaryProps) => {
  const comercial = config.comercial;

  const safeCapex = config.capex ?? {};

  const totalCapex = Object.values(safeCapex).reduce(
    (acc, curr) => acc + (Number(curr) || 0),
    0
  );

  const totalEstoque = categoriaMeta.reduce((acc, c) => {
    const dados = comercial?.[c.id as keyof typeof comercial];
    return acc + (dados?.estoque || 0) * c.custoUn;
  }, 0);

  const saldoFinal = 700000 - totalCapex - totalEstoque;

  const markupMedio =
    (comercial.pereciveis.margem +
      comercial.mercearia.margem +
      comercial.eletro.margem +
      comercial.hipel.margem) /
    4;

  const operadores = config.operadores ?? 0;

  const margemOperadores = (operadores / 10) * 100;

  const taxaSLA =
    operadores >= 10
      ? 1
      : operadores >= 8
      ? 2
      : operadores >= 6
      ? 3
      : operadores >= 4
      ? 4
      : operadores >= 2
      ? 5
      : 6;

  const capexSelecionados = Object.entries(safeCapex).filter(
    ([, v]) => (v ?? 0) > 0
  );

  return (
    <div className="space-y-8 pb-10">

      {/* HEADER */}
      <div className="border-l-4 border-green-500 pl-6 py-2">
        <h2 className="text-4xl font-black text-cencosud-blue uppercase italic">
          Resumo <span className="text-green-500">Executivo</span>
        </h2>
      </div>

      {/* BOX */}
      <motion.div className="bg-white rounded-[2.5rem] border shadow-sm overflow-hidden">

        <div className="bg-cencosud-blue px-8 py-5 flex items-center gap-3">
          <ClipboardList size={20} className="text-cencosud-orange" />
          <h3 className="font-black text-white uppercase text-sm">
            Resumo das Decisões
          </h3>
        </div>

        <div className="grid lg:grid-cols-3 divide-y lg:divide-y-0 lg:divide-x">

          {/* CAPEX */}
          <div className="p-6 space-y-3">
            <h4 className="text-xs font-black text-gray-400 uppercase">
              CAPEX
            </h4>

            {capexSelecionados.length === 0 && (
              <p className="text-xs text-gray-400">
                Nenhum investimento selecionado
              </p>
            )}

            {capexSelecionados.map(([id, valor]) => {
              const meta = capexMeta[id];
              if (!meta) return null;

              return (
                <div key={id} className="flex items-center gap-3">
                  <meta.Icon size={14} className="text-green-500" />
                  <div className="flex-1">
                    <p className="text-xs font-bold">{meta.label}</p>
                    <p className="text-[10px] text-gray-400">
                      R$ {Number(valor).toLocaleString("pt-BR")}
                    </p>
                  </div>
                  <CheckCircle2 size={14} className="text-green-400" />
                </div>
              );
            })}

            <div className="pt-2 border-t text-xs font-bold">
              Total: R$ {totalCapex.toLocaleString("pt-BR")}
            </div>
          </div>

          {/* COMERCIAL */}
          <div className="p-6 space-y-3">
            <h4 className="text-xs font-black text-gray-400 uppercase">
              Comercial
            </h4>

            {categoriaMeta.map((c) => {
              const dados = comercial?.[c.id as keyof typeof comercial];

              const subtotal = (dados?.estoque || 0) * c.custoUn;

              return (
                <div key={c.id} className="flex justify-between text-xs">
                  <span>{c.label}</span>
                  <span>
                    {dados?.estoque || 0} un | R${" "}
                    {subtotal.toLocaleString("pt-BR")}
                  </span>
                </div>
              );
            })}

            <div className="pt-2 border-t text-xs">
              Estoque: R$ {totalEstoque.toLocaleString("pt-BR")}
            </div>
          </div>

          {/* OPERADORES */}
          <div className="p-6 space-y-3">
            <h4 className="text-xs font-black text-gray-400 uppercase">
              Operadores
            </h4>

            <p className="text-sm font-bold">{operadores}</p>

            <p className="text-xs">
              Margem: {margemOperadores.toFixed(1)}%
            </p>

            <p className="text-xs">SLA: {taxaSLA} dia(s)</p>

            <div
              className={`text-xs font-bold ${
                saldoFinal < 0 ? "text-red-500" : "text-green-500"
              }`}
            >
              Saldo: R$ {saldoFinal.toLocaleString("pt-BR")}
            </div>
          </div>

        </div>
      </motion.div>

      {/* ALERTA */}
      <div className="bg-yellow-50 border p-4 rounded-2xl flex gap-3">
        <AlertTriangle size={18} />
        <p className="text-xs font-bold">
          Confirme antes de finalizar a rodada.
        </p>
      </div>

    </div>
  );
};

export default SummaryStep;