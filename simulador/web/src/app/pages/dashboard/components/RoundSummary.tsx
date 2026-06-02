"use client";

import React from "react";
import { History, CheckCircle2 } from "lucide-react";
import { DashboardResponse } from "../types";

interface RoundSummaryProps {
  history: Record<number, DashboardResponse>;
  activeRound: number;
  onSelectRound: (roundNumber: number) => void;
}

export default function RoundSummary({ history, activeRound, onSelectRound }: RoundSummaryProps) {
  const rounds = Object.values(history).sort((a, b) => a.roundNumber - b.roundNumber);

  if (rounds.length === 0) return null;

  return (
    <div className="bg-white/[0.02] border border-white/5 rounded-2xl p-4">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 mb-4">
        <h2 className="text-[10px] font-black uppercase text-slate-500 tracking-[0.2em] flex items-center gap-2">
          <History size={14} className="text-orange-500" /> Linha do Tempo da Operação
        </h2>
      </div>

      <div className="flex gap-3 overflow-x-auto pb-2 scrollbar-thin scrollbar-thumb-white/10">
        {rounds.map((round) => {
          const isSelected = activeRound === round.roundNumber;
          const ebitda = round.myStore?.kpis?.ebitda ?? 0;

          return (
            <button
              key={round.roundNumber}
              onClick={() => onSelectRound(round.roundNumber)}
              className={`flex-shrink-0 min-w-[140px] p-3 rounded-xl border transition-all duration-200 text-left ${
                isSelected
                  ? "bg-orange-500/10 border-orange-500 text-white"
                  : "bg-white/[0.02] border-white/5 hover:border-white/20 text-slate-400"
              }`}
            >
              <div className="flex items-center justify-between mb-1">
                <span className="text-[10px] font-black uppercase tracking-wider">Rodada {round.roundNumber}</span>
                <CheckCircle2 size={12} className={isSelected ? "text-orange-500" : "text-slate-700"} />
              </div>
              <p className={`text-sm font-black font-mono ${isSelected ? "text-white" : "text-slate-300"}`}>
                R$ {(ebitda / 1000).toFixed(1)}k
              </p>
              <span className="text-[9px] text-slate-500 font-bold uppercase tracking-wide">EBITDA</span>
            </button>
          );
        })}
      </div>
    </div>
  );
}