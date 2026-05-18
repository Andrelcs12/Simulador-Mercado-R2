"use client";

import React from "react";
import { motion } from "framer-motion";
import {
  Users,
  Headphones,
  Target,
  ShieldCheck,
} from "lucide-react";

import { AppConfig } from "../types/onboarding";

interface Props {
  config: AppConfig;
  setConfig: React.Dispatch<React.SetStateAction<AppConfig>>;
}

const MAX_OP = 20;

// CSAT:
// (operadores caixa / 10) * quiz
function calcCSAT(caixa: number, quiz: number) {
  const operatorFactor = Math.min(caixa / 10, 1);

  return Math.round(operatorFactor * quiz);
}

// SLA baseado SOMENTE operadores de atendimento
function calcSLA(serviceOps: number) {
  if (serviceOps >= 8) return 95;
  if (serviceOps >= 6) return 85;
  if (serviceOps >= 4) return 75;
  if (serviceOps >= 2) return 60;

  return 40;
}

function slaLabel(sla: number) {
  if (sla >= 95) {
    return {
      label: "Excelência operacional",
      color: "text-emerald-600",
      bg: "bg-emerald-50",
    };
  }

  if (sla >= 85) {
    return {
      label: "Alta eficiência",
      color: "text-emerald-600",
      bg: "bg-emerald-50",
    };
  }

  if (sla >= 75) {
    return {
      label: "Boa operação",
      color: "text-yellow-600",
      bg: "bg-yellow-50",
    };
  }

  if (sla >= 60) {
    return {
      label: "Operação limitada",
      color: "text-orange-600",
      bg: "bg-orange-50",
    };
  }

  return {
    label: "Operação crítica",
    color: "text-red-600",
    bg: "bg-red-50",
  };
}

