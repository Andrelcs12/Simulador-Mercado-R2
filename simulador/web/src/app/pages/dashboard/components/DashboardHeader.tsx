"use client";

import React from "react";
import { Clock } from "lucide-react";

interface Props {
  roundNumber?: number | null;
  totalRounds?: number | null;
}

export default function DashboardHeader({
  roundNumber,
  totalRounds,
}: Props) {
  const hasRound = typeof roundNumber === "number" && roundNumber > 0;

  return (
    <header className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
      {/* LEFT */}
      <div>
        <span className="bg-[#002350] text-white text-[10px] px-4 py-1 rounded-full font-black uppercase">
          {hasRound
            ? `Rodada ${roundNumber} / ${totalRounds ?? "?"}`
            : "Sessão iniciando"}
        </span>

        <h1 className="text-4xl font-black text-[#002350] uppercase italic mt-3">
          Performance <span className="text-orange-500">Analítica</span>
        </h1>
      </div>

      {/* RIGHT */}
      <div className="flex items-center gap-3 bg-white border border-slate-200 rounded-2xl px-6 py-4 shadow-sm">
        <Clock className="text-orange-500" />

        <div className="leading-tight">
          <p className="text-[10px] uppercase font-black text-gray-400">
            Status da rodada
          </p>

          <p className="text-sm font-black text-[#002350]">
            {hasRound
              ? "Rodada em andamento"
              : "Aguardando facilitador iniciar"}
          </p>
        </div>
      </div>
    </header>
  );
}