import { ArrowRight, CheckCircle2, Activity } from "lucide-react";

interface ReadyBannerProps {
  isReady: boolean;
  onConfirm: () => void;
}

export const ReadyBanner = ({ isReady, onConfirm }: ReadyBannerProps) => (
  <div
    className={`rounded-[2.8rem] border-b-[10px] p-8 lg:p-10 transition-all ${
      isReady
        ? "bg-emerald-500 border-emerald-700"
        : "bg-[#001F3F] border-orange-500"
    }`}
  >
    <div className="flex flex-col xl:flex-row items-center justify-between gap-8">
      <div className="flex items-center gap-6">
        <div className="w-20 h-20 rounded-[2rem] bg-white flex items-center justify-center shadow-xl">
          {isReady ? (
            <CheckCircle2 className="text-emerald-500" size={42} />
          ) : (
            <Activity className="text-orange-500" size={42} />
          )}
        </div>
        <div>
          <h3 className="text-3xl font-black uppercase italic text-white mb-2">
            {isReady ? "Pronto para iniciar" : "Confirmar participação"}
          </h3>
          <p className="text-white/60 uppercase tracking-[0.2em] text-xs font-black">
            {isReady
              ? "Aguardando o facilitador iniciar a rodada"
              : "Clique abaixo para entrar oficialmente"}
          </p>
        </div>
      </div>

      {!isReady ? (
        <button
          onClick={onConfirm}
          className="group bg-white text-[#001F3F] hover:bg-orange-500 hover:text-white transition-all px-12 py-6 rounded-[2rem] font-black uppercase flex items-center gap-4 shadow-2xl"
        >
          Confirmar Entrada
          <ArrowRight
            size={22}
            className="group-hover:translate-x-1 transition-transform"
          />
        </button>
      ) : (
        <div className="bg-white/10 border border-white/10 px-8 py-5 rounded-3xl">
          <div className="text-white font-black uppercase text-sm tracking-widest">
            Entrada confirmada ✓
          </div>
        </div>
      )}
    </div>
  </div>
);