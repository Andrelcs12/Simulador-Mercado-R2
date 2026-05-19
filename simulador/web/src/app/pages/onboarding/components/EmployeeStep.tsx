"use client";

import React, { useMemo } from "react";
import { motion } from "framer-motion";
import { Users, Headphones, Target, ShieldCheck, Minus, Plus } from "lucide-react";
import { AppConfig } from "../types/onboarding";

interface EmployeeStepProps {
  config: AppConfig;
  setConfig: React.Dispatch<React.SetStateAction<AppConfig>>;
}

const MAX_OPERATORS = 20;

/**
 * Calcula o CSAT garantindo precisão decimal antes do arredondamento.
 * Formula: (Caixa / 10) * QuizScore
 */
function calculateCSAT(operadoresCaixa: number, quizScore: number): number {
  const factor = Math.min(operadoresCaixa / 10, 1);
  return Math.round(factor * quizScore);
}

/**
 * Retorna o percentual de SLA baseado no número de operadores de atendimento.
 */
function calculateSLA(serviceOps: number): number {
  if (serviceOps >= 10) return 100;
  if (serviceOps <= 0) return 20;
  
  const slaMapping: Record<number, number> = {
    1: 30,
    2: 40,
    3: 50,
    4: 60,
    5: 70,
    6: 80,
    7: 85,
    8: 90,
    9: 95,
  };

  return slaMapping[serviceOps] ?? 20;
}

interface SLAMetaInfo {
  label: string;
  color: string;
  bg: string;
}

function getSLAMeta(sla: number): SLAMetaInfo {
  if (sla >= 85) {
    return { label: "Excelência operacional", color: "text-emerald-600", bg: "bg-emerald-50" };
  }
  if (sla >= 70) {
    return { label: "Boa operação", color: "text-yellow-600", bg: "bg-yellow-50" };
  }
  if (sla >= 50) {
    return { label: "Operação limitada", color: "text-orange-600", bg: "bg-orange-50" };
  }
  return { label: "Operação crítica", color: "text-red-600", bg: "bg-red-50" };
}

