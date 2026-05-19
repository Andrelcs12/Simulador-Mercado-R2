"use client";

import React from "react";
import { TrendingUp, Target, ShieldAlert, Smile } from "lucide-react";

type KPIs = {
  ebitda: number;
  revenue: number;
  expenses: number;
  cash: number;
  csat: number;
  sla: number;
};

interface KPISectionProps {
  results?: KPIs | null;
  cashBalance: number;
}

export default function KPISection({ results, cashBalance }: KPISectionProps) {
  const k = results ?? { ebitda: 0, revenue: 0, expenses: 0, cash: 0, csat: 0, sla: 0 };
  
  // Cálculo da margem EBITDA baseado nas regras do jogo
  const ebitdaMargin = k.revenue > 0 ? (k.ebitda / k.revenue) * 100 : 0;
  const money = (v: number) => Math.round(v).toLocaleString("pt-BR");

  const items = [
    { 
      label: "Resultado EBITDA", 
      value: `R$ ${money(k.ebitda)}`, 
      sub: `Margem: ${ebitdaMargin.toFixed(1)}%`,
      icon: TrendingUp, 
      color: "text-emerald-400" 
    },
    { 
      label: "Receita de Vendas", 
      value: `R$ ${money(k.revenue)}`, 
      sub: "Base de Cesta Coletada",
      icon: Target, 
      color: "text-orange-400" 
    },
    { 
      label: "Custo Fixo & Variável", 
      value: `R$ ${money(k.expenses)}`, 
      sub: "Incluso CMV e Folha",
      icon: ShieldAlert, 
      color: "text-rose-400" 
    },
    { 
      label: "Nível de Serviço CSAT", 
      value: `${k.csat.toFixed(1)}%`, 
      sub: "Quadro Ideal vs Prova",
      icon: Smile, 
      color: "text-sky-400" 
    },
  ];

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-4">
      {items.map((item, idx) => (
        <div key={idx} className="bg-[#111827] border border-white/[0.06] rounded-2xl p-5 shadow-lg">
          <div className="flex justify-between items-center text-slate-400">
            <span className="text-[10px] uppercase font-black tracking-widest text-slate-500">{item.label}</span>
            <item.icon size={16} className={item.color} />
          </div>
          <p className="text-2xl font-black mt-2 text-white tracking-tight">{item.value}</p>
          <p className="text-[11px] text-slate-400 font-medium mt-1">{item.sub}</p>
        </div>
      ))}
    </div>
  );
}