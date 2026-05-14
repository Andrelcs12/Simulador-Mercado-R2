import { Hash, Wifi, WifiOff, Timer, LogOut } from "lucide-react";
import { Session } from "../types";

interface HeaderProps {
  session: Session | null;
  connected: boolean;
  gameStarted: boolean;
  currentRoundNumber: number;
  playersCount: number;
  onEncerrar: () => void;
}

export const Header = ({
  session,
  connected,
  gameStarted,
  currentRoundNumber,
  playersCount,
  onEncerrar,
}: HeaderProps) => {
  return (
    <header className="sticky top-0 z-40 w-full border-b border-white/[0.06] bg-[#080D17]/90 backdrop-blur-xl">
      <div className="max-w-7xl mx-auto px-4 md:px-6 lg:px-8 py-4 flex flex-col lg:flex-row items-start lg:items-center justify-between gap-4">

        {/* ── LEFT ── */}
        <div className="flex flex-col gap-3 w-full lg:w-auto">

          {/* Título + Status */}
          <div className="flex flex-wrap items-center gap-3">
            <div>
              <h1 className="font-black italic uppercase tracking-tight text-xl md:text-2xl text-white leading-none">
                Central Mestre
              </h1>
              <p className="text-[10px] md:text-[11px] uppercase tracking-[0.28em] text-slate-500 font-black mt-1">
                Painel de Controle da Simulação
              </p>
            </div>

            <div
              className={`flex items-center gap-2 px-3 py-1.5 rounded-full border text-[11px] font-black uppercase tracking-wider ${
                connected
                  ? "bg-emerald-500/10 border-emerald-500/20 text-emerald-400"
                  : "bg-red-500/10 border-red-500/20 text-red-400"
              }`}
            >
              {connected ? (
                <Wifi className="animate-pulse" size={13} />
              ) : (
                <WifiOff size={13} />
              )}
              {connected ? "Conectado" : "Desconectado"}
            </div>
          </div>

          {/* Código da Sala + Status da Sessão */}
          <div className="flex flex-wrap items-center gap-3">

            {/* Código */}
            <div className="bg-orange-500 rounded-2xl px-5 py-3 shadow-xl border-b-4 border-orange-700">
              <div className="flex items-center gap-2 mb-1">
                <Hash size={14} className="text-orange-100" />
                <span className="text-[10px] uppercase tracking-[0.25em] text-orange-100 font-black">
                  Código da Sala
                </span>
              </div>
              <div className="text-2xl md:text-3xl font-black tracking-[0.35em] text-white leading-none">
                {session?.code || "----"}
              </div>
            </div>

            {/* Info da sessão */}
            <div className="flex flex-col justify-center bg-white/[0.03] border border-white/[0.06] rounded-2xl px-4 py-3 min-h-[76px]">
              <span className="text-[10px] uppercase tracking-[0.22em] text-slate-500 font-black mb-1">
                Status da Sessão
              </span>
              <div className="flex items-center gap-2">
                <div
                  className={`w-2.5 h-2.5 rounded-full ${
                    gameStarted ? "bg-orange-500 animate-pulse" : "bg-emerald-400"
                  }`}
                />
                <span className="font-black uppercase text-sm text-white">
                  {gameStarted
                    ? `Rodada ${currentRoundNumber} em andamento`
                    : "Lobby — aguardando início"}
                </span>
              </div>
              <span className="text-xs text-slate-500 mt-1">
                {playersCount} participante(s) conectado(s)
              </span>
            </div>
          </div>
        </div>

        {/* ── RIGHT ── */}
        <div className="flex items-center gap-3 w-full lg:w-auto">

          {/* Rodada atual */}
          <div className="hidden md:flex items-center gap-3 bg-[#121826] border border-white/[0.06] rounded-2xl px-5 py-3">
            <div className="w-11 h-11 rounded-xl bg-orange-500/10 flex items-center justify-center">
              <Timer className="text-orange-500" size={20} />
            </div>
            <div>
              <div className="text-[10px] uppercase tracking-[0.22em] text-slate-500 font-black">
                Rodada Atual
              </div>
              <div className="text-lg font-black text-white">
                {currentRoundNumber}
              </div>
            </div>
          </div>

          {/* Encerrar */}
          <button
            onClick={onEncerrar}
            className="group flex items-center justify-center gap-2 bg-red-500/10 hover:bg-red-500 text-red-400 hover:text-white border border-red-500/20 hover:border-red-500 px-4 md:px-5 py-3 rounded-2xl transition-all duration-200 font-black uppercase text-xs md:text-sm shadow-lg w-full lg:w-auto"
          >
            <LogOut size={16} className="group-hover:-translate-x-0.5 transition-transform" />
            <span>Encerrar Sessão</span>
          </button>
        </div>
      </div>
    </header>
  );
};