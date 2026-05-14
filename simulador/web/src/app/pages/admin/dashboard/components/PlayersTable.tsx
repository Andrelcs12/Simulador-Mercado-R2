import { Users, CheckCircle2, Clock, UserMinus } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { Player } from "../types";

interface PlayersTableProps {
  players: Player[];
  submittedCount: number;
  onKick: (player: Player) => void;
}

export const PlayersTable = ({ players, submittedCount, onKick }: PlayersTableProps) => {
  return (
    <aside className="space-y-3">
      <div className="flex items-center justify-between px-1">
        <div className="flex items-center gap-2 text-xs font-black text-slate-400 uppercase">
          <Users size={14} />
          Jogadores ({players.length})
        </div>
        <div className="text-xs font-bold text-emerald-400">
          {submittedCount} enviaram
        </div>
      </div>

      <div className="space-y-2 max-h-[70vh] overflow-y-auto pr-1">
        <AnimatePresence>
          {players.length === 0 ? (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="bg-[#111827] border border-white/[0.06] rounded-2xl p-6 text-center text-slate-600 text-sm"
            >
              Nenhum jogador conectado
            </motion.div>
          ) : (
            players.map((player) => (
              <motion.div
                layout
                key={player.id}
                initial={{ opacity: 0, y: 8 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, scale: 0.95 }}
                className="bg-[#111827] border border-white/[0.06] rounded-2xl p-4 flex items-center justify-between gap-3 group"
              >
                <div className="min-w-0">
                  <div className="font-bold text-sm truncate">{player.storeName}</div>
                  <div className="text-[11px] text-slate-500 font-semibold truncate">
                    {player.name}
                  </div>
                  {player.submittedAt && (
                    <div className="text-[10px] text-emerald-500 font-bold mt-0.5">
                      Enviado às {player.submittedAt}
                    </div>
                  )}
                </div>

                <div className="flex items-center gap-2 shrink-0">
                  {player.submittedAt ? (
                    <div
                      className="bg-emerald-500/10 text-emerald-500 p-1.5 rounded-lg"
                      title="Enviado"
                    >
                      <CheckCircle2 size={16} />
                    </div>
                  ) : (
                    <div
                      className="bg-white/5 text-slate-600 p-1.5 rounded-lg"
                      title="Aguardando"
                    >
                      <Clock size={16} />
                    </div>
                  )}

                  <button
                    onClick={() => onKick(player)}
                    className="opacity-0 group-hover:opacity-100 bg-red-500/10 text-red-400 hover:bg-red-500/20 p-1.5 rounded-lg transition-all"
                    title="Remover jogador"
                  >
                    <UserMinus size={16} />
                  </button>
                </div>
              </motion.div>
            ))
          )}
        </AnimatePresence>
      </div>
    </aside>
  );
};