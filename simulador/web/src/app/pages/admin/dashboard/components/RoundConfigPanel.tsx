"use client";

import { AnimatePresence, motion } from "framer-motion";
import {
  ChevronDown,
  ChevronUp,
  Clock3,
  Layers3,
  Play,
  Settings,
  SkipForward,
  Square,
} from "lucide-react";

import type {
  RoundConfig,
  RoundConfigCategoryLimitKey,
} from "../types";

const DURATION_PRESETS = [
  5, 10, 15, 20, 25, 30, 45, 60, 90,
];

const CATEGORY_LIMIT_FIELDS: Array<{
  label: string;
  key: RoundConfigCategoryLimitKey;
}> = [
  { label: "Perecíveis", key: "maxPereciveis" },
  { label: "Mercearia", key: "maxMercearia" },
  { label: "Eletro", key: "maxEletro" },
  { label: "Hipel", key: "maxHipel" },
];

interface RoundConfigPanelProps {
  config: RoundConfig;
  gameStarted: boolean;
  showConfig: boolean;
  canGoNext: boolean;
  currentRound?: number;
  totalRounds?: number;
  onToggle: () => void;
  onConfigChange: (
    patch: Partial<RoundConfig>
  ) => void;
  onIniciar: () => void;
  onParar: () => void;
  onProxima: () => void;
}

export const RoundConfigPanel = ({
  config,
  gameStarted,
  showConfig,
  canGoNext,
  currentRound = 1,
  totalRounds = 3,
  onToggle,
  onConfigChange,
  onIniciar,
  onParar,
  onProxima,
}: RoundConfigPanelProps) => {
  return (
    <section className="w-full rounded-3xl border border-white/[0.06] bg-[#111827] overflow-hidden">

      {/* HEADER */}
      <button
        type="button"
        onClick={onToggle}
        className="w-full px-5 py-4 flex items-center justify-between hover:bg-white/[0.02] transition-colors"
      >
        <div className="flex items-center gap-3 min-w-0">

          <div className="w-11 h-11 rounded-2xl bg-orange-500/10 border border-orange-500/20 flex items-center justify-center shrink-0">
            <Settings
              size={18}
              className="text-orange-400"
            />
          </div>

          <div className="text-left min-w-0">

            <h2 className="text-sm font-black text-white uppercase tracking-tight">
              Configuração da Rodada
            </h2>

            <p className="text-[10px] uppercase tracking-[0.22em] text-slate-500 font-black mt-1">
              Controle operacional
            </p>

          </div>

        </div>

        {showConfig ? (
          <ChevronUp
            size={18}
            className="text-slate-500 shrink-0"
          />
        ) : (
          <ChevronDown
            size={18}
            className="text-slate-500 shrink-0"
          />
        )}
      </button>

      {/* CONTENT */}
      <AnimatePresence initial={false}>
        {showConfig && (
          <motion.div
            initial={{
              height: 0,
              opacity: 0,
            }}
            animate={{
              height: "auto",
              opacity: 1,
            }}
            exit={{
              height: 0,
              opacity: 0,
            }}
            transition={{
              duration: 0.22,
            }}
            className="overflow-hidden"
          >

            <div className="border-t border-white/[0.06] p-5 space-y-5">

              {/* INFO */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">

                <div className="bg-[#0B1220] border border-white/[0.05] rounded-2xl p-5">
                  <div className="flex items-center justify-between">

                    <div>
                      <p className="text-[10px] uppercase tracking-[0.22em] text-slate-500 font-black">
                        Rodada
                      </p>

                      <div className="mt-3 text-4xl font-black text-white leading-none">
                        {currentRound}
                        <span className="text-lg text-slate-500 ml-1">
                          / {totalRounds}
                        </span>
                      </div>
                    </div>

                    <div className="w-11 h-11 rounded-2xl bg-orange-500/10 flex items-center justify-center">
                      <Layers3
                        size={18}
                        className="text-orange-400"
                      />
                    </div>

                  </div>
                </div>

                <div className="bg-[#0B1220] border border-white/[0.05] rounded-2xl p-5">
                  <div className="flex items-center justify-between">

                    <div>
                      <p className="text-[10px] uppercase tracking-[0.22em] text-slate-500 font-black">
                        Duração
                      </p>

                      <div className="mt-3 text-4xl font-black text-white leading-none">
                        {config.durationMinutes}
                        <span className="text-lg text-slate-500 ml-1">
                          min
                        </span>
                      </div>
                    </div>

                    <div className="w-11 h-11 rounded-2xl bg-sky-500/10 flex items-center justify-center">
                      <Clock3
                        size={18}
                        className="text-sky-400"
                      />
                    </div>

                  </div>
                </div>

              </div>

              {/* QUANTIDADES MÁXIMAS */}
                <div className="bg-[#0B1220] border border-white/[0.05] rounded-2xl p-5">
                  <div className="flex items-center justify-between gap-3 mb-4 flex-wrap">
                    <div>
                      <p className="text-[10px] uppercase tracking-[0.22em] text-slate-500 font-black">
                        Quantidades Máximas por Categoria
                      </p>
                      <p className="text-xs text-slate-600 mt-1">
                        Defina o limite máximo de itens para a rodada
                      </p>
                    </div>
                    {gameStarted && (
                      <div className="px-3 py-1.5 rounded-xl bg-red-500/10 border border-red-500/20 text-red-400 text-[10px] uppercase tracking-widest font-black">
                        Bloqueado
                      </div>
                    )}
                  </div>

                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
                    {CATEGORY_LIMIT_FIELDS.map((item) => (
                      <div key={item.key} className="flex flex-col gap-1.5">
                        <label
                          htmlFor={item.key}
                          className="text-[11px] font-bold text-slate-400 uppercase tracking-wider"
                        >
                          {item.label}
                        </label>
                        <input
                          id={item.key}
                          type="number"
                          min="0"
                          step="1"
                          disabled={gameStarted}
                          value={config[item.key]}
                          onChange={(e) => {
                            const parsedValue = Number(e.target.value);
                            const nextValue = Number.isFinite(parsedValue)
                              ? Math.max(0, Math.floor(parsedValue))
                              : 0;

                            onConfigChange({ [item.key]: nextValue });
                          }}
                          className="w-full h-10 px-3 rounded-xl bg-white/[0.03] border border-white/[0.06] text-white text-sm font-black focus:outline-none focus:border-orange-500/50 disabled:opacity-40 disabled:cursor-not-allowed transition-all [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none"
                        />
                      </div>
                    ))}
                  </div>
                </div>

              {/* PRESETS */}
              <div className="bg-[#0B1220] border border-white/[0.05] rounded-2xl p-5">

                <div className="flex items-center justify-between gap-3 mb-4 flex-wrap">

                  <div>
                    <p className="text-[10px] uppercase tracking-[0.22em] text-slate-500 font-black">
                      Tempo da Rodada
                    </p>

                    <p className="text-xs text-slate-600 mt-1">
                      Duração da simulação
                    </p>
                  </div>

                  {gameStarted && (
                    <div className="px-3 py-1.5 rounded-xl bg-red-500/10 border border-red-500/20 text-red-400 text-[10px] uppercase tracking-widest font-black">
                      Bloqueado
                    </div>
                  )}

                </div>

                <div className="grid grid-cols-3 sm:grid-cols-5 xl:grid-cols-9 gap-2">

                  {DURATION_PRESETS.map((minutes) => {
                    const active =
                      config.durationMinutes ===
                      minutes;

                    return (
                      <button
                        type="button"
                        key={minutes}
                        disabled={gameStarted}
                        onClick={() =>
                          onConfigChange({
                            durationMinutes:
                              minutes,
                            durationSeconds: 0,
                          })
                        }
                        className={`
                          h-10 rounded-xl text-xs font-black uppercase border transition-all
                          ${
                            active
                              ? "bg-orange-500 border-orange-400 text-white shadow-lg shadow-orange-500/20"
                              : "bg-white/[0.03] border-white/[0.06] text-slate-400 hover:bg-white/[0.06] hover:text-white"
                          }
                          ${
                            gameStarted
                              ? "opacity-40 cursor-not-allowed"
                              : "cursor-pointer"
                          }
                        `}
                      >
                        {minutes}m
                      </button>
                    );
                  })}

                </div>

              </div>

              {/* ACTIONS */}
              <div className="grid grid-cols-1 lg:grid-cols-3 gap-3">

                {!gameStarted && (
                  <button
                    type="button"
                    onClick={onIniciar}
                    className="flex cursor-pointer items-center justify-center gap-2 px-5 py-3 rounded-2xl bg-orange-500 hover:bg-orange-400 transition-all shadow-lg shadow-orange-500/20"
                  >
                    <Play
                      size={16}
                      className="text-white"
                    />

                    <span className="text-xs font-black uppercase tracking-wide text-white">
                      Iniciar
                    </span>
                  </button>
                )}

                {gameStarted && (
                  <button
                    type="button"
                    onClick={onParar}
                    className="flex items-center justify-center gap-2 px-5 py-3 rounded-2xl bg-red-500/10 hover:bg-red-500 border border-red-500/20 hover:border-transparent transition-all"
                  >
                    <Square
                      size={16}
                      className="text-red-400"
                    />

                    <span className="text-xs font-black uppercase tracking-wide text-red-400">
                      Encerrar
                    </span>
                  </button>
                )}

                {!gameStarted && canGoNext && (
                  <button
                    type="button"
                    onClick={onProxima}
                    className="flex items-center justify-center gap-2 px-5 py-3 rounded-2xl bg-sky-500/10 hover:bg-sky-500/20 border border-sky-500/20 transition-all"
                  >
                    <SkipForward
                      size={16}
                      className="text-sky-400"
                    />

                    <span className="text-xs font-black uppercase tracking-wide text-sky-400">
                      Próxima
                    </span>
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
