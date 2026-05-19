"use client";

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

  return `${String(minutes).padStart(2, "0")}:${String(
    seconds
  ).padStart(2, "0")}`;
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
  const todosEnviaram =
    playersCount > 0 &&
    submittedCount === playersCount;

  const progresso = Math.max(
    0,
    Math.min(100, progressPercent)
  );

  const timerColor = !gameStarted
    ? "text-slate-700"
    : timeLeft <= 30
    ? "text-red-400"
    : timeLeft <= 120
    ? "text-yellow-400"
    : "text-white";

  const barColor = todosEnviaram
    ? "bg-emerald-500"
    : progresso < 30
    ? "bg-red-500"
    : "bg-orange-500";

  const stats = [
    {
      label: "Prontos",
      value: `${readyCount}/${playersCount}`,
      Icon: ShieldCheck,
      tone: {
        bg: "bg-sky-500/10",
        border: "border-sky-500/10",
        text: "text-sky-400",
      },
    },
    {
      label: "Envios",
      value: `${submittedCount}/${playersCount}`,
      Icon: CheckCircle2,
      tone: {
        bg: "bg-emerald-500/10",
        border: "border-emerald-500/10",
        text: "text-emerald-400",
      },
    },
    {
      label: "Players",
      value: `${playersCount}`,
      Icon: Users,
      tone: {
        bg: "bg-violet-500/10",
        border: "border-violet-500/10",
        text: "text-violet-400",
      },
    },
  ];

  return (
    <section className="rounded-3xl border border-white/[0.06] bg-[#111827] overflow-hidden">

      <div className="p-5 lg:p-6 space-y-6">

        {/* HEADER */}
        <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-5">

          <div className="flex items-center gap-4 min-w-0">

            <div
              className={`w-12 h-12 rounded-2xl flex items-center justify-center border shrink-0 ${
                gameStarted
                  ? "bg-orange-500/10 border-orange-500/20"
                  : "bg-white/[0.03] border-white/[0.06]"
              }`}
            >
              <Timer
                size={20}
                className={
                  gameStarted
                    ? "text-orange-400 animate-pulse"
                    : "text-slate-600"
                }
              />
            </div>

            <div className="min-w-0">

              <h2 className="text-lg font-black text-white leading-none">
                Rodada {roundNumber}
              </h2>

              <p className="text-[10px] uppercase tracking-[0.25em] text-slate-500 font-black mt-2">
                cronômetro operacional
              </p>

            </div>

          </div>

          <div
            className={`px-4 py-2 rounded-2xl border text-[10px] uppercase tracking-[0.2em] font-black flex items-center justify-center ${
              gameStarted
                ? "bg-orange-500/10 border-orange-500/20 text-orange-400"
                : "bg-emerald-500/10 border-emerald-500/20 text-emerald-400"
            }`}
          >
            {gameStarted
              ? "rodada em andamento"
              : "aguardando rodada"}
          </div>

        </div>

        {/* TIMER */}
<div className="rounded-3xl border border-white/[0.05] bg-[#0B1220] p-6 lg:p-7">

  <div className="flex flex-col items-center justify-center text-center">

    <p className="text-[10px] uppercase tracking-[0.25em] text-slate-500 font-black mb-4">
      Tempo restante
    </p>

    <div
      className={`text-5xl sm:text-6xl lg:text-7xl font-black tracking-[-0.06em] leading-none tabular-nums ${timerColor}`}
    >
      {gameStarted
        ? formatMs(timeLeft)
        : "00:00"}
    </div>

  </div>

</div>

        {/* PROGRESS */}
        <div>

          <div className="flex items-center justify-between gap-3 mb-3">

            <span className="text-[10px] uppercase tracking-[0.25em] text-slate-500 font-black">
              progresso da rodada
            </span>

            <span
              className={`text-[11px] font-black ${
                todosEnviaram
                  ? "text-emerald-400"
                  : "text-white"
              }`}
            >
              {todosEnviaram
                ? "✓ todos enviaram"
                : `${Math.round(progresso)}%`}
            </span>

          </div>

          <div className="h-2.5 rounded-full overflow-hidden bg-white/[0.04] border border-white/[0.05]">

            <motion.div
              className={`h-full rounded-full ${barColor}`}
              animate={{
                width: `${
                  gameStarted ? progresso : 0
                }%`,
              }}
              transition={{
                duration: 0.35,
                ease: "easeOut",
              }}
            />

          </div>

          

        </div>

      </div>

    </section>
  );
}