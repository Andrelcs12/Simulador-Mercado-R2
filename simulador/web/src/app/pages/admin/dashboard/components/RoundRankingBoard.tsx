// ======================================================
// components/AdminRoundRanking.tsx
// ======================================================

"use client";

import React from "react";
import {
  Trophy,
  Medal,
  Crown,
  TrendingUp,
  CheckCircle2,
  Activity,
  ShieldCheck,
} from "lucide-react";

import { motion, AnimatePresence } from "framer-motion";

interface RankingItem {
  storeId: string;
  name: string;
  position: number;
  finalScore: number;
  marketShare: number;
  submitted?: boolean;
  ready?: boolean;
}

interface RankingProps {
  ranking: RankingItem[];
  roundNumber: number;
}

function getPositionStyle(position: number) {
  switch (position) {
    case 1:
      return {
        bg: "from-yellow-500/20 to-orange-500/10",
        border: "border-yellow-500/20",
        text: "text-yellow-400",
        icon: Crown,
      };

    case 2:
      return {
        bg: "from-slate-400/20 to-slate-500/10",
        border: "border-slate-400/20",
        text: "text-slate-300",
        icon: Medal,
      };

    case 3:
      return {
        bg: "from-orange-700/20 to-orange-900/10",
        border: "border-orange-700/20",
        text: "text-orange-400",
        icon: Medal,
      };

    default:
      return {
        bg: "from-white/[0.03] to-white/[0.02]",
        border: "border-white/[0.06]",
        text: "text-slate-400",
        icon: Trophy,
      };
  }
}

export default function AdminRoundRanking({
  ranking,
  roundNumber,
}: RankingProps) {
  return (
    <section className="bg-[#111827] border border-white/[0.06] rounded-[2rem] overflow-hidden">

      {/* HEADER */}
      <div className="px-6 py-5 border-b border-white/[0.06]">
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">

          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-2xl bg-orange-500/10 flex items-center justify-center border border-orange-500/10">
              <Trophy className="text-orange-500" size={22} />
            </div>

            <div>
              <h2 className="font-black uppercase tracking-wide text-lg text-white">
                Ranking da Rodada {roundNumber}
              </h2>

              <p className="text-xs text-slate-500 font-semibold mt-1">
                Desempenho operacional em tempo real
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2 bg-emerald-500/10 border border-emerald-500/20 px-4 py-2 rounded-2xl w-fit">
            <TrendingUp
              size={15}
              className="text-emerald-400"
            />

            <span className="text-[11px] uppercase tracking-[0.18em] font-black text-emerald-400">
              Atualização ao vivo
            </span>
          </div>
        </div>
      </div>

      {/* BODY */}
      <div className="p-4 md:p-5">
        <AnimatePresence>
          {ranking.length === 0 ? (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="bg-white/[0.03] border border-dashed border-white/[0.08] rounded-3xl p-10 text-center"
            >
              <Trophy
                size={36}
                className="mx-auto text-slate-700 mb-4"
              />

              <h3 className="font-black text-slate-300 uppercase text-sm">
                Ranking ainda não disponível
              </h3>

              <p className="text-xs text-slate-600 mt-2">
                Os resultados aparecerão após o início da rodada
              </p>
            </motion.div>
          ) : (
            <div className="space-y-3">
              {ranking.map((team, index) => {
                const style = getPositionStyle(team.position);
                const Icon = style.icon;

                return (
                  <motion.div
                    key={team.storeId}
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: index * 0.04 }}
                    className={`relative overflow-hidden rounded-[1.7rem] border bg-gradient-to-r ${style.bg} ${style.border} p-5`}
                  >
                    <div className="flex flex-col xl:flex-row xl:items-center xl:justify-between gap-5">

                      {/* LEFT */}
                      <div className="flex items-start gap-4 min-w-0">

                        <div
                          className={`w-14 h-14 rounded-2xl flex items-center justify-center border shrink-0 ${
                            team.position === 1
                              ? "bg-yellow-500/10 border-yellow-500/20"
                              : "bg-white/[0.04] border-white/[0.06]"
                          }`}
                        >
                          <Icon
                            size={24}
                            className={style.text}
                          />
                        </div>

                        <div className="min-w-0">

                          <div className="flex items-center gap-3 flex-wrap">
                            <span
                              className={`text-xl font-black ${style.text}`}
                            >
                              #{team.position}
                            </span>

                            <h3 className="text-white font-black text-lg truncate">
                              {team.name}
                            </h3>
                          </div>

                          <div className="flex flex-wrap items-center gap-2 mt-3">

                            {team.ready && (
                              <div className="flex items-center gap-1.5 bg-sky-500/10 border border-sky-500/20 text-sky-400 px-3 py-1.5 rounded-xl">
                                <ShieldCheck size={12} />

                                <span className="text-[10px] uppercase font-black tracking-wide">
                                  Pronto
                                </span>
                              </div>
                            )}

                            {team.submitted && (
                              <div className="flex items-center gap-1.5 bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 px-3 py-1.5 rounded-xl">
                                <CheckCircle2 size={12} />

                                <span className="text-[10px] uppercase font-black tracking-wide">
                                  Enviado
                                </span>
                              </div>
                            )}
                          </div>
                        </div>
                      </div>

                      {/* RIGHT */}
                      <div className="grid grid-cols-2 gap-3 xl:min-w-[320px]">

                        <div className="bg-black/20 border border-white/[0.05] rounded-2xl p-4">
                          <div className="flex items-center gap-2 mb-2">
                            <Activity
                              size={14}
                              className="text-orange-400"
                            />

                            <span className="text-[10px] uppercase tracking-[0.18em] font-black text-slate-500">
                              Market Share
                            </span>
                          </div>

                          <div className="text-2xl font-black text-white">
                            {team.marketShare.toFixed(1)}%
                          </div>
                        </div>

                        <div className="bg-black/20 border border-white/[0.05] rounded-2xl p-4">
                          <div className="flex items-center gap-2 mb-2">
                            <TrendingUp
                              size={14}
                              className="text-emerald-400"
                            />

                            <span className="text-[10px] uppercase tracking-[0.18em] font-black text-slate-500">
                              Score Final
                            </span>
                          </div>

                          <div className="text-2xl font-black text-white">
                            {team.finalScore.toFixed(0)}
                          </div>
                        </div>
                      </div>
                    </div>
                  </motion.div>
                );
              })}
            </div>
          )}
        </AnimatePresence>
      </div>
    </section>
  );
}