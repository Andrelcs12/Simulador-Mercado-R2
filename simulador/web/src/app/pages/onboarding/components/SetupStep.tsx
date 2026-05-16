"use client";

import React from "react";
import { AnimatePresence, motion } from "framer-motion";
import {
  ShieldAlert, Wrench, HardDrive,
  Monitor, ReceiptText, RefreshCw,
  Info, LucideIcon, AlertTriangle
} from "lucide-react";
import { AppConfig, CapexKey } from "../types/onboarding";

interface Props {
  config: AppConfig;
  setConfig: React.Dispatch<React.SetStateAction<AppConfig>>;
}

interface CapexItem {
  id: CapexKey;
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
    insight: "Reduz custo de manutenção. 1 dia parado se ignorado.",
    risk: "medio",
  },
  {
    id: "redes",
    label: "Redes",
    Icon: HardDrive,
    desc: "Estabilidade de rede, PDV e infraestrutura de pagamentos.",
    value: 80000,
    insight: "Evita falhas em caixas e transações com cartão.",
    risk: "alto",
  },
  {
    id: "site",
    label: "Plataforma Digital",
    Icon: Monitor,
    desc: "Migração e melhoria contínua da plataforma online.",
    value: 65000,
    insight: "+30% de performance otimizada no canal digital.",
    risk: "baixo",
  },
  {
    id: "selfcheckout",
    label: "Self Checkout",
    Icon: ReceiptText,
    desc: "Automação de checkouts para redução drástica de filas.",
    value: 80000,
    insight: "Aumenta a eficiência e melhora o índice de CSAT.",
    risk: "baixo",
  },
  {
    id: "melhoria",
    label: "Melhoria Contínua",
    Icon: RefreshCw,
    desc: "Automação avançada de processos e eficiência interna.",
    value: 45000,
    insight: "Ganho expressivo de escalabilidade operacional.",
    risk: "baixo",
  },
];

const RISK_COLORS = {
  alto: "bg-red-500/10 text-red-400 border-red-500/20",
  medio: "bg-yellow-500/10 text-yellow-400 border-yellow-500/20",
  baixo: "bg-emerald-500/10 text-emerald-400 border-emerald-500/20",
};

const RISK_LABELS = {
  alto: "Risco alto",
  medio: "Risco médio",
  baixo: "Risco baixo",
};

const ORCAMENTO = 700000;

export default function SetupStep({ config, setConfig }: Props) {
  const toggle = (id: CapexKey) => {
    setConfig((prev) => ({
      ...prev,
      capex: {
        ...prev.capex,
        [id]: !prev.capex[id],
      },
    }));
  };

  const totalCapex = CAPEX_ITEMS
    .filter((item) => config.capex[item.id])
    .reduce((acc, item) => acc + item.value, 0);

  const saldo = ORCAMENTO - totalCapex;
  const saldoPct = Math.min((totalCapex / ORCAMENTO) * 100, 100);
  const selecionados = CAPEX_ITEMS.filter((item) => config.capex[item.id]).length;

  return (
    <div className="space-y-6 md:space-y-8">
      {/* ── HEADER DA ETAPA ── */}
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 border-b border-white/[0.04] pb-6">
        <div className="border-l-4 border-orange-500 pl-4 md:pl-5">
          <p className="text-[10px] md:text-[11px] font-black uppercase tracking-[0.25em] text-orange-500 mb-1">
            Passo 1 de 4
          </p>
          <h2 className="text-2xl md:text-3xl font-black uppercase text-white leading-tight">
            Investimento <span className="text-orange-500">CAPEX</span>
          </h2>
          <p className="text-xs md:text-sm text-slate-400 font-medium mt-1">
            Selecione estrategicamente onde aplicar os recursos nesta rodada.
          </p>
        </div>

        <div className={`rounded-2xl border transition-all px-5 py-3.5 text-left lg:text-right min-w-[220px] ${
          saldo < 0 
            ? "bg-red-500/10 border-red-500/30 shadow-lg shadow-red-500/5" 
            : "bg-white/[0.02] border-white/[0.08]"
        }`}>
          <p className="text-[10px] uppercase tracking-widest font-black text-slate-400">
            Orçamento Disponível
          </p>
          <p className={`text-xl md:text-2xl font-black font-mono tabular-nums mt-0.5 ${
            saldo < 0 ? "text-red-400" : "text-white"
          }`}>
            R$ {saldo.toLocaleString("pt-BR")}
          </p>
        </div>
      </div>

      {/* ── METRICAS E BARRA DE CONSUMO ── */}
      <div className="space-y-2.5 bg-white/[0.02] border border-white/[0.04] rounded-2xl p-4">
        <div className="flex justify-between text-[11px] font-black text-slate-400 uppercase tracking-wider">
          <span>{selecionados} de {CAPEX_ITEMS.length} selecionados</span>
          <span className={saldo < 0 ? "text-red-400" : "text-orange-500 font-mono"}>
            Alocado: R$ {totalCapex.toLocaleString("pt-BR")}
          </span>
        </div>

        <div className="h-2 bg-white/5 rounded-full overflow-hidden p-[2px] border border-white/[0.05]">
          <motion.div
            className={`h-full rounded-full ${
              saldo < 0 ? "bg-red-500" : "bg-gradient-to-r from-orange-600 to-orange-400"
            }`}
            animate={{ width: `${saldoPct}%` }}
            transition={{ type: "spring", stiffness: 60, damping: 15 }}
          />
        </div>
      </div>

      {/* ── GRID DOS CARDS DE INVESTIMENTO ── */}
      <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {CAPEX_ITEMS.map(({ id, label, Icon, desc, value, insight, risk }) => {
          const selected = !!config.capex[id];

          return (
            <motion.button
              key={id}
              type="button"
              onClick={() => toggle(id)}
              whileTap={{ scale: 0.98 }}
              className={`w-full text-left p-5 rounded-2xl border transition-all flex flex-col justify-between h-full relative overflow-hidden group ${
                selected
                  ? "border-orange-500 bg-orange-500/10 shadow-lg shadow-orange-500/5 text-white"
                  : "border-white/[0.06] bg-white/[0.02] hover:bg-white/[0.04] hover:border-white/[0.12] text-slate-300"
              }`}
            >
              {/* Efeito sutil ao passar o mouse por cima do card não selecionado */}
              <div className={`absolute inset-0 bg-gradient-to-br from-white/[0.01] to-transparent opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none`} />

              <div>
                {/* Header do Card */}
                <div className="flex items-start justify-between gap-3 mb-4 relative z-10">
                  <div className={`w-10 h-10 rounded-xl flex items-center justify-center border shrink-0 transition-colors ${
                    selected 
                      ? "bg-orange-500 border-orange-400 text-white" 
                      : "bg-white/5 border-white/10 text-orange-500"
                  }`}>
                    <Icon size={18} />
                  </div>

                  <span className={`text-[9px] font-black uppercase tracking-wider px-2 py-1 rounded-lg border shrink-0 ${
                    selected ? "bg-white/10 text-white border-white/20" : RISK_COLORS[risk]
                  }`}>
                    {RISK_LABELS[risk]}
                  </span>
                </div>

                {/* Título e Descrição */}
                <div className="space-y-1.5 mb-4 relative z-10">
                  <h3 className="font-black text-sm tracking-wide text-white">
                    {label}
                  </h3>
                  <p className="text-xs text-slate-400 leading-relaxed font-medium line-clamp-2">
                    {desc}
                  </p>
                </div>
              </div>

              {/* Insights e Bloco de Valor Remodelado */}
              <div className="space-y-3 pt-3 border-t border-white/[0.04] w-full relative z-10 mt-auto">
                <div className={`flex items-start gap-1.5 text-[11px] leading-tight font-medium ${
                  selected ? "text-white/80" : "text-slate-400"
                }`}>
                  <Info size={12} className="shrink-0 mt-0.5 text-orange-400" />
                  <span>{insight}</span>
                </div>

                <div className={`text-base font-black font-mono tracking-wide ${
                  selected ? "text-orange-400" : "text-white"
                }`}>
                  R$ {value.toLocaleString("pt-BR")}
                </div>
              </div>
            </motion.button>
          );
        })}
      </div>

      {/* ── ALERT BANNER SE EXCEDER O BUDGET ── */}
      <AnimatePresence>
        {saldo < 0 && (
          <motion.div 
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.95 }}
            className="bg-red-500/10 border border-red-500/20 rounded-2xl p-4 text-red-400 font-bold text-xs md:text-sm flex items-center gap-2.5 shadow-lg shadow-red-900/5"
          >
            <AlertTriangle size={18} className="shrink-0" />
            <span>
              Atenção: Seu orçamento planejado foi excedido em{" "}
              <strong className="font-mono underline">R$ {Math.abs(saldo).toLocaleString("pt-BR")}</strong>. Reduza alguma operação antes de finalizar.
            </span>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}