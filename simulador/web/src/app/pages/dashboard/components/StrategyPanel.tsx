"use client";

import React from "react";

export default function StrategyPanel({ configurations = [] }: any) {
  const config = configurations?.[0];
  const capex = config?.capexSelections ?? [];

  return (
    <div>
      <h2 className="text-sm font-black uppercase text-orange-400 mb-4">
        Estratégia
      </h2>

      {capex.length === 0 ? (
        <p className="text-slate-400 text-sm">Sem CAPEX</p>
      ) : (
        capex.map((c: any) => (
          <div
            key={c.capexId}
            className="flex justify-between text-sm border-b border-white/5 py-2"
          >
            <span>{c.capex?.name ?? "CAPEX"}</span>
            <span className="text-slate-300">
              R$ {c.capex?.cost?.toLocaleString("pt-BR") ?? 0}
            </span>
          </div>
        ))
      )}
    </div>
  );
}