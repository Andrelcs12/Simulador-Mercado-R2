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
  seguranca:    { label: "Segurança",         Icon: ShieldAlert,  value: 50000 },
  equipamentos: { label: "Equipamentos",      Icon: Wrench,       value: 75000 },
  redes:        { label: "Redes",             Icon: HardDrive,    value: 80000 },
  site:         { label: "Plataforma Digital",Icon: Monitor,      value: 65000 },
  selfcheckout: { label: "Self Checkout",     Icon: ReceiptText,  value: 80000 },
  melhoria:     { label: "Melhoria Contínua", Icon: RefreshCw,    value: 45000 },
};

// ── Meta dados Categorias ─────────────────────────────────────
const CATEGORIAS = [
  { id: "pereciveis" as const, label: "Perecíveis",       Icon: ShoppingBasket, custoUn: 15.5, cor: "text-red-500"     },
  { id: "mercearia"  as const, label: "Mercearia",        Icon: Package,        custoUn: 8.9,  cor: "text-blue-500"   },
  { id: "eletro"     as const, label: "Eletrônicos",      Icon: Computer,       custoUn: 12.4, cor: "text-emerald-500"},
  { id: "hipel"      as const, label: "Higiene & Limpeza",Icon: Droplets,       custoUn: 6.2,  cor: "text-[#FF6D00]"  },
];

function calcSLA(caixa: number, atendimento: number): number {
  const total = caixa + atendimento;
  if (total >= 16) return 1;
  if (total >= 12) return 2;
  if (total >= 8)  return 3;
  if (total >= 4)  return 4;
  return 5;
}

const ORCAMENTO = 700_000;

