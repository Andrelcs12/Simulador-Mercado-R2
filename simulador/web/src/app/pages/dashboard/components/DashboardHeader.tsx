"use client";

import React from "react";
import { Clock, Users, Trophy } from "lucide-react";

interface Props {
  roundNumber?: number;
  totalRounds?: number;
  sessionId?: string;
  myStore?: {
    name: string;
    position: number | null;
    marketShare: number;
  };
}

export default function DashboardHeader({
  roundNumber,
  totalRounds,
  myStore,
}: Props) {
  const hasRound = !!roundNumber;

  return (
    <header className="sticky top-0 z-40 border-b border-white/5 bg-[#080D17]/80 backdrop-blur-xl">
      <div className="max-w-7xl mx-auto px-4 lg:px-8 py-5 flex flex-col lg:flex-row justify-between gap-6">

        {/* LEFT */}
        <div>
          <p className="text-[10px] uppercase tracking-[0.3em] text-orange-400 font-black">
            Dashboard Operacional
          </p>

          <h1 className="text-2xl lg:text-3xl font-black">
            Performance <span className="text-orange-500">Analytics</span>
          </h1>

          <p className="text-xs text-slate-400 mt-1">
            {myStore?.name ?? "Minha Loja"} • Posição #{myStore?.position ?? "-"}
          </p>
        </div>

        {/* RIGHT */}
        <div className="flex flex-wrap gap-3">

          <div className="bg-[#111827] border border-white/5 rounded-2xl px-4 py-3">
            <p className="text-[10px] text-slate-400 uppercase">Rodada</p>
            <div className="flex items-center gap-2 text-white font-black">
              <Trophy size={14} className="text-orange-400" />
              {hasRound ? `${roundNumber} / ${totalRounds}` : "-"}
            </div>
          </div>

          <div className="bg-[#111827] border border-white/5 rounded-2xl px-4 py-3">
            <p className="text-[10px] text-slate-400 uppercase">Market Share</p>
            <div className="text-white font-black">
              {myStore?.marketShare?.toFixed(1) ?? 0}%
            </div>
          </div>

          <div className="bg-[#111827] border border-white/5 rounded-2xl px-4 py-3">
            <p className="text-[10px] text-slate-400 uppercase">Status</p>
            <div className="flex items-center gap-2 text-emerald-400 font-black">
              <div className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
              Ativo
            </div>
          </div>

        </div>
      </div>
    </header>
  );
}