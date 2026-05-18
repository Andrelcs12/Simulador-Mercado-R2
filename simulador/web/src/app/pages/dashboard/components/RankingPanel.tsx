"use client";

import React from "react";

export default function RankingPanel({ ranking = [] }: any) {
  return (
    <div>
      <h2 className="text-sm font-black uppercase text-orange-400 mb-4">
        Ranking da Rodada
      </h2>

      <div className="space-y-4">
        {ranking.length === 0 ? (
          <p className="text-slate-400 text-sm">Sem dados ainda</p>
        ) : (
          ranking.map((r: any) => (
            <div key={r.storeId} className="space-y-2">
              <div className="flex justify-between">
                <span className="font-black">{r.name}</span>
                <span className="text-slate-400">#{r.position}</span>
              </div>

              <div className="text-xs text-slate-400 flex justify-between">
                <span>{r.marketShare.toFixed(1)}%</span>
                <span>{r.finalScore}</span>
              </div>

              <div className="h-2 bg-white/5 rounded-full overflow-hidden">
                <div
                  className="h-full bg-orange-500"
                  style={{ width: `${Math.min(r.marketShare, 100)}%` }}
                />
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
}