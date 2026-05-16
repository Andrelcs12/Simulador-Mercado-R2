"use client";

import React from "react";
import { motion } from "framer-motion";
import { Users, Headphones, Info, TrendingUp, Clock } from "lucide-react";
import { AppConfig } from "../types/onboarding";

interface Props {
  config: AppConfig;
  setConfig: React.Dispatch<React.SetStateAction<AppConfig>>;
}

function calcSLA(caixa: number, atendimento: number): number {
  const total = caixa + atendimento;
  if (total >= 16) return 1;
  if (total >= 12) return 2;
  if (total >= 8)  return 3;
  if (total >= 4)  return 4;
  return 5;
}

function slaInfo(days: number) {
  if (days === 1) return { label: "Excelente",  color: "text-emerald-400", bg: "bg-emerald-500/10", border: "border-emerald-500/20" };
  if (days === 2) return { label: "Ótimo",      color: "text-emerald-400", bg: "bg-emerald-500/10", border: "border-emerald-500/20" };
  if (days === 3) return { label: "Bom",        color: "text-yellow-400",  bg: "bg-yellow-500/10", border: "border-yellow-500/20"  };
  if (days === 4) return { label: "Regular",    color: "text-orange-400",  bg: "bg-orange-500/10", border: "border-orange-500/20"  };
  return              { label: "Crítico",     color: "text-red-400",     bg: "bg-red-500/10",    border: "border-red-500/20"     };
}

const MAX_OP = 20;

