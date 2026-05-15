"use client";

import { Hash, Timer } from "lucide-react";

interface LobbyHeaderProps {
  sessionCode: string;
  isGameStarted: boolean;
  tempoRestante: number;
  connected?: boolean;
}

function formatTime(seconds: number): string {
  const m = Math.floor(seconds / 60);
  const s = seconds % 60;
  return `${String(m).padStart(2, "0")}:${String(s).padStart(2, "0")}`;
}

export const LobbyHeader = ({
  sessionCode,
  isGameStarted,
  tempoRestante,
}: LobbyHeaderProps) => {
  return (
    <div className="grid grid-cols-1 xl:grid-cols-3 gap-5 mb-6">

      {/* SESSION CODE */}
      <div className="xl:col-span-2 bg-[#111827] border border-white/10 rounded-3xl p-8 shadow-xl">
        <div className="flex items-start justify-between">
          <div>
            <div className="text-[11px] uppercase tracking-[0.3em] text-slate-400 font-bold mb-4">
              Código da Sessão
            </div>

            <div className="text-5xl md:text-6xl font-black tracking-[0.25em] text-white">
              {sessionCode || "----"}
            </div>

            <div className="mt-4 text-sm text-slate-400">
              Compartilhe este código com os participantes
            </div>
          </div>

          <div className="hidden md:flex w-20 h-20 rounded-2xl bg-orange-500/10 border border-orange-500/20 items-center justify-center">
            <Hash className="text-orange-400" size={34} />
          </div>
        </div>
      </div>

      {/* TIMER */}
      <div className="bg-[#0B1220] border border-white/10 rounded-3xl p-8 shadow-xl flex items-center justify-between">
        <div className="flex items-center gap-4">

          <div className="w-14 h-14 rounded-2xl bg-orange-500/10 border border-orange-500/20 flex items-center justify-center">
            <Timer className="text-orange-400" size={28} />
          </div>

          <div>
            <div className="text-[10px] uppercase tracking-[0.3em] text-slate-400 font-bold mb-2">
              {isGameStarted ? "Rodada em andamento" : "Aguardando início"}
            </div>

            <div className="text-4xl md:text-5xl font-black text-white font-mono tracking-tight">
              {formatTime(tempoRestante)}
            </div>
          </div>

        </div>
      </div>

    </div>
  );
};