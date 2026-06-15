"use client";

import React from "react";
import { Clock, TrendingUp, Crown, Medal, Trophy, BarChart3 } from "lucide-react";

interface Props {
  roundNumber?: number;
  totalRounds?: number;
  isLatestRound?: boolean;
  myStore?: {
    name: string;
    position: number | null;
    marketShare: number;
  };
  onViewRanking?: () => void;
  showRanking?: boolean;
}

// Estilo do bloco de posição: ouro / prata / bronze / padrão.
function getPositionStyle(position: number | null) {
  switch (position) {
    case 1:
      return { box: "border-amber-400/40 bg-amber-500/10", text: "text-amber-400", label: "1º Lugar", Icon: Crown };
    case 2:
      return { box: "border-slate-300/30 bg-slate-400/10", text: "text-slate-200", label: "2º Lugar", Icon: Medal };
    case 3:
      return { box: "border-orange-700/40 bg-orange-700/10", text: "text-orange-400", label: "3º Lugar", Icon: Medal };
    default:
      return {
        box: "border-white/10 bg-white/5",
        text: "text-slate-300",
        label: position ? `${position}º Lugar` : "—",
        Icon: Trophy,
      };
  }
}

export default function DashboardHeader({ roundNumber, totalRounds, isLatestRound = true, myStore, onViewRanking, showRanking = false }: Props) {
  const pos = getPositionStyle(myStore?.position ?? null);
  const PosIcon = pos.Icon;
  return (
    <header className="sticky top-0 z-40 border-b border-white/5 bg-[#080D17]/80 backdrop-blur-xl">
      <div className="max-w-7xl mx-auto px-6 py-6 flex flex-col lg:flex-row justify-between gap-6">
        {/* LEFT INFO */}
        <div>
          <p className="text-[10px] uppercase tracking-[0.3em] text-orange-500 font-black">
            Terminal do Operador
          </p>
          <h1 className="text-3xl font-black text-white mt-1 tracking-tight uppercase">
            {myStore?.name ?? "Loja Operacional"}
          </h1>
          <p className="text-xs text-slate-400 mt-1 font-medium">
            Monitoramento de Simulação
          </p>
        </div>

        {/* RIGHT METRICS */}
        <div className="flex flex-wrap gap-3">
          {/* POSIÇÃO (ouro / prata / bronze / padrão) */}
          <div className={`border rounded-2xl px-5 py-3 flex items-center gap-3 ${pos.box}`}>
            <PosIcon size={18} className={pos.text} />
            <div>
              <p className="text-[9px] uppercase font-black text-slate-500 tracking-wider">Posição</p>
              <p className={`text-sm font-black ${pos.text}`}>{pos.label}</p>
            </div>
          </div>

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
              <p className="text-sm font-black text-white">{(myStore?.marketShare ?? 0).toFixed(1)}%</p>
            </div>
          </div>

          <div className="bg-white/5 border border-white/10 rounded-2xl px-5 py-3 flex items-center gap-3">
            <div className="relative">
              <div className={`w-2 h-2 rounded-full ${isLatestRound ? "bg-emerald-500 animate-pulse" : "bg-amber-500"}`} />
            </div>
            <div>
              <p className="text-[9px] uppercase font-black text-slate-500 tracking-wider">Status</p>
              <p className={`text-sm font-black ${isLatestRound ? "text-emerald-500" : "text-amber-500"}`}>
                {isLatestRound ? "Live Sync" : "Histórico"}
              </p>
            </div>
          </div>

          {/* VER RANKING — apenas quando todas as rodadas terminaram */}
          {showRanking && (
            <button
              onClick={onViewRanking}
              className="rounded-2xl border border-orange-500/30 bg-orange-500/10 px-5 py-3 flex items-center gap-2 text-xs font-black uppercase tracking-wide text-orange-400 hover:bg-orange-500 hover:text-white transition cursor-pointer"
            >
              <BarChart3 size={16} />
              Ver ranking
            </button>
          )}
        </div>
      </div>
    </header>
  );
}