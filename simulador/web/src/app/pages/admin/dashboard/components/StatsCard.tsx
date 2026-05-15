"use client";

import {
  CircleDot,
  Trophy,
  Users,
  Activity,
  CheckCircle2,
  ShieldCheck,
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
  const readyCount = players.filter((p: any) => p?.isReady).length;

  const progress =
    playersCount > 0
      ? Math.round((submittedCount / playersCount) * 100)
      : 0;

  const stats = [
    {
      label: "Sessão",
      value:
        session?.status === "IN_PROGRESS"
          ? "Ativa"
          : session?.status === "FINISHED"
          ? "Encerrada"
          : "Lobby",
      icon: CircleDot,
      sub: null,
    },
    {
      label: "Rodada",
      value: session?.currentRound ?? 0,
      sub: `de ${session?.totalRounds ?? 0}`,
      icon: Trophy,
    },
    {
      label: "Jogadores",
      value: playersCount,
      sub: "online",
      icon: Users,
    },
    {
      label: "Prontos",
      value: readyCount,
      sub: playersCount ? `${Math.round((readyCount / playersCount) * 100)}%` : "0%",
      icon: ShieldCheck,
    },
    {
      label: "Envios",
      value: submittedCount,
      sub: `${progress}%`,
      icon: CheckCircle2,
    },
    {
      label: "Progresso",
      value: `${progress}%`,
      sub: progress === 100 ? "concluído" : "em andamento",
      icon: Activity,
    },
  ];

  return (
    <section className="grid grid-cols-2 xl:grid-cols-3 gap-3">
      {stats.map((stat, index) => {
        const Icon = stat.icon;

        return (
          <motion.div
            key={stat.label}
            initial={{ opacity: 0, y: 6 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: index * 0.03 }}
            className="bg-[#111827] border border-white/5 rounded-2xl p-4"
          >
            {/* TOP */}
            <div className="flex items-start justify-between">
              <div className="space-y-1">
                <div className="text-[10px] uppercase tracking-[0.2em] text-slate-500 font-black">
                  {stat.label}
                </div>

                <div className="text-xl font-black text-white leading-none">
                  {stat.value}
                </div>

                {stat.sub && (
                  <div className="text-[11px] text-slate-500">
                    {stat.sub}
                  </div>
                )}
              </div>

              <div className="w-9 h-9 rounded-xl bg-white/5 border border-white/5 flex items-center justify-center">
                <Icon size={18} className="text-slate-300" />
              </div>
            </div>

            {/* PROGRESS ONLY WHERE MEANINGFUL */}
            {(stat.label === "Prontos" || stat.label === "Envios") && (
              <div className="mt-3 h-1.5 bg-white/5 rounded-full overflow-hidden">
                <motion.div
                  initial={{ width: 0 }}
                  animate={{
                    width:
                      stat.label === "Prontos"
                        ? playersCount
                          ? `${(readyCount / playersCount) * 100}%`
                          : "0%"
                        : `${progress}%`,
                  }}
                  transition={{ duration: 0.35 }}
                  className="h-full bg-white/30 rounded-full"
                />
              </div>
            )}
          </motion.div>
        );
      })}
    </section>
  );
};