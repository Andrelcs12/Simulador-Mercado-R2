"use client";

import { Copy, LogOut, Wifi, WifiOff, Users, Trophy, Shield } from "lucide-react";
import { Session } from "../types";
import toast from "react-hot-toast";

interface HeaderProps {
  session:            Session | null;
  connected:          boolean;
  gameStarted:        boolean;
  currentRoundNumber: number;
  playersCount:       number;
  adminName:          string;
  onEncerrar:         () => void;
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
  const copyCode = async () => {
    if (!session?.code) return;
    await navigator.clipboard.writeText(session.code);
    toast.success("Código copiado!");
  };

  return (
    <header className="sticky top-0 z-40 border-b border-white/[0.06] bg-[#080D17]/95 backdrop-blur-xl">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-5">
        <div className="flex flex-col xl:flex-row xl:items-center xl:justify-between gap-5">

          {/* ── ESQUERDA ── */}
          <div className="flex flex-col gap-4">

            {/* Título + conexão */}
            <div className="flex flex-wrap items-center gap-3">
              <div>
                <h1 className="text-2xl font-black text-white leading-none tracking-tight">
                  Central Mestre
                </h1>
                <p className="text-[11px] uppercase tracking-[0.3em] text-slate-500 mt-1 font-black">
                  Gestão da Dinâmica
                </p>
              </div>

              <span className={`flex items-center gap-2 px-3 py-1.5 rounded-xl border text-[11px] uppercase font-black tracking-widest ${
                connected
                  ? "text-emerald-400 border-emerald-500/20 bg-emerald-500/10"
                  : "text-red-400 border-red-500/20 bg-red-500/10"
              }`}>
                {connected ? <Wifi size={13} /> : <WifiOff size={13} />}
                {connected ? "Online" : "Offline"}
              </span>
            </div>

            {/* Métricas */}
            <div className="flex flex-wrap gap-3">

              {/* Código da sala — destaque */}
              <div className="flex items-center gap-3 bg-orange-500 shadow-lg shadow-orange-500/20 px-5 py-3.5 rounded-2xl">
                <div>
                  <p className="text-[10px] uppercase tracking-widest font-black text-orange-100">
                    Código da Sala
                  </p>
                  <div className="text-2xl font-black text-white tracking-[0.3em] leading-none mt-0.5">
                    {session?.code ?? "----"}
                  </div>
                </div>
                <button
                  onClick={copyCode}
                  title="Copiar"
                  className="w-8 h-8 rounded-xl bg-white/20 hover:bg-white/30 flex items-center justify-center transition-all"
                >
                  <Copy size={14} className="text-white" />
                </button>
              </div>

              {/* Rodada */}
              <div className="px-5 py-3.5 rounded-2xl bg-[#111827] border border-white/[0.06]">
                <p className="text-[10px] uppercase tracking-widest text-slate-500 font-black flex items-center gap-1.5">
                  <Trophy size={11} className="text-orange-400" /> Rodada
                </p>
                <div className="text-xl font-black text-white mt-0.5">
                  {currentRoundNumber}
                  <span className="text-sm text-slate-500 font-bold ml-1">
                    / {session?.totalRounds ?? 3}
                  </span>
                </div>
              </div>

              {/* Participantes */}
              <div className="px-5 py-3.5 rounded-2xl bg-[#111827] border border-white/[0.06]">
                <p className="text-[10px] uppercase tracking-widest text-slate-500 font-black flex items-center gap-1.5">
                  <Users size={11} className="text-sky-400" /> Participantes
                </p>
                <div className="text-xl font-black text-white mt-0.5">
                  {playersCount}
                </div>
              </div>

              {/* Facilitador */}
              <div className="px-5 py-3.5 rounded-2xl bg-[#111827] border border-white/[0.06]">
                <p className="text-[10px] uppercase tracking-widest text-slate-500 font-black flex items-center gap-1.5">
                  <Shield size={11} className="text-violet-400" /> Facilitador
                </p>
                <div className="text-sm font-black text-white mt-0.5 truncate max-w-[180px]">
                  {adminName}
                </div>
              </div>
            </div>
          </div>

          {/* ── DIREITA ── */}
          <div className="flex items-center gap-3">

            {/* Status da rodada */}
            <div className={`px-5 py-3.5 rounded-2xl border ${
              gameStarted
                ? "border-orange-500/25 bg-orange-500/10"
                : "border-emerald-500/25 bg-emerald-500/10"
            }`}>
              <p className="text-[10px] uppercase tracking-widest font-black text-slate-500">
                Status
              </p>
              <div className={`flex items-center gap-2 mt-0.5 ${gameStarted ? "text-orange-400" : "text-emerald-400"}`}>
                <div className={`w-2 h-2 rounded-full ${gameStarted ? "bg-orange-400 animate-pulse" : "bg-emerald-400"}`} />
                <span className="text-sm font-black">
                  {gameStarted ? "Em andamento" : "Aguardando"}
                </span>
              </div>
            </div>

            {/* Encerrar sessão */}
            <button
              onClick={onEncerrar}
              className="group flex items-center gap-2 px-5 py-3.5 rounded-2xl bg-red-500/10 hover:bg-red-500 border border-red-500/20 hover:border-transparent text-red-400 hover:text-white transition-all duration-200"
            >
              <LogOut size={15} className="group-hover:-translate-x-0.5 transition-transform" />
              <span className="text-[11px] uppercase font-black tracking-widest">Encerrar</span>
            </button>
          </div>
        </div>
      </div>
    </header>
  );
};