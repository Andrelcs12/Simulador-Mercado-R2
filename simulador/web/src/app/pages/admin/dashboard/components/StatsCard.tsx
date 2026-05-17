"use client";

import { CircleDot, ShieldCheck, CheckCircle2 } from "lucide-react";
import { motion } from "framer-motion";
import { Session, Player } from "../types";

interface StatsCardsProps {
  session:        Session | null;
  players:        Player[];
  playersCount:   number;
  submittedCount: number;
}

export const StatsCards = ({
  session,
  players,
  playersCount,
  submittedCount,
}: StatsCardsProps) => {
  const readyCount = players.filter((p: any) => p?.ready || p?.isReady).length;

  const readyPct     = playersCount > 0 ? (readyCount     / playersCount) * 100 : 0;
  const submittedPct = playersCount > 0 ? (submittedCount / playersCount) * 100 : 0;

  const statusLabel =
    session?.status === "IN_PROGRESS" ? "Em andamento"
    : session?.status === "FINISHED"  ? "Encerrada"
    : "Aguardando";

  const statusTone =
    session?.status === "IN_PROGRESS"
      ? { text: "text-orange-400",  bg: "bg-orange-500/10",  bar: "bg-orange-400",  dot: "bg-orange-400 animate-pulse" }
      : session?.status === "FINISHED"
      ? { text: "text-red-400",     bg: "bg-red-500/10",     bar: "bg-red-400",     dot: "bg-red-400"                   }
      : { text: "text-emerald-400", bg: "bg-emerald-500/10", bar: "bg-emerald-400", dot: "bg-emerald-400"               };

  const stats = [
    {
      label:    "Status",
      value:    statusLabel,
      subtitle: "Estado atual da sessão",
      Icon:     CircleDot,
      tone:     statusTone,
      progress: null,
    },
    {
      label:    "Jogadores Prontos",
      value:    `${readyCount} / ${playersCount}`,
      subtitle: "Confirmaram participação",
      Icon:     ShieldCheck,
      tone:     { text: "text-sky-400", bg: "bg-sky-500/10", bar: "bg-sky-400", dot: "bg-sky-400" },
      progress: readyPct,
    },
    {
      label:    "Envios Concluídos",
      value:    `${submittedCount} / ${playersCount}`,
      subtitle: "Configurações enviadas",
      Icon:     CheckCircle2,
      tone:     { text: "text-violet-400", bg: "bg-violet-500/10", bar: "bg-violet-400", dot: "bg-violet-400" },
      progress: submittedPct,
    },
  ];

  return (
    <section className="grid grid-cols-1 sm:grid-cols-3 gap-4">
      {stats.map(({ label, value, subtitle, Icon, tone, progress }, i) => (
        <motion.div
          key={label}
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: i * 0.06 }}
          className="bg-[#111827] border border-white/[0.06] rounded-3xl p-7 hover:border-white/[0.12] transition-all duration-200"
        >
          {/* Cabeçalho */}
          <div className="flex items-start justify-between gap-4">
            <div className="min-w-0 flex-1">
              <p className="text-[11px] uppercase tracking-widest text-slate-500 font-black">
                {label}
              </p>
              <p className="text-[10px] text-slate-600 mt-1 font-medium">
                {subtitle}
              </p>
            </div>

            <div className={`w-12 h-12 rounded-2xl flex items-center justify-center shrink-0 ${tone.bg}`}>
              <Icon size={20} className={tone.text} />
            </div>
          </div>

          {/* Valor */}
          <div className="mt-6 flex items-end gap-3">
            <div className={`w-2.5 h-2.5 rounded-full mb-1.5 shrink-0 ${tone.dot}`} />
            <span className="text-3xl font-black text-white leading-none tabular-nums">
              {value}
            </span>
          </div>

          {/* Barra de progresso (só quando tem progresso) */}
          {progress !== null && (
            <div className="mt-5 space-y-1.5">
              <div className="h-2 rounded-full bg-white/[0.05] overflow-hidden border border-white/[0.05]">
                <motion.div
                  initial={{ width: 0 }}
                  animate={{ width: `${progress}%` }}
                  transition={{ duration: 0.5, ease: "easeOut" }}
                  className={`h-full rounded-full ${tone.bar}`}
                />
              </div>
              <p className={`text-[10px] font-black text-right ${tone.text}`}>
                {Math.round(progress)}%
              </p>
            </div>
          )}
        </motion.div>
      ))}
    </section>
  );
};