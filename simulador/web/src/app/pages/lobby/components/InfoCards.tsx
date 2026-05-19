"use client";

import { User, ShieldCheck, Store, Briefcase } from "lucide-react";
import { GameConfig, Player } from "../types";

interface InfoCardsProps {
  myPlayerData: Player | null;
  config: GameConfig;
  connected: boolean;
  roundLabel: string;
  isReady: boolean;
}

export const InfoCards = ({
  myPlayerData,
  config,
  connected,
  roundLabel,
  isReady,
}: InfoCardsProps) => {
  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">

      {/* PLAYER */}
      <div className="bg-[#111827] border border-white/[0.06] rounded-3xl p-6">

        <div className="flex items-center gap-4 mb-6">

          <div className="w-12 h-12 rounded-2xl bg-orange-500/10 border border-orange-500/20 flex items-center justify-center">
            <User className="text-orange-400" size={20} />
          </div>

          <div className="min-w-0">
            <p className="text-[10px] uppercase tracking-[0.25em] text-slate-500 font-black">
              Participante
            </p>
            <p className="text-base font-black text-white truncate">
              {myPlayerData?.name || "—"}
            </p>
          </div>

        </div>

        <div className="space-y-3">

          <div className="bg-black/20 border border-white/[0.05] rounded-2xl p-4">
            <p className="text-[10px] uppercase text-slate-500 font-black mb-1">
              Loja
            </p>
            <p className="text-white font-bold truncate">
              {myPlayerData?.name || "—"}
            </p>
          </div>

          <div className="bg-black/20 border border-white/[0.05] rounded-2xl p-4">
            <p className="text-[10px] uppercase text-slate-500 font-black mb-1">
              Cargo
            </p>
            <p className="text-white font-bold">
              {myPlayerData?.role || "Participante"}
            </p>
          </div>

        </div>

      </div>

      {/* FACILITATOR */}
      <div className="bg-[#111827] border border-white/[0.06] rounded-3xl p-6">

        <div className="flex items-center gap-4 mb-6">

          <div className="w-12 h-12 rounded-2xl bg-sky-500/10 border border-sky-500/20 flex items-center justify-center">
            <ShieldCheck className="text-sky-400" size={20} />
          </div>

          <div className="min-w-0">
            <p className="text-[10px] uppercase tracking-[0.25em] text-slate-500 font-black">
              Facilitador
            </p>
            <p className="text-base font-black text-white truncate">
              {config.adminName || "—"}
            </p>
          </div>

        </div>

        <div className="bg-black/20 border border-white/[0.05] rounded-2xl p-4 flex items-center justify-between">

          <p className="text-[10px] uppercase text-slate-500 font-black">
            Conexão
          </p>

          <div className="flex items-center gap-2">

            <span
              className={`w-2 h-2 rounded-full ${
                connected ? "bg-emerald-400" : "bg-red-400"
              }`}
            />

            <span className="text-sm font-black text-white">
              {connected ? "Online" : "Offline"}
            </span>

          </div>

        </div>

      </div>

      {/* ROUND */}
      <div className="bg-[#111827] border border-white/[0.06] rounded-3xl p-6">

        <p className="text-[10px] uppercase tracking-[0.25em] text-slate-500 font-black mb-6">
          Rodada
        </p>

        <div className="space-y-3">

          <div className="bg-orange-500/10 border border-orange-500/20 rounded-2xl p-4">
            <p className="text-[10px] uppercase text-orange-400 font-black mb-1">
              Atual
            </p>
            <p className="text-xl font-black text-white">
              {roundLabel}
            </p>
          </div>

          <div className="bg-black/20 border border-white/[0.05] rounded-2xl p-4 flex items-center justify-between">

            <p className="text-[10px] uppercase text-slate-500 font-black">
              Status
            </p>

            <span
              className={`text-xs font-black uppercase ${
                isReady ? "text-emerald-400" : "text-orange-400"
              }`}
            >
              {isReady ? "Pronto" : "Aguardando"}
            </span>

          </div>

        </div>

      </div>

    </div>
  );
};