import {
  AlertTriangle,
  UserMinus,
  X,
} from "lucide-react";

import {
  motion,
  AnimatePresence,
} from "framer-motion";

import { Player } from "../types";

// ─────────────────────────────────────────────
// BASE MODAL
// ─────────────────────────────────────────────

const Modal = ({
  children,
  onClose,
}: {
  children: React.ReactNode;
  onClose: () => void;
}) => (
  <motion.div
    initial={{ opacity: 0 }}
    animate={{ opacity: 1 }}
    exit={{ opacity: 0 }}
    className="fixed inset-0 z-50 bg-black/80 backdrop-blur-md flex items-center justify-center p-4"
    onClick={onClose}
  >
    <motion.div
      initial={{
        scale: 0.94,
        opacity: 0,
        y: 10,
      }}
      animate={{
        scale: 1,
        opacity: 1,
        y: 0,
      }}
      exit={{
        scale: 0.94,
        opacity: 0,
        y: 10,
      }}
      transition={{
        duration: 0.2,
      }}
      onClick={(e) =>
        e.stopPropagation()
      }
      className="relative bg-[#111827] border border-white/10 rounded-[2rem] w-full max-w-md overflow-hidden shadow-[0_20px_80px_rgba(0,0,0,0.45)]"
    >
      {/* glow */}
      <div className="absolute inset-0 bg-gradient-to-b from-white/[0.02] to-transparent pointer-events-none" />

      {/* close */}
      <button
        onClick={onClose}
        className="absolute top-4 right-4 w-9 h-9 rounded-xl bg-white/5 hover:bg-white/10 border border-white/5 hover:border-white/10 flex items-center justify-center transition-all"
      >
        <X
          size={16}
          className="text-slate-400"
        />
      </button>

      <div className="p-8 relative z-10">
        {children}
      </div>
    </motion.div>
  </motion.div>
);

// ─────────────────────────────────────────────
// MODAL ENCERRAR
// ─────────────────────────────────────────────

interface ModalEncerrarProps {
  open: boolean;
  onClose: () => void;
  onConfirm: () => void;
}

export const ModalEncerrarSessao = ({
  open,
  onClose,
  onConfirm,
}: ModalEncerrarProps) => (
  <AnimatePresence>
    {open && (
      <Modal onClose={onClose}>

        <div className="flex flex-col items-center text-center">

          {/* icon */}
          <div className="w-20 h-20 rounded-[2rem] bg-red-500/10 border border-red-500/20 flex items-center justify-center mb-6">
            <AlertTriangle
              className="text-red-400"
              size={38}
            />
          </div>

          {/* title */}
          <h2 className="text-2xl font-black text-white mb-3">
            Encerrar Simulação?
          </h2>

          {/* desc */}
          <p className="text-slate-400 text-sm leading-relaxed max-w-[300px]">
            Todos os participantes serão
            desconectados e a sessão será
            finalizada permanentemente.
          </p>

          {/* buttons */}
          <div className="flex gap-3 w-full mt-8">

            <button
              onClick={onClose}
              className="flex-1 h-14 rounded-2xl border border-white/10 bg-white/[0.03] hover:bg-white/[0.06] text-slate-300 hover:text-white font-black uppercase text-xs tracking-wide transition-all"
            >
              Cancelar
            </button>

            <button
              onClick={onConfirm}
              className="flex-1 h-14 rounded-2xl bg-red-500 hover:bg-red-400 text-white font-black uppercase text-xs tracking-wide shadow-lg hover:shadow-red-500/30 transition-all hover:scale-[1.02] active:scale-[0.98]"
            >
              Encerrar
            </button>
          </div>
        </div>
      </Modal>
    )}
  </AnimatePresence>
);

// ─────────────────────────────────────────────
// MODAL REMOVER
// ─────────────────────────────────────────────

interface ModalKickProps {
  player: Player | null;
  onClose: () => void;
  onConfirm: (player: Player) => void;
}

export const ModalExpulsarJogador = ({
  player,
  onClose,
  onConfirm,
}: ModalKickProps) => (
  <AnimatePresence>
    {player && (
      <Modal onClose={onClose}>

        <div className="flex flex-col items-center text-center">

          {/* icon */}
          <div className="w-20 h-20 rounded-[2rem] bg-orange-500/10 border border-orange-500/20 flex items-center justify-center mb-6">
            <UserMinus
              className="text-orange-400"
              size={38}
            />
          </div>

          {/* title */}
          <h2 className="text-2xl font-black text-white mb-3">
            Remover Participante?
          </h2>

          {/* player */}
          <div className="bg-white/[0.03] border border-white/5 rounded-2xl px-5 py-4 w-full mb-5">
            <div className="text-[10px] uppercase tracking-[0.2em] text-slate-500 font-black mb-2">
              Loja Selecionada
            </div>

            <div className="text-white font-black text-lg">
              {player.storeName}
            </div>

            {player.name && (
              <div className="text-slate-400 text-sm mt-1">
                Responsável: {player.name}
              </div>
            )}
          </div>

          {/* desc */}
          <p className="text-slate-500 text-sm leading-relaxed max-w-[300px]">
            O participante será desconectado
            imediatamente da sessão atual.
          </p>

          {/* buttons */}
          <div className="flex gap-3 w-full mt-8">

            <button
              onClick={onClose}
              className="flex-1 h-14 rounded-2xl border border-white/10 bg-white/[0.03] hover:bg-white/[0.06] text-slate-300 hover:text-white font-black uppercase text-xs tracking-wide transition-all"
            >
              Cancelar
            </button>

            <button
              onClick={() =>
                onConfirm(player)
              }
              className="flex-1 h-14 rounded-2xl bg-orange-500 hover:bg-orange-400 text-white font-black uppercase text-xs tracking-wide shadow-lg hover:shadow-orange-500/30 transition-all hover:scale-[1.02] active:scale-[0.98]"
            >
              Remover
            </button>
          </div>
        </div>
      </Modal>
    )}
  </AnimatePresence>
);