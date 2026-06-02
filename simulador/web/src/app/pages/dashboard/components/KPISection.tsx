"use client";

import React from "react";
import { TrendingUp, Target, ShieldAlert, Smile, DollarSign, Headphones } from "lucide-react";

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
  isProjected?: boolean;
}

export default function KPISection({ results, cashBalance, isProjected = false }: KPISectionProps) {
  const k = results ?? { ebitda: 0, revenue: 0, expenses: 0, cash: 0, csat: 0, sla: 0 };
  
  const ebitdaMargin = k.revenue > 0 ? (k.ebitda / k.revenue) * 100 : 0;
  const money = (v: number) => `R$ ${Math.round(v).toLocaleString("pt-BR")}`;

  const items = [
    { label: isProjected ? "EBITDA Projetado" : "Resultado EBITDA", value: money(k.ebitda), sub: `Margem: ${ebitdaMargin.toFixed(1)}%`, icon: TrendingUp, color: "text-emerald-400" },
    { label: "Receita de Vendas", value: money(k.revenue), sub: isProjected ? "Faturamento ideal enviado" : "Base de Cesta Coletada", icon: Target, color: "text-orange-400" },
    { label: "Custo Operacional", value: money(k.expenses), sub: isProjected ? "Compra, CAPEX e folha" : "Incluso CMV e Folha", icon: ShieldAlert, color: "text-rose-400" },
    { label: "Saldo em Caixa", value: money(cashBalance), sub: "Liquidez Imediata", icon: DollarSign, color: "text-purple-400" },
    { label: "CSAT", value: `${Math.round(k.csat)}%`, sub: "Experiencia do cliente", icon: Smile, color: "text-sky-400" },
    { label: "SLA", value: `${Math.round(k.sla)}%`, sub: "Nivel de atendimento", icon: Headphones, color: "text-amber-400" },
  ];

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-6 gap-4">
      {items.map((item, idx) => (
        <div key={idx} className="bg-[#111827]/60 border border-white/10 rounded-2xl p-5 hover:border-white/20 transition-all">
          <div className="flex justify-between items-center mb-3">
            <span className="text-[10px] uppercase font-black tracking-widest text-slate-500">{item.label}</span>
            <item.icon size={14} className={item.color} />
          </div>
          <p className="text-xl font-black text-white tracking-tight">{item.value}</p>
          <p className="text-[10px] text-slate-400 font-bold mt-1 uppercase">{item.sub}</p>
        </div>
      ))}
    </div>
  );
}