export default function SummaryStep({ config }: Props) {
  const safeCapex = config.capex ?? {};

  // Totais
  const totalCapex = Object.entries(safeCapex)
    .filter(([, v]) => v)
    .reduce((acc, [id]) => acc + (CAPEX_META[id]?.value ?? 0), 0);

  const totalEstoque = CATEGORIAS.reduce((acc, c) => {
    return acc + (config.comercial[c.id]?.estoque ?? 0) * c.custoUn;
  }, 0);

  const saldoFinal   = ORCAMENTO - totalCapex - totalEstoque;
  const margemMedia  = CATEGORIAS.reduce((a, c) => a + (config.comercial[c.id]?.margem ?? 0), 0) / CATEGORIAS.length;

  const opCaixa       = config.operadoresCaixa       ?? 0;
  const opAtendimento = config.operadoresAtendimento  ?? 0;
  const quiz          = config.quizScore              ?? 100;
  const csatOp        = Math.min(Math.round((opCaixa / 10) * 100), 100);
  const csatFinal     = Math.round((csatOp + quiz) / 2);
  const sla           = calcSLA(opCaixa, opAtendimento);

  const capexSelecionados = Object.entries(safeCapex).filter(([, v]) => v);
  const orcamentoPct      = Math.min(((totalCapex + totalEstoque) / ORCAMENTO) * 100, 100);
  const okBudget          = saldoFinal >= 0;

  return (
    <div className="space-y-8 pb-4">

      {/* ── TÍTULO ── */}
      <div className="border-l-4 border-emerald-500 pl-5 py-1">
        <p className="text-[11px] font-black uppercase tracking-[0.25em] text-emerald-500 mb-1">Passo 4 de 4</p>
        <h2 className="text-3xl md:text-4xl font-black italic uppercase text-[#001F3F] leading-none">
          Resumo <span className="text-emerald-500">Executivo</span>
        </h2>
        <p className="text-sm text-slate-500 font-medium mt-2">
          Revise suas decisões antes de confirmar o envio.
        </p>
      </div>

      {/* ── BARRA ORÇAMENTO GLOBAL ── */}
      <div className="bg-white border border-slate-200 rounded-2xl p-5 space-y-3">
        <div className="flex justify-between items-center">
          <p className="text-xs font-black uppercase tracking-widest text-slate-400">Uso do Orçamento</p>
          <p className={`text-sm font-black ${okBudget ? "text-emerald-600" : "text-red-500"}`}>
            R$ {(totalCapex + totalEstoque).toLocaleString("pt-BR")} / R$ {ORCAMENTO.toLocaleString("pt-BR")}
          </p>
        </div>
        <div className="h-3 bg-slate-100 rounded-full overflow-hidden">
          <motion.div
            className={`h-full rounded-full ${okBudget ? "bg-[#FF6D00]" : "bg-red-500"}`}
            initial={{ width: 0 }}
            animate={{ width: `${orcamentoPct}%` }}
            transition={{ duration: 0.6, ease: "easeOut" }}
          />
        </div>
        <div className={`text-sm font-black flex items-center gap-2 ${okBudget ? "text-emerald-600" : "text-red-500"}`}>
          {okBudget
            ? <><CheckCircle2 size={16} /> Saldo disponível: R$ {saldoFinal.toLocaleString("pt-BR")}</>
            : <><AlertTriangle size={16} /> Deficit de R$ {Math.abs(saldoFinal).toLocaleString("pt-BR")} — revise antes de enviar</>
          }
        </div>
      </div>

      {/* ── GRID RESUMO ── */}
      <div className="grid lg:grid-cols-3 gap-5">

        {/* CAPEX */}
        <div className="bg-white border border-slate-200 rounded-2xl overflow-hidden">
          <div className="bg-[#001F3F] px-5 py-3 flex items-center gap-2">
            <ClipboardList size={16} className="text-[#FF6D00]" />
            <p className="font-black text-white text-xs uppercase tracking-wider">CAPEX</p>
          </div>
          <div className="p-5 space-y-3">
            {capexSelecionados.length === 0 ? (
              <p className="text-xs text-slate-400 italic">Nenhum investimento selecionado</p>
            ) : (
              capexSelecionados.map(([id]) => {
                const meta = CAPEX_META[id];
                if (!meta) return null;
                return (
                  <div key={id} className="flex items-center gap-3">
                    <meta.Icon size={14} className="text-[#FF6D00] shrink-0" />
                    <div className="flex-1 min-w-0">
                      <p className="text-xs font-bold text-[#001F3F] truncate">{meta.label}</p>
                      <p className="text-[10px] text-slate-400">R$ {meta.value.toLocaleString("pt-BR")}</p>
                    </div>
                    <CheckCircle2 size={14} className="text-emerald-400 shrink-0" />
                  </div>
                );
              })
            )}
            <div className="pt-3 border-t border-slate-100 flex justify-between">
              <span className="text-xs text-slate-400 font-bold uppercase">Total</span>
              <span className="text-xs font-black text-[#001F3F]">R$ {totalCapex.toLocaleString("pt-BR")}</span>
            </div>
          </div>
        </div>

        {/* COMERCIAL */}
        <div className="bg-white border border-slate-200 rounded-2xl overflow-hidden">
          <div className="bg-[#001F3F] px-5 py-3 flex items-center gap-2">
            <TrendingUp size={16} className="text-[#FF6D00]" />
            <p className="font-black text-white text-xs uppercase tracking-wider">Comercial</p>
          </div>
          <div className="p-5 space-y-3">
            {CATEGORIAS.map((c) => {
              const dados    = config.comercial[c.id];
              const subtotal = (dados?.estoque ?? 0) * c.custoUn;
              return (
                <div key={c.id} className="flex items-center gap-2">
                  <c.Icon size={13} className={`${c.cor} shrink-0`} />
                  <div className="flex-1 min-w-0">
                    <p className="text-xs font-bold text-[#001F3F]">{c.label}</p>
                    <p className="text-[10px] text-slate-400">
                      {dados?.estoque ?? 0} un · {dados?.margem ?? 0}% margem
                    </p>
                  </div>
                  <span className="text-[11px] font-black text-slate-600 tabular-nums shrink-0">
                    R$ {subtotal.toLocaleString("pt-BR", { maximumFractionDigits: 0 })}
                  </span>
                </div>
              );
            })}
            <div className="pt-3 border-t border-slate-100 space-y-1">
              <div className="flex justify-between">
                <span className="text-xs text-slate-400 font-bold uppercase">Estoque total</span>
                <span className="text-xs font-black text-[#001F3F]">R$ {totalEstoque.toLocaleString("pt-BR")}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-xs text-slate-400 font-bold uppercase">Margem média</span>
                <span className="text-xs font-black text-[#FF6D00]">{margemMedia.toFixed(1)}%</span>
              </div>
            </div>
          </div>
        </div>

        {/* OPERADORES */}
        <div className="bg-white border border-slate-200 rounded-2xl overflow-hidden">
          <div className="bg-[#001F3F] px-5 py-3 flex items-center gap-2">
            <Users size={16} className="text-[#FF6D00]" />
            <p className="font-black text-white text-xs uppercase tracking-wider">Equipe</p>
          </div>
          <div className="p-5 space-y-3">
            <div className="flex justify-between items-center">
              <span className="text-xs text-slate-500 font-medium">Caixa</span>
              <span className="text-sm font-black text-[#001F3F]">{opCaixa} operadores</span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-xs text-slate-500 font-medium">Atendimento</span>
              <span className="text-sm font-black text-[#001F3F]">{opAtendimento} operadores</span>
            </div>
            <div className="pt-3 border-t border-slate-100 space-y-2">
              <div className="flex justify-between items-center">
                <div className="flex items-center gap-1.5">
                  <TrendingUp size={12} className="text-[#FF6D00]" />
                  <span className="text-xs text-slate-400 font-bold uppercase">CSAT</span>
                </div>
                <span className={`text-sm font-black ${csatFinal >= 80 ? "text-emerald-600" : csatFinal >= 60 ? "text-yellow-600" : "text-red-500"}`}>
                  {csatFinal}%
                </span>
              </div>
              <div className="flex justify-between items-center">
                <div className="flex items-center gap-1.5">
                  <Clock size={12} className="text-slate-400" />
                  <span className="text-xs text-slate-400 font-bold uppercase">SLA</span>
                </div>
                <span className={`text-sm font-black ${sla <= 2 ? "text-emerald-600" : sla === 3 ? "text-yellow-600" : "text-red-500"}`}>
                  {sla} dia{sla > 1 ? "s" : ""}
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* ── ALERTA FINAL ── */}
      <div className={`rounded-2xl p-4 flex gap-3 items-start border ${
        okBudget
          ? "bg-emerald-50 border-emerald-200"
          : "bg-red-50 border-red-200"
      }`}>
        {okBudget
          ? <CheckCircle2 size={18} className="text-emerald-500 shrink-0 mt-0.5" />
          : <AlertTriangle size={18} className="text-red-500 shrink-0 mt-0.5" />
        }
        <p className={`text-sm font-bold ${okBudget ? "text-emerald-700" : "text-red-600"}`}>
          {okBudget
            ? "Tudo certo! Revise as informações e clique em Enviar Configuração para confirmar."
            : "Atenção: seu orçamento está negativo. Volte e ajuste os investimentos antes de enviar."
          }
        </p>
      </div>
    </div>
  );
}