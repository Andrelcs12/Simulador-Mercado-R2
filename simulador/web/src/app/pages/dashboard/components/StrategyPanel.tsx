"use client";

import React from "react";

interface Props {
  configurations?: {
    store?: { name?: string };
    capexSelections?: {
      capexId: string;
      capex?: {
        name: string;
        cost: number;
      };
    }[];
  }[];
}

export default function StrategyPanel({ configurations = [] }: Props) {
  const config = configurations[0];

  const capex = config?.capexSelections ?? [];

  return (
    <div className="bg-white p-6 rounded-2xl border space-y-4">
      <h3 className="font-black text-[#002350] uppercase text-sm">
        Estratégia (CAPEX)
      </h3>

      {!config && (
        <p className="text-sm text-gray-400">
          Sem dados de estratégia ainda
        </p>
      )}

      {capex.length === 0 ? (
        <p className="text-sm text-gray-400">
          Nenhum CAPEX selecionado
        </p>
      ) : (
        capex.map((c) => (
          <div
            key={c.capexId}
            className="flex justify-between text-sm"
          >
            <span className="uppercase text-[#002350] font-medium">
              {c.capex?.name ?? "CAPEX"}
            </span>

            <span className="font-bold text-gray-600">
              R$ {(c.capex?.cost ?? 0).toLocaleString("pt-BR")}
            </span>
          </div>
        ))
      )}
    </div>
  );
}