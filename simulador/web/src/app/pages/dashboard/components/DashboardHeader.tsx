"use client";

import React from "react";
import { Trophy, Activity, Store, TrendingUp, Clock } from "lucide-react";

interface Props {
  roundNumber?: number;
  totalRounds?: number;
  myStore?: {
    name: string;
    position: number | null;
    marketShare: number;
  };
}

export default function DashboardHeader({ roundNumber, totalRounds, myStore }: Props) {
  return (
    <header className="sticky top-0 z-40 border-b border-white/5 bg-[#080D17]/80 backdrop-blur-xl">
      <div className="max-w-7xl mx-auto px-6 py-6 flex flex-col lg:flex-row justify-between gap-6">
        {/* LEFT INFO */}
        <div>
          <p className="text-[10px] uppercase tracking-[0.3em] text-orange-500 font-black">
            Terminal do Operador
          </p>
          <h1 className="text-3xl font-black text-white mt-1 tracking-tight">
            {myStore?.name ?? "Loja Operacional"}
          </h1>
          <p className="text-xs text-slate-400 mt-1 font-medium">
            Monitoramento em Tempo Real • Posição: {myStore?.position ?? "-"}º Lugar
          </p>
        </div>

        {/* RIGHT METRICS */}
        <div className="flex flex-wrap gap-3">
          <div className="bg-white/5 border border-white/10 rounded-2xl px-5 py-3 flex items-center gap-3">
            <Clock size={16} className="text-orange-500" />
            <div>
              <p className="text-[9px] uppercase font-black text-slate-500 tracking-wider">Rodada</p>
              <p className="text-sm font-black text-white">{roundNumber ?? 0} / {totalRounds ?? 3}</p>
            </div>
          </div>

          <div className="bg-white/5 border border-white/10 rounded-2xl px-5 py-3 flex items-center gap-3">
            <TrendingUp size={16} className="text-sky-400" />
            <div>
              <p className="text-[9px] uppercase font-black text-slate-500 tracking-wider">Market Share</p>
              <p className="text-sm font-black text-white">{((myStore?.marketShare ?? 0) * 100).toFixed(1)}%</p>
            </div>
          </div>

          <div className="bg-white/5 border border-white/10 rounded-2xl px-5 py-3 flex items-center gap-3">
            <div className="relative">
              <div className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
            </div>
            <div>
              <p className="text-[9px] uppercase font-black text-slate-500 tracking-wider">Status</p>
              <p className="text-sm font-black text-emerald-500">Live Sync</p>
            </div>
          </div>
        </div>
      </div>
    </header>
  );
}