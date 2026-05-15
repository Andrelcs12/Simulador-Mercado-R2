"use client";

import { User, ShieldCheck } from "lucide-react";
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
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-5 mb-6">

      {/* PLAYER */}
      <div className="bg-[#111827] border border-white/10 rounded-3xl p-6">
        <div className="flex items-center gap-4 mb-6">

          <div className="w-12 h-12 rounded-2xl bg-orange-500/10 border border-orange-500/20 flex items-center justify-center">
            <User className="text-orange-400" size={22} />
          </div>

          <div>
            <div className="text-[10px] uppercase tracking-widest text-slate-400 font-bold">
              Participante
            </div>
            <div className="text-lg font-black text-white uppercase">
              {myPlayerData?.name || "—"}
            </div>
          </div>

        </div>

        <div className="space-y-3 text-sm">

          <div className="bg-black/20 border border-white/5 rounded-2xl p-4">
            <div className="text-[10px] uppercase text-slate-500 font-bold mb-1">
              Loja
            </div>
            <div className="text-white font-bold">
              {myPlayerData?.storeName || "—"}
            </div>
          </div>

          <div className="bg-black/20 border border-white/5 rounded-2xl p-4">
            <div className="text-[10px] uppercase text-slate-500 font-bold mb-1">
              Cargo
            </div>
            <div className="text-white font-bold">
              {myPlayerData?.role || "Participante"}
            </div>
          </div>

        </div>
      </div>

      {/* FACILITATOR */}
      <div className="bg-[#111827] border border-white/10 rounded-3xl p-6">

        <div className="flex items-center gap-4 mb-6">

          <div className="w-12 h-12 rounded-2xl bg-blue-500/10 border border-blue-500/20 flex items-center justify-center">
            <ShieldCheck className="text-blue-400" size={22} />
          </div>

          <div>
            <div className="text-[10px] uppercase tracking-widest text-slate-400 font-bold">
              Facilitador
            </div>
            <div className="text-lg font-black text-white">
              {config.adminName || "—"}
            </div>
          </div>

        </div>

        <div className="bg-black/20 border border-white/5 rounded-2xl p-4">

          <div className="text-[10px] uppercase text-slate-500 font-bold mb-2">
            Status da Conexão
          </div>

          <div className="flex items-center gap-3">

            <div
              className={`w-2.5 h-2.5 rounded-full ${
                connected ? "bg-emerald-400" : "bg-red-400"
              }`}
            />

            <div className="text-sm font-bold text-white uppercase">
              {connected ? "Conectado" : "Reconectando"}
            </div>

          </div>

        </div>
      </div>

      {/* ROUND */}
      <div className="bg-[#111827] border border-white/10 rounded-3xl p-6">

        <div className="text-[10px] uppercase tracking-widest text-slate-400 font-bold mb-6">
          Informações da Rodada
        </div>

        <div className="space-y-4">

          <div className="bg-orange-500/10 border border-orange-500/20 rounded-2xl p-4">
            <div className="text-[10px] uppercase text-orange-400 font-bold mb-1">
              Rodada Atual
            </div>
            <div className="text-2xl font-black text-white">
              {roundLabel}
            </div>
          </div>

          <div className="bg-black/20 border border-white/5 rounded-2xl p-4">
            <div className="text-[10px] uppercase text-slate-500 font-bold mb-1">
              Status do Jogador
            </div>
            <div
              className={`text-sm font-black uppercase ${
                isReady ? "text-emerald-400" : "text-orange-400"
              }`}
            >
              {isReady ? "Pronto" : "Aguardando"}
            </div>
          </div>

        </div>
      </div>

    </div>
  );
};