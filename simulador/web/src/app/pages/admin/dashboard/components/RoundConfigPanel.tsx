"use client";

import {
  Settings,
  ChevronUp,
  ChevronDown,
  Clock3,
  TimerReset,
  Layers3,
  Sparkles,
} from "lucide-react";

import { motion, AnimatePresence } from "framer-motion";
import { RoundConfig } from "../types";

const DURATION_PRESETS = [5, 10, 15, 20, 30, 45, 60];
const INTERVAL_PRESETS = [0, 2, 5, 10, 15];

const clamp = (v: number, min: number, max: number) =>
  Math.min(max, Math.max(min, v));

interface RoundConfigPanelProps {
  config: RoundConfig;
  gameStarted: boolean;
  showConfig: boolean;
  canGoNext: boolean;
  onToggle: () => void;
  onConfigChange: (patch: Partial<RoundConfig>) => void;
  onIniciar: () => void;
  onParar: () => void;
  onProxima: () => void;
}

export const RoundConfigPanel = ({
  config,
  gameStarted,
  showConfig,
  canGoNext,
  onToggle,
  onConfigChange,
  onIniciar,
  onParar,
  onProxima,
}: RoundConfigPanelProps) => {
  return (
    <section className="bg-[#111827] border border-white/[0.06] rounded-[2rem] overflow-hidden shadow-2xl">

      {/* HEADER */}
      <button
        onClick={onToggle}
        className="w-full px-5 py-5 flex items-center justify-between hover:bg-white/[0.02]"
      >
        <div className="flex items-center gap-3">
          <Settings size={18} className="text-orange-400" />

          <div className="text-left">
            <h2 className="text-sm font-black uppercase text-white">
              Configuração da Rodada
            </h2>
            <p className="text-[10px] text-slate-500 uppercase tracking-[0.2em]">
              controle operacional
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          {gameStarted && (
            <div className="flex items-center gap-1 text-[10px] text-orange-400 font-black uppercase">
              <Sparkles size={12} />
              ativa
            </div>
          )}

          {showConfig ? (
            <ChevronUp size={16} className="text-slate-400" />
          ) : (
            <ChevronDown size={16} className="text-slate-400" />
          )}
        </div>
      </button>

      <AnimatePresence>
        {showConfig && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: "auto", opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            className="overflow-hidden"
          >
            <div className="border-t border-white/[0.06] p-5 space-y-6">

              {/* GRID */}
              <div className="grid grid-cols-1 xl:grid-cols-3 gap-4">

                {/* DURAÇÃO */}
                <div className="bg-[#0B1220] border border-white/[0.05] rounded-2xl p-4">

                  <div className="flex items-center gap-2 mb-3">
                    <Clock3 size={16} className="text-orange-400" />
                    <span className="text-sm font-black uppercase text-white">
                      duração
                    </span>
                  </div>

                  <div className="grid grid-cols-3 gap-2">
                    {DURATION_PRESETS.map((m) => {
                      const active = config.durationMinutes === m;

                      return (
                        <button
                          key={m}
                          disabled={gameStarted}
                          onClick={() =>
                            onConfigChange({
                              durationMinutes: m,
                              durationSeconds: 0,
                            })
                          }
                          className={`py-2 rounded-xl text-xs font-black border transition ${
                            active
                              ? "bg-orange-500 text-white border-orange-400"
                              : "bg-white/[0.03] text-slate-300 border-white/[0.05]"
                          }`}
                        >
                          {m}m
                        </button>
                      );
                    })}
                  </div>
                </div>

                {/* INTERVALO */}
                <div className="bg-[#0B1220] border border-white/[0.05] rounded-2xl p-4">

                  <div className="flex items-center gap-2 mb-3">
                    <TimerReset size={16} className="text-sky-400" />
                    <span className="text-sm font-black uppercase text-white">
                      intervalo
                    </span>
                  </div>

                  <div className="grid grid-cols-5 gap-2">
                    {INTERVAL_PRESETS.map((m) => {
                      const active = config.intervalMinutes === m;

                      return (
                        <button
                          key={m}
                          disabled={gameStarted}
                          onClick={() =>
                            onConfigChange({ intervalMinutes: m })
                          }
                          className={`py-2 rounded-xl text-xs font-black border transition ${
                            active
                              ? "bg-sky-500 text-white border-sky-400"
                              : "bg-white/[0.03] text-slate-300 border-white/[0.05]"
                          }`}
                        >
                          {m}
                        </button>
                      );
                    })}
                  </div>
                </div>

                {/* RODADA */}
                <div className="bg-[#0B1220] border border-white/[0.05] rounded-2xl p-4">

                  <div className="flex items-center gap-2 mb-3">
                    <Layers3 size={16} className="text-emerald-400" />
                    <span className="text-sm font-black uppercase text-white">
                      rodada
                    </span>
                  </div>

                  <div className="grid grid-cols-5 gap-2">
                    {[1, 2, 3, 4, 5].map((r) => {
                      const active = config.roundNumber === r;
                      const disabled = gameStarted || active;

                      return (
                        <button
                          key={r}
                          disabled={disabled}
                          onClick={() =>
                            onConfigChange({ roundNumber: r })
                          }
                          className={`py-2 rounded-xl text-xs font-black border transition ${
                            active
                              ? "bg-emerald-500 text-white border-emerald-400"
                              : "bg-white/[0.03] text-slate-300 border-white/[0.05]"
                          }`}
                        >
                          {r}
                        </button>
                      );
                    })}
                  </div>

                  <div className="mt-3 text-[10px] text-slate-500 uppercase tracking-[0.2em]">
                    rodada atual: #{config.roundNumber}
                  </div>
                </div>

              </div>

              {/* ACTIONS */}
              <div className="flex gap-2">

                <button
                  disabled={gameStarted}
                  onClick={onIniciar}
                  className="bg-orange-500 px-4 py-2 rounded-xl text-xs font-black uppercase"
                >
                  iniciar
                </button>

                {gameStarted && (
                  <button
                    onClick={onParar}
                    className="bg-yellow-500 text-black px-4 py-2 rounded-xl text-xs font-black uppercase"
                  >
                    encerrar
                  </button>
                )}

                {!gameStarted && canGoNext && (
                  <button
                    onClick={onProxima}
                    className="bg-sky-500/10 border border-sky-500/20 px-4 py-2 rounded-xl text-xs font-black uppercase text-sky-400"
                  >
                    próxima
                  </button>
                )}

              </div>

            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </section>
  );
};