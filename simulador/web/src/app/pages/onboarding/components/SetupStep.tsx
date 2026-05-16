"use client";

import React from "react";
import { motion } from "framer-motion";
import {
  ShieldAlert, Wrench, HardDrive,
  Monitor, ReceiptText, RefreshCw,
  CheckCircle2, Info, LucideIcon,
} from "lucide-react";
import { AppConfig } from "../types/onboarding";

interface Props {
  config: AppConfig;
  setConfig: React.Dispatch<React.SetStateAction<AppConfig>>;
}

interface CapexItem {
  id: keyof AppConfig["capex"];
  label: string;
  Icon: LucideIcon;
  desc: string;
  value: number;
  insight: string;
  risk: "alto" | "medio" | "baixo";
}

const CAPEX_ITEMS: CapexItem[] = [
  {
    id: "seguranca",
    label: "Segurança",
    Icon: ShieldAlert,
    desc: "Monitoramento e proteção contra ataques cibernéticos.",
    value: 50000,
    insight: "Sem este investimento: risco de 2 dias sem vendas.",
    risk: "alto",
  },
  {
    id: "equipamentos",
    label: "Equipamentos",
    Icon: Wrench,
    desc: "Troca de equipamentos desgastados da operação.",
    value: 75000,
    insight: "Reduz custo de manutenção mensal. 1 dia parado se ignorado.",
    risk: "medio",
  },
  {
    id: "redes",
    label: "Redes",
    Icon: HardDrive,
    desc: "Estabilidade de rede, PDV e pagamentos.",
    value: 80000,
    insight: "Evita falhas em caixa e transações com cartão.",
    risk: "alto",
  },
  {
    id: "site",
    label: "Plataforma Digital",
    Icon: Monitor,
    desc: "Migração e melhoria da plataforma online.",
    value: 65000,
    insight: "+30% performance no canal digital.",
    risk: "baixo",
  },
  {
    id: "selfcheckout",
    label: "Self Checkout",
    Icon: ReceiptText,
    desc: "Automação de checkouts para reduzir filas.",
    value: 80000,
    insight: "Aumenta eficiência e melhora CSAT.",
    risk: "baixo",
  },
  {
    id: "melhoria",
    label: "Melhoria Contínua",
    Icon: RefreshCw,
    desc: "Automação de processos e eficiência interna.",
    value: 45000,
    insight: "Ganho de escalabilidade operacional.",
    risk: "baixo",
  },
];

const RISK_COLORS = {
  alto: "bg-red-50 text-red-600 border-red-200",
  medio: "bg-yellow-50 text-yellow-700 border-yellow-200",
  baixo: "bg-emerald-50 text-emerald-600 border-emerald-200",
};

const RISK_LABELS = {
  alto: "Risco alto",
  medio: "Risco médio",
  baixo: "Risco baixo",
};

export default function SetupStep({ config, setConfig }: Props) {
  const toggle = (id: keyof AppConfig["capex"], value: number) => {
    setConfig((prev) => ({
      ...prev,
      capex: {
        ...prev.capex,
        [id]: prev.capex[id] > 0 ? 0 : value,
      },
    }));
  };

  const capexValues = Object.values(config.capex);

  const totalCapex = capexValues.reduce((a, b) => a + b, 0);

  const ORCAMENTO = 700_000;
  const saldo = ORCAMENTO - totalCapex;
  const saldoPct = Math.min((totalCapex / ORCAMENTO) * 100, 100);

  const selecionados = capexValues.filter((v) => v > 0).length;

  return (
    <div className="space-y-8">

      {/* HEADER */}
      <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4">
        <div className="border-l-4 border-[#FF6D00] pl-5">
          <p className="text-[11px] font-black uppercase tracking-[0.25em] text-[#FF6D00] mb-1">
            Passo 1 de 4
          </p>
          <h2 className="text-3xl md:text-4xl font-black italic uppercase text-[#001F3F]">
            Investimento <span className="text-[#FF6D00]">CAPEX</span>
          </h2>
          <p className="text-sm text-slate-500 mt-2">
            Selecione os investimentos estratégicos para esta rodada.
          </p>
        </div>

        {/* SALDO */}
        <div
          className={`rounded-2xl border px-6 py-4 text-right ${
            saldo < 0 ? "bg-red-50 border-red-200" : "bg-white border-slate-200"
          }`}
        >
          <p className="text-[10px] uppercase font-black text-slate-400">
            Orçamento disponível
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

      {/* PROGRESS */}
      <div className="space-y-2">
        <div className="flex justify-between text-xs font-bold text-slate-400 uppercase">
          <span>
            {selecionados} investimento{selecionados !== 1 ? "s" : ""} selecionado
            {selecionados !== 1 ? "s" : ""}
          </span>
          <span>R$ {totalCapex.toLocaleString("pt-BR")}</span>
        </div>

        <div className="h-2 bg-slate-100 rounded-full overflow-hidden">
          <motion.div
            className={`h-full ${saldo < 0 ? "bg-red-500" : "bg-[#FF6D00]"}`}
            animate={{ width: `${saldoPct}%` }}
          />
        </div>
      </div>

      {/* GRID */}
      <div className="grid sm:grid-cols-2 xl:grid-cols-3 gap-4">
        {CAPEX_ITEMS.map((item) => {
          const selected = config.capex[item.id] > 0;

          return (
            <motion.button
              key={item.id}
              type="button"
              onClick={() => toggle(item.id, item.value)}
              className={`p-5 rounded-2xl border-2 text-left transition ${
                selected
                  ? "bg-[#001F3F] text-white border-[#001F3F]"
                  : "bg-white border-slate-200"
              }`}
            >
              {/* HEADER ITEM */}
              <div className="flex items-center gap-3 mb-3">
                <div className="w-10 h-10 flex items-center justify-center rounded-xl bg-slate-100">
                  <item.Icon
                    size={20}
                    className={selected ? "text-[#FF6D00]" : "text-[#001F3F]"}
                  />
                </div>

                <div>
                  <p className="font-black text-sm">{item.label}</p>
                  <span
                    className={`text-[10px] px-2 py-0.5 rounded-full border ${
                      selected
                        ? "bg-white/10 text-white"
                        : RISK_COLORS[item.risk]
                    }`}
                  >
                    {RISK_LABELS[item.risk]}
                  </span>
                </div>
              </div>

              <p className="text-xs opacity-80 mb-3">{item.desc}</p>

              <div className="text-[11px] opacity-70 flex gap-2 items-start">
                <Info size={12} />
                {item.insight}
              </div>

              <div className="mt-3 pt-3 border-t font-black text-sm">
                R$ {item.value.toLocaleString("pt-BR")}
              </div>

              {selected && (
                <div className="absolute top-3 right-3">
                  <CheckCircle2 size={18} className="text-[#FF6D00]" />
                </div>
              )}
            </motion.button>
          );
        })}
      </div>

      {/* ALERT */}
      {saldo < 0 && (
        <div className="bg-red-50 border border-red-200 rounded-2xl p-4 text-red-600 font-bold">
          Orçamento excedido em R$ {Math.abs(saldo).toLocaleString("pt-BR")}
        </div>
      )}
    </div>
  );
}