"use client";

import React, { useMemo } from "react";
import { motion } from "framer-motion";
import { Users, Headphones, Target, ShieldCheck, Minus, Plus, HelpCircle } from "lucide-react";
import { useOnboarding } from "../context/OnboardingContext"; // Ajuste o caminho se necessário

const MAX_OPERATORS = 20;

interface SLAMetaInfo {
  label: string;
  color: string;
  bg: string;
  borderColor: string;
}

function getSLAMeta(sla: number): SLAMetaInfo {
  if (sla >= 85) {
    return { 
      label: "Excelência operacional", 
      color: "text-emerald-400", 
      bg: "bg-emerald-500/10", 
      borderColor: "border-emerald-500/20" 
    };
  }
  if (sla >= 70) {
    return { 
      label: "Boa operação", 
      color: "text-amber-400", 
      bg: "bg-amber-500/10", 
      borderColor: "border-amber-500/20" 
    };
  }
  if (sla >= 50) {
    return { 
      label: "Operação limitada", 
      color: "text-orange-400", 
      bg: "bg-orange-500/10", 
      borderColor: "border-orange-500/20" 
    };
  }
  return { 
    label: "Operação crítica", 
    color: "text-rose-400", 
    bg: "bg-rose-500/10", 
    borderColor: "border-rose-500/20" 
  };
}

