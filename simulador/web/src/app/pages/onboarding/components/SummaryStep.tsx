"use client";

import React from "react";
import { motion } from "framer-motion";
import {
  ShieldAlert, Wrench, HardDrive, Monitor, ReceiptText, RefreshCw,
  ShoppingBasket, Package, Computer, Droplets,
  CheckCircle2, AlertTriangle, ClipboardList,
  TrendingUp, Users, Clock,
} from "lucide-react";
import { AppConfig } from "../types/onboarding";

interface Props {
  config: AppConfig;
}

// ── Meta dados CAPEX ──────────────────────────────────────────
const CAPEX_META: Record<string, { label: string; Icon: any; value: number }> = {
  seguranca:    { label: "Segurança",          Icon: ShieldAlert,  value: 50000 },
  equipamentos: { label: "Equipamentos",       Icon: Wrench,       value: 75000 },
  redes:        { label: "Redes",             Icon: HardDrive,    value: 80000 },
  site:         { label: "Plataforma Digital", Icon: Monitor,      value: 65000 },
  selfcheckout: { label: "Self Checkout",      Icon: ReceiptText,  value: 80000 },
  melhoria:     { label: "Melhoria Contínua",  Icon: RefreshCw,    value: 45000 },
};

// ── Meta dados Categorias ─────────────────────────────────────
const CATEGORIAS = [
  { id: "pereciveis" as const, label: "Perecíveis",        Icon: ShoppingBasket, custoUn: 15.5, cor: "text-red-400"     },
  { id: "mercearia"  as const, label: "Mercearia",         Icon: Package,        custoUn: 8.9,  cor: "text-blue-400"    },
  { id: "eletro"     as const, label: "Eletrônicos",       Icon: Computer,       custoUn: 12.4, cor: "text-emerald-400" },
  { id: "hipel"      as const, label: "Higiene & Limpeza", Icon: Droplets,       custoUn: 6.2,  cor: "text-orange-400"   },
];

function calcSLA(caixa: number, atendimento: number): number {
  const total = caixa + atendimento;
  if (total >= 16) return 1;
  if (total >= 12) return 2;
  if (total >= 8)  return 3;
  if (total >= 4)  return 4;
  return 5;
}

const ORCAMENTO = 700000;

