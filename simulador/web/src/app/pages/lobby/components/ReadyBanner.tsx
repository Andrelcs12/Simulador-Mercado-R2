"use client";

import React from "react";
import { Activity } from "lucide-react";

interface ReadyBannerProps {
  isReady: boolean;
  onConfirm: () => void;
}

export const ReadyBanner = ({ isReady, onConfirm }: ReadyBannerProps) => {
  return (
    <div className="bg-[#0d121f] border border-slate-800/60 rounded-3xl p-6 relative overflow-hidden shadow-xl">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-6 relative z-10 w-full">
        
        <div className="flex items-center gap-4 min-w-0">
          <div className="w-12 h-12 rounded-2xl bg-orange-500/10 border border-orange-500/30 flex items-center justify-center shrink-0">
            <Activity className="text-orange-400" size={22} />
          </div>
          <div>
            <h2 className="text-xl font-black text-white uppercase tracking-tight">
              Confirmar Entrada
            </h2>
            <p className="text-[11px] text-slate-500 font-black uppercase tracking-[0.15em] mt-1">
              Clique para participar
            </p>
          </div>
        </div>

        <button
          onClick={onConfirm}
          disabled={isReady}
          className={`px-5 py-2.5 rounded-3xl font-black text-sm uppercase tracking-wider transition-all duration-300 flex items-center justify-center whitespace-nowrap ${
            isReady
              ? "bg-emerald-500 text-white cursor-default shadow-[0_0_20px_rgba(16,185,129,0.2)]"
              : "bg-orange-500 hover:bg-orange-600 text-white shadow-[0_4px_20px_rgba(249,115,22,0.3)] hover:shadow-[0_4px_25px_rgba(249,115,22,0.45)] active:scale-[0.98]"
        }`}
      >
  {isReady ? "Pronto ✓" : "Confirmar →"}
</button>

      </div>
    </div>
  );
};