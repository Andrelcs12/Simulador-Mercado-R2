"use client";

import { Users, CheckCircle2, Wifi, WifiOff } from "lucide-react";
import { motion } from "framer-motion";
import { Player } from "../types";

interface StatsMetricsProps {
  players: Player[];
  connected: boolean;
}

export const StatsMetrics = ({ players, connected }: StatsMetricsProps) => {
  const readyCount = players.filter((p) => p.isReady).length;

  const progress =
    players.length > 0
      ? Math.round((readyCount / players.length) * 100)
      : 0;

  return (
    <section className="grid grid-cols-1 md:grid-cols-3 gap-5">

      {/* PLAYERS */}
      <div className="bg-[#111827] border border-white/[0.06] rounded-3xl p-6">

        <div className="flex items-center gap-4">

          <div className="w-12 h-12 rounded-2xl bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center">
            <Users className="text-emerald-400" size={20} />
          </div>

          <div>
            <p className="text-[10px] uppercase tracking-[0.25em] text-slate-500 font-black">
              Jogadores
            </p>

            <p className="text-2xl font-black text-white mt-1 tabular-nums">
              {players.length}
            </p>
          </div>

        </div>

      </div>

      {/* READY */}
      <div className="bg-[#111827] border border-white/[0.06] rounded-3xl p-6">

        <div className="flex items-center gap-4">

          <div className="w-12 h-12 rounded-2xl bg-orange-500/10 border border-orange-500/20 flex items-center justify-center">
            <CheckCircle2 className="text-orange-400" size={20} />
          </div>

          <div>
            <p className="text-[10px] uppercase tracking-[0.25em] text-slate-500 font-black">
              Confirmados
            </p>

            <p className="text-2xl font-black text-white mt-1 tabular-nums">
              {readyCount}
            </p>
          </div>

        </div>

        <div className="mt-5 h-2 bg-white/[0.04] rounded-full overflow-hidden border border-white/[0.06]">
          <motion.div
            className="h-full bg-orange-500 rounded-full"
            initial={{ width: 0 }}
            animate={{ width: `${progress}%` }}
            transition={{ duration: 0.4 }}
          />
        </div>

        <p className="mt-2 text-[11px] text-slate-500 font-black uppercase tracking-[0.2em]">
          {readyCount} / {players.length}
        </p>

      </div>

      {/* CONNECTION */}
      <div className="bg-[#111827] border border-white/[0.06] rounded-3xl p-6">

        <div className="flex items-center gap-4">

          <div
            className={`w-12 h-12 rounded-2xl flex items-center justify-center border ${
              connected
                ? "bg-emerald-500/10 border-emerald-500/20"
                : "bg-red-500/10 border-red-500/20"
            }`}
          >
            {connected ? (
              <Wifi className="text-emerald-400" size={20} />
            ) : (
              <WifiOff className="text-red-400" size={20} />
            )}
          </div>

          <div>
            <p className="text-[10px] uppercase tracking-[0.25em] text-slate-500 font-black">
              Conexão
            </p>

            <p
              className={`text-lg font-black mt-1 uppercase ${
                connected ? "text-emerald-400" : "text-red-400"
              }`}
            >
              {connected ? "Online" : "Offline"}
            </p>
          </div>

        </div>

      </div>

    </section>
  );
};