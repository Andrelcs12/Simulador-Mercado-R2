// ======================================================
// components/RoundTimer.tsx
// ======================================================

"use client";

import React from "react";

import {
  Timer,
  CheckCircle2,
  Users,
  ShieldCheck,
} from "lucide-react";

import { motion } from "framer-motion";

interface RoundTimerProps {
  gameStarted: boolean;
  timeLeft: number;
  progressPercent: number;
  roundNumber: number;
  playersCount: number;
  submittedCount: number;
  readyCount?: number;
}

function formatMs(ms: number): string {
  const total = Math.ceil(ms / 1000);

  const minutes = Math.floor(total / 60);
  const seconds = total % 60;

  return `${String(minutes).padStart(2, "0")}:${String(seconds).padStart(
    2,
    "0"
  )}`;
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
  const allSubmitted =
    playersCount > 0 && submittedCount === playersCount;

  return (
    <section className="relative overflow-hidden bg-[#111827] border border-white/[0.06] rounded-2xl">

      {/* subtle glow */}
      <div className="absolute inset-0 bg-gradient-to-br from-orange-500/[0.02] via-transparent to-transparent pointer-events-none" />

      <div className="relative p-5 md:p-6">

        {/* HEADER */}
        <div className="flex items-center justify-between gap-4 mb-6">

          <div className="flex items-center gap-3">

            <div
              className={`w-10 h-10 rounded-xl flex items-center justify-center border ${
                gameStarted
                  ? "bg-orange-500/10 border-orange-500/20"
                  : "bg-white/[0.03] border-white/[0.06]"
              }`}
            >
              <Timer
                size={18}
                className={
                  gameStarted
                    ? "text-orange-500"
                    : "text-slate-500"
                }
              />
            </div>

            <div>
              <h2 className="font-black uppercase text-white tracking-wide text-sm">
                Rodada {roundNumber}
              </h2>

              <p className="text-[11px] text-slate-500 font-medium">
                Monitoramento em tempo real
              </p>
            </div>
          </div>

          <div
            className={`px-3 py-1.5 rounded-xl border text-[10px] uppercase font-black tracking-wide ${
              gameStarted
                ? "bg-orange-500/10 border-orange-500/20 text-orange-400"
                : "bg-emerald-500/10 border-emerald-500/20 text-emerald-400"
            }`}
          >
            {gameStarted ? "Em andamento" : "Lobby"}
          </div>
        </div>

        {/* MAIN CONTENT */}
        <div className="flex flex-col lg:flex-row lg:items-end justify-between gap-6">

          {/* TIMER */}
          <div>
            <div
              className={`text-5xl md:text-6xl font-black tabular-nums leading-none ${
                gameStarted ? "text-white" : "text-slate-700"
              }`}
            >
              {gameStarted ? formatMs(timeLeft) : "00:00"}
            </div>

            <p className="text-xs text-slate-500 mt-2">
              Tempo restante da rodada
            </p>
          </div>

          {/* KPIs */}
          <div className="grid grid-cols-3 gap-2 w-full lg:w-auto">

            <div className="bg-white/[0.03] border border-white/[0.05] rounded-xl px-3 py-3 min-w-[110px]">
              <div className="flex items-center gap-2 mb-1">
                <Users size={12} className="text-sky-400" />
                <span className="text-[10px] uppercase text-slate-500 font-black">
                  Players
                </span>
              </div>
              <div className="text-xl font-black text-white">
                {playersCount}
              </div>
            </div>

            <div className="bg-white/[0.03] border border-white/[0.05] rounded-xl px-3 py-3 min-w-[110px]">
              <div className="flex items-center gap-2 mb-1">
                <ShieldCheck size={12} className="text-sky-400" />
                <span className="text-[10px] uppercase text-slate-500 font-black">
                  Ready
                </span>
              </div>
              <div className="text-xl font-black text-white">
                {readyCount}
              </div>
            </div>

            <div className="bg-white/[0.03] border border-white/[0.05] rounded-xl px-3 py-3 min-w-[110px]">
              <div className="flex items-center gap-2 mb-1">
                <CheckCircle2 size={12} className="text-emerald-400" />
                <span className="text-[10px] uppercase text-slate-500 font-black">
                  Sent
                </span>
              </div>
              <div className="text-xl font-black text-white">
                {submittedCount}
              </div>
            </div>

          </div>
        </div>

        {/* PROGRESS */}
        <div className="mt-5">

          <div className="flex items-center justify-between mb-2">
            <span className="text-[10px] uppercase text-slate-500 font-black">
              Progresso
            </span>

            <span className="text-xs font-black text-white">
              {Math.round(Math.max(0, Math.min(100, progressPercent)))}%
            </span>
          </div>

          <div className="h-2.5 bg-white/[0.04] rounded-full overflow-hidden border border-white/[0.04]">
            <motion.div
              className={`h-full rounded-full ${
                allSubmitted ? "bg-emerald-500" : "bg-orange-500"
              }`}
              animate={{
                width: `${gameStarted ? progressPercent : 0}%`,
              }}
              transition={{ duration: 0.4, ease: "linear" }}
            />
          </div>
        </div>

        {/* FOOTER */}
        {gameStarted && (
          <div className="mt-4 flex items-center justify-between text-[11px] text-slate-500">

            <span>
              {submittedCount}/{playersCount} enviados
            </span>

            {allSubmitted && (
              <span className="text-emerald-400 font-black uppercase tracking-wide">
                Completo
              </span>
            )}

          </div>
        )}

      </div>
    </section>
  );
}