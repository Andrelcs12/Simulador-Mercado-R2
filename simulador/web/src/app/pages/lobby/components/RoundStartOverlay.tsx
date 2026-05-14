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
}: RoundStartOverlayProps) => (
  <AnimatePresence>
    {isGameStarted && (
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="fixed inset-0 z-50 flex items-center justify-center bg-[#001B36]/90 backdrop-blur-md"
      >
        <motion.div
          initial={{ scale: 0.8, y: 30 }}
          animate={{ scale: 1, y: 0 }}
          className="text-center px-6"
        >
          <div className="text-8xl mb-6">🚀</div>
          <h2 className="text-5xl font-black uppercase italic text-white tracking-tight">
            Rodada Iniciada
          </h2>
          <p className="text-orange-500 font-black uppercase tracking-[0.4em] mt-4">
            {roundLabel}
          </p>
          <div className="mt-10 flex justify-center">
            <div className="bg-white/10 border border-white/10 px-10 py-5 rounded-3xl">
              <div className="text-xs uppercase tracking-widest text-white/50 font-black mb-2">
                Tempo disponível
              </div>
              <div className="text-6xl font-black text-white font-mono">
                {formatTime(tempoRestante)}
              </div>
            </div>
          </div>
        </motion.div>
      </motion.div>
    )}
  </AnimatePresence>
);