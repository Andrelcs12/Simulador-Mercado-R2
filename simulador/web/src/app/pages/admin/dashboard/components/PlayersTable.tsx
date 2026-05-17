"use client";

import {
  Users,
  CheckCircle2,
  Clock3,
  UserMinus,
  ShieldCheck,
  Store,
  User2,
  Briefcase,
} from "lucide-react";

import { motion, AnimatePresence } from "framer-motion";
import { Player } from "../types";

interface PlayersTableProps {
  players: Player[];
  submittedCount: number;
  onKick: (player: Player) => void;
}

const ROLE_LABELS: Record<string, string> = {
  STORE_MANAGER: "Gerente Loja",
  SERVICE_MANAGER: "Serviços",
  SUPPLY_MANAGER: "Abastecimento",
  COMMERCIAL_MANAGER: "Comercial",
  OPERATION_MANAGER: "Operacional",
};

export const PlayersTable = ({
  players,
  submittedCount,
  onKick,
}: PlayersTableProps) => {
  const readyCount = players.filter(
    (p: any) => p.ready || p.isReady
  ).length;

  return (
    <aside className="bg-[#111827] border border-white/[0.06] rounded-2xl overflow-hidden">

      {/* HEADER */}
      <div className="px-4 py-4 border-b border-white/[0.06]">

        <div className="flex items-center justify-between">

          <div className="flex items-center gap-2">
            <Users size={16} className="text-orange-400" />

            <div>
              <h2 className="text-xs font-black uppercase tracking-widest text-white">
                Participantes
              </h2>
              <p className="text-[10px] text-slate-500 uppercase tracking-widest">
                em tempo real
              </p>
            </div>
          </div>

          <div className="text-sm font-black text-white bg-orange-500/10 border border-orange-500/20 px-3 py-1 rounded-xl">
            {players.length}
          </div>

        </div>

        {/* STATS */}
        <div className="grid grid-cols-2 gap-2 mt-4">

          <div className="bg-[#0B1220] border border-white/[0.05] rounded-xl p-3">
            <div className="flex items-center gap-2 text-emerald-400">
              <CheckCircle2 size={12} />
              <span className="text-[9px] uppercase tracking-widest text-slate-500">
                enviados
              </span>
            </div>
            <div className="text-lg font-black text-white mt-1">
              {submittedCount}
            </div>
          </div>

          <div className="bg-[#0B1220] border border-white/[0.05] rounded-xl p-3">
            <div className="flex items-center gap-2 text-sky-400">
              <ShieldCheck size={12} />
              <span className="text-[9px] uppercase tracking-widest text-slate-500">
                prontos
              </span>
            </div>
            <div className="text-lg font-black text-white mt-1">
              {readyCount}
            </div>
          </div>

        </div>
      </div>

      {/* LIST */}
      <div className="p-3 max-h-[74vh] overflow-y-auto">

        <AnimatePresence mode="popLayout">

          {players.length === 0 ? (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="text-center py-10 border border-dashed border-white/[0.06] rounded-xl bg-[#0B1220]"
            >
              <Users className="mx-auto text-slate-700 mb-3" size={28} />

              <p className="text-sm font-black text-slate-300 uppercase">
                sem jogadores
              </p>

              <p className="text-[10px] text-slate-600 mt-2">
                aguardando conexões
              </p>
            </motion.div>
          ) : (
            <div className="space-y-2">

              {players.map((player: any, index) => {
                const isReady = player.ready || player.isReady;
                const submitted = !!player.submittedAt;

                const role =
                  ROLE_LABELS[player.role] || "Participante";

                return (
                  <motion.div
                    key={player.id}
                    layout
                    initial={{ opacity: 0, y: 6 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, scale: 0.98 }}
                    className="bg-[#0B1220] border border-white/[0.05] hover:border-white/[0.12] rounded-xl p-3 transition"
                  >

                    <div className="flex justify-between gap-3">

                      {/* LEFT */}
                      <div className="flex gap-3 min-w-0">

                        {/* ICON */}
                        <div className="w-10 h-10 rounded-xl bg-orange-500/10 border border-orange-500/10 flex items-center justify-center shrink-0">
                          <Store size={16} className="text-orange-400" />
                        </div>

                        {/* INFO */}
                        <div className="min-w-0">

                          <div className="flex items-center gap-2">
                            <p className="text-sm font-black text-white truncate">
                              {player.storeName || "Sem loja"}
                            </p>

                            <span className="text-[9px] text-slate-500">
                              #{index + 1}
                            </span>
                          </div>

                          <div className="flex items-center gap-2 mt-2 text-slate-400">
                            <User2 size={12} />
                            <p className="text-xs truncate">
                              {player.name}
                            </p>
                          </div>

                          <div className="flex items-center gap-2 mt-1 text-orange-400">
                            <Briefcase size={12} />
                            <span className="text-[10px] uppercase tracking-widest font-black">
                              {role}
                            </span>
                          </div>

                          {/* STATUS */}
                          <div className="flex gap-2 mt-3 flex-wrap">

                            <span className={`px-2 py-1 rounded-lg text-[9px] font-black uppercase border ${
                              isReady
                                ? "text-sky-400 border-sky-500/20 bg-sky-500/10"
                                : "text-slate-500 border-white/[0.06] bg-white/[0.03]"
                            }`}>
                              {isReady ? "pronto" : "preparando"}
                            </span>

                            <span className={`px-2 py-1 rounded-lg text-[9px] font-black uppercase border ${
                              submitted
                                ? "text-emerald-400 border-emerald-500/20 bg-emerald-500/10"
                                : "text-yellow-400 border-yellow-500/20 bg-yellow-500/10"
                            }`}>
                              {submitted ? "enviado" : "aguardando"}
                            </span>

                          </div>

                          {submitted && (
                            <p className="text-[9px] text-emerald-500 mt-2 uppercase tracking-widest">
                              {new Date(player.submittedAt).toLocaleTimeString("pt-BR", {
                                hour: "2-digit",
                                minute: "2-digit",
                              })}
                            </p>
                          )}

                        </div>
                      </div>

                      {/* ACTION */}
                      <button
                        onClick={() => onKick(player)}
                        className="w-9 h-9 rounded-lg bg-red-500/10 hover:bg-red-500 border border-red-500/20 hover:border-red-500 flex items-center justify-center text-red-400 hover:text-white transition"
                      >
                        <UserMinus size={14} />
                      </button>

                    </div>

                  </motion.div>
                );
              })}

            </div>
          )}

        </AnimatePresence>
      </div>
    </aside>
  );
};