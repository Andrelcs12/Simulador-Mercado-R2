"use client";

import React from "react";

interface Props {
  configurations: any[];
}

export default function StrategyPanel({ configurations }: Props) {
  const config = configurations?.[0];

  const capex = config?.capexSelections || [];

  return (
    <div className="bg-white p-6 rounded-2xl border space-y-4">
      <h3 className="font-black text-[#002350] uppercase">
        CAPEX
      </h3>

      {capex.length === 0 && (
        <p className="text-sm text-gray-400">
          Nenhum CAPEX selecionado
        </p>
      )}

      {capex.map((c: any) => (
        <div
          key={c.id}
          className="flex justify-between text-sm"
        >
          <span className="uppercase">{c.capex?.name}</span>
          <span>R$ {c.capex?.cost?.toLocaleString()}</span>
        </div>
      ))}
    </div>
  );
}