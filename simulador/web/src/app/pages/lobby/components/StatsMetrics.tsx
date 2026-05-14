import { Users, CheckCircle2, Wifi, WifiOff } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { Player } from "../types";

interface StatsMetricsProps {
  players: Player[];
  connected: boolean;
}

export const StatsMetrics = ({ players, connected }: StatsMetricsProps) => {
  const readyCount = players.filter((p) => p.isReady).length;

  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">

      {/* Total jogadores */}
      <div className="bg-white rounded-[2rem] p-6 border border-slate-100 shadow-sm">
        <div className="flex items-center gap-4">
          <div className="w-14 h-14 rounded-2xl bg-emerald-100 flex items-center justify-center">
            <Users className="text-emerald-500" size={28} />
          </div>
          <div>
            <div className="text-[10px] uppercase tracking-widest text-slate-400 font-black">
              Jogadores
            </div>
            <AnimatePresence mode="wait">
              <motion.div
                key={players.length}
                initial={{ opacity: 0, y: -6 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: 6 }}
                className="text-3xl font-black text-[#001F3F]"
              >
                {players.length}
              </motion.div>
            </AnimatePresence>
          </div>
        </div>

        {/* Lista compacta de nomes - estilo Kahoot */}
        {players.length > 0 && (
          <div className="mt-4 flex flex-wrap gap-2">
            <AnimatePresence>
              {players.map((p) => (
                <motion.span
                  key={p.id}
                  initial={{ opacity: 0, scale: 0.8 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0, scale: 0.8 }}
                  className={`text-[11px] font-bold px-3 py-1 rounded-full border ${
                    p.isReady
                      ? "bg-emerald-50 border-emerald-200 text-emerald-600"
                      : "bg-slate-50 border-slate-200 text-slate-500"
                  }`}
                >
                  {p.storeName}
                </motion.span>
              ))}
            </AnimatePresence>
          </div>
        )}
      </div>

      {/* Confirmados */}
      <div className="bg-white rounded-[2rem] p-6 border border-slate-100 shadow-sm">
        <div className="flex items-center gap-4">
          <div className="w-14 h-14 rounded-2xl bg-orange-100 flex items-center justify-center">
            <CheckCircle2 className="text-orange-500" size={28} />
          </div>
          <div>
            <div className="text-[10px] uppercase tracking-widest text-slate-400 font-black">
              Confirmados
            </div>
            <AnimatePresence mode="wait">
              <motion.div
                key={readyCount}
                initial={{ opacity: 0, y: -6 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: 6 }}
                className="text-3xl font-black text-[#001F3F]"
              >
                {readyCount}
              </motion.div>
            </AnimatePresence>
          </div>
        </div>
        {players.length > 0 && (
          <div className="mt-4 h-2 bg-slate-100 rounded-full overflow-hidden">
            <motion.div
              className="h-full bg-orange-500 rounded-full"
              initial={{ width: 0 }}
              animate={{ width: `${(readyCount / players.length) * 100}%` }}
              transition={{ duration: 0.4 }}
            />
          </div>
        )}
        {players.length > 0 && (
          <div className="mt-2 text-[11px] text-slate-400 font-bold">
            {readyCount} de {players.length} prontos
          </div>
        )}
      </div>

      {/* Conexão */}
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
    </div>
  );
};