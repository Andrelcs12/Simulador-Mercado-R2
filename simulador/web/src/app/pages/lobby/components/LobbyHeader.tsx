import { Hash, Timer } from "lucide-react";

interface LobbyHeaderProps {
  sessionCode: string;
  isGameStarted: boolean;
  tempoRestante: number;
}

function formatTime(seconds: number): string {
  const m = Math.floor(seconds / 60);
  const s = seconds % 60;
  return `${String(m).padStart(2, "0")}:${String(s).padStart(2, "0")}`;
}

export const LobbyHeader = ({
  sessionCode,
  isGameStarted,
  tempoRestante,
}: LobbyHeaderProps) => (
  <div className="flex flex-col xl:flex-row justify-between gap-6 mb-8">
    {/* Código da sala */}
    <div className="bg-white rounded-[2.5rem] p-8 border border-slate-100 shadow-sm flex-1">
      <div className="flex items-center justify-between">
        <div>
          <div className="text-[11px] uppercase tracking-[0.3em] text-slate-400 font-black mb-3">
            Código da Sala
          </div>
          <div className="text-6xl font-black tracking-[0.25em] text-[#001F3F]">
            {sessionCode || "----"}
          </div>
          <div className="mt-4 text-sm text-slate-500 font-medium">
            Compartilhe este código com os participantes
          </div>
        </div>
        <div className="hidden lg:flex w-24 h-24 rounded-[2rem] bg-orange-500 items-center justify-center">
          <Hash className="text-white" size={42} />
        </div>
      </div>
    </div>

    {/* Cronômetro */}
    <div className="bg-[#001F3F] min-w-[340px] rounded-[2.5rem] px-10 py-8 border-b-[10px] border-orange-500 shadow-2xl flex items-center">
      <div className="flex items-center gap-5">
        <div className="w-16 h-16 rounded-3xl bg-white/10 flex items-center justify-center">
          <Timer className="text-orange-500" size={34} />
        </div>
        <div>
          <div className="text-[10px] uppercase tracking-[0.3em] text-white/50 font-black mb-2">
            {isGameStarted ? "Rodada em andamento" : "Aguardando início"}
          </div>
          <div className="text-6xl font-black text-white font-mono tracking-tighter">
            {formatTime(tempoRestante)}
          </div>
        </div>
      </div>
    </div>
  </div>
);