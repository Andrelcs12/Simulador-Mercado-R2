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
    <div className="grid grid-cols-1 xl:grid-cols-3 gap-5">

      {/* SESSION CODE */}
      <div className="xl:col-span-2 bg-[#111827] border border-white/[0.06] rounded-3xl p-6 sm:p-8 relative overflow-hidden">

        {/* subtle glow */}
        <div className="absolute inset-0 opacity-[0.04] pointer-events-none">
          <div className="w-full h-full bg-gradient-to-br from-orange-500/20 via-transparent to-transparent" />
        </div>

        <div className="relative flex items-start justify-between gap-6">

          <div className="min-w-0">

            <div className="flex items-center gap-2 mb-4">
              <span className="w-2 h-2 rounded-full bg-orange-400 animate-pulse" />
              <p className="text-[10px] uppercase tracking-[0.3em] text-slate-500 font-black">
                Sessão ativa
              </p>
            </div>

            <p className="text-[11px] uppercase tracking-[0.25em] text-slate-500 font-black">
              Código da Sessão
            </p>

            <div className="mt-3 text-4xl sm:text-5xl font-black tracking-[0.2em] text-white break-all">
              {sessionCode || "----"}
            </div>

            <p className="mt-3 text-sm text-slate-500">
              Compartilhe este código com os participantes
            </p>

          </div>

          <div className="hidden sm:flex w-14 h-14 rounded-2xl bg-orange-500/10 border border-orange-500/20 items-center justify-center shrink-0">
            <Hash className="text-orange-400" size={22} />
          </div>

        </div>
      </div>

      {/* TIMER */}
      <div className="bg-[#111827] border border-white/[0.06] rounded-3xl p-6 sm:p-8 flex flex-col justify-between">

        <div className="flex items-center justify-between">

          <div className="flex items-center gap-4">

            <div className="w-12 h-12 rounded-2xl bg-orange-500/10 border border-orange-500/20 flex items-center justify-center">
              <Timer className="text-orange-400" size={20} />
            </div>

            <div className="min-w-0">

              <p className="text-[10px] uppercase tracking-[0.25em] text-slate-500 font-black">
                Status
              </p>

              <p className="text-sm font-bold text-slate-300 mt-1">
                {isGameStarted ? "Rodada em andamento" : "Aguardando início"}
              </p>

            </div>

          </div>

        </div>

        <div className="mt-6">

          <div className="text-4xl sm:text-5xl font-black text-white font-mono tracking-tight tabular-nums">
            {formatTime(tempoRestante)}
          </div>

          <div className="mt-3 flex items-center gap-2 text-[11px] uppercase tracking-[0.2em] font-black text-slate-500">

            <span
              className={`w-2 h-2 rounded-full ${
                isGameStarted
                  ? "bg-orange-400 animate-pulse"
                  : "bg-slate-600"
              }`}
            />

            {isGameStarted ? "Sincronizado em tempo real" : "Pausado"}

          </div>

        </div>

      </div>
    </div>
  );
};