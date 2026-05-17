"use client";

import React from "react";
import { motion } from "framer-motion";
import { Users, Headphones, Info, TrendingUp, Clock, Target } from "lucide-react";
import { AppConfig } from "../types/onboarding";

interface Props {
  config: AppConfig;
  setConfig: React.Dispatch<React.SetStateAction<AppConfig>>;
}

const MAX_OP = 20;

// CSAT real do jogo:
// (operadores/10) × (quiz/100)
function calcCSAT(caixa: number, quiz: number) {
  const base = Math.min(caixa / 10, 1);
  return Math.round(base * quiz);
}

// SLA simplificado por escala operacional
function calcSLA(totalOps: number) {
  if (totalOps >= 16) return 1;
  if (totalOps >= 12) return 2;
  if (totalOps >= 8) return 3;
  if (totalOps >= 4) return 4;
  return 5;
}

function slaLabel(sla: number) {
  if (sla === 1) return { label: "Excelente operação", color: "text-emerald-600", bg: "bg-emerald-50" };
  if (sla === 2) return { label: "Alta eficiência", color: "text-emerald-600", bg: "bg-emerald-50" };
  if (sla === 3) return { label: "Operação estável", color: "text-yellow-600", bg: "bg-yellow-50" };
  if (sla === 4) return { label: "Risco operacional", color: "text-orange-600", bg: "bg-orange-50" };
  return { label: "Crítico", color: "text-red-600", bg: "bg-red-50" };
}

export default function EmployeeStep({ config, setConfig }: Props) {
  const opCaixa = config.operadoresCaixa ?? 5;
  const opAtendimento = config.operadoresAtendimento ?? 3;
  const quiz = config.quizScore ?? 100;

  const totalOps = opCaixa + opAtendimento;

  const csat = calcCSAT(opCaixa, quiz);
  const sla = calcSLA(totalOps);
  const slaInfo = slaLabel(sla);

  const csatColor =
    csat >= 80 ? "text-emerald-600" : csat >= 60 ? "text-yellow-600" : "text-red-500";

  const update = (
    field: "operadoresCaixa" | "operadoresAtendimento",
    val: number
  ) => {
    setConfig((prev) => ({
      ...prev,
      [field]: Math.max(0, Math.min(MAX_OP, val)),
    }));
  };

  return (
    <div className="space-y-8">

      {/* HEADER */}
      <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4">
        <div className="border-l-4 border-[#FF6D00] pl-5">
          <p className="text-[11px] font-black uppercase tracking-[0.25em] text-[#FF6D00]">
            Passo 3 de 4
          </p>
          <h2 className="text-3xl font-black text-[#001F3F]">
            Gestão de <span className="text-[#FF6D00]">Equipe</span>
          </h2>
          <p className="text-sm text-slate-500 mt-2">
            Dimensione operadores de caixa e atendimento.
          </p>
        </div>

        {/* KPIs PRINCIPAIS */}
        <div className="flex gap-3">
          <div className="bg-white border rounded-2xl px-5 py-3 text-center">
            <p className="text-[10px] uppercase font-black text-slate-400">CSAT</p>
            <p className={`text-2xl font-black ${csatColor}`}>{csat}%</p>
          </div>

          <div className={`border rounded-2xl px-5 py-3 text-center ${slaInfo.bg}`}>
            <p className="text-[10px] uppercase font-black text-slate-400">SLA</p>
            <p className={`text-2xl font-black ${slaInfo.color}`}>{sla}d</p>
          </div>
        </div>
      </div>

      {/* CARDS */}
      <div className="grid md:grid-cols-2 gap-6">

        {/* CAIXA */}
        <div className="bg-white border rounded-2xl p-6 space-y-5">
          <div className="flex gap-3 items-center">
            <div className="w-11 h-11 rounded-xl bg-blue-50 flex items-center justify-center">
              <Users className="text-[#001F3F]" />
            </div>
            <div>
              <p className="font-black text-[#001F3F]">Operadores de Caixa</p>
              <p className="text-xs text-slate-500">
                Impacta diretamente CSAT (velocidade de checkout)
              </p>
            </div>
          </div>

          {/* CONTROLES */}
          <div className="flex items-center justify-between">
            <button
              onClick={() => update("operadoresCaixa", opCaixa - 1)}
              className="w-10 h-10 rounded-xl bg-slate-100 font-black"
            >
              −
            </button>

            <div className="text-4xl font-black">{opCaixa}</div>

            <button
              onClick={() => update("operadoresCaixa", opCaixa + 1)}
              className="w-10 h-10 rounded-xl bg-slate-100 font-black"
            >
              +
            </button>
          </div>

          {/* IMPACTO */}
          <div className="bg-blue-50 rounded-xl p-3 text-center">
            <p className="text-[10px] font-black text-blue-600 uppercase">
              Impacto no CSAT
            </p>
            <p className="text-xl font-black">{csat}%</p>
            <p className="text-[10px] text-slate-500">
              (operadores / 10) × quiz
            </p>
          </div>
        </div>

        {/* ATENDIMENTO */}
        <div className="bg-white border rounded-2xl p-6 space-y-5">

          <div className="flex gap-3 items-center">
            <div className="w-11 h-11 rounded-xl bg-orange-50 flex items-center justify-center">
              <Headphones className="text-[#FF6D00]" />
            </div>
            <div>
              <p className="font-black text-[#001F3F]">Atendimento</p>
              <p className="text-xs text-slate-500">
                Define SLA operacional da loja
              </p>
            </div>
          </div>

          {/* CONTROLES */}
          <div className="flex items-center justify-between">
            <button
              onClick={() => update("operadoresAtendimento", opAtendimento - 1)}
              className="w-10 h-10 rounded-xl bg-slate-100 font-black"
            >
              −
            </button>

            <div className="text-4xl font-black">{opAtendimento}</div>

            <button
              onClick={() => update("operadoresAtendimento", opAtendimento + 1)}
              className="w-10 h-10 rounded-xl bg-slate-100 font-black"
            >
              +
            </button>
          </div>

          {/* SLA */}
          <div className={`rounded-xl p-3 text-center ${slaInfo.bg}`}>
            <p className="text-[10px] uppercase font-black text-slate-400">
              SLA operacional
            </p>
            <p className={`text-xl font-black ${slaInfo.color}`}>
              {sla} dia(s)
            </p>
            <p className={`text-xs ${slaInfo.color}`}>
              {slaInfo.label}
            </p>
          </div>
        </div>
      </div>

      {/* IMPACTO GLOBAL NO JOGO */}
      <div className="bg-slate-50 border rounded-2xl p-5 space-y-2">
        <div className="flex items-center gap-2">
          <Target size={14} className="text-[#001F3F]" />
          <p className="text-xs font-black uppercase text-slate-500">
            Impacto competitivo
          </p>
        </div>

        <p className="text-sm text-slate-600">
          CSAT e SLA influenciam diretamente sua pontuação de demanda.
          Lojas com melhor combinação de serviço recebem maior participação
          na distribuição de vendas.
        </p>

        <div className="text-xs text-slate-500">
          Total equipe: <b>{totalOps}</b> operadores
        </div>
      </div>
    </div>
  );
}