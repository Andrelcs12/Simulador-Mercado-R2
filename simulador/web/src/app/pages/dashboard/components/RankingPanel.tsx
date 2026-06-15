"use client";

import React from "react";
import { Award, TrendingUp, Users } from "lucide-react";

export default function RankingPanel({ ranking = [], myStoreId }: { ranking: any[]; myStoreId?: string }) {
  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-[10px] font-black uppercase text-slate-500 tracking-[0.2em] flex items-center gap-2">
          <Users size={14} className="text-orange-500" /> Comparativo de Mercado
        </h2>
      </div>

      <div className="space-y-2">
        {ranking.map((r: any, idx: number) => {
          const isMe = r.storeId === myStoreId;
          // EBITDA pode vir ausente/inválido → evita "NaNk"
          const ebitda = Number(r.ebitda);
          const ebitdaK = Number.isFinite(ebitda) ? (ebitda / 1000).toFixed(0) : "0";
          // marketShare já chega do backend como percentual (0–100). Não multiplicar de novo.
          const share = Number(r.marketShare);
          const sharePct = Number.isFinite(share) ? share : 0;
          const barWidth = Math.min(Math.max(sharePct, 0), 100);
          return (
            <div key={r.storeId} className={`p-4 rounded-xl border ${isMe ? "bg-orange-500/10 border-orange-500/30" : "bg-white/[0.02] border-white/5"}`}>
              <div className="flex items-center justify-between mb-3">
                <div className="flex items-center gap-3">
                  <div className={`w-8 h-8 rounded-lg flex items-center justify-center font-black text-xs ${idx === 0 ? "bg-amber-500/20 text-amber-500" : "bg-white/5 text-slate-400"}`}>
                    {r.position}º
                  </div>
                  <span className={`font-black text-sm ${isMe ? "text-orange-400" : "text-white"}`}>
                    {r.name} {isMe && <span className="text-[9px] opacity-60">(Você)</span>}
                  </span>
                </div>
                <div className="text-right">
                  <p className="text-[10px] text-slate-500 uppercase font-black">EBITDA</p>
                  <p className="font-mono font-black text-white">R$ {ebitdaK}k</p>
                </div>
              </div>

              {/* Comparativo de Share */}
              <div className="flex items-center gap-3">
                <div className="flex-1 h-1.5 bg-black/30 rounded-full overflow-hidden">
                  <div className={`h-full ${isMe ? "bg-orange-500" : "bg-sky-500"}`} style={{ width: `${barWidth}%` }} />
                </div>
                <span className="text-[10px] font-black font-mono text-slate-400">{sharePct.toFixed(1)}%</span>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}