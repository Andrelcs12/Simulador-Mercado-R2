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
  results?: {
    ebitda: number;
    revenue: number;
    expenses: number;
    cash: number;
    csat: number;
    sla: number;
  };
}

export default function KPISection({ results }: Props) {
  const kpis = [
    {
      label: "EBITDA",
      value: `R$ ${(results?.ebitda ?? 0).toLocaleString()}`,
      icon: <TrendingUp />,
      trend: "+0%",
      up: true,
    },
    {
      label: "Receita",
      value: `R$ ${(results?.revenue ?? 0).toLocaleString()}`,
      icon: <Target />,
      trend: "+0%",
      up: true,
    },
    {
      label: "Despesas",
      value: `R$ ${(results?.expenses ?? 0).toLocaleString()}`,
      icon: <AlertTriangle />,
      trend: "-0%",
      up: false,
    },
    {
      label: "CSAT",
      value: results?.csat ?? 0,
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
          <div className="flex justify-between items-center mb-4">
            <div className="text-[#002350]">
              {kpi.icon}
            </div>

            <span
              className={`flex items-center gap-1 text-sm font-bold ${
                kpi.up
                  ? "text-green-500"
                  : "text-red-500"
              }`}
            >
              {kpi.trend}

              {kpi.up ? (
                <ArrowUpRight size={14} />
              ) : (
                <ArrowDownRight size={14} />
              )}
            </span>
          </div>

          <p className="text-[10px] uppercase text-gray-400 font-black">
            {kpi.label}
          </p>

          <h3 className="text-2xl font-black text-[#002350] mt-2">
            {kpi.value}
          </h3>
        </div>
      ))}
    </div>
  );
}