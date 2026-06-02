"use client";

import React from "react";
import { Cpu, ShieldCheck, ShieldAlert } from "lucide-react";
import { CapexItem } from "../types";

interface StrategyPanelProps {
  operatorsQty: number;
  serviceOperatorsQty: number;
  quizScore: number;
  capexSelections: CapexItem[];
}

export default function StrategyPanel({ operatorsQty, serviceOperatorsQty, quizScore, capexSelections }: StrategyPanelProps) {
  
  let slaLabel = "Sem Operação";
  let slaColor = "text-rose-400 border-rose-500/20 bg-rose-500/10";
  
  if (serviceOperatorsQty >= 8) { slaLabel = "Excelente (95%)"; slaColor = "text-emerald-400 border-emerald-500/20 bg-emerald-500/10"; }
  else if (serviceOperatorsQty >= 6) { slaLabel = "Bom (85%)"; slaColor = "text-sky-400 border-sky-500/20 bg-sky-500/10"; }
  else if (serviceOperatorsQty >= 4) { slaLabel = "Regular (75%)"; slaColor = "text-orange-400 border-orange-500/20 bg-orange-500/10"; }
  else if (serviceOperatorsQty >= 2) { slaLabel = "Critico (60%)"; slaColor = "text-amber-500 border-amber-500/20 bg-amber-500/10"; }
  else { slaLabel = "Critico (40%)"; }

  return (
    <div className="space-y-6">
      <div className="bg-white/[0.02] border border-white/5 rounded-2xl p-5">
        <h2 className="text-[10px] font-black uppercase text-slate-500 tracking-[0.2em] mb-4 flex items-center gap-2">
          <Cpu size={14} className="text-orange-500" /> Alocação de RH & SLA
        </h2>
        <div className="space-y-3">
          <div className="flex justify-between items-center text-xs">
            <span className="text-slate-400 font-bold uppercase">Operação Caixa:</span>
            <span className="font-black text-white">{operatorsQty} Proffs</span>
          </div>
          <div className="flex justify-between items-center text-xs">
            <span className="text-slate-400 font-bold uppercase">Suporte de TI:</span>
            <span className="font-black text-white">{serviceOperatorsQty} Proffs</span>
          </div>
          <div className="flex justify-between items-center text-xs">
            <span className="text-slate-400 font-bold uppercase">Quiz Operacional:</span>
            <span className="font-black text-white">{quizScore}%</span>
          </div>
          <div className="pt-3 border-t border-white/5 flex justify-between items-center">
            <span className="text-[10px] text-slate-500 uppercase font-black">Previsão SLA:</span>
            <span className={`px-2.5 py-0.5 text-[9px] uppercase font-black rounded border ${slaColor}`}>
              {slaLabel}
            </span>
          </div>
        </div>
      </div>

      <div className="bg-white/[0.02] border border-white/5 rounded-2xl p-5">
        <h2 className="text-[10px] font-black uppercase text-slate-500 tracking-[0.2em] mb-4 flex items-center gap-2">
          <ShieldCheck size={14} className="text-orange-500" /> Investimentos CAPEX
        </h2>
        <div className="space-y-2">
          {capexSelections.length === 0 ? (
            <div className="text-center py-6 border border-dashed border-white/10 rounded-xl">
              <ShieldAlert size={18} className="text-slate-700 mx-auto mb-1" />
              <p className="text-slate-600 text-[9px] font-black uppercase tracking-wider">Nenhum Ativo Imobilizado</p>
            </div>
          ) : (
            capexSelections.map((c) => (
              <div key={c.capexId} className="flex justify-between items-center text-xs bg-white/[0.02] border border-white/5 p-3 rounded-xl">
                <p className="font-black text-white uppercase text-[10px] truncate max-w-[180px]">{c.name}</p>
                <span className="text-orange-500 font-black font-mono text-[11px]">
                  R$ {c.cost.toLocaleString("pt-BR")}
                </span>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
}