export default function EmployeeStep({ config, setConfig }: EmployeeStepProps) {
  const opCaixa = config.operadoresCaixa ?? 5;
  const opAtendimento = config.operadoresAtendimento ?? 3;
  const quiz = config.quizScore ?? 100;

  // Cálculos memoizados para evitar recalculação desnecessária em re-renders
  const totalOps = useMemo(() => opCaixa + opAtendimento, [opCaixa, opAtendimento]);
  const csat = useMemo(() => calculateCSAT(opCaixa, quiz), [opCaixa, quiz]);
  const sla = useMemo(() => calculateSLA(opAtendimento), [opAtendimento]);
  const slaInfo = useMemo(() => getSLAMeta(sla), [sla]);

  const csatColor = useMemo(() => {
    if (csat >= 80) return "text-emerald-600";
    if (csat >= 60) return "text-yellow-600";
    return "text-red-500";
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
    <div className="space-y-10">
      {/* HEADER */}
      <div className="border-l-4 border-orange-500 pl-5">
        <p className="text-[10px] uppercase tracking-[0.3em] font-black text-orange-500">
          Operação
        </p>
        <h2 className="text-3xl font-black text-slate-900">
          Gestão de <span className="text-orange-500">Equipe</span>
        </h2>
        <p className="text-sm text-slate-500 mt-1">
          CSAT, SLA e impacto operacional da loja.
        </p>
      </div>

      {/* KPI CARDS */}
      <div className="grid md:grid-cols-2 gap-5">
        {/* CSAT */}
        <div className="bg-white border-2 border-slate-100 rounded-2xl p-5">
          <div className="flex items-center gap-2">
            <ShieldCheck className="text-sky-500" size={16} />
            <p className="text-xs uppercase font-black text-slate-400">CSAT</p>
          </div>
          <p className={`text-4xl font-black mt-3 ${csatColor}`}>{csat}%</p>
          <p className="text-xs text-slate-500 mt-2">
            (Caixa / 10) × Quiz
          </p>
        </div>

        {/* SLA */}
        <div className={`border-2 rounded-2xl p-5 transition-colors duration-200 ${slaInfo.bg}`}>
          <div className="flex items-center gap-2">
            <Headphones className={slaInfo.color} size={16} />
            <p className="text-xs uppercase font-black text-slate-400">SLA</p>
          </div>
          <p className={`text-4xl font-black mt-3 ${slaInfo.color}`}>{sla}%</p>
          <p className={`text-xs mt-2 font-medium ${slaInfo.color}`}>
            {slaInfo.label}
          </p>
        </div>
      </div>

      {/* QUIZ */}
      <div className="bg-white border-2 border-slate-100 rounded-2xl p-5">
        <div className="flex justify-between items-center flex-wrap gap-3">
          <div>
            <p className="text-sm font-black text-slate-900">
              Conhecimento operacional (Quiz)
            </p>
            <p className="text-xs text-slate-500">
              Impacta diretamente o CSAT
            </p>
          </div>

          <div className="flex items-center gap-2">
            <input
              type="number"
              min={0}
              max={100}
              value={quiz === 0 ? "" : quiz}
              onChange={(e) => {
                const val = e.target.value;
                updateQuizScore(val === "" ? 0 : Number(val));
              }}
              className="w-24 h-11 text-center font-black rounded-xl border-2 border-slate-100 bg-slate-50 focus:border-orange-400 focus:bg-white outline-none transition-all cursor-text"
            />
            <span className="font-black text-slate-500">%</span>
          </div>
        </div>
      </div>

      {/* OPERADORES */}
      <div className="grid md:grid-cols-2 gap-5">
        {/* CAIXA */}
        <motion.div
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-white border-2 border-slate-100 rounded-2xl p-5"
        >
          <div className="flex items-center gap-3">
            <Users className="text-sky-600" />
            <div>
              <p className="font-black text-slate-900">Caixa</p>
              <p className="text-xs text-slate-500">Influência no CSAT</p>
            </div>
          </div>

          <div className="flex justify-between items-center mt-6">
            <button
              type="button"
              onClick={() => updateOperators("operadoresCaixa", opCaixa - 1)}
              className="w-11 h-11 flex items-center justify-center rounded-xl bg-slate-100 hover:bg-slate-200 active:scale-95 transition-all cursor-pointer"
            >
              <Minus size={16} className="text-slate-700 stroke-[3]" />
            </button>
            <p className="text-4xl font-black select-none">{opCaixa}</p>
            <button
              type="button"
              onClick={() => updateOperators("operadoresCaixa", opCaixa + 1)}
              className="w-11 h-11 flex items-center justify-center rounded-xl bg-orange-500 hover:bg-orange-600 active:scale-95 text-white transition-all cursor-pointer"
            >
              <Plus size={16} className="stroke-[3]" />
            </button>
          </div>
        </motion.div>

        {/* ATENDIMENTO */}
        <motion.div
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-white border-2 border-slate-100 rounded-2xl p-5"
        >
          <div className="flex items-center gap-3">
            <Headphones className="text-orange-500" />
            <div>
              <p className="font-black text-slate-900">Atendimento</p>
              <p className="text-xs text-slate-500">Define SLA operacional</p>
            </div>
          </div>

          <div className="flex justify-between items-center mt-6">
            <button
              type="button"
              onClick={() => updateOperators("operadoresAtendimento", opAtendimento - 1)}
              className="w-11 h-11 flex items-center justify-center rounded-xl bg-slate-100 hover:bg-slate-200 active:scale-95 transition-all cursor-pointer"
            >
              <Minus size={16} className="text-slate-700 stroke-[3]" />
            </button>
            <p className="text-4xl font-black select-none">{opAtendimento}</p>
            <button
              type="button"
              onClick={() => updateOperators("operadoresAtendimento", opAtendimento + 1)}
              className="w-11 h-11 flex items-center justify-center rounded-xl bg-orange-500 hover:bg-orange-600 active:scale-95 text-white transition-all cursor-pointer"
            >
              <Plus size={16} className="stroke-[3]" />
            </button>
          </div>
        </motion.div>
      </div>

      {/* IMPACTO FINAL */}
      <div className="bg-gradient-to-r from-slate-50 to-orange-50 border-2 border-slate-100 rounded-2xl p-5">
        <div className="flex items-center gap-3">
          <Target className="text-orange-500" />
          <div>
            <p className="text-xs uppercase font-black text-slate-400">
              Impacto geral
            </p>
            <p className="text-sm font-medium text-slate-600 mt-1">
              Equipe total: {totalOps} | CSAT: {csat}% | SLA: {sla}%
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}