export default function EmployeeStep() {
  // Consumindo tudo do estado global centralizado
  const { config, setConfig, performanceMetrics } = useOnboarding();

  const opCaixa = config.operadoresCaixa ?? 5;
  const opAtendimento = config.operadoresAtendimento ?? 3;
  const quiz = config.quizScore ?? 100;

  const totalOps = useMemo(() => opCaixa + opAtendimento, [opCaixa, opAtendimento]);
  
  // Pegando a verdade única calculada no Context
  const { csat, sla } = performanceMetrics;
  const slaInfo = useMemo(() => getSLAMeta(sla), [sla]);

  const csatColor = useMemo(() => {
    if (csat >= 80) return "text-emerald-400";
    if (csat >= 60) return "text-amber-400";
    return "text-rose-400";
  }, [csat]);

  const updateOperators = (field: "operadoresCaixa" | "operadoresAtendimento", value: number) => {
    setConfig((prev) => ({
      ...prev,
      [field]: Math.max(0, Math.min(MAX_OPERATORS, value)),
    }));
  };

  const updateQuizScore = (value: number) => {
    setConfig((prev) => ({
      ...prev,
      quizScore: Math.max(0, Math.min(100, value)),
    }));
  };

  return (
    <div className="space-y-8">
      {/* HEADER */}
      <div className="border-l-4 border-orange-500 pl-5">
        <p className="text-[11px] uppercase tracking-[0.3em] font-black text-orange-500">
          Etapa 3 de 4
        </p>
        <h2 className="text-3xl font-black text-white tracking-tight">
          Gestão de <span className="text-orange-500">Equipe</span>
        </h2>
        <p className="text-sm text-slate-400 mt-2">
          Gerencie o quadro de funcionários e veja o impacto em tempo real no CSAT e SLA da operação.
        </p>
      </div>

      {/* QUIZ */}
      <div className="bg-white/5 border border-white/10 rounded-2xl p-5 transition-all">
        <div className="flex justify-between items-center flex-wrap gap-4">
          <div>
            <p className="text-sm font-black text-white">
              Conhecimento operacional (Quiz)
            </p>
            <p className="text-xs text-slate-400 mt-0.5">
              A nota média do teste de conhecimento da sua equipe. Multiplica o teto do CSAT.
            </p>
          </div>

          <div className="flex items-center gap-2">
            <input
              type="number"
              min={0}
              max={100}
              value={quiz === 0 ? "" : quiz}
              placeholder="0"
              onChange={(e) => {
                const val = e.target.value;
                updateQuizScore(val === "" ? 0 : Number(val));
              }}
              className="w-24 h-11 text-center font-black rounded-xl border border-white/10 bg-white/5 focus:border-white/30 focus:outline-none text-white outline-none transition-all cursor-text"
            />
            <span className="font-black text-slate-400">%</span>
          </div>
        </div>
      </div>

      {/* OPERADORES */}
      <div className="grid md:grid-cols-2 gap-5">
        {/* CAIXA */}
        <motion.div
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-white/5 border border-white/10 rounded-2xl p-5 flex flex-col justify-between"
        >
          <div className="flex justify-between items-start">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 flex items-center justify-center rounded-xl bg-sky-500/10 text-sky-400">
                <Users size={18} />
              </div>
              <div>
                <p className="font-black text-white">Operadores de Caixa</p>
                <p className="text-xs text-slate-400 mt-0.5">Capacidade de vazão dos checkouts</p>
              </div>
            </div>
            <span className="text-[10px] font-bold text-slate-500 bg-white/5 px-2 py-1 rounded-md border border-white/5">
              Máx: {MAX_OPERATORS}
            </span>
          </div>

          <div className="flex justify-between items-center mt-8">
            <button
              type="button"
              disabled={opCaixa <= 0}
              onClick={() => updateOperators("operadoresCaixa", opCaixa - 1)}
              className="w-11 h-11 flex items-center justify-center rounded-xl border border-white/10 bg-white/5 hover:bg-white/10 text-slate-300 disabled:opacity-20 active:scale-95 transition-all cursor-pointer"
            >
              <Minus size={14} />
            </button>
            <p className="text-4xl font-black text-white select-none">{opCaixa}</p>
            <button
              type="button"
              disabled={opCaixa >= MAX_OPERATORS}
              onClick={() => updateOperators("operadoresCaixa", opCaixa + 1)}
              className="w-11 h-11 flex items-center justify-center rounded-xl bg-orange-500 hover:bg-orange-600 disabled:bg-white/5 disabled:text-slate-600 disabled:border-white/5 disabled:cursor-not-allowed active:scale-95 text-white transition-all cursor-pointer"
            >
              <Plus size={14} />
            </button>
          </div>
        </motion.div>

        {/* ATENDIMENTO */}
        <motion.div
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-white/5 border border-white/10 rounded-2xl p-5 flex flex-col justify-between"
        >
          <div className="flex justify-between items-start">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 flex items-center justify-center rounded-xl bg-orange-500/10 text-orange-400">
                <Headphones size={18} />
              </div>
              <div>
                <p className="font-black text-white">Atendimento de Salão</p>
                <p className="text-xs text-slate-400 mt-0.5">Suporte e reposição interna</p>
              </div>
            </div>
            <span className="text-[10px] font-bold text-slate-500 bg-white/5 px-2 py-1 rounded-md border border-white/5">
              Máx: {MAX_OPERATORS}
            </span>
          </div>

          <div className="flex justify-between items-center mt-8">
            <button
              type="button"
              disabled={opAtendimento <= 0}
              onClick={() => updateOperators("operadoresAtendimento", opAtendimento - 1)}
              className="w-11 h-11 flex items-center justify-center rounded-xl border border-white/10 bg-white/5 hover:bg-white/10 text-slate-300 disabled:opacity-20 active:scale-95 transition-all cursor-pointer"
            >
              <Minus size={14} />
            </button>
            <p className="text-4xl font-black text-white select-none">{opAtendimento}</p>
            <button
              type="button"
              disabled={opAtendimento >= MAX_OPERATORS}
              onClick={() => updateOperators("operadoresAtendimento", opAtendimento + 1)}
              className="w-11 h-11 flex items-center justify-center rounded-xl bg-orange-500 hover:bg-orange-600 disabled:bg-white/5 disabled:text-slate-600 disabled:border-white/5 disabled:cursor-not-allowed active:scale-95 text-white transition-all cursor-pointer"
            >
              <Plus size={14} />
            </button>
          </div>
        </motion.div>
      </div>

      {/* IMPACTO GERAL */}
      <div className="bg-gradient-to-r from-white/[0.02] to-orange-500/[0.02] border border-white/10 rounded-2xl p-4">
        <div className="flex items-center gap-3">
          <Target className="text-orange-500" size={18} />
          <div>
            <p className="text-[10px] uppercase font-black text-slate-500 tracking-wider">
              Dimensionamento Geral
            </p>
            <p className="text-sm font-medium text-slate-300 mt-0.5">
              Headcount Ativo: <span className="font-black text-white">{totalOps} funcionários</span> escalados na unidade.
            </p>
          </div>
        </div>
      </div>

      {/* KPI CARDS */}
      <div className="grid md:grid-cols-2 gap-5">
        {/* CSAT */}
        <div className="bg-white/5 border border-white/10 rounded-2xl p-5 flex flex-col justify-between">
          <div>
            <div className="flex items-center gap-2">
              <ShieldCheck className="text-sky-400" size={16} />
              <p className="text-xs uppercase font-black text-slate-400 tracking-wider">Métrica CSAT</p>
            </div>
            <p className={`text-4xl font-black mt-4 ${csatColor}`}>{csat}%</p>
          </div>
          
          <div className="mt-5 pt-3 border-t border-white/5 flex items-center gap-2 text-slate-400">
            <HelpCircle size={12} className="text-slate-500 shrink-0" />
            <p className="text-[11px] leading-relaxed">
              Fórmula aplicada: <span className="text-white font-mono font-bold">Min(Caixa / 10, 1) × Quiz ({quiz}%)</span>
            </p>
          </div>
        </div>

        {/* SLA */}
        <div className={`border rounded-2xl p-5 transition-colors duration-200 flex flex-col justify-between ${slaInfo.bg} ${slaInfo.borderColor}`}>
          <div>
            <div className="flex items-center gap-2">
              <Headphones className={slaInfo.color} size={16} />
              <p className="text-xs uppercase font-black text-slate-400 tracking-wider">Nível de SLA</p>
            </div>
            <p className={`text-4xl font-black mt-4 ${slaInfo.color}`}>{sla}%</p>
          </div>

          <div className="mt-5 pt-3 border-t border-white/5 flex flex-col gap-0.5 text-slate-400">
            <p className={`text-xs font-bold ${slaInfo.color}`}>
              {slaInfo.label}
            </p>
            <p className="text-[11px] text-slate-500">
              Baseado na tabela de contingência por operadores de atendimento.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}