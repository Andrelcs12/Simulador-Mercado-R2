import { ArrowRight, CheckCircle2, Activity } from "lucide-react";

interface ReadyBannerProps {
  isReady: boolean;
  onConfirm: () => void;
}

export const ReadyBanner = ({ isReady, onConfirm }: ReadyBannerProps) => {
  return (
    <div
      className={`rounded-[2.5rem] border-b-[10px] p-8 transition-all shadow-xl ${
        isReady
          ? "bg-emerald-500 border-emerald-700"
          : "bg-[#001F3F] border-orange-500"
      }`}
    >
      <div className="flex flex-col lg:flex-row items-center justify-between gap-8">

        <div className="flex items-center gap-6">
          <div className="w-16 h-16 rounded-2xl bg-white flex items-center justify-center">
            {isReady ? (
              <CheckCircle2 className="text-emerald-500" size={34} />
            ) : (
              <Activity className="text-orange-500" size={34} />
            )}
          </div>

          <div>
            <h3 className="text-2xl font-black uppercase text-white">
              {isReady ? "Pronto" : "Confirmar entrada"}
            </h3>

            <p className="text-white/60 text-xs uppercase tracking-widest">
              {isReady
                ? "Aguardando início da rodada"
                : "Clique para participar"}
            </p>
          </div>
        </div>

        {!isReady ? (
          <button
            onClick={onConfirm}
            className="bg-white text-[#001F3F] hover:bg-orange-500 hover:text-white transition px-10 py-5 rounded-2xl font-black uppercase flex items-center gap-3"
          >
            Confirmar
            <ArrowRight size={18} />
          </button>
        ) : (
          <div className="text-white font-black uppercase text-sm bg-white/10 px-6 py-4 rounded-2xl">
            Confirmado ✓
          </div>
        )}
      </div>
    </div>
  );
};