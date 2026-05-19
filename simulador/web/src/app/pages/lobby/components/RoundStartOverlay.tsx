"use client";

import { motion, AnimatePresence } from "framer-motion";

function formatTime(seconds: number): string {
  const m = Math.floor(seconds / 60);
  const s = seconds % 60;

  return `${String(m).padStart(2, "0")}:${String(s).padStart(2, "0")}`;
}

interface RoundStartOverlayProps {
  isGameStarted: boolean;
  roundLabel: string;
  tempoRestante: number;
}

export const RoundStartOverlay = ({
  isGameStarted,
  roundLabel,
  tempoRestante,
}: RoundStartOverlayProps) => {
  return (
    <AnimatePresence>
      {isGameStarted && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 z-50 flex items-center justify-center bg-[#0B1220]/90 backdrop-blur-xl"
        >
          <motion.div
            initial={{ scale: 0.9, y: 20, opacity: 0 }}
            animate={{ scale: 1, y: 0, opacity: 1 }}
            exit={{ scale: 0.95, opacity: 0 }}
            transition={{ duration: 0.25 }}
            className="text-center px-6 max-w-md w-full"
          >

            <div className="bg-[#111827] border border-white/[0.06] rounded-3xl p-8">

              <div className="text-5xl mb-5">🚀</div>

              <h2 className="text-2xl sm:text-3xl font-black text-white uppercase">
                Rodada iniciada
              </h2>

              <p className="text-orange-400 font-black uppercase tracking-[0.3em] mt-3 text-xs">
                {roundLabel}
              </p>

              <div className="mt-8">

                <p className="text-[10px] uppercase tracking-[0.25em] text-slate-500 font-black mb-3">
                  Tempo restante
                </p>

                <div className="text-4xl sm:text-5xl font-black text-white font-mono tabular-nums">
                  {formatTime(tempoRestante)}
                </div>

              </div>

            </div>

          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};