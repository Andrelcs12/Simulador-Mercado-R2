import {
  AlertTriangle,
  UserMinus,
  X,
} from "lucide-react";

import { motion, AnimatePresence } from "framer-motion";
import { Player } from "../types";

// ─────────────────────────────
// BASE MODAL (clean)
// ─────────────────────────────

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
    className="fixed inset-0 z-50 bg-black/70 backdrop-blur-sm flex items-center justify-center p-4"
    onClick={onClose}
  >
    <motion.div
      initial={{ scale: 0.96, opacity: 0, y: 8 }}
      animate={{ scale: 1, opacity: 1, y: 0 }}
      exit={{ scale: 0.96, opacity: 0, y: 8 }}
      transition={{ duration: 0.18 }}
      onClick={(e) => e.stopPropagation()}
      className="relative w-full max-w-md bg-[#111827] border border-white/[0.08] rounded-2xl shadow-2xl"
    >
      {/* close */}
      <button
        onClick={onClose}
        className="absolute cursor-pointer top-3 right-3 w-8 h-8 rounded-lg bg-white/5 hover:bg-white/10 border border-white/5 flex items-center justify-center transition"
      >
        <X size={14} className="text-slate-400" />
      </button>

      <div className="p-6">{children}</div>
    </motion.div>
  </motion.div>
);

// ─────────────────────────────
// ENCERRAR SESSÃO
// ─────────────────────────────

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
        <div className="text-center space-y-4">

          {/* icon */}
          <div className="w-16 h-16 mx-auto rounded-xl bg-red-500/10 border border-red-500/20 flex items-center justify-center">
            <AlertTriangle className="text-red-400" size={28} />
          </div>

          {/* title */}
          <h2 className="text-xl font-black text-white">
            Encerrar sessão?
          </h2>

          {/* desc */}
          <p className="text-sm text-slate-400 leading-relaxed">
            Todos os participantes serão desconectados e a sessão será finalizada.
          </p>

          {/* actions */}
          <div className="flex gap-3 pt-4">

            <button
              onClick={onClose}
              className="flex-1 cursor-pointer h-11 rounded-xl bg-white/5 hover:bg-white/10 border border-white/10 text-slate-300 hover:text-white text-xs uppercase font-black transition"
            >
              Cancelar
            </button>

            <button
              onClick={onConfirm}
              className="flex-1 cursor-pointer h-11 rounded-xl bg-red-500/90 hover:bg-red-500 text-white text-xs uppercase font-black transition"
            >
              Encerrar
            </button>

          </div>
        </div>
      </Modal>
    )}
  </AnimatePresence>
);

// ─────────────────────────────
// EXPULSAR JOGADOR
// ─────────────────────────────

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
        <div className="text-center space-y-4">

          {/* icon */}
          <div className="w-16 h-16 mx-auto rounded-xl bg-orange-500/10 border border-orange-500/20 flex items-center justify-center">
            <UserMinus className="text-orange-400" size={28} />
          </div>

          {/* title */}
          <h2 className="text-xl font-black text-white">
            Remover participante?
          </h2>

          {/* target */}
          <div className="text-left bg-white/[0.03] border border-white/[0.06] rounded-xl p-4">

            <p className="text-[10px] uppercase tracking-widest text-slate-500 font-black">
              Loja
            </p>

            <p className="text-white font-black text-sm mt-1">
              {player.storeName}
            </p>

            {player.name && (
              <p className="text-slate-400 text-xs mt-1">
                {player.name}
              </p>
            )}
          </div>

          {/* desc */}
          <p className="text-sm text-slate-500 leading-relaxed">
            O participante será removido imediatamente da sessão.
          </p>

          {/* actions */}
          <div className="flex gap-3 pt-4">

            <button
              onClick={onClose}
              className="flex-1 cursor-pointer h-11 rounded-xl bg-white/5 hover:bg-white/10 border border-white/10 text-slate-300 hover:text-white text-xs uppercase font-black transition"
            >
              Cancelar
            </button>

            <button
              onClick={() => onConfirm(player)}
              className="flex-1 cursor-pointer h-11 rounded-xl bg-orange-500/90 hover:bg-orange-500 text-white text-xs uppercase font-black transition"
            >
              Remover
            </button>

          </div>
        </div>
      </Modal>
    )}
  </AnimatePresence>
);