import { Timer, CheckCircle2 } from "lucide-react";
import { motion } from "framer-motion";

function formatMs(ms: number): string {
  const total = Math.ceil(ms / 1000);
  const m = Math.floor(total / 60);
  const s = total % 60;
  return `${String(m).padStart(2, "0")}:${String(s).padStart(2, "0")}`;
}

interface RoundTimerProps {
  gameStarted: boolean;
  timeLeft: number;
  progressPercent: number;
  roundNumber: number;
  playersCount: number;
  submittedCount: number;
}

export const RoundTimer = ({
  gameStarted,
  timeLeft,
  progressPercent,
  roundNumber,
  playersCount,
  submittedCount,
}: RoundTimerProps) => {
  return (
    <section className="bg-[#111827] border border-white/[0.06] rounded-3xl p-6 md:p-8">
      <div className="flex items-center justify-between mb-5">
        <span className="text-xs font-black text-slate-500 uppercase tracking-widest">
          Cronômetro — Rodada {roundNumber}
        </span>
        <Timer
          size={18}
          className={gameStarted ? "text-orange-500 animate-pulse" : "text-slate-600"}
        />
      </div>

      <div
        className={`text-6xl md:text-8xl font-mono font-black tabular-nums leading-none ${
          gameStarted ? "text-white" : "text-slate-700"
        }`}
      >
        {gameStarted ? formatMs(timeLeft) : "00:00"}
      </div>

      {/* Barra de progresso */}
      <div className="mt-6 h-2 bg-white/5 rounded-full overflow-hidden">
        <motion.div
          className="h-full bg-orange-500 rounded-full"
          initial={{ width: "100%" }}
          animate={{ width: `${gameStarted ? progressPercent : 0}%` }}
          transition={{ ease: "linear", duration: 0.5 }}
        />
      </div>

      {/* Sub-info */}
      {gameStarted && playersCount > 0 && (
        <div className="mt-4 flex items-center gap-2 text-xs text-slate-500 font-medium">
          <CheckCircle2 size={13} className="text-emerald-500" />
          {submittedCount} de {playersCount} jogadores já enviaram
        </div>
      )}
    </section>
  );
};