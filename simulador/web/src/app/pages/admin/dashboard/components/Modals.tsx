import { AlertTriangle, UserMinus } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { Player } from "../types";

// ─── Modal base ───────────────────────────────────────────
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
    className="fixed inset-0 bg-black/70 backdrop-blur-sm flex items-center justify-center z-50 p-4"
    onClick={onClose}
  >
    <motion.div
      initial={{ scale: 0.92, opacity: 0 }}
      animate={{ scale: 1, opacity: 1 }}
      exit={{ scale: 0.92, opacity: 0 }}
      onClick={(e) => e.stopPropagation()}
      className="bg-[#111827] border border-white/10 p-8 rounded-3xl max-w-sm w-full text-center shadow-2xl"
    >
      {children}
    </motion.div>
  </motion.div>
);

// ─── Modal: Encerrar Sessão ───────────────────────────────
interface ModalEncerrarProps {
  open: boolean;
  onClose: () => void;
  onConfirm: () => void;
}

export const ModalEncerrarSessao = ({ open, onClose, onConfirm }: ModalEncerrarProps) => (
  <AnimatePresence>
    {open && (
      <Modal onClose={onClose}>
        <AlertTriangle className="text-red-400 mx-auto mb-4" size={44} />
        <h2 className="text-xl font-black mb-2">Encerrar Simulação?</h2>
        <p className="text-slate-400 text-sm mb-6">
          Todos os jogadores serão desconectados e os relatórios serão finalizados.
        </p>
        <div className="flex gap-3">
          <button
            onClick={onClose}
            className="flex-1 py-3 font-bold text-slate-400 hover:text-white transition-colors"
          >
            Cancelar
          </button>
          <button
            onClick={onConfirm}
            className="flex-1 bg-red-500 hover:bg-red-400 py-3 rounded-xl font-bold transition-all"
          >
            Encerrar
          </button>
        </div>
      </Modal>
    )}
  </AnimatePresence>
);

// ─── Modal: Expulsar Jogador ──────────────────────────────
interface ModalKickProps {
  player: Player | null;
  onClose: () => void;
  onConfirm: (player: Player) => void;
}

export const ModalExpulsarJogador = ({ player, onClose, onConfirm }: ModalKickProps) => (
  <AnimatePresence>
    {player && (
      <Modal onClose={onClose}>
        <UserMinus className="text-orange-400 mx-auto mb-4" size={44} />
        <h2 className="text-xl font-black mb-2">Remover Jogador?</h2>
        <p className="text-slate-400 text-sm mb-1">
          <span className="text-white font-bold">{player.storeName}</span>
        </p>
        <p className="text-slate-500 text-xs mb-6">
          O jogador será desconectado da sessão.
        </p>
        <div className="flex gap-3">
          <button
            onClick={onClose}
            className="flex-1 py-3 font-bold text-slate-400 hover:text-white transition-colors"
          >
            Cancelar
          </button>
          <button
            onClick={() => onConfirm(player)}
            className="flex-1 bg-orange-500 hover:bg-orange-400 py-3 rounded-xl font-bold transition-all"
          >
            Remover
          </button>
        </div>
      </Modal>
    )}
  </AnimatePresence>
);