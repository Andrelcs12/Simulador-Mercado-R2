"use client";

import { ArrowRight, CheckCircle2, Activity } from "lucide-react";

interface ReadyBannerProps {
  isReady: boolean;
  onConfirm: () => void;
}

export const ReadyBanner = ({ isReady, onConfirm }: ReadyBannerProps) => {
  return (
    <div
      className={`rounded-3xl border border-white/[0.06] p-6 sm:p-7 transition-all ${
        isReady
          ? "bg-emerald-500/10 border-emerald-500/20"
          : "bg-[#111827] border-white/[0.06]"
      }`}
    >
      <div className="flex flex-col sm:flex-row items-center justify-between gap-6">

        {/* LEFT */}
        <div className="flex items-center gap-4 min-w-0">

          <div
            className={`w-12 h-12 rounded-2xl flex items-center justify-center border ${
              isReady
                ? "bg-emerald-500/10 border-emerald-500/20"
                : "bg-orange-500/10 border-orange-500/20"
            }`}
          >
            {isReady ? (
              <CheckCircle2 className="text-emerald-400" size={22} />
            ) : (
              <Activity className="text-orange-400" size={22} />
            )}
          </div>

          <div className="min-w-0">

            <h3 className="text-lg font-black uppercase text-white">
              {isReady ? "Pronto" : "Confirmar entrada"}
            </h3>

            <p className="text-[11px] uppercase tracking-[0.25em] text-slate-500 font-black mt-1">
              {isReady
                ? "Aguardando início da rodada"
                : "Clique para participar"}
            </p>

          </div>

        </div>

        {/* ACTION */}
        {!isReady ? (
          <button
            onClick={onConfirm}
            className="w-full sm:w-auto flex items-center justify-center gap-2 px-6 py-3 rounded-2xl bg-orange-500 hover:bg-orange-400 transition-all text-sm font-black uppercase text-white"
          >
            Confirmar
            <ArrowRight size={16} />
          </button>
        ) : (
          <div className="px-5 py-3 rounded-2xl bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 text-xs font-black uppercase tracking-wider">
            Confirmado
          </div>
        )}

      </div>
    </div>
  );
};