"use client";

import React from "react";
import {
  Trophy,
  Medal,
  Crown,
  TrendingUp,
  CheckCircle2,
  ShieldCheck,
  Store,
  BarChart3,
  Users,
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

  rounds?: {
    round: number;
    score: number;
    marketShare: number;
  }[];
}

interface RankingProps {
  ranking: RankingItem[];
  roundNumber: number;
}

function getPositionStyle(position: number) {
  switch (position) {
    case 1:
      return {
        border: "border-yellow-500/20",
        bg: "bg-yellow-500/10",
        text: "text-yellow-400",
        icon: Crown,
      };

    case 2:
      return {
        border: "border-slate-400/20",
        bg: "bg-slate-400/10",
        text: "text-slate-300",
        icon: Medal,
      };

    case 3:
      return {
        border: "border-orange-700/20",
        bg: "bg-orange-700/10",
        text: "text-orange-400",
        icon: Medal,
      };

    default:
      return {
        border: "border-white/[0.06]",
        bg: "bg-white/[0.03]",
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
    <section className="rounded-3xl border border-white/[0.06] bg-[#111827] overflow-hidden">

      {/* HEADER */}
      <div className="px-5 py-5 border-b border-white/[0.06] bg-[#0F172A]">

        <div className="flex items-center justify-between gap-4 flex-wrap">

          <div className="flex items-center gap-3">

            <div className="w-11 h-11 rounded-2xl bg-orange-500/10 border border-orange-500/10 flex items-center justify-center">
              <Trophy size={20} className="text-orange-400" />
            </div>

            <div>

              <h2 className="text-sm font-black uppercase tracking-[0.18em] text-white">
                Ranking Geral
              </h2>

              <p className="text-[10px] uppercase tracking-[0.22em] text-slate-500 mt-1">
                rodada {roundNumber}
              </p>

            </div>

          </div>

          <div className="flex items-center gap-2 px-3 py-1.5 rounded-xl border border-emerald-500/20 bg-emerald-500/10">

            <div className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />

            <span className="text-[10px] uppercase tracking-[0.2em] text-emerald-400 font-black">
              realtime
            </span>

          </div>

        </div>

      </div>

      {/* BODY */}
      <div className="p-4 space-y-4">

        <AnimatePresence>

          {ranking.length === 0 ? (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="rounded-3xl border border-dashed border-white/[0.06] bg-[#0B1220] p-10 text-center"
            >

              <Users
                size={34}
                className="mx-auto text-slate-700 mb-4"
              />

              <h3 className="text-sm font-black uppercase tracking-widest text-slate-300">
                aguardando participantes
              </h3>

              <p className="text-xs text-slate-600 mt-2">
                as lojas aparecerão aqui automaticamente
              </p>

            </motion.div>
          ) : (
            ranking.map((team, index) => {
              const style = getPositionStyle(team.position);
              const Icon = style.icon;

              return (
                <motion.div
                  key={team.storeId}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: index * 0.04 }}
                  className={`rounded-3xl border ${style.border} ${style.bg} overflow-hidden`}
                >

                  {/* TOP */}
                  <div className="p-5 border-b border-white/[0.05]">

                    <div className="flex flex-col xl:flex-row xl:items-center xl:justify-between gap-5">

                      {/* LEFT */}
                      <div className="flex items-start gap-4 min-w-0 flex-1">

                        <div className="w-14 h-14 rounded-2xl bg-black/20 border border-white/[0.05] flex items-center justify-center shrink-0">
                          <Icon size={22} className={style.text} />
                        </div>

                        <div className="min-w-0 flex-1">

                          <div className="flex items-center gap-3 flex-wrap">

                            <span className={`text-2xl font-black ${style.text}`}>
                              #{team.position}
                            </span>

                            <h3 className="text-lg font-black text-white truncate">
                              {team.name}
                            </h3>

                          </div>

                          <div className="flex flex-wrap gap-2 mt-4">

                            <span
                              className={`px-3 py-1 rounded-xl text-[10px] uppercase tracking-[0.18em] font-black border flex items-center gap-1 ${
                                team.ready
                                  ? "bg-sky-500/10 border-sky-500/20 text-sky-400"
                                  : "bg-white/[0.03] border-white/[0.05] text-slate-500"
                              }`}
                            >
                              <ShieldCheck size={12} />
                              {team.ready ? "pronto" : "aguardando"}
                            </span>

                            <span
                              className={`px-3 py-1 rounded-xl text-[10px] uppercase tracking-[0.18em] font-black border flex items-center gap-1 ${
                                team.submitted
                                  ? "bg-emerald-500/10 border-emerald-500/20 text-emerald-400"
                                  : "bg-yellow-500/10 border-yellow-500/20 text-yellow-400"
                              }`}
                            >
                              <CheckCircle2 size={12} />
                              {team.submitted ? "enviado" : "pendente"}
                            </span>

                          </div>

                        </div>

                      </div>

                      {/* RIGHT */}
                      <div className="grid grid-cols-2 gap-3 w-full xl:w-auto xl:min-w-[320px]">

                        <div className="rounded-2xl border border-white/[0.05] bg-[#0B1220] p-4">

                          <div className="flex items-center gap-2 mb-3">

                            <BarChart3
                              size={14}
                              className="text-orange-400"
                            />

                            <span className="text-[10px] uppercase tracking-[0.18em] text-slate-500 font-black">
                              Market Share
                            </span>

                          </div>

                          <div className="text-3xl font-black text-white tabular-nums">
                            {team.marketShare.toFixed(1)}%
                          </div>

                        </div>

                        <div className="rounded-2xl border border-white/[0.05] bg-[#0B1220] p-4">

                          <div className="flex items-center gap-2 mb-3">

                            <TrendingUp
                              size={14}
                              className="text-emerald-400"
                            />

                            <span className="text-[10px] uppercase tracking-[0.18em] text-slate-500 font-black">
                              Score Final
                            </span>

                          </div>

                          <div className="text-3xl font-black text-white tabular-nums">
                            {team.finalScore.toFixed(0)}
                          </div>

                        </div>

                      </div>

                    </div>

                  </div>

                  {/* TABLE */}
                  <div className="p-5 overflow-x-auto">

                    <table className="w-full min-w-[640px]">

                      <thead>

                        <tr className="border-b border-white/[0.05]">

                          <th className="text-left py-3 text-[10px] uppercase tracking-[0.18em] text-slate-500 font-black">
                            Rodada
                          </th>

                          <th className="text-left py-3 text-[10px] uppercase tracking-[0.18em] text-slate-500 font-black">
                            Score
                          </th>

                          <th className="text-left py-3 text-[10px] uppercase tracking-[0.18em] text-slate-500 font-black">
                            Market Share
                          </th>

                          <th className="text-left py-3 text-[10px] uppercase tracking-[0.18em] text-slate-500 font-black">
                            Status
                          </th>

                        </tr>

                      </thead>

                      <tbody>

                        {[1, 2, 3, 4].map((round) => {
                          const data = team.rounds?.find(
                            (r) => r.round === round
                          );

                          const hasData =
                            (data?.score ?? 0) > 0 ||
                            (data?.marketShare ?? 0) > 0;

                          return (
                            <tr
                              key={round}
                              className="border-b border-white/[0.03]"
                            >

                              <td className="py-4">

                                <div className="flex items-center gap-3">

                                  <div className="w-9 h-9 rounded-xl bg-orange-500/10 border border-orange-500/10 flex items-center justify-center">

                                    <span className="text-xs font-black text-orange-400">
                                      {round}
                                    </span>

                                  </div>

                                  <span className="text-sm font-bold text-white">
                                    Rodada {round}
                                  </span>

                                </div>

                              </td>

                              <td className="py-4 text-white font-black text-lg tabular-nums">
                                {data?.score?.toFixed(0) ?? "0"}
                              </td>

                              <td className="py-4 text-white font-black text-lg tabular-nums">
                                {data?.marketShare?.toFixed(1) ?? "0.0"}%
                              </td>

                              <td className="py-4">

                                {hasData ? (
                                  <span className="px-3 py-1 rounded-xl bg-emerald-500/10 border border-emerald-500/20 text-[10px] uppercase tracking-[0.18em] font-black text-emerald-400">
                                    concluída
                                  </span>
                                ) : (
                                  <span className="px-3 py-1 rounded-xl bg-white/[0.03] border border-white/[0.05] text-[10px] uppercase tracking-[0.18em] font-black text-slate-500">
                                    aguardando
                                  </span>
                                )}

                              </td>

                            </tr>
                          );
                        })}

                      </tbody>

                    </table>

                  </div>

                </motion.div>
              );
            })
          )}

        </AnimatePresence>

      </div>

    </section>
  );
}