export default function EmployeeStep({ config, setConfig }: Props) {
  const opCaixa       = config.comercial?.pereciveis?.estoque !== undefined ? (config as any).operadoresCaixa ?? 5 : 5;
  const opAtendimento = config.comercial?.pereciveis?.estoque !== undefined ? (config as any).operadoresAtendimento ?? 3 : 3;
  const quiz          = (config as any).quizScore ?? 100;

  const csatOp    = Math.min(Math.round((opCaixa / 10) * 100), 100);
  const csatFinal = Math.round((csatOp + quiz) / 2);
  const sla       = calcSLA(opCaixa, opAtendimento);
  const slaData   = slaInfo(sla);

  const csatColor = csatFinal >= 80 ? "text-emerald-400" : csatFinal >= 60 ? "text-yellow-400" : "text-red-400";

  const update = (field: "operadoresCaixa" | "operadoresAtendimento", val: number) => {
    setConfig((prev: AppConfig) => ({
      ...prev,
      [field]: Math.max(0, Math.min(MAX_OP, val))
    }));
  };

  return (
    <div className="space-y-6 md:space-y-8">
      {/* ── HEADER DA ETAPA ── */}
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 border-b border-white/[0.04] pb-6">
        <div className="border-l-4 border-orange-500 pl-4 md:pl-5">
          <p className="text-[10px] md:text-[11px] font-black uppercase tracking-[0.25em] text-orange-500 mb-1">
            Passo 3 de 4
          </p>
          <h2 className="text-2xl md:text-3xl font-black uppercase text-white leading-tight">
            Equipe <span className="text-orange-500">Operacional</span>
          </h2>
          <p className="text-xs md:text-sm text-slate-400 font-medium mt-1">
            Aloque e dimensione os operadores para balancear o atendimento da filial.
          </p>
        </div>

        {/* Indicadores rápidos de Performance */}
        <div className="flex items-center gap-4 bg-white/[0.02] border border-white/[0.08] rounded-2xl px-5 py-3 shadow-md shrink-0 self-start lg:self-auto">
          <div className="text-left sm:text-center">
            <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">CSAT Estimado</p>
            <p className={`text-xl md:text-2xl font-black font-mono tabular-nums mt-0.5 ${csatColor}`}>{csatFinal}%</p>
          </div>
          <div className="w-px h-8 bg-white/[0.08]" />
          <div className="text-left sm:text-center">
            <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">SLA Atual</p>
            <p className={`text-xl md:text-2xl font-black font-mono tabular-nums mt-0.5 ${slaData.color}`}>{sla}d</p>
          </div>
        </div>
      </div>

      {/* ── CARDS DE CONTROLE DE OPERADORES ── */}
      <div className="grid md:grid-cols-2 gap-5">
        
        {/* 1. Operadores de Caixa */}
        <div className="bg-white/[0.02] border border-white/[0.06] rounded-2xl p-5 md:p-6 space-y-5 hover:border-white/[0.1] transition-all">
          <div className="flex items-center gap-3">
            <div className="w-11 h-11 rounded-xl bg-orange-500/10 border border-orange-500/20 flex items-center justify-center shrink-0 text-orange-500">
              <Users size={20} />
            </div>
            <div>
              <h3 className="font-black text-white text-sm tracking-wide uppercase">Operadores de Caixa</h3>
              <p className="text-[11px] text-slate-400 font-medium mt-0.5">Velocidade de checkout — impacta o CSAT diretamente</p>
            </div>
          </div>

          <div className="flex items-center gap-3 bg-white/[0.02] border border-white/[0.06] rounded-xl p-2">
            <button 
              type="button" 
              onClick={() => update("operadoresCaixa", opCaixa - 1)} 
              className="w-10 h-10 rounded-lg bg-white/5 hover:bg-white/10 text-white font-black flex items-center justify-center transition-all text-lg active:scale-95"
            >
              −
            </button>
            <div className="flex-1 text-center">
              <span className="text-4xl md:text-5xl font-black text-white font-mono tracking-tight tabular-nums">{opCaixa}</span>
              <span className="text-slate-500 font-bold text-xs ml-1 font-mono">/{MAX_OP}</span>
            </div>
            <button 
              type="button" 
              onClick={() => update("operadoresCaixa", opCaixa + 1)} 
              className="w-10 h-10 rounded-lg bg-white/5 hover:bg-white/10 text-white font-black flex items-center justify-center transition-all text-lg active:scale-95"
            >
              +
            </button>
          </div>

          <div className="space-y-2">
            <input 
              type="range" 
              min={0} 
              max={MAX_OP} 
              value={opCaixa} 
              onChange={(e) => update("operadoresCaixa", Number(e.target.value))} 
              className="w-full accent-orange-500 bg-white/10 h-1.5 rounded-lg appearance-none cursor-pointer"
            />
            <div className="h-2 bg-white/5 rounded-full overflow-hidden p-[1px]">
              <motion.div className="h-full bg-orange-500 rounded-full" animate={{ width: `${(opCaixa / MAX_OP) * 100}%` }} transition={{ duration: 0.2 }} />
            </div>
          </div>

          <div className="bg-white/[0.02] border border-white/[0.04] rounded-xl p-3 text-center">
            <p className="text-[10px] text-slate-400 font-black uppercase tracking-widest mb-0.5">Fator de Impacto no CSAT</p>
            <p className="text-lg font-black font-mono text-white">{csatOp}%</p>
            <p className="text-[9px] text-slate-500 font-medium font-mono mt-0.5">(caixa / 10) × 100</p>
          </div>
        </div>

        {/* 2. Operadores de Atendimento */}
        <div className="bg-white/[0.02] border border-white/[0.06] rounded-2xl p-5 md:p-6 space-y-5 hover:border-white/[0.1] transition-all">
          <div className="flex items-center gap-3">
            <div className="w-11 h-11 rounded-xl bg-orange-500/10 border border-orange-500/20 flex items-center justify-center shrink-0 text-orange-500">
              <Headphones size={20} />
            </div>
            <div>
              <h3 className="font-black text-white text-sm tracking-wide uppercase">Operadores de Atendimento</h3>
              <p className="text-[11px] text-slate-400 font-medium mt-0.5">Suporte pós-venda — impacta severamente o SLA</p>
            </div>
          </div>

          <div className="flex items-center gap-3 bg-white/[0.02] border border-white/[0.06] rounded-xl p-2">
            <button 
              type="button" 
              onClick={() => update("operadoresAtendimento", opAtendimento - 1)} 
              className="w-10 h-10 rounded-lg bg-white/5 hover:bg-white/10 text-white font-black flex items-center justify-center transition-all text-lg active:scale-95"
            >
              −
            </button>
            <div className="flex-1 text-center">
              <span className="text-4xl md:text-5xl font-black text-white font-mono tracking-tight tabular-nums">{opAtendimento}</span>
              <span className="text-slate-500 font-bold text-xs ml-1 font-mono">/{MAX_OP}</span>
            </div>
            <button 
              type="button" 
              onClick={() => update("operadoresAtendimento", opAtendimento + 1)} 
              className="w-10 h-10 rounded-lg bg-white/5 hover:bg-white/10 text-white font-black flex items-center justify-center transition-all text-lg active:scale-95"
            >
              +
            </button>
          </div>

          <div className="space-y-2">
            <input 
              type="range" 
              min={0} 
              max={MAX_OP} 
              value={opAtendimento} 
              onChange={(e) => update("operadoresAtendimento", Number(e.target.value))} 
              className="w-full accent-orange-500 bg-white/10 h-1.5 rounded-lg appearance-none cursor-pointer"
            />
            <div className="h-2 bg-white/5 rounded-full overflow-hidden p-[1px]">
              <motion.div className="h-full bg-orange-500 rounded-full" animate={{ width: `${(opAtendimento / MAX_OP) * 100}%` }} transition={{ duration: 0.2 }} />
            </div>
          </div>

          <div className={`border rounded-xl p-3 text-center transition-colors ${slaData.bg} ${slaData.border}`}>
            <p className={`text-[10px] font-black uppercase tracking-widest mb-0.5 opacity-80 ${slaData.color}`}>Prazo de Resolução</p>
            <p className={`text-lg font-black font-mono ${slaData.color}`}>{sla} dia{sla > 1 ? "s" : ""} — {slaData.label}</p>
            <p className="text-[9px] text-slate-500 font-medium mt-0.5">Alocados na Loja: {opCaixa + opAtendimento} funcionários</p>
          </div>
        </div>
      </div>

      {/* ── METRICAS DE CONSOLIDACAO INFERIOR ── */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 pt-2">
        <div className="bg-white/[0.02] border border-white/[0.06] rounded-2xl p-4 flex flex-col justify-between">
          <div className="flex items-center gap-1.5 mb-2">
            <TrendingUp size={14} className="text-orange-500" />
            <p className="text-[10px] uppercase tracking-widest font-black text-slate-400">CSAT Consolidado</p>
          </div>
          <p className="text-2xl font-black font-mono tracking-wide text-white">{csatFinal}%</p>
          <p className="text-[10px] text-slate-500 font-medium mt-1">Média: Loja ({csatOp}%) + Quiz ({quiz}%)</p>
        </div>

        <div className={`border rounded-2xl p-4 flex flex-col justify-between transition-colors ${slaData.bg} ${slaData.border}`}>
          <div className="flex items-center gap-1.5 mb-2">
            <Clock size={14} className={slaData.color} />
            <p className={`text-[10px] uppercase tracking-widest font-black opacity-80 ${slaData.color}`}>SLA da Operação</p>
          </div>
          <p className={`text-2xl font-black font-mono tracking-wide ${slaData.color}`}>{sla} dia{sla > 1 ? "s" : ""}</p>
          <p className={`text-[10px] font-semibold mt-1 opacity-80 ${slaData.color}`}>{slaData.label}</p>
        </div>

        <div className="bg-white/[0.02] border border-white/[0.06] rounded-2xl p-4 flex flex-col justify-between">
          <div className="flex items-center gap-1.5 mb-2">
            <Users size={14} className="text-slate-400" />
            <p className="text-[10px] uppercase tracking-widest font-black text-slate-400">Total HC Ativo</p>
          </div>
          <p className="text-2xl font-black font-mono tracking-wide text-white">{opCaixa + opAtendimento}</p>
          <p className="text-[10px] text-slate-500 font-medium mt-1">{opCaixa} frentes de caixa · {opAtendimento} SAC</p>
        </div>
      </div>

      {/* ── LEGAL FOOTNOTE INFORMATION ── */}
      <div className="bg-white/[0.01] border border-white/[0.04] rounded-2xl p-4 flex gap-3 items-start">
        <Info size={14} className="text-orange-500 shrink-0 mt-0.5" />
        <p className="text-xs font-medium text-slate-400 leading-relaxed">
          <strong className="text-white">Diretriz operacional:</strong> O indicador de satisfação do cliente (CSAT) combina o dimensionamento de frentes físicas com o desempenho técnico obtido nos quizes da rodada. O tempo de resposta (SLA) é inversamente proporcional à força de trabalho total alocada.
        </p>
      </div>
    </div>
  );
}