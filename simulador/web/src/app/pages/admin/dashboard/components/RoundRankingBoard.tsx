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
    <section className="bg-[#111827] border border-white/[0.06] rounded-2xl overflow-hidden">

      {/* HEADER */}
      <div className="px-4 sm:px-6 py-4 border-b border-white/[0.06]">

        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">

          <div className="flex items-center gap-3">

            <div className="w-10 h-10 sm:w-12 sm:h-12 rounded-xl bg-orange-500/10 flex items-center justify-center border border-orange-500/10">
              <Trophy className="text-orange-500" size={20} />
            </div>

            <div>
              <h2 className="text-sm sm:text-base font-black uppercase text-white">
                Ranking da Rodada {roundNumber}
              </h2>

              <p className="text-[10px] sm:text-xs text-slate-500 mt-1">
                desempenho em tempo real
              </p>
            </div>

          </div>

          <div className="flex items-center gap-2 bg-emerald-500/10 border border-emerald-500/20 px-3 py-2 rounded-xl w-fit">

            <TrendingUp size={14} className="text-emerald-400" />

            <span className="text-[10px] uppercase tracking-widest font-black text-emerald-400">
              ao vivo
            </span>

          </div>

        </div>
      </div>

      {/* BODY */}
      <div className="p-3 sm:p-5">

        <AnimatePresence>

          {ranking.length === 0 ? (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="bg-white/[0.03] border border-dashed border-white/[0.08] rounded-2xl p-8 text-center"
            >
              <Trophy size={34} className="mx-auto text-slate-700 mb-3" />

              <h3 className="text-sm font-black uppercase text-slate-300">
                Ranking ainda não disponível
              </h3>

              <p className="text-xs text-slate-600 mt-2">
                Aguarde o início da rodada
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
                    initial={{ opacity: 0, y: 8 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: index * 0.03 }}
                    className={`rounded-2xl border bg-gradient-to-r ${style.bg} ${style.border} p-4 sm:p-5`}
                  >

                    <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">

                      {/* LEFT */}
                      <div className="flex items-start gap-3 min-w-0">

                        <div className="w-11 h-11 sm:w-12 sm:h-12 rounded-xl flex items-center justify-center border bg-black/10 border-white/[0.06] shrink-0">
                          <Icon size={20} className={style.text} />
                        </div>

                        <div className="min-w-0">

                          <div className="flex items-center gap-2 flex-wrap">

                            <span className={`text-lg font-black ${style.text}`}>
                              #{team.position}
                            </span>

                            <h3 className="text-white font-black text-sm sm:text-base truncate">
                              {team.name}
                            </h3>

                          </div>

                          <div className="flex flex-wrap gap-2 mt-2">

                            {team.ready && (
                              <span className="flex items-center gap-1 px-2 py-1 rounded-lg text-[10px] uppercase font-black bg-sky-500/10 border border-sky-500/20 text-sky-400">
                                <ShieldCheck size={12} />
                                pronto
                              </span>
                            )}

                            {team.submitted && (
                              <span className="flex items-center gap-1 px-2 py-1 rounded-lg text-[10px] uppercase font-black bg-emerald-500/10 border border-emerald-500/20 text-emerald-400">
                                <CheckCircle2 size={12} />
                                enviado
                              </span>
                            )}

                          </div>

                        </div>

                      </div>

                      {/* RIGHT */}
                      <div className="grid grid-cols-2 gap-2 sm:gap-3 lg:min-w-[260px]">

                        <div className="bg-black/20 border border-white/[0.05] rounded-xl p-3 sm:p-4">
                          <div className="flex items-center gap-2 mb-2">
                            <Activity size={14} className="text-orange-400" />
                            <span className="text-[10px] uppercase text-slate-500 font-black">
                              Market
                            </span>
                          </div>

                          <div className="text-xl sm:text-2xl font-black text-white">
                            {team.marketShare.toFixed(1)}%
                          </div>
                        </div>

                        <div className="bg-black/20 border border-white/[0.05] rounded-xl p-3 sm:p-4">
                          <div className="flex items-center gap-2 mb-2">
                            <TrendingUp size={14} className="text-emerald-400" />
                            <span className="text-[10px] uppercase text-slate-500 font-black">
                              Score
                            </span>
                          </div>

                          <div className="text-xl sm:text-2xl font-black text-white">
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