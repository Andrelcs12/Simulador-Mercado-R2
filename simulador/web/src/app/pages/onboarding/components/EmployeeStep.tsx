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
  if (days === 1) return { label: "Excelente",  color: "text-emerald-700", bg: "bg-emerald-50", border: "border-emerald-200" };
  if (days === 2) return { label: "Ótimo",      color: "text-emerald-600", bg: "bg-emerald-50", border: "border-emerald-200" };
  if (days === 3) return { label: "Bom",        color: "text-yellow-700",  bg: "bg-yellow-50",  border: "border-yellow-200"  };
  if (days === 4) return { label: "Regular",    color: "text-orange-600",  bg: "bg-orange-50",  border: "border-orange-200"  };
  return              { label: "Crítico",     color: "text-red-600",    bg: "bg-red-50",     border: "border-red-200"     };
}

const MAX_OP = 20;

export default function EmployeeStep({ config, setConfig }: Props) {
  const opCaixa       = config.operadoresCaixa       ?? 5;
  const opAtendimento = config.operadoresAtendimento  ?? 3;
  const quiz          = config.quizScore              ?? 100;

  const csatOp    = Math.min(Math.round((opCaixa / 10) * 100), 100);
  const csatFinal = Math.round((csatOp + quiz) / 2);
  const sla       = calcSLA(opCaixa, opAtendimento);
  const slaData   = slaInfo(sla);

  const csatColor = csatFinal >= 80 ? "text-emerald-600" : csatFinal >= 60 ? "text-yellow-600" : "text-red-500";

  const update = (field: "operadoresCaixa" | "operadoresAtendimento", val: number) => {
    setConfig((prev: AppConfig) => ({ ...prev, [field]: Math.max(0, Math.min(MAX_OP, val)) }));
  };

  return (
    <div className="space-y-8">
      <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4">
        <div className="border-l-4 border-[#FF6D00] pl-5">
          <p className="text-[11px] font-black uppercase tracking-[0.25em] text-[#FF6D00] mb-1">Passo 3 de 4</p>
          <h2 className="text-3xl md:text-4xl font-black italic uppercase text-[#001F3F] leading-none">
            Equipe <span className="text-[#FF6D00]">Operacional</span>
          </h2>
          <p className="text-sm text-slate-500 font-medium mt-2">Defina operadores de caixa e atendimento.</p>
        </div>
        <div className="flex items-center gap-3 bg-white border border-slate-200 rounded-2xl px-6 py-4 shadow-sm shrink-0">
          <div className="text-center">
            <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">CSAT</p>
            <p className={`text-3xl font-black tabular-nums ${csatColor}`}>{csatFinal}%</p>
          </div>
          <div className="w-px h-10 bg-slate-200" />
          <div className="text-center">
            <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">SLA</p>
            <p className={`text-3xl font-black tabular-nums ${slaData.color}`}>{sla}d</p>
          </div>
        </div>
      </div>

      <div className="grid md:grid-cols-2 gap-5">
        {/* Caixa */}
        <div className="bg-white border border-slate-200 rounded-2xl p-6 space-y-5">
          <div className="flex items-center gap-3">
            <div className="w-11 h-11 rounded-xl bg-blue-50 flex items-center justify-center shrink-0">
              <Users size={22} className="text-[#001F3F]" />
            </div>
            <div>
              <p className="font-black text-[#001F3F] uppercase tracking-wide text-sm">Operadores de Caixa</p>
              <p className="text-[11px] text-slate-500 font-medium">Velocidade checkout · impacta CSAT</p>
            </div>
          </div>
          <div className="flex items-center gap-3">
            <button type="button" onClick={() => update("operadoresCaixa", opCaixa - 1)} className="w-10 h-10 rounded-xl bg-slate-100 hover:bg-slate-200 font-black text-[#001F3F] flex items-center justify-center transition-all">−</button>
            <div className="flex-1 text-center">
              <span className="text-5xl font-black text-[#001F3F] tabular-nums">{opCaixa}</span>
              <span className="text-slate-400 font-bold text-sm ml-1">/{MAX_OP}</span>
            </div>
            <button type="button" onClick={() => update("operadoresCaixa", opCaixa + 1)} className="w-10 h-10 rounded-xl bg-slate-100 hover:bg-slate-200 font-black text-[#001F3F] flex items-center justify-center transition-all">+</button>
          </div>
          <input type="range" min={0} max={MAX_OP} value={opCaixa} onChange={(e) => update("operadoresCaixa", Number(e.target.value))} className="w-full accent-[#001F3F]" />
          <div className="h-2 bg-slate-100 rounded-full overflow-hidden">
            <motion.div className="h-full bg-[#001F3F] rounded-full" animate={{ width: `${(opCaixa / MAX_OP) * 100}%` }} transition={{ duration: 0.3 }} />
          </div>
          <div className="bg-blue-50 border border-blue-100 rounded-xl p-3 text-center">
            <p className="text-[10px] text-blue-500 font-black uppercase tracking-widest mb-0.5">CSAT — operadores</p>
            <p className="text-xl font-black text-[#001F3F]">{csatOp}%</p>
            <p className="text-[10px] text-slate-400 font-medium">(caixa / 10) × 100</p>
          </div>
        </div>

        {/* Atendimento */}
        <div className="bg-white border border-slate-200 rounded-2xl p-6 space-y-5">
          <div className="flex items-center gap-3">
            <div className="w-11 h-11 rounded-xl bg-orange-50 flex items-center justify-center shrink-0">
              <Headphones size={22} className="text-[#FF6D00]" />
            </div>
            <div>
              <p className="font-black text-[#001F3F] uppercase tracking-wide text-sm">Operadores de Atendimento</p>
              <p className="text-[11px] text-slate-500 font-medium">Suporte ao cliente · impacta SLA</p>
            </div>
          </div>
          <div className="flex items-center gap-3">
            <button type="button" onClick={() => update("operadoresAtendimento", opAtendimento - 1)} className="w-10 h-10 rounded-xl bg-slate-100 hover:bg-slate-200 font-black text-[#001F3F] flex items-center justify-center transition-all">−</button>
            <div className="flex-1 text-center">
              <span className="text-5xl font-black text-[#001F3F] tabular-nums">{opAtendimento}</span>
              <span className="text-slate-400 font-bold text-sm ml-1">/{MAX_OP}</span>
            </div>
            <button type="button" onClick={() => update("operadoresAtendimento", opAtendimento + 1)} className="w-10 h-10 rounded-xl bg-slate-100 hover:bg-slate-200 font-black text-[#001F3F] flex items-center justify-center transition-all">+</button>
          </div>
          <input type="range" min={0} max={MAX_OP} value={opAtendimento} onChange={(e) => update("operadoresAtendimento", Number(e.target.value))} className="w-full accent-[#FF6D00]" />
          <div className="h-2 bg-slate-100 rounded-full overflow-hidden">
            <motion.div className="h-full bg-[#FF6D00] rounded-full" animate={{ width: `${(opAtendimento / MAX_OP) * 100}%` }} transition={{ duration: 0.3 }} />
          </div>
          <div className={`border rounded-xl p-3 text-center ${slaData.bg} ${slaData.border}`}>
            <p className={`text-[10px] font-black uppercase tracking-widest mb-0.5 opacity-60 ${slaData.color}`}>SLA de entrega</p>
            <p className={`text-xl font-black ${slaData.color}`}>{sla} dia{sla > 1 ? "s" : ""} — {slaData.label}</p>
            <p className="text-[10px] text-slate-400 font-medium mt-0.5">Total: {opCaixa + opAtendimento} operadores</p>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="bg-[#001F3F] text-white rounded-2xl p-5">
          <div className="flex items-center gap-2 mb-2"><TrendingUp size={14} className="text-[#FF6D00]" /><p className="text-[10px] uppercase tracking-widest font-black text-white/50">CSAT Final</p></div>
          <p className="text-3xl font-black tabular-nums">{csatFinal}%</p>
          <p className="text-[11px] text-white/50 mt-1">Operadores ({csatOp}%) + quiz ({quiz}%)</p>
        </div>
        <div className={`border rounded-2xl p-5 ${slaData.bg} ${slaData.border}`}>
          <div className="flex items-center gap-2 mb-2"><Clock size={14} className={slaData.color} /><p className={`text-[10px] uppercase tracking-widest font-black opacity-60 ${slaData.color}`}>SLA</p></div>
          <p className={`text-3xl font-black tabular-nums ${slaData.color}`}>{sla} dia{sla > 1 ? "s" : ""}</p>
          <p className={`text-[11px] mt-1 opacity-70 ${slaData.color}`}>{slaData.label}</p>
        </div>
        <div className="bg-white border border-slate-200 rounded-2xl p-5">
          <div className="flex items-center gap-2 mb-2"><Users size={14} className="text-slate-400" /><p className="text-[10px] uppercase tracking-widest font-black text-slate-400">Total equipe</p></div>
          <p className="text-3xl font-black text-[#001F3F] tabular-nums">{opCaixa + opAtendimento}</p>
          <p className="text-[11px] text-slate-400 mt-1">{opCaixa} caixa · {opAtendimento} atendimento</p>
        </div>
      </div>

      <div className="bg-slate-50 border border-slate-200 rounded-2xl p-4 flex gap-3 items-start">
        <Info size={15} className="text-[#001F3F] shrink-0 mt-0.5" />
        <p className="text-xs font-medium text-slate-600">
          <strong className="text-[#001F3F]">Como funciona:</strong> O CSAT combina operadores de caixa com o score do quiz. O SLA depende da soma total — quanto mais operadores, menor o prazo de atendimento.
        </p>
      </div>
    </div>
  );
}