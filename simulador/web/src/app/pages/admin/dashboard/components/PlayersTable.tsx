"use client";

import {
  Users,
  CheckCircle2,
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
    <aside className="w-full bg-[#111827] border border-white/[0.06] rounded-3xl overflow-hidden">

      {/* HEADER */}
      <div className="px-5 py-5 border-b border-white/[0.06] bg-[#0F172A]">

        <div className="flex items-center justify-between gap-4">

          <div className="flex items-center gap-3">

            <div className="w-10 h-10 rounded-2xl bg-orange-500/10 border border-orange-500/10 flex items-center justify-center shrink-0">
              <Users size={18} className="text-orange-400" />
            </div>

            <div>
              <h2 className="text-sm font-black uppercase tracking-[0.18em] text-white">
                Participantes
              </h2>

              <p className="text-[10px] text-slate-500 uppercase tracking-[0.25em] mt-1">
                realtime lobby
              </p>
            </div>

          </div>

          <div className="px-3 py-1.5 rounded-xl border border-orange-500/10 bg-orange-500/5">
            <span className="text-[10px] uppercase tracking-[0.2em] text-orange-400 font-black">
              {players.length} online
            </span>
          </div>

        </div>

        {/* STATS */}
        <div className="grid grid-cols-3 gap-3 mt-5">

          <div className="bg-[#0B1220] border border-white/[0.05] rounded-2xl p-4">
            <div className="flex items-center justify-between">
              <User2 size={15} className="text-orange-400" />

              <span className="text-2xl font-black text-white">
                {players.length}
              </span>
            </div>

            <p className="text-[10px] uppercase tracking-widest text-slate-500 font-black mt-3">
              Jogadores
            </p>
          </div>

          <div className="bg-[#0B1220] border border-white/[0.05] rounded-2xl p-4">
            <div className="flex items-center justify-between">
              <CheckCircle2
                size={15}
                className="text-emerald-400"
              />

              <span className="text-2xl font-black text-white">
                {submittedCount}
              </span>
            </div>

            <p className="text-[10px] uppercase tracking-widest text-slate-500 font-black mt-3">
              Enviados
            </p>
          </div>

          <div className="bg-[#0B1220] border border-white/[0.05] rounded-2xl p-4">
            <div className="flex items-center justify-between">
              <ShieldCheck
                size={15}
                className="text-sky-400"
              />

              <span className="text-2xl font-black text-white">
                {readyCount}
              </span>
            </div>

            <p className="text-[10px] uppercase tracking-widest text-slate-500 font-black mt-3">
              Prontos
            </p>
          </div>

        </div>

      </div>

      {/* LIST */}
      <div className="p-4 space-y-3 max-h-[72vh] overflow-y-auto scrollbar-thin scrollbar-thumb-white/10 scrollbar-track-transparent">

        <AnimatePresence mode="popLayout">

          {players.length === 0 ? (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="text-center py-14 border border-dashed border-white/[0.06] rounded-3xl bg-[#0B1220]"
            >

              <Users
                className="mx-auto text-slate-700 mb-4"
                size={30}
              />

              <p className="text-sm font-black text-slate-300 uppercase tracking-widest">
                sem jogadores
              </p>

            </motion.div>
          ) : (
            players.map((player: any, index) => {
              const isReady =
                player.ready || player.isReady;

              const submitted = !!player.submittedAt;

              const role =
                ROLE_LABELS[player.role] ||
                "Participante";

              return (
                <motion.div
                  key={player.id}
                  layout
                  initial={{ opacity: 0, y: 8 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0 }}
                  transition={{ duration: 0.18 }}
                  className="bg-[#0B1220] border border-white/[0.05] hover:border-orange-500/20 rounded-3xl p-4 transition-all"
                >

                  <div className="flex items-start justify-between gap-4">

                    {/* LEFT */}
                    <div className="flex gap-4 min-w-0 flex-1">

                      <div className="w-12 h-12 rounded-2xl bg-orange-500/10 border border-orange-500/10 flex items-center justify-center shrink-0">
                        <Store
                          size={18}
                          className="text-orange-400"
                        />
                      </div>

                      <div className="min-w-0 flex-1">

                        {/* STORE */}
                        <div className="flex items-start justify-between gap-2">

                          <div className="min-w-0">
                            <p className="text-sm font-black text-white truncate">
                              {player.storeName ||
                                "Sem loja"}
                            </p>

                            <p className="text-[10px] text-slate-500 uppercase tracking-[0.2em] mt-1">
                              jogador #{index + 1}
                            </p>
                          </div>

                        </div>

                        {/* PLAYER */}
                        <div className="flex items-center gap-2 mt-4 text-slate-300">
                          <User2 size={13} />

                          <p className="text-xs truncate font-medium">
                            {player.name}
                          </p>
                        </div>

                        {/* ROLE */}
                        <div className="flex items-center gap-2 mt-2 text-orange-400">
                          <Briefcase size={13} />

                          <span className="text-[10px] uppercase tracking-[0.18em] font-black truncate">
                            {role}
                          </span>
                        </div>

                        {/* BADGES */}
                        <div className="flex flex-wrap gap-2 mt-4">

                          <span
                            className={`px-3 py-1 rounded-xl text-[10px] font-black uppercase tracking-wider border ${
                              isReady
                                ? "text-sky-400 border-sky-500/20 bg-sky-500/10"
                                : "text-slate-500 border-white/[0.06] bg-white/[0.03]"
                            }`}
                          >
                            {isReady
                              ? "pronto"
                              : "preparando"}
                          </span>

                          <span
                            className={`px-3 py-1 rounded-xl text-[10px] font-black uppercase tracking-wider border ${
                              submitted
                                ? "text-emerald-400 border-emerald-500/20 bg-emerald-500/10"
                                : "text-yellow-400 border-yellow-500/20 bg-yellow-500/10"
                            }`}
                          >
                            {submitted
                              ? "enviado"
                              : "aguardando"}
                          </span>

                        </div>

                      </div>

                    </div>

                    {/* ACTION */}
                    <button
                      onClick={() => onKick(player)}
                      className="w-10 h-10 cursor-pointer rounded-2xl bg-red-500/10 hover:bg-red-500 border border-red-500/20 hover:border-red-500 flex items-center justify-center text-red-400 hover:text-white transition-all shrink-0"
                    >
                      <UserMinus size={15} />
                    </button>

                  </div>

                </motion.div>
              );
            })
          )}

        </AnimatePresence>

      </div>
    </aside>
  );
};