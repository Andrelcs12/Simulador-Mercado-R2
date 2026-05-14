"use client";

import React from "react";

interface Props {
  ranking: any[];
}

export default function RankingPanel({ ranking }: Props) {
  return (
    <div className="lg:col-span-2 bg-white p-8 rounded-2xl border space-y-6">
      <h2 className="font-black text-[#002350] uppercase">
        Ranking da Rodada
      </h2>

      {ranking.map((item) => (
        <div key={item.storeId} className="border-b pb-4">
          <div className="flex justify-between">
            <span className="font-bold uppercase">
              {item.name}
            </span>
            <span>#{item.position}</span>
          </div>

          <div className="flex justify-between text-sm text-gray-500">
            <span>Market Share: {item.marketShare}%</span>
            <span>Score: {item.finalScore}</span>
          </div>

          <div className="h-3 bg-gray-100 rounded-full mt-2">
            <div
              className="h-full bg-[#002350]"
              style={{ width: `${item.marketShare}%` }}
            />
          </div>
        </div>
      ))}
    </div>
  );
}