export default function SummaryStep({ config }: Props) {
  const safeCapex = config.capex ?? {};

  // Totais de Investimento
  const totalCapex = Object.entries(safeCapex)
    .filter(([, v]) => v)
    .reduce((acc, [id]) => acc + (CAPEX_META[id]?.value ?? 0), 0);

  const totalEstoque = CATEGORIAS.reduce((acc, c) => {
    return acc + (config.comercial[c.id]?.estoque ?? 0) * c.custoUn;
  }, 0);

  const saldoFinal   = ORCAMENTO - totalCapex - totalEstoque;
  const margemMedia  = CATEGORIAS.reduce((a, c) => a + (config.comercial[c.id]?.margem ?? 0), 0) / CATEGORIAS.length;

  const opCaixa       = config.operadoresCaixa       ?? 0;
  const opAtendimento = config.operadoresAtendimento ?? 0;
  const quiz          = config.quizScore              ?? 100;
  const csatOp        = Math.min(Math.round((opCaixa / 10) * 100), 100);
  const csatFinal     = Math.round((csatOp + quiz) / 2);
  const sla           = calcSLA(opCaixa, opAtendimento);

  const capexSelecionados = Object.entries(safeCapex).filter(([, v]) => v);
  const orcamentoPct      = Math.min(((totalCapex + totalEstoque) / ORCAMENTO) * 100, 100);
  const okBudget          = saldoFinal >= 0;

  return (
    <div className="space-y-6 md:space-y-8 pb-4">

      {/* ── HEADER DA ETAPA ── */}
      <div className="border-l-4 border-emerald-500 pl-4 md:pl-5 py-1">
        <p className="text-[10px] md:text-[11px] font-black uppercase tracking-[0.25em] text-emerald-400 mb-1">
          Passo 4 de 4
        </p>
        <h2 className="text-2xl md:text-3xl font-black uppercase text-white leading-tight">
          Resumo <span className="text-emerald-400">Executivo</span>
        </h2>
        <p className="text-xs md:text-sm text-slate-400 font-medium mt-1">
          Revise e valide o planejamento estratégico antes de submeter a rodada.
        </p>
      </div>

      {/* ── BARRA DE CONSUMO DE ORÇAMENTO GLOBAL ── */}
      <div className="bg-white/[0.02] border border-white/[0.06] rounded-2xl p-5 space-y-4">
        <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-2">
          <p className="text-[10px] font-black uppercase tracking-widest text-slate-400">Alocação de Budget</p>
          <p className={`text-sm font-black font-mono tabular-nums ${okBudget ? "text-emerald-400" : "text-red-400"}`}>
            R$ {(totalCapex + totalEstoque).toLocaleString("pt-BR")} / R$ {ORCAMENTO.toLocaleString("pt-BR")}
          </p>
        </div>
        
        <div className="h-2.5 bg-white/5 rounded-full overflow-hidden p-[1px]">
          <motion.div
            className={`h-full rounded-full ${okBudget ? "bg-orange-500" : "bg-red-500"}`}
            initial={{ width: 0 }}
            animate={{ width: `${orcamentoPct}%` }}
            transition={{ duration: 0.5, ease: "easeOut" }}
          />
        </div>

        <div className={`text-xs font-black flex items-center gap-2 font-mono ${okBudget ? "text-emerald-400" : "text-red-400"}`}>
          {okBudget ? (
            <>
              <CheckCircle2 size={15} className="shrink-0" /> 
              <span>SALDO DISPONÍVEL DA OPERAÇÃO: R$ {saldoFinal.toLocaleString("pt-BR")}</span>
            </>
          ) : (
            <>
              <AlertTriangle size={15} className="shrink-0 animate-pulse" /> 
              <span>ORÇAMENTO EXCEDIDO EM: R$ {Math.abs(saldoFinal).toLocaleString("pt-BR")} — REVISE AS ETAPAS ANTERIORES</span>
            </>
          )}
        </div>
      </div>

      {/* ── GRID PRINCIPAL DE REVISÃO ── */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">

        {/* COLUNA 1: CAPEX EXECUTADO */}
        <div className="bg-white/[0.02] border border-white/[0.06] rounded-2xl overflow-hidden flex flex-col justify-between hover:border-white/[0.1] transition-all">
          <div>
            <div className="bg-white/[0.03] border-b border-white/[0.04] px-5 py-3.5 flex items-center gap-2">
              <ClipboardList size={16} className="text-orange-500" />
              <h3 className="font-black text-white text-xs uppercase tracking-wider">Investimento (CAPEX)</h3>
            </div>
            <div className="p-5 space-y-3.5">
              {capexSelecionados.length === 0 ? (
                <p className="text-xs text-slate-500 italic">Nenhum ativo selecionado nesta rodada.</p>
              ) : (
                capexSelecionados.map(([id]) => {
                  const meta = CAPEX_META[id];
                  if (!meta) return null;
                  return (
                    <div key={id} className="flex items-center justify-between gap-3 border-b border-white/[0.02] pb-2 last:border-0 last:pb-0">
                      <div className="flex items-center gap-2.5 min-w-0">
                        <meta.Icon size={14} className="text-orange-500 shrink-0" />
                        <p className="text-xs font-black text-white truncate tracking-wide">{meta.label}</p>
                      </div>
                      <span className="text-[11px] font-black font-mono text-slate-300 shrink-0">
                        R$ {meta.value.toLocaleString("pt-BR")}
                      </span>
                    </div>
                  );
                })
              )}
            </div>
          </div>
          <div className="p-5 bg-white/[0.01] border-t border-white/[0.04] flex justify-between items-center">
            <span className="text-[10px] text-slate-400 font-black uppercase tracking-wider">Subtotal Ativos</span>
            <span className="text-sm font-black font-mono text-white">R$ {totalCapex.toLocaleString("pt-BR")}</span>
          </div>
        </div>

        {/* COLUNA 2: ESTRATÉGIA COMERCIAL */}
        <div className="bg-white/[0.02] border border-white/[0.06] rounded-2xl overflow-hidden flex flex-col justify-between hover:border-white/[0.1] transition-all">
          <div>
            <div className="bg-white/[0.03] border-b border-white/[0.04] px-5 py-3.5 flex items-center gap-2">
              <TrendingUp size={16} className="text-orange-500" />
              <h3 className="font-black text-white text-xs uppercase tracking-wider">Mix de Categorias</h3>
            </div>
            <div className="p-5 space-y-3.5">
              {CATEGORIAS.map((c) => {
                const dados    = config.comercial[c.id];
                const subtotal = (dados?.estoque ?? 0) * c.custoUn;
                return (
                  <div key={c.id} className="flex items-center justify-between gap-2 border-b border-white/[0.02] pb-2 last:border-0 last:pb-0">
                    <div className="flex items-center gap-2.5 min-w-0">
                      <c.Icon size={14} className={`${c.cor} shrink-0`} />
                      <div className="min-w-0">
                        <p className="text-xs font-black text-white tracking-wide">{c.label}</p>
                        <p className="text-[10px] text-slate-400 font-medium font-mono mt-0.5">
                          {dados?.estoque ?? 0} un · {dados?.margem ?? 0}% margem
                        </p>
                      </div>
                    </div>
                    <span className="text-[11px] font-black font-mono text-slate-300 shrink-0">
                      R$ {subtotal.toLocaleString("pt-BR", { maximumFractionDigits: 0 })}
                    </span>
                  </div>
                );
              })}
            </div>
          </div>
          <div className="p-5 bg-white/[0.01] border-t border-white/[0.04] space-y-1.5">
            <div className="flex justify-between items-center">
              <span className="text-[10px] text-slate-400 font-black uppercase tracking-wider">Subtotal Estoque</span>
              <span className="text-sm font-black font-mono text-white">R$ {totalEstoque.toLocaleString("pt-BR")}</span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-[10px] text-slate-400 font-black uppercase tracking-wider">Margem Média</span>
              <span className="text-xs font-black font-mono text-orange-400">{margemMedia.toFixed(1)}%</span>
            </div>
          </div>
        </div>

        {/* COLUNA 3: DIMENSIONAMENTO DE HEADCOUNT */}
        <div className="bg-white/[0.02] border border-white/[0.06] rounded-2xl overflow-hidden flex flex-col justify-between hover:border-white/[0.1] transition-all">
          <div>
            <div className="bg-white/[0.03] border-b border-white/[0.04] px-5 py-3.5 flex items-center gap-2">
              <Users size={16} className="text-orange-500" />
              <h3 className="font-black text-white text-xs uppercase tracking-wider">Dimensionamento Loja</h3>
            </div>
            <div className="p-5 space-y-4">
              <div className="flex justify-between items-center">
                <span className="text-xs text-slate-400 font-medium">Frentes de Caixa</span>
                <span className="text-xs font-black font-mono text-white bg-white/5 px-2.5 py-1 rounded-md">{opCaixa} op.</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-xs text-slate-400 font-medium">Central de SAC / Atendimento</span>
                <span className="text-xs font-black font-mono text-white bg-white/5 px-2.5 py-1 rounded-md">{opAtendimento} op.</span>
              </div>
              
              <div className="pt-3 border-t border-white/[0.04] space-y-3">
                <div className="flex justify-between items-center">
                  <div className="flex items-center gap-1.5">
                    <TrendingUp size={13} className="text-orange-500" />
                    <span className="text-[10px] text-slate-400 font-black uppercase tracking-wider">Kpi CSAT</span>
                  </div>
                  <span className={`text-xs font-black font-mono ${csatFinal >= 80 ? "text-emerald-400" : csatFinal >= 60 ? "text-yellow-400" : "text-red-400"}`}>
                    {csatFinal}%
                  </span>
                </div>
                <div className="flex justify-between items-center">
                  <div className="flex items-center gap-1.5">
                    <Clock size={13} className="text-slate-400" />
                    <span className="text-[10px] text-slate-400 font-black uppercase tracking-wider">Kpi SLA</span>
                  </div>
                  <span className={`text-xs font-black font-mono ${sla <= 2 ? "text-emerald-400" : sla === 3 ? "text-yellow-400" : "text-red-400"}`}>
                    {sla} dia{sla > 1 ? "s" : ""}
                  </span>
                </div>
              </div>
            </div>
          </div>
          <div className="p-5 bg-white/[0.01] border-t border-white/[0.04] flex justify-between items-center">
            <span className="text-[10px] text-slate-400 font-black uppercase tracking-wider">Headcount Ativo</span>
            <span className="text-sm font-black font-mono text-white">{opCaixa + opAtendimento} Colaboradores</span>
          </div>
        </div>
      </div>

      {/* ── CARD NOTIFICAÇÃO / CALL TO ACTION ── */}
      <div className={`rounded-2xl p-4 flex gap-3 items-start border transition-all ${
        okBudget
          ? "bg-emerald-500/10 border-emerald-500/20 text-emerald-400"
          : "bg-red-500/10 border-red-500/20 text-red-400"
      }`}>
        {okBudget ? (
          <CheckCircle2 size={16} className="shrink-0 mt-0.5" />
        ) : (
          <AlertTriangle size={16} className="shrink-0 mt-0.5" />
        )}
        <p className="text-xs font-medium leading-relaxed">
          {okBudget
            ? "Configuração em conformidade financeira. Valide as métricas operacionais acima e prossiga para processar a sua rodada."
            : "Trava financeira acionada: O balanço comercial e investimentos superam o teto orçamentário. É necessário mitigar custos ou reduzir compras."}
        </p>
      </div>
    </div>
  );
}