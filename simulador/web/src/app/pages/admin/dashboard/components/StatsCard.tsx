import { CircleDot, Trophy, Users, BarChart2 } from "lucide-react";
import { Session } from "../types";

interface StatsCardsProps {
  session: Session | null;
  playersCount: number;
  submittedCount: number;
}

export const StatsCards = ({ session, playersCount, submittedCount }: StatsCardsProps) => {
  const stats = [
    {
      icon: <CircleDot size={16} className="text-orange-400" />,
      label: "Status",
      value:
        session?.status === "IN_PROGRESS"
          ? "Em Progresso"
          : session?.status === "FINISHED"
          ? "Encerrada"
          : "Aguardando",
    },
    {
      icon: <Trophy size={16} className="text-yellow-400" />,
      label: "Rodada Atual",
      value: `${session?.currentRound ?? 0} / ${session?.totalRounds ?? "—"}`,
    },
    {
      icon: <Users size={16} className="text-sky-400" />,
      label: "Jogadores",
      value: playersCount,
    },
    {
      icon: <BarChart2 size={16} className="text-emerald-400" />,
      label: "Enviaram",
      value: `${submittedCount} / ${playersCount}`,
    },
  ];

  return (
    <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
      {stats.map((stat) => (
        <div
          key={stat.label}
          className="bg-[#111827] border border-white/[0.06] rounded-2xl px-4 py-3 flex flex-col gap-2"
        >
          <div className="flex items-center gap-1.5 text-slate-500 text-xs font-black uppercase tracking-wider">
            {stat.icon}
            {stat.label}
          </div>
          <div className="text-xl font-black text-white">{stat.value}</div>
        </div>
      ))}
    </div>
  );
};