export default function EmployeeStep({
  config,
  setConfig,
}: Props) {
  const opCaixa = config.operadoresCaixa ?? 5;

  const opAtendimento =
    config.operadoresAtendimento ?? 3;

  const quiz = config.quizScore ?? 100;

  const totalOps = opCaixa + opAtendimento;

  const csat = calcCSAT(opCaixa, quiz);

  const sla = calcSLA(opAtendimento);

  const slaInfo = slaLabel(sla);

  const csatColor =
    csat >= 80
      ? "text-emerald-600"
      : csat >= 60
      ? "text-yellow-600"
      : "text-red-500";

  const update = (
    field:
      | "operadoresCaixa"
      | "operadoresAtendimento",
    val: number
  ) => {
    setConfig((prev) => ({
      ...prev,
      [field]: Math.max(
        0,
        Math.min(MAX_OP, val)
      ),
    }));
  };

  const updateQuiz = (val: number) => {
  setConfig((prev) => ({
    ...prev,
    quizScore: Math.max(
      0,
      Math.min(100, val)
    ),
  }));
};

  return (
    <div className="space-y-6">

      {/* HEADER */}
      <div className="flex flex-col lg:flex-row lg:items-end justify-between gap-4">

        <div className="pl-4 border-l-[3px] border-orange-500">
          <p className="text-[10px] font-black uppercase tracking-[0.25em] text-orange-500">
            Passo 3 de 4
          </p>

          <h2 className="text-2xl md:text-3xl font-black text-slate-900 mt-2">
            Gestão de{" "}
            <span className="text-orange-500">
              Equipe
            </span>
          </h2>

          <p className="text-sm text-slate-500 mt-2">
            Configure equipe operacional e nível de
            conhecimento da loja.
          </p>
        </div>

        {/* KPIS */}
        <div className="flex gap-3">

          {/* CSAT */}
          <div className="bg-white rounded-2xl px-5 py-4 shadow-sm min-w-[130px]">
            <div className="flex items-center gap-2 mb-2">
              <ShieldCheck
                size={14}
                className="text-sky-500"
              />

              <p className="text-[10px] uppercase tracking-[0.2em] font-black text-slate-400">
                CSAT
              </p>
            </div>

            <p
              className={`text-3xl font-black ${csatColor}`}
            >
              {csat}%
            </p>
          </div>

          {/* SLA */}
          <div
            className={`rounded-2xl px-5 py-4 shadow-sm min-w-[130px] ${slaInfo.bg}`}
          >
            <div className="flex items-center gap-2 mb-2">
              <Headphones
                size={14}
                className={slaInfo.color}
              />

              <p className="text-[10px] uppercase tracking-[0.2em] font-black text-slate-400">
                SLA
              </p>
            </div>

            <p
              className={`text-3xl font-black ${slaInfo.color}`}
            >
              {sla}%
            </p>
          </div>

        </div>
      </div>

      {/* QUIZ */}
      <div className="bg-white rounded-2xl p-5 shadow-sm">

        <div className="flex items-center justify-between gap-4 flex-wrap">

          <div>
            <p className="text-sm font-black text-slate-900">
              Resultado do Quiz
            </p>

            <p className="text-xs text-slate-500 mt-1">
              Percentual de acertos no questionário
              operacional.
            </p>
          </div>

          <div className="flex items-center gap-3">

            
            <input
  type="number"
  min={0}
  max={100}
  value={quiz === 0 ? "" : quiz}
  onChange={(e) => {
    const raw = e.target.value;

    // permite apagar completamente
    if (raw === "") {
      updateQuiz(0);
      return;
    }

    const value = Number(raw);

    // impede negativo
    if (value < 0) return;

    updateQuiz(value);
  }}
  className="w-24 h-11 rounded-xl border border-slate-200 bg-slate-50 px-3 text-center text-lg font-black outline-none focus:border-orange-400"
/>

            <span className="text-sm font-black text-slate-500">
              %
            </span>

          </div>

        </div>
      </div>

      {/* CARDS */}
      <div className="grid lg:grid-cols-2 gap-5">

        {/* CAIXA */}
        <motion.div
          initial={{ opacity: 0, y: 6 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-white rounded-2xl p-5 shadow-sm"
        >

          <div className="flex items-start gap-3">

            <div className="w-12 h-12 rounded-xl bg-sky-50 flex items-center justify-center shrink-0">
              <Users
                className="text-sky-600"
                size={20}
              />
            </div>

            <div>
              <h3 className="text-lg font-black text-slate-900">
                Operadores de Caixa
              </h3>

              <p className="text-xs text-slate-500 mt-1">
                Impactam diretamente o CSAT da loja.
              </p>
            </div>
          </div>

          {/* COUNTER */}
          <div className="flex items-center justify-between mt-7">

            <button
              onClick={() =>
                update(
                  "operadoresCaixa",
                  opCaixa - 1
                )
              }
              className="w-11 h-11 rounded-xl bg-slate-100 hover:bg-slate-200 text-xl font-black transition"
            >
              −
            </button>

            <div className="text-center">
              <p className="text-5xl font-black text-slate-900">
                {opCaixa}
              </p>

              <p className="text-[10px] uppercase tracking-[0.2em] text-slate-400 font-bold mt-1">
                operadores
              </p>
            </div>

            <button
              onClick={() =>
                update(
                  "operadoresCaixa",
                  opCaixa + 1
                )
              }
              className="w-11 h-11 rounded-xl bg-orange-500 hover:bg-orange-600 text-white text-xl font-black transition"
            >
              +
            </button>

          </div>

          {/* RESULT */}
          <div className="mt-6 rounded-xl bg-sky-50 p-4">

            <div className="flex items-center justify-between">

              <div>
                <p className="text-[10px] uppercase tracking-[0.2em] font-black text-sky-600">
                  Impacto no CSAT
                </p>

                <p className="text-xs text-slate-500 mt-2">
                  (operadores / 10) × quiz
                </p>
              </div>

              <div
                className={`text-3xl font-black ${csatColor}`}
              >
                {csat}%
              </div>

            </div>
          </div>

        </motion.div>

        {/* ATENDIMENTO */}
        <motion.div
          initial={{ opacity: 0, y: 6 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-white rounded-2xl p-5 shadow-sm"
        >

          <div className="flex items-start gap-3">

            <div className="w-12 h-12 rounded-xl bg-orange-50 flex items-center justify-center shrink-0">
              <Headphones
                className="text-orange-500"
                size={20}
              />
            </div>

            <div>
              <h3 className="text-lg font-black text-slate-900">
                Atendimento
              </h3>

              <p className="text-xs text-slate-500 mt-1">
                Define SLA operacional da loja.
              </p>
            </div>
          </div>

          {/* COUNTER */}
          <div className="flex items-center justify-between mt-7">

            <button
              onClick={() =>
                update(
                  "operadoresAtendimento",
                  opAtendimento - 1
                )
              }
              className="w-11 h-11 rounded-xl bg-slate-100 hover:bg-slate-200 text-xl font-black transition"
            >
              −
            </button>

            <div className="text-center">
              <p className="text-5xl font-black text-slate-900">
                {opAtendimento}
              </p>

              <p className="text-[10px] uppercase tracking-[0.2em] text-slate-400 font-bold mt-1">
                operadores
              </p>
            </div>

            <button
              onClick={() =>
                update(
                  "operadoresAtendimento",
                  opAtendimento + 1
                )
              }
              className="w-11 h-11 rounded-xl bg-orange-500 hover:bg-orange-600 text-white text-xl font-black transition"
            >
              +
            </button>

          </div>

          {/* RESULT */}
          <div
            className={`mt-6 rounded-xl p-4 ${slaInfo.bg}`}
          >

            <div className="flex items-center justify-between">

              <div>
                <p className="text-[10px] uppercase tracking-[0.2em] font-black text-slate-500">
                  SLA operacional
                </p>

                <p
                  className={`text-sm font-black mt-2 ${slaInfo.color}`}
                >
                  {slaInfo.label}
                </p>
              </div>

              <div
                className={`text-3xl font-black ${slaInfo.color}`}
              >
                {sla}%
              </div>

            </div>
          </div>

        </motion.div>
      </div>

      {/* IMPACTO */}
      <div className="bg-gradient-to-r from-slate-50 to-orange-50 rounded-2xl p-5">

        <div className="flex items-start gap-3">

          <div className="w-10 h-10 rounded-xl bg-white flex items-center justify-center shadow-sm shrink-0">
            <Target
              size={18}
              className="text-orange-500"
            />
          </div>

          <div className="flex-1">

            <p className="text-[10px] uppercase tracking-[0.2em] font-black text-slate-500">
              Impacto competitivo
            </p>

            <p className="text-sm text-slate-600 mt-2 leading-relaxed">
              O sistema distribui demanda entre as
              lojas usando preço, disponibilidade e
              CSAT. Melhor operação recebe maior
              participação nas vendas.
            </p>

            <div className="flex gap-3 mt-4 flex-wrap">

              <div className="bg-white rounded-xl px-4 py-3 shadow-sm">
                <p className="text-[10px] uppercase tracking-[0.18em] font-black text-slate-400">
                  Equipe Total
                </p>

                <p className="text-2xl font-black text-slate-900 mt-1">
                  {totalOps}
                </p>
              </div>

              <div className="bg-white rounded-xl px-4 py-3 shadow-sm">
                <p className="text-[10px] uppercase tracking-[0.18em] font-black text-slate-400">
                  Quiz
                </p>

                <p className="text-2xl font-black text-slate-900 mt-1">
                  {quiz}%
                </p>
              </div>

            </div>

          </div>
        </div>
      </div>

    </div>
  );
}