"use client";

import {
  Settings, ChevronUp, ChevronDown,
  Clock3, Play, Square, SkipForward, Layers3,
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { RoundConfig } from "../types";

const DURATION_PRESETS = [5, 10, 15, 20, 25, 30, 45, 60, 90];

interface RoundConfigPanelProps {
  config:        RoundConfig;
  gameStarted:   boolean;
  showConfig:    boolean;
  canGoNext:     boolean;
  currentRound?: number;
  totalRounds?:  number;
  onToggle:      () => void;
  onConfigChange:(patch: Partial<RoundConfig>) => void;
  onIniciar:     () => void;
  onParar:       () => void;
  onProxima:     () => void;
}

export const RoundConfigPanel = ({
  config,
  gameStarted,
  showConfig,
  canGoNext,
  currentRound = 1,
  totalRounds  = 3,
  onToggle,
  onConfigChange,
  onIniciar,
  onParar,
  onProxima,
}: RoundConfigPanelProps) => (
  <section className="bg-[#111827] border border-white/[0.06] rounded-3xl overflow-hidden">

    {/* ── TOGGLE HEADER ── */}
    <button
      onClick={onToggle}
      className="w-full px-7 py-5 flex items-center justify-between hover:bg-white/[0.02] transition-colors"
    >
      <div className="flex items-center gap-4">
        <div className="w-10 h-10 rounded-xl bg-orange-500/10 border border-orange-500/20 flex items-center justify-center shrink-0">
          <Settings size={17} className="text-orange-400" />
        </div>
        <div className="text-left">
          <h2 className="text-sm font-black uppercase text-white tracking-tight leading-none">
            Configuração da Rodada
          </h2>
          <p className="text-[11px] uppercase tracking-widest text-slate-500 font-black mt-1">
            Controle da simulação
          </p>
        </div>
      </div>

      {showConfig
        ? <ChevronUp  size={18} className="text-slate-500 shrink-0" />
        : <ChevronDown size={18} className="text-slate-500 shrink-0" />
      }
    </button>

    {/* ── CONTEÚDO ── */}
    <AnimatePresence initial={false}>
      {showConfig && (
        <motion.div
          initial={{ height: 0, opacity: 0 }}
          animate={{ height: "auto", opacity: 1 }}
          exit={{ height: 0, opacity: 0 }}
          transition={{ duration: 0.22 }}
          className="overflow-hidden"
        >
          <div className="border-t border-white/[0.06] p-7 space-y-6">

            {/* Info: rodada atual + duração selecionada */}
            <div className="grid grid-cols-2 gap-4">
              <div className="bg-[#0B1220] border border-white/[0.05] rounded-2xl p-5">
                <div className="flex items-center gap-2 text-slate-500 mb-3">
                  <Layers3 size={14} />
                  <span className="text-[10px] uppercase tracking-widest font-black">
                    Rodada
                  </span>
                </div>
                <div className="text-3xl font-black text-white tabular-nums leading-none">
                  {currentRound}
                  <span className="text-slate-500 text-lg font-bold ml-1.5">
                    / {totalRounds}
                  </span>
                </div>
              </div>

              <div className="bg-[#0B1220] border border-white/[0.05] rounded-2xl p-5">
                <div className="flex items-center gap-2 text-slate-500 mb-3">
                  <Clock3 size={14} />
                  <span className="text-[10px] uppercase tracking-widest font-black">
                    Duração
                  </span>
                </div>
                <div className="text-3xl font-black text-white tabular-nums leading-none">
                  {config.durationMinutes}
                  <span className="text-slate-500 text-lg font-bold ml-1.5">
                    min
                  </span>
                </div>
              </div>
            </div>

            {/* Presets de duração */}
            <div className="bg-[#0B1220] border border-white/[0.05] rounded-2xl p-5">
              <p className="text-[11px] uppercase tracking-widest text-slate-500 font-black mb-4">
                Tempo da Rodada
              </p>
              <div className="grid grid-cols-3 sm:grid-cols-5 md:grid-cols-9 gap-2">
                {DURATION_PRESETS.map((minutes) => {
                  const active = config.durationMinutes === minutes;
                  return (
                    <button
                      key={minutes}
                      disabled={gameStarted}
                      onClick={() => onConfigChange({ durationMinutes: minutes, durationSeconds: 0 })}
                      className={`h-11 cursor-pointer rounded-xl text-xs font-black uppercase border transition-all ${
                        active
                          ? "bg-orange-500 border-orange-400 text-white shadow-lg shadow-orange-500/20"
                          : "bg-white/[0.03] border-white/[0.06] text-slate-400 hover:bg-white/[0.07] hover:text-white"
                      } ${gameStarted ? "opacity-40 cursor-not-allowed" : ""}`}
                    >
                      {minutes}m
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Botões de ação */}
            <div className="flex flex-wrap gap-3">

              {!gameStarted && (
                <button
                  onClick={onIniciar}
                  className="flex items-center gap-2 px-6 py-3 rounded-2xl bg-orange-500 hover:bg-orange-400 transition-all text-sm font-black uppercase shadow-lg shadow-orange-500/20"
                >
                  <Play size={16} />
                  Iniciar Rodada
                </button>
              )}

              {gameStarted && (
                <button
                  onClick={onParar}
                  className="flex items-center gap-2 px-6 py-3 rounded-2xl bg-red-500/10 hover:bg-red-500 border border-red-500/20 hover:border-transparent text-red-400 hover:text-white transition-all text-sm font-black uppercase"
                >
                  <Square size={16} />
                  Encerrar Rodada
                </button>
              )}

              {!gameStarted && canGoNext && (
                <button
                  onClick={onProxima}
                  className="flex items-center gap-2 px-6 py-3 rounded-2xl bg-sky-500/10 hover:bg-sky-500/20 border border-sky-500/20 text-sky-400 transition-all text-sm font-black uppercase"
                >
                  <SkipForward size={16} />
                  Próxima Rodada
                </button>
              )}

            </div>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  </section>
);