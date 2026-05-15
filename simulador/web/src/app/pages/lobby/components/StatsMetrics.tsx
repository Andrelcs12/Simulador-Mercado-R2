import { Users, CheckCircle2, Wifi, WifiOff } from "lucide-react";
import { motion } from "framer-motion";
import { Player } from "../types";

interface StatsMetricsProps {
  players: Player[];
  connected: boolean;
}

export const StatsMetrics = ({ players, connected }: StatsMetricsProps) => {
  const readyCount = players.filter((p) => p.isReady).length;

  const progress =
    players.length > 0
      ? Math.round((readyCount / players.length) * 100)
      : 0;

  return (
    <section className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">

      {/* PLAYERS */}
      <div className="bg-white rounded-[2rem] p-6 border border-slate-100 shadow-sm">
        <div className="flex items-center gap-4">
          <div className="w-14 h-14 rounded-2xl bg-emerald-100 flex items-center justify-center">
            <Users className="text-emerald-500" size={28} />
          </div>

          <div>
            <div className="text-[10px] uppercase tracking-widest text-slate-400 font-black">
              Jogadores
            </div>

            <div className="text-3xl font-black text-[#001F3F]">
              {players.length}
            </div>
          </div>
        </div>
      </div>

      {/* READY */}
      <div className="bg-white rounded-[2rem] p-6 border border-slate-100 shadow-sm">
        <div className="flex items-center gap-4">
          <div className="w-14 h-14 rounded-2xl bg-orange-100 flex items-center justify-center">
            <CheckCircle2 className="text-orange-500" size={28} />
          </div>

          <div>
            <div className="text-[10px] uppercase tracking-widest text-slate-400 font-black">
              Confirmados
            </div>

            <div className="text-3xl font-black text-[#001F3F]">
              {readyCount}
            </div>
          </div>
        </div>

        <div className="mt-4 h-2 bg-slate-100 rounded-full overflow-hidden">
          <motion.div
            className="h-full bg-orange-500 rounded-full"
            initial={{ width: 0 }}
            animate={{ width: `${progress}%` }}
          />
        </div>

        <div className="mt-2 text-[11px] text-slate-400 font-bold">
          {readyCount} de {players.length} prontos
        </div>
      </div>

      {/* CONNECTION */}
      <div className="bg-white rounded-[2rem] p-6 border border-slate-100 shadow-sm">
        <div className="flex items-center gap-4">
          <div
            className={`w-14 h-14 rounded-2xl flex items-center justify-center ${
              connected ? "bg-emerald-100" : "bg-red-100"
            }`}
          >
            {connected ? (
              <Wifi className="text-emerald-500" size={28} />
            ) : (
              <WifiOff className="text-red-500" size={28} />
            )}
          </div>

          <div>
            <div className="text-[10px] uppercase tracking-widest text-slate-400 font-black">
              Conexão
            </div>

            <div
              className={`text-xl font-black uppercase ${
                connected ? "text-emerald-500" : "text-red-500"
              }`}
            >
              {connected ? "ONLINE" : "OFFLINE"}
            </div>
          </div>
        </div>
      </div>

    </section>
  );
};