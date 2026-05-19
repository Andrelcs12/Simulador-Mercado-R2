"use client";

import {
  Copy,
  LogOut,
  Wifi,
  WifiOff,
  Users,
  Trophy,
  Shield,
} from "lucide-react";

import { Session } from "../types";
import toast from "react-hot-toast";

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
  currentRoundNumber,
  playersCount,
  adminName,
  onEncerrar,
}: HeaderProps) => {
  const copyCode = async () => {
    if (!session?.code) return;

    await navigator.clipboard.writeText(session.code);

    toast.success("Código copiado!");
  };

  return (
    <header className="lg:sticky lg:top-0 z-40 border-b border-white/[0.06] bg-[#080D17]/95 backdrop-blur-xl">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-5">

        <div className="flex flex-col gap-5">

          {/* TOP */}
          <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">

            {/* TITLE */}
            <div className="flex flex-wrap items-center gap-3">

              <div>
                <h1 className="text-2xl font-black text-white leading-none tracking-tight">
                  Central Mestre
                </h1>

                <p className="text-[11px] uppercase tracking-[0.3em] text-slate-500 mt-1 font-black">
                  Gestão da Dinâmica
                </p>
              </div>

              {/* STATUS */}
              <span
                className={`flex items-center gap-2 px-3 py-1.5 rounded-xl border text-[11px] uppercase font-black tracking-widest
                ${
                  connected
                    ? "text-emerald-400 border-emerald-500/20 bg-emerald-500/10"
                    : "text-red-400 border-red-500/20 bg-red-500/10"
                }`}
              >
                {connected ? (
                  <Wifi size={13} />
                ) : (
                  <WifiOff size={13} />
                )}

                {connected ? "Online" : "Offline"}
              </span>

            </div>

            {/* ACTION */}
            <button
              onClick={onEncerrar}
              className="group cursor-pointer flex items-center justify-center gap-2 px-5 py-3 rounded-2xl bg-red-500/10 hover:bg-red-500 border border-red-500/20 hover:border-transparent text-red-400 hover:text-white transition-all duration-200"
            >
              <LogOut
                size={15}
                className="group-hover:-translate-x-0.5 transition-transform"
              />

              <span className="text-[11px] uppercase font-black tracking-widest">
                Encerrar
              </span>
            </button>

          </div>

          {/* CARDS */}
          <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-3 w-full">

            {/* SALA */}
            <div className="w-full flex items-center justify-between gap-3 bg-orange-500 shadow-lg shadow-orange-500/20 px-5 py-4 rounded-2xl min-h-[96px]">

              <div className="min-w-0">
                <p className="text-[10px] uppercase tracking-widest font-black text-orange-100">
                  Código da Sala
                </p>

                <div className="text-2xl sm:text-3xl font-black text-white tracking-[0.25em] leading-none mt-1 truncate">
                  {session?.code ?? "----"}
                </div>
              </div>

              <button
                onClick={copyCode}
                title="Copiar"
                className="min-w-[42px] cursor-pointer h-[42px] rounded-xl bg-white/20 hover:bg-white/30 flex items-center justify-center transition-all"
              >
                <Copy size={16} className="text-white" />
              </button>

            </div>

            {/* RODADA */}
            <div className="w-full px-5 py-4 rounded-2xl bg-[#111827] border border-white/[0.06] min-h-[96px] flex flex-col justify-center">

              <p className="text-[10px] uppercase tracking-widest text-slate-500 font-black flex items-center gap-1.5">
                <Trophy size={11} className="text-orange-400" />
                Rodada
              </p>

              <div className="text-2xl font-black text-white mt-1">
                {currentRoundNumber}

                <span className="text-sm text-slate-500 font-bold ml-1">
                  / {session?.totalRounds ?? 3}
                </span>
              </div>

            </div>

            {/* PLAYERS */}
            <div className="w-full px-5 py-4 rounded-2xl bg-[#111827] border border-white/[0.06] min-h-[96px] flex flex-col justify-center">

              <p className="text-[10px] uppercase tracking-widest text-slate-500 font-black flex items-center gap-1.5">
                <Users size={11} className="text-sky-400" />
                Participantes
              </p>

              <div className="text-2xl font-black text-white mt-1">
                {playersCount}
              </div>

            </div>

            {/* ADMIN */}
            <div className="w-full px-5 py-4 rounded-2xl bg-[#111827] border border-white/[0.06] min-h-[96px] flex flex-col justify-center">

              <p className="text-[10px] uppercase tracking-widest text-slate-500 font-black flex items-center gap-1.5">
                <Shield size={11} className="text-violet-400" />
                Facilitador
              </p>

              <div className="text-base font-black text-white mt-1 truncate">
                {adminName}
              </div>

            </div>

          </div>

        </div>
      </div>
    </header>
  );
};