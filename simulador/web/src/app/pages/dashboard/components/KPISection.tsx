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

interface Props {
  results: any[];
}

export default function KPISection({ results }: Props) {
  const r = results?.[0];

  const kpis = [
    {
      label: "Market Share",
      value: `${r?.marketShare?.toFixed(2) ?? 0}%`,
      icon: <Target />,
      trend: "+0%",
      up: true,
    },
    {
      label: "EBITDA",
      value: `R$ ${(r?.ebitdaValue ?? 0).toLocaleString()}`,
      icon: <TrendingUp />,
      trend: "+0%",
      up: true,
    },
    {
      label: "Perdas",
      value: `${r?.stockBreakLoss ?? 0}%`,
      icon: <AlertTriangle />,
      trend: "-0%",
      up: false,
    },
    {
      label: "CSAT",
      value: r?.csat ?? 0,
      icon: <Smile />,
      trend: "Atual",
      up: true,
    },
  ];

  return (
    <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
      {kpis.map((kpi, i) => (
        <div
          key={i}
          className="bg-white p-6 rounded-2xl border"
        >
          <div className="flex justify-between mb-4">
            {kpi.icon}
            <span
              className={kpi.up ? "text-green-500" : "text-red-500"}
            >
              {kpi.trend}
              {kpi.up ? (
                <ArrowUpRight size={14} />
              ) : (
                <ArrowDownRight size={14} />
              )}
            </span>
          </div>

          <p className="text-[10px] uppercase text-gray-400">
            {kpi.label}
          </p>

          <h3 className="text-2xl font-black text-[#002350]">
            {kpi.value}
          </h3>
        </div>
      ))}
    </div>
  );
}