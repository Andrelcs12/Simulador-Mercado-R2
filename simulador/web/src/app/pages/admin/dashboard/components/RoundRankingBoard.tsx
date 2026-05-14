"use client";

import React from "react";
import { Trophy } from "lucide-react";

interface Props {
  ranking: {
    storeId: string;
    name: string;
    position: number;
    finalScore: number;
    marketShare: number;
  }[];
  roundNumber: number;
}

export default function AdminRoundRanking({ ranking, roundNumber }: Props) {
  return (
    <div className="bg-[#111827] border border-white/10 rounded-2xl p-5 space-y-4">
      
      <div className="flex items-center gap-2">
        <Trophy className="text-orange-500" />
        <h2 className="font-black uppercase">
          Ranking Rodada {roundNumber}
        </h2>
      </div>

      <div className="space-y-2">
        {ranking.map((r) => (
          <div
            key={r.storeId}
            className="flex justify-between items-center bg-white/5 rounded-xl px-3 py-2"
          >
            <div className="flex items-center gap-3">
              <span className="font-black text-orange-500">
                #{r.position}
              </span>
              <span className="font-semibold">{r.name}</span>
            </div>

            <div className="text-sm text-white/70">
              MS {r.marketShare.toFixed(1)}% • Score {r.finalScore.toFixed(0)}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}