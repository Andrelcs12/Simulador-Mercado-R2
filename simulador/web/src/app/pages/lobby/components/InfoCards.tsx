import { User, ShieldCheck } from "lucide-react";
import { GameConfig, Player } from "../types";
import { RoundConfig } from "../../admin/dashboard/types";



interface InfoCardsProps {
  myPlayerData: Player | null;
  config: GameConfig;
  connected: boolean;
  roundLabel: string;
  isReady: boolean;
}

export const InfoCards = ({
  myPlayerData,
  config,
  connected,
  roundLabel,
  isReady,
}: InfoCardsProps) => (
  <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-8">

    {/* Participante */}
    <div className="bg-white rounded-[2rem] p-6 border border-slate-100 shadow-sm">
      <div className="flex items-center gap-4 mb-5">
        <div className="w-14 h-14 rounded-2xl bg-orange-100 flex items-center justify-center">
          <User className="text-orange-500" size={28} />
        </div>
        <div>
          <div className="text-[10px] uppercase tracking-widest text-slate-400 font-black">
            Participante
          </div>
          <div className="text-xl font-black text-[#001F3F] uppercase italic">
            {myPlayerData?.name}
          </div>
        </div>
      </div>
      <div className="space-y-3">
        <div className="bg-slate-50 rounded-2xl p-4">
          <div className="text-[10px] uppercase font-black tracking-widest text-slate-400 mb-1">
            Loja
          </div>
          <div className="font-black text-[#001F3F]">
            {myPlayerData?.storeName}
          </div>
        </div>
        <div className="bg-slate-50 rounded-2xl p-4">
          <div className="text-[10px] uppercase font-black tracking-widest text-slate-400 mb-1">
            Cargo
          </div>
          <div className="font-black text-[#001F3F]">
            {myPlayerData?.role || "Participante"}
          </div>
        </div>
      </div>
    </div>

    {/* Facilitador */}
    <div className="bg-white rounded-[2rem] p-6 border border-slate-100 shadow-sm">
      <div className="flex items-center gap-4 mb-5">
        <div className="w-14 h-14 rounded-2xl bg-blue-100 flex items-center justify-center">
          <ShieldCheck className="text-[#001F3F]" size={28} />
        </div>
        <div>
          <div className="text-[10px] uppercase tracking-widest text-slate-400 font-black">
            Facilitador
          </div>
          <div className="text-xl font-black text-[#001F3F] uppercase italic">
            {config.adminName}
          </div>
        </div>
      </div>
      <div className="bg-[#001F3F] rounded-2xl p-5 text-white">
        <div className="text-[10px] uppercase tracking-widest font-black text-white/50 mb-2">
          Status da Sessão
        </div>
        <div className="flex items-center gap-3">
          <div
            className={`w-3 h-3 rounded-full animate-pulse ${
              connected ? "bg-emerald-400" : "bg-red-400"
            }`}
          />
          <div className="font-black uppercase">
            {connected ? "Conectado" : "Reconectando"}
          </div>
        </div>
      </div>
    </div>

    {/* Rodada */}
    <div className="bg-white rounded-[2rem] p-6 border border-slate-100 shadow-sm">
      <div className="text-[10px] uppercase tracking-widest text-slate-400 font-black mb-5">
        Informações da Rodada
      </div>
      <div className="space-y-4">
        <div className="bg-orange-50 rounded-2xl p-4 border border-orange-100">
          <div className="text-[10px] uppercase tracking-widest text-orange-500 font-black mb-1">
            Rodada Atual
          </div>
          <div className="text-3xl font-black text-orange-500">{roundLabel}</div>
        </div>
        <div className="bg-slate-50 rounded-2xl p-4">
          <div className="text-[10px] uppercase tracking-widest text-slate-400 font-black mb-1">
            Seu Status
          </div>
          <div
            className={`font-black uppercase ${
              isReady ? "text-emerald-500" : "text-orange-500"
            }`}
          >
            {isReady ? "Pronto para jogar" : "Aguardando confirmação"}
          </div>
        </div>
      </div>
    </div>
  </div>
);