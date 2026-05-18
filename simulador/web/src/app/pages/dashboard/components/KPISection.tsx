"use client";

import React from "react";
import {
  TrendingUp,
  Target,
  AlertTriangle,
  Smile,
  ArrowUpRight,
  ArrowDownRight,
} from "lucide-react";

type KPIs = {
  ebitda: number;
  revenue: number;
  expenses: number;
  cash: number;
  csat: number;
  sla: number;
};

export default function KPISection({ results }: { results?: KPIs | null }) {
  const k = results ?? {
    ebitda: 0,
    revenue: 0,
    expenses: 0,
    cash: 0,
    csat: 0,
    sla: 0,
  };

  const money = (v: number) => v.toLocaleString("pt-BR");

  const items = [
    { label: "EBITDA", value: `R$ ${money(k.ebitda)}`, icon: TrendingUp },
    { label: "Receita", value: `R$ ${money(k.revenue)}`, icon: Target },
    { label: "Despesas", value: `R$ ${money(k.expenses)}`, icon: AlertTriangle },
    { label: "CSAT", value: k.csat.toFixed(1), icon: Smile },
  ];

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-4">
      {items.map((i, idx) => (
        <div
          key={idx}
          className="bg-[#0B1220]/70 border border-white/5 rounded-2xl p-5 backdrop-blur-xl"
        >
          <div className="flex justify-between text-white">
            <i.icon size={18} />
            <ArrowUpRight size={14} className="text-orange-400" />
          </div>

          <p className="text-[10px] text-slate-400 uppercase mt-3">
            {i.label}
          </p>

          <p className="text-xl font-black mt-1">{i.value}</p>
        </div>
      ))}
    </div>
  );
}