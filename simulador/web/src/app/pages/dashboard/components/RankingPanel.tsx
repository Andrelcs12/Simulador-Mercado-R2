"use client";

import React from "react";
import { Trophy, Medal } from "lucide-react";

export default function RankingPanel({ ranking = [], myStoreId }: { ranking: any[]; myStoreId?: string }) {
  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <div>
          <h2 className="text-sm font-black uppercase text-white tracking-wider">
            Posicionamento do Mercado
          </h2>
          <p className="text-xs text-slate-500 mt-0.5">Critério de desempate e vitória por % EBITDA</p>
        </div>
        <Trophy size={16} className="text-orange-500" />
      </div>

      <div className="space-y-3">
        {ranking.length === 0 ? (
          <p className="text-slate-500 text-xs font-medium py-4 uppercase tracking-wider">Aguardando processamento de vendas...</p>
        ) : (
          ranking.map((r: any, idx: number) => {
            const isMe = r.storeId === myStoreId;
            return (
              <div 
                key={r.storeId} 
                className={`p-4 rounded-xl border transition-all duration-200 
                  ${isMe 
                    ? "bg-orange-500/10 border-orange-500/30 shadow-md shadow-orange-500/5" 
                    : "bg-[#0B1220]/50 border-white/[0.04]"
                  }`}
              >
                <div className="flex justify-between items-center">
                  <div className="flex items-center gap-3">
                    <span className={`w-6 h-6 rounded-lg flex items-center justify-center text-xs font-black
                      ${idx === 0 ? "bg-amber-500/20 text-amber-400" : ""}
                      ${idx === 1 ? "bg-slate-400/20 text-slate-300" : ""}
                      ${idx > 1 ? "bg-white/5 text-slate-500" : ""}
                    `}>
                      {r.position}º
                    </span>
                    <span className={`font-black text-sm tracking-tight ${isMe ? "text-orange-400" : "text-white"}`}>
                      {r.name} {isMe && "(Sua Loja)"}
                    </span>
                  </div>
                  
                  <div className="text-right">
                    <span className="text-xs font-black text-white font-mono">
                      {r.finalScore ? `${Math.round(r.finalScore)} pts` : "-"}
                    </span>
                  </div>
                </div>

                <div className="mt-3 grid grid-cols-2 text-[11px] text-slate-400 font-semibold uppercase tracking-wider">
                  <div>Market Share: <span className="text-white font-black">{((r.marketShare ?? 0) * 100).toFixed(1)}%</span></div>
                  <div className="text-right">Aproveitamento Máximo</div>
                </div>

                {/* Progress Bar do Market Share */}
                <div className="h-1.5 bg-white/5 rounded-full overflow-hidden mt-2">
                  <div
                    className={`h-full transition-all duration-500 ${isMe ? "bg-orange-500" : "bg-sky-500/70"}`}
                    style={{ width: `${Math.min((r.marketShare ?? 0) * 100, 100)}%` }}
                  />
                </div>
              </div>
            );
          })
        )}
      </div>
    </div>
  );
}