"use client";

import {
  CircleDot,
  ShieldCheck,
  CheckCircle2,
} from "lucide-react";

import { motion } from "framer-motion";

import { Session, Player } from "../types";

interface StatsCardsProps {
  session: Session | null;
  players: Player[];
  playersCount: number;
  submittedCount: number;
}

export const StatsCards = ({
  session,
  players,
  playersCount,
  submittedCount,
}: StatsCardsProps) => {
  const readyCount = players.filter(
    (p: any) => p?.ready || p?.isReady
  ).length;

  const readyPct =
    playersCount > 0
      ? (readyCount / playersCount) * 100
      : 0;

  const submittedPct =
    playersCount > 0
      ? (submittedCount / playersCount) * 100
      : 0;

  const statusLabel =
    session?.status === "IN_PROGRESS"
      ? "Em andamento"
      : session?.status === "FINISHED"
      ? "Encerrada"
      : "Aguardando";

  const statusTone =
    session?.status === "IN_PROGRESS"
      ? {
          text: "text-orange-400",
          bg: "bg-orange-500/10",
          bar: "bg-orange-400",
          dot: "bg-orange-400 animate-pulse",
        }
      : session?.status === "FINISHED"
      ? {
          text: "text-red-400",
          bg: "bg-red-500/10",
          bar: "bg-red-400",
          dot: "bg-red-400",
        }
      : {
          text: "text-emerald-400",
          bg: "bg-emerald-500/10",
          bar: "bg-emerald-400",
          dot: "bg-emerald-400",
        };

  const stats = [
    {
      label: "Status",
      value: statusLabel,
      subtitle: "Estado da sessão",
      Icon: CircleDot,
      tone: statusTone,
      progress: null,
    },

    {
      label: "Prontos",
      value: `${readyCount}/${playersCount}`,
      subtitle: "Jogadores confirmados",
      Icon: ShieldCheck,
      tone: {
        text: "text-sky-400",
        bg: "bg-sky-500/10",
        bar: "bg-sky-400",
        dot: "bg-sky-400",
      },
      progress: readyPct,
    },

    {
      label: "Envios",
      value: `${submittedCount}/${playersCount}`,
      subtitle: "Configurações enviadas",
      Icon: CheckCircle2,
      tone: {
        text: "text-violet-400",
        bg: "bg-violet-500/10",
        bar: "bg-violet-400",
        dot: "bg-violet-400",
      },
      progress: submittedPct,
    },
  ];

  return (
    <section className="grid grid-cols-1 md:grid-cols-3 gap-4 w-full">

      {stats.map(
        (
          {
            label,
            value,
            subtitle,
            Icon,
            tone,
            progress,
          },
          i
        ) => (
          <motion.div
            key={label}
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.05 }}
            className="rounded-3xl border border-white/[0.06] bg-[#111827] p-5 hover:border-white/[0.10] transition-all duration-200"
          >

            {/* TOP */}
            <div className="flex items-start justify-between gap-4">

              <div className="min-w-0 flex-1">

                <p className="text-[10px] uppercase tracking-[0.22em] text-slate-500 font-black">
                  {label}
                </p>

                <h3 className="mt-3 text-2xl lg:text-3xl font-black text-white leading-none truncate">
                  {value}
                </h3>

                <p className="mt-2 text-xs text-slate-500">
                  {subtitle}
                </p>

              </div>

              <div
                className={`w-12 h-12 rounded-2xl flex items-center justify-center shrink-0 ${tone.bg}`}
              >
                <Icon
                  size={18}
                  className={tone.text}
                />
              </div>

            </div>

            {/* STATUS */}
            <div className="mt-5 flex items-center gap-2">

              <div
                className={`w-2 h-2 rounded-full ${tone.dot}`}
              />

              <span
                className={`text-[10px] uppercase tracking-widest font-black ${tone.text}`}
              >
                ativo
              </span>

            </div>

            {/* PROGRESS */}
            {progress !== null && (
              <div className="mt-4">

                <div className="flex items-center justify-between mb-2">

                  <span className="text-[10px] uppercase tracking-widest text-slate-500 font-black">
                    progresso
                  </span>

                  <span
                    className={`text-[10px] font-black ${tone.text}`}
                  >
                    {Math.round(progress)}%
                  </span>

                </div>

                <div className="h-2 rounded-full overflow-hidden bg-white/[0.05]">
                  <motion.div
                    initial={{ width: 0 }}
                    animate={{ width: `${progress}%` }}
                    transition={{
                      duration: 0.45,
                      ease: "easeOut",
                    }}
                    className={`h-full rounded-full ${tone.bar}`}
                  />
                </div>

              </div>
            )}

          </motion.div>
        )
      )}

    </section>
  );
};