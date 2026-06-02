"use client";

import React from "react";
import { Clock, Hash } from "lucide-react";

interface LobbyHeaderProps {
  sessionCode: string;
  isGameStarted: boolean;
  tempoRestante: number;
  connected: boolean;
}

export const LobbyHeader = ({
  sessionCode,
  isGameStarted,
  tempoRestante,
  connected,
}: LobbyHeaderProps) => {
  
  // Formata o tempo restante no formato MM:SS
  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, "0")}:${secs.toString().padStart(2, "0")}`;
  };

  return (
    <header className="grid grid-cols-1 lg:grid-cols-3 gap-6">
      
      {/* CARD DO CÓDIGO DA SESSÃO - Borda alterada de laranja para cinza */}
      <div className="lg:col-span-2 bg-[#0d121f] border border-slate-800/60 rounded-3xl p-6 relative overflow-hidden">
        <div className="relative z-10 flex flex-col h-full justify-between min-h-[140px]">
          <div>
            <div className="flex items-center gap-2 text-slate-500 font-black text-[10px] uppercase tracking-[0.25em]">
              <span className="w-1.5 h-1.5 rounded-full bg-orange-500 animate-pulse" />
              Sessão Ativa
            </div>
            <h1 className="text-white font-black text-xs uppercase tracking-[0.2em] mt-3 mb-6">
              Código da Sessão
            </h1>
          </div>

          <div className="flex items-end justify-between">
            <div className="text-2xl sm:text-3xl font-black text-white tracking-[0.3em] font-mono select-all">
              {sessionCode || "————"}
            </div>
            <p className="text-[11px] text-slate-500 font-medium hidden sm:block">
              Compartilhe este código com os participantes
            </p>
          </div>
        </div>

        {/* Ícone decorativo ao fundo */}
        <div className="absolute right-6 top-6 w-12 h-12 rounded-2xl bg-white/[0.02] border border-white/[0.05] flex items-center justify-center">
          <Hash className="text-slate-600" size={20} />
        </div>
      </div>

      {/* CARD DO CRONÔMETRO DE STATUS - Borda alterada de laranja para cinza */}
      <div className="bg-[#0d121f] border border-slate-800/60 rounded-3xl p-6 flex flex-col justify-between min-h-[160px]">
        
        <div className="flex items-start gap-4">
          <div className="w-10 h-10 rounded-xl bg-white/[0.02] border border-white/[0.05] flex items-center justify-center shrink-0">
            <Clock className="text-slate-400" size={18} />
          </div>
          <div>
            <p className="text-[10px] uppercase tracking-[0.25em] text-slate-500 font-black">
              Status
            </p>
            <p className="text-xs font-bold text-orange-400 mt-0.5">
              {isGameStarted ? "Em andamento" : "Aguardando início"}
            </p>
          </div>
        </div>

        <div className="mt-4">
          <div className="text-4xl font-black text-white tracking-wider font-mono tabular-nums leading-none">
            {formatTime(tempoRestante)}
          </div>
          <div className="flex items-center gap-1.5 mt-2.5">
            <span className={`w-1.5 h-1.5 rounded-full ${isGameStarted ? "bg-emerald-500 animate-pulse" : "bg-orange-500"}`} />
            <span className="text-[9px] uppercase tracking-widest text-slate-500 font-black">
              {isGameStarted ? "Cronômetro Ativo" : "Pausado"}
            </span>
          </div>
        </div>

      </div>

    </header>
  );
};