"use client";

import React from "react";
import { History, CheckCircle2 } from "lucide-react";

export default function RoundSummary({ history }: { history: Record<number, any> }) {
  const rounds = Object.values(history).sort((a, b) => a.roundNumber - b.roundNumber);

  return (
    <div className="bg-white/[0.02] border border-white/5 rounded-2xl p-6">
      <h2 className="text-[10px] font-black uppercase text-slate-500 tracking-[0.2em] mb-6 flex items-center gap-2">
        <History size={14} className="text-orange-500" /> Histórico de Rodadas
      </h2>
      <div className="space-y-4">
        {rounds.map((round) => (
          <div key={round.roundNumber} className="flex items-center justify-between p-3 bg-white/[0.02] rounded-xl border border-white/5">
            <div className="flex items-center gap-3">
              <CheckCircle2 size={16} className="text-emerald-500" />
              <div>
                <p className="text-xs font-black text-white uppercase">Rodada {round.roundNumber}</p>
                <p className="text-[9px] text-slate-500 uppercase">Resultado: R$ {(round.myStore.kpis.ebitda / 1000).toFixed(0)}k</p>
              </div>
            </div>
            <span className="text-[10px] font-black text-slate-400 bg-white/5 px-2 py-1 rounded">
              POS: {round.myStore.position}º
            </span>
          </div>
        ))}
      </div>
    </div>
  );
}