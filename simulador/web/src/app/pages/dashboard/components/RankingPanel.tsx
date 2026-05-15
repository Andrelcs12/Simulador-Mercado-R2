"use client";

import React from "react";

interface Props {
  ranking?: {
    storeId: string;
    name: string;
    position: number;
    marketShare: number;
    finalScore: number;
  }[];
}

export default function RankingPanel({ ranking = [] }: Props) {
  return (
    <div className="lg:col-span-2 bg-white p-6 rounded-2xl border space-y-4">
      <h2 className="font-black text-[#002350] uppercase text-sm">
        Ranking da Rodada
      </h2>

      {ranking.length === 0 ? (
        <p className="text-sm text-gray-400">
          Ranking ainda não disponível
        </p>
      ) : (
        ranking.map((item) => (
          <div key={item.storeId} className="space-y-2 border-b pb-4 last:border-none">
            <div className="flex justify-between items-center">
              <span className="font-bold uppercase text-sm text-[#002350]">
                {item.name}
              </span>

              <span className="text-xs font-black text-gray-500">
                #{item.position}
              </span>
            </div>

            <div className="flex justify-between text-xs text-gray-500">
              <span>Market Share: {item.marketShare.toFixed(1)}%</span>
              <span>Score: {item.finalScore.toLocaleString("pt-BR")}</span>
            </div>

            <div className="h-2 bg-gray-100 rounded-full overflow-hidden">
              <div
                className="h-full bg-[#002350]"
                style={{ width: `${Math.min(item.marketShare, 100)}%` }}
              />
            </div>
          </div>
        ))
      )}
    </div>
  );
}