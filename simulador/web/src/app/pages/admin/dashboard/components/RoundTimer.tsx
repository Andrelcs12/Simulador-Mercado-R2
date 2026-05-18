"use client";

import { Timer, CheckCircle2, Users, ShieldCheck } from "lucide-react";
import { motion } from "framer-motion";

interface RoundTimerProps {
  gameStarted:     boolean;
  timeLeft:        number;
  progressPercent: number;
  roundNumber:     number;
  playersCount:    number;
  submittedCount:  number;
  readyCount?:     number;
}

function formatMs(ms: number): string {
  const total   = Math.ceil(ms / 1000);
  const minutes = Math.floor(total / 60);
  const seconds = total % 60;
  return `${String(minutes).padStart(2, "0")}:${String(seconds).padStart(2, "0")}`;
}

export function RoundTimer({
  gameStarted,
  timeLeft,
  progressPercent,
  roundNumber,
  playersCount,
  submittedCount,
  readyCount = 0,
}: RoundTimerProps) {
  const todosEnviaram = playersCount > 0 && submittedCount === playersCount;
  const progresso     = Math.max(0, Math.min(100, progressPercent));

  const barColor = todosEnviaram
    ? "bg-emerald-500"
    : progresso < 30
    ? "bg-red-500"
    : "bg-orange-500";

  return (
    <section className="bg-[#111827] border border-white/[0.06] rounded-3xl overflow-hidden">
      <div className="p-7 space-y-7">

        {/* ── CABEÇALHO ── */}
        <div className="flex items-center justify-between gap-4">
          <div className="flex items-center gap-4">
            <div className={`w-12 h-12 rounded-2xl flex items-center justify-center border shrink-0 ${
              gameStarted
                ? "bg-orange-500/10 border-orange-500/20"
                : "bg-white/[0.03] border-white/[0.06]"
            }`}>
              <Timer
                size={20}
                className={gameStarted ? "text-orange-500 animate-pulse" : "text-slate-600"}
              />
            </div>
            <div>
              <h2 className="text-base font-black uppercase text-white tracking-tight">
                Cronômetro — Rodada {roundNumber}
              </h2>
              <p className="text-[11px] uppercase tracking-widest text-slate-500 font-black mt-0.5">
                Monitoramento em tempo real
              </p>
            </div>
          </div>

          <span className={`px-4 py-1.5 rounded-xl text-[11px] uppercase font-black border shrink-0 ${
            gameStarted
              ? "bg-orange-500/10 border-orange-500/20 text-orange-400"
              : "bg-emerald-500/10 border-emerald-500/20 text-emerald-400"
          }`}>
            {gameStarted ? "Rodada em andamento" : "Aguardando início da rodada"}
          </span>
        </div>

        {/* ── TIMER + MINI CARDS ── */}
        <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-6">

          {/* Timer */}
          <div>
            <div className={`text-6xl md:text-8xl font-black tabular-nums leading-none tracking-tighter ${
              gameStarted
                ? timeLeft < 30 ? "text-red-400" : timeLeft < 120 ? "text-yellow-400" : "text-white"
                : "text-slate-700"
            }`}>
              {gameStarted ? formatMs(timeLeft) : "00:00"}
            </div>
            <p className="text-[11px] uppercase tracking-widest text-slate-500 font-black mt-3">
              Tempo restante
            </p>
          </div>

        
        </div>

        {/* ── BARRA DE PROGRESSO ── */}
        <div className="space-y-2">
          <div className="flex items-center justify-between">
            <span className="text-[11px] uppercase tracking-widest text-slate-500 font-black">
              Progresso da rodada
            </span>
            <span className={`text-xs font-black ${
              todosEnviaram ? "text-emerald-400" : "text-white"
            }`}>
              {todosEnviaram ? "✓ Todos enviaram" : `${Math.round(progresso)}%`}
            </span>
          </div>

          <div className="h-2.5 bg-white/[0.04] rounded-full overflow-hidden border border-white/[0.05]">
            <motion.div
              className={`h-full rounded-full ${barColor}`}
              animate={{ width: `${gameStarted ? progresso : 0}%` }}
              transition={{ duration: 0.4, ease: "easeOut" }}
            />
          </div>

          {gameStarted && (
            <p className="text-[10px] text-slate-600 font-medium">
              {submittedCount} de {playersCount} configurações enviadas
            </p>
          )}
        </div>

      </div>
    </section>
  );
}