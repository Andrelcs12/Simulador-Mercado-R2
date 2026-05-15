import {
  Hash,
  Wifi,
  WifiOff,
  Timer,
  LogOut,
  Shield,
  Copy,
} from "lucide-react";

import { Session } from "../types";

interface HeaderProps {
  session: Session | null;
  connected: boolean;
  gameStarted: boolean;
  currentRoundNumber: number;
  playersCount: number;
  adminName: string;
  onEncerrar: () => void;
}

export const Header = ({
  session,
  connected,
  gameStarted,
  currentRoundNumber,
  playersCount,
  adminName,
  onEncerrar,
}: HeaderProps) => {
  const copyCode = () => {
    if (session?.code) {
      navigator.clipboard.writeText(session.code);
    }
  };

  return (
    <header className="sticky top-0 z-40 w-full border-b border-white/[0.06] bg-[#080D17]/90 backdrop-blur-2xl">
      <div className="max-w-7xl mx-auto px-4 md:px-6 lg:px-8 py-4 flex flex-col xl:flex-row items-start xl:items-center justify-between gap-4">

        {/* LEFT */}
        <div className="flex flex-col gap-3 w-full">

          {/* TITLE + STATUS */}
          <div className="flex flex-wrap items-center gap-3">
            <div>
              <h1 className="font-black uppercase tracking-tight text-xl md:text-2xl text-white leading-none">
                Central Mestre
              </h1>

              <p className="text-[10px] uppercase tracking-[0.28em] text-slate-500 font-black mt-1">
                Painel operacional da simulação
              </p>
            </div>

            <div
              className={`flex items-center gap-2 px-3 py-1 rounded-full border text-[10px] font-black uppercase tracking-wider ${
                connected
                  ? "bg-emerald-500/10 border-emerald-500/20 text-emerald-400"
                  : "bg-red-500/10 border-red-500/20 text-red-400"
              }`}
            >
              {connected ? <Wifi size={12} /> : <WifiOff size={12} />}
              {connected ? "Online" : "Offline"}
            </div>
          </div>

          {/* ROOM CODE (HIGHLIGHTED) */}
          <div className="flex items-stretch gap-3">

            <div className="flex items-center gap-3 px-4 py-3 rounded-2xl bg-orange-500/10 border border-orange-500/20">

              <Hash size={14} className="text-orange-400" />

              <div className="leading-tight">
                <div className="text-[10px] uppercase tracking-[0.25em] text-orange-300 font-black">
                  Código da sessão
                </div>

                <div className="text-2xl md:text-3xl font-black tracking-[0.35em] text-white">
                  {session?.code || "----"}
                </div>
              </div>

            </div>

            <button
              onClick={copyCode}
              className="px-4 rounded-2xl bg-white/[0.03] border border-white/[0.06] hover:bg-white/[0.06] transition flex items-center gap-2"
            >
              <Copy size={14} className="text-slate-400" />
              <span className="text-[10px] uppercase font-black text-slate-400">
                copiar
              </span>
            </button>

          </div>

          {/* COMPACT INFO ROW */}
          <div className="flex flex-wrap gap-2">

            {/* STATUS RODADA */}
            <div className="flex items-center gap-2 px-3 py-2 rounded-2xl bg-white/[0.03] border border-white/[0.06]">
              <div
                className={`w-2 h-2 rounded-full ${
                  gameStarted ? "bg-orange-500 animate-pulse" : "bg-emerald-400"
                }`}
              />
              <span className="text-[10px] uppercase text-slate-400 font-black">
                {gameStarted ? `Rodada ${currentRoundNumber}` : "Lobby"}
              </span>
            </div>

            {/* PLAYERS */}
            <div className="flex items-center gap-2 px-3 py-2 rounded-2xl bg-white/[0.03] border border-white/[0.06]">
              <span className="text-[10px] uppercase text-slate-400 font-black">
                {playersCount} jogadores
              </span>
            </div>

            {/* ADMIN */}
            <div className="flex items-center gap-2 px-3 py-2 rounded-2xl bg-white/[0.03] border border-white/[0.06]">
              <Shield size={12} className="text-orange-400" />
              <span className="text-[10px] uppercase text-slate-400 font-black truncate max-w-[140px]">
                {adminName}
              </span>
            </div>

          </div>
        </div>

        {/* RIGHT */}
        <div className="flex items-center gap-3 w-full xl:w-auto">

          {/* ROUND */}
          <div className="hidden md:flex items-center gap-3 px-4 py-3 rounded-2xl bg-white/[0.03] border border-white/[0.06]">
            <Timer size={16} className="text-orange-400" />

            <div className="leading-tight">
              <div className="text-[10px] uppercase text-slate-500 font-black">
                Rodada atual
              </div>
              <div className="text-xl font-black text-white">
                {currentRoundNumber}
              </div>
            </div>
          </div>

          {/* END BUTTON */}
          <button
            onClick={onEncerrar}
            className="flex items-center gap-2 px-4 py-3 rounded-2xl bg-red-500/10 border border-red-500/20 text-red-400 hover:bg-red-500 hover:text-white transition-all font-black uppercase text-[11px]"
          >
            <LogOut size={14} />
            Encerrar sessão
          </button>

        </div>
      </div>
    </header>
  );
};