import {
  Users,
  CheckCircle2,
  Clock,
  UserMinus,
  ShieldCheck,
  Store,
  User2,
} from "lucide-react";

import { motion, AnimatePresence } from "framer-motion";
import { Player } from "../types";

interface PlayersTableProps {
  players: Player[];
  submittedCount: number;
  onKick: (player: Player) => void;
}

export const PlayersTable = ({
  players,
  submittedCount,
  onKick,
}: PlayersTableProps) => {
  const readyCount = players.filter((p: any) => p.ready).length;

  return (
    <aside className="bg-[#0F172A] border border-white/[0.06] rounded-[2rem] overflow-hidden h-fit">

      {/* HEADER */}
      <div className="border-b border-white/[0.06] px-5 py-5">

        <div className="flex items-center justify-between gap-3">

          <div>
            <div className="flex items-center gap-2">
              <Users size={16} className="text-orange-500" />

              <h2 className="text-sm font-black uppercase tracking-[0.18em] text-white">
                Participantes
              </h2>
            </div>

            <p className="text-[11px] text-slate-500 font-semibold mt-1">
              Monitoramento em tempo real da sessão
            </p>
          </div>

          <div className="bg-orange-500 text-white min-w-[46px] h-[46px] rounded-2xl flex items-center justify-center text-sm font-black shadow-lg">
            {players.length}
          </div>
        </div>

        {/* STATS */}
        <div className="grid grid-cols-2 gap-3 mt-5">

          <div className="bg-white/[0.03] border border-white/[0.05] rounded-2xl p-4">
            <div className="flex items-center gap-2 mb-2">
              <CheckCircle2 size={15} className="text-emerald-400" />

              <span className="text-[10px] uppercase tracking-[0.2em] font-black text-slate-500">
                Enviaram
              </span>
            </div>

            <div className="text-2xl font-black text-white">
              {submittedCount}
            </div>
          </div>

          <div className="bg-white/[0.03] border border-white/[0.05] rounded-2xl p-4">
            <div className="flex items-center gap-2 mb-2">
              <ShieldCheck size={15} className="text-sky-400" />

              <span className="text-[10px] uppercase tracking-[0.2em] font-black text-slate-500">
                Prontos
              </span>
            </div>

            <div className="text-2xl font-black text-white">
              {readyCount}
            </div>
          </div>
        </div>
      </div>

      {/* PLAYERS */}
      <div className="p-3 max-h-[72vh] overflow-y-auto">

        <AnimatePresence mode="popLayout">

          {players.length === 0 ? (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="bg-white/[0.03] border border-dashed border-white/[0.08] rounded-3xl p-10 text-center"
            >
              <Users
                size={34}
                className="mx-auto text-slate-700 mb-4"
              />

              <h3 className="font-black text-slate-300 text-sm uppercase tracking-wide">
                Nenhum participante conectado
              </h3>

              <p className="text-xs text-slate-600 mt-2">
                Os jogadores aparecerão aqui ao entrar na sessão
              </p>
            </motion.div>
          ) : (
            <div className="space-y-3">

              {players.map((player: any, index) => (
                <motion.div
                  key={player.id}
                  layout
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, scale: 0.96 }}
                  transition={{ duration: 0.18 }}
                  className="group relative overflow-hidden bg-[#111827] hover:bg-[#151D2E] border border-white/[0.06] hover:border-orange-500/20 rounded-[1.6rem] p-4 transition-all duration-300 shadow-lg"
                >

                  {/* glow */}
                  <div className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity bg-gradient-to-r from-orange-500/[0.03] via-transparent to-transparent pointer-events-none" />

                  <div className="relative flex items-start justify-between gap-4">

                    {/* LEFT */}
                    <div className="flex items-start gap-3 min-w-0 flex-1">

                      {/* avatar */}
                      <div className="w-12 h-12 rounded-2xl bg-orange-500/10 border border-orange-500/10 flex items-center justify-center shrink-0">
                        <Store
                          size={20}
                          className="text-orange-400"
                        />
                      </div>

                      {/* infos */}
                      <div className="min-w-0 flex-1">

                        <div className="flex items-center gap-2 flex-wrap">

                          <h3 className="font-black text-white text-sm truncate">
                            {player.storeName || "Loja não informada"}
                          </h3>

                          <span className="bg-white/[0.04] border border-white/[0.06] px-2 py-1 rounded-full text-[9px] uppercase tracking-[0.16em] font-black text-slate-400">
                            #{index + 1}
                          </span>
                        </div>

                        <div className="flex items-center gap-2 mt-2 min-w-0">

                          <User2
                            size={13}
                            className="text-slate-500 shrink-0"
                          />

                          <p className="text-xs text-slate-400 font-semibold truncate">
                            {player.name}
                          </p>
                        </div>

                        {/* STATUS */}
                        <div className="flex flex-wrap items-center gap-2 mt-3">

                          {/* READY */}
                          {player.ready ? (
                            <div className="flex items-center gap-1.5 bg-sky-500/10 border border-sky-500/20 text-sky-400 px-2.5 py-1.5 rounded-xl">
                              <ShieldCheck size={12} />
                              <span className="text-[10px] font-black uppercase tracking-wide">
                                Pronto
                              </span>
                            </div>
                          ) : (
                            <div className="flex items-center gap-1.5 bg-white/[0.04] border border-white/[0.06] text-slate-500 px-2.5 py-1.5 rounded-xl">
                              <Clock size={12} />
                              <span className="text-[10px] font-black uppercase tracking-wide">
                                Preparando
                              </span>
                            </div>
                          )}

                          {/* SUBMITTED */}
                          {player.submittedAt ? (
                            <div className="flex items-center gap-1.5 bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 px-2.5 py-1.5 rounded-xl">
                              <CheckCircle2 size={12} />
                              <span className="text-[10px] font-black uppercase tracking-wide">
                                Enviado
                              </span>
                            </div>
                          ) : (
                            <div className="flex items-center gap-1.5 bg-yellow-500/10 border border-yellow-500/20 text-yellow-400 px-2.5 py-1.5 rounded-xl">
                              <Clock size={12} />
                              <span className="text-[10px] font-black uppercase tracking-wide">
                                Aguardando
                              </span>
                            </div>
                          )}
                        </div>

                        {/* horário */}
                        {player.submittedAt && (
                          <p className="text-[10px] text-emerald-500/80 font-bold mt-3">
                            Configuração enviada às{" "}
                            {new Date(player.submittedAt).toLocaleTimeString(
                              "pt-BR",
                              {
                                hour: "2-digit",
                                minute: "2-digit",
                              }
                            )}
                          </p>
                        )}
                      </div>
                    </div>

                    {/* RIGHT */}
                    <div className="flex flex-col items-center gap-2 shrink-0">

                      <button
                        onClick={() => onKick(player)}
                        className="opacity-100 lg:opacity-0 lg:group-hover:opacity-100 transition-all duration-200 bg-red-500/10 hover:bg-red-500 text-red-400 hover:text-white border border-red-500/10 hover:border-red-500 w-10 h-10 rounded-xl flex items-center justify-center shadow-lg"
                        title="Remover jogador"
                      >
                        <UserMinus size={16} />
                      </button>
                    </div>
                  </div>
                </motion.div>
              ))}
            </div>
          )}
        </AnimatePresence>
      </div>
    </aside>
  );
};