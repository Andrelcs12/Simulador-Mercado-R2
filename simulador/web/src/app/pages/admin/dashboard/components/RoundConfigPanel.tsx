import { Settings, ChevronUp, ChevronDown, Play, Square, SkipForward } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { RoundConfig } from "../types";

const DURATION_PRESETS = [
  { label: "5 min", minutes: 5 },
  { label: "15 min", minutes: 15 },
  { label: "30 min", minutes: 30 },
  { label: "60 min", minutes: 60 },
];

const INTERVAL_PRESETS = [
  { label: "Sem intervalo", minutes: 0 },
  { label: "5 min", minutes: 5 },
  { label: "10 min", minutes: 10 },
];

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
    <section className="bg-[#111827] border border-white/[0.06] rounded-3xl overflow-hidden">
      <button
        onClick={onToggle}
        className="w-full px-6 py-5 flex justify-between items-center hover:bg-white/[0.03] transition-colors"
      >
        <div className="flex items-center gap-3">
          <Settings size={18} className="text-orange-500" />
          <span className="font-black uppercase text-sm">
            Configurar Rodada {config.roundNumber}
          </span>
        </div>
        {showConfig ? (
          <ChevronUp size={18} className="text-slate-500" />
        ) : (
          <ChevronDown size={18} className="text-slate-500" />
        )}
      </button>

      <AnimatePresence initial={false}>
        {showConfig && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: "auto", opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.25 }}
            className="overflow-hidden"
          >
            <div className="px-6 pb-6 pt-4 border-t border-white/[0.06] space-y-5">

              {/* Duração */}
              <div>
                <label className="text-xs font-black text-slate-500 uppercase block mb-3">
                  Duração da Rodada
                </label>
                <div className="flex flex-wrap gap-2">
                  {DURATION_PRESETS.map((p) => (
                    <button
                      key={p.minutes}
                      disabled={gameStarted}
                      onClick={() =>
                        onConfigChange({ durationMinutes: p.minutes, durationSeconds: 0 })
                      }
                      className={`px-4 py-2 rounded-xl text-sm font-bold transition-all disabled:opacity-40 ${
                        config.durationMinutes === p.minutes
                          ? "bg-orange-500 text-white"
                          : "bg-white/5 hover:bg-white/10 text-slate-300"
                      }`}
                    >
                      {p.label}
                    </button>
                  ))}
                </div>
              </div>

              {/* Intervalo */}
              <div>
                <label className="text-xs font-black text-slate-500 uppercase block mb-3">
                  Intervalo entre Rodadas
                </label>
                <div className="flex flex-wrap gap-2">
                  {INTERVAL_PRESETS.map((p) => (
                    <button
                      key={p.minutes}
                      disabled={gameStarted}
                      onClick={() => onConfigChange({ intervalMinutes: p.minutes })}
                      className={`px-4 py-2 rounded-xl text-sm font-bold transition-all disabled:opacity-40 ${
                        config.intervalMinutes === p.minutes
                          ? "bg-slate-500 text-white"
                          : "bg-white/5 hover:bg-white/10 text-slate-300"
                      }`}
                    >
                      {p.label}
                    </button>
                  ))}
                </div>
              </div>

              {/* Número da rodada */}
              <div>
                <label className="text-xs font-black text-slate-500 uppercase block mb-3">
                  Número da Rodada
                </label>
                <input
                  type="number"
                  min={1}
                  value={config.roundNumber}
                  disabled={gameStarted}
                  onChange={(e) =>
                    onConfigChange({ roundNumber: Math.max(1, Number(e.target.value)) })
                  }
                  className="w-24 bg-white/5 border border-white/10 rounded-xl px-3 py-2 text-white font-bold text-sm focus:outline-none focus:border-orange-500 disabled:opacity-40"
                />
              </div>

              {/* Ações */}
              <div className="flex flex-wrap gap-3 pt-1">
                <button
                  disabled={gameStarted}
                  onClick={onIniciar}
                  className="flex items-center gap-2 bg-orange-500 hover:bg-orange-400 disabled:opacity-40 disabled:cursor-not-allowed px-6 py-3 rounded-2xl font-black uppercase text-sm transition-all"
                >
                  <Play size={16} /> Iniciar Rodada
                </button>

                {gameStarted && (
                  <button
                    onClick={onParar}
                    className="flex items-center gap-2 bg-yellow-500 hover:bg-yellow-400 text-black px-5 py-3 rounded-2xl font-black uppercase text-sm transition-all"
                  >
                    <Square size={16} /> Parar
                  </button>
                )}

                {!gameStarted && canGoNext && (
                  <button
                    onClick={onProxima}
                    className="flex items-center gap-2 bg-sky-500/20 hover:bg-sky-500/30 text-sky-400 border border-sky-400/20 px-5 py-3 rounded-2xl font-black uppercase text-sm transition-all"
                  >
                    <SkipForward size={16} /> Próxima Rodada
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