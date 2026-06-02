"use client";

import React from "react";
import { Layers } from "lucide-react";
import { CommercialItem } from "../types";

interface ComercialDetailsProps {
  comercialBreakdown: CommercialItem[];
  isProjected?: boolean;
}

export default function ComercialDetails({ comercialBreakdown = [], isProjected = false }: ComercialDetailsProps) {
  const totals = comercialBreakdown.reduce(
    (acc, cur) => {
      acc.investido += cur.investedCost || 0;
      acc.faturamento += cur.revenue || 0;
      acc.lucroBruto += cur.grossProfit || 0;
      return acc;
    },
    { investido: 0, faturamento: 0, lucroBruto: 0 }
  );

  return (
    <div className="rounded-2xl border border-white/10 bg-white/5 p-5 overflow-x-auto">
      <div className="flex items-center gap-2 mb-4">
        <Layers size={14} className="text-orange-500" />
        {isProjected && (
          <span className="rounded border border-orange-500/30 bg-orange-500/10 px-2 py-0.5 text-[9px] font-black uppercase tracking-wider text-orange-400">
            Projetado
          </span>
        )}
        <p className="text-[10px] font-black uppercase tracking-wider text-slate-400">
          Resultados Comerciais Auditados por Gôndola
        </p>
      </div>
      
      <table className="w-full text-left border-collapse min-w-[620px]">
        <thead>
          <tr className="border-b border-white/10 text-[10px] uppercase font-black text-slate-400 tracking-wider">
            <th className="py-3 pr-4">Categoria</th>
            <th className="py-3 px-4 text-center">Volume</th>
            <th className="py-3 px-4 text-right">Custo de Compra</th>
            <th className="py-3 px-4 text-right">Margem Praticada</th>
            <th className="py-3 px-4 text-right">Faturamento</th>
            <th className="py-3 pl-4 text-right">Lucro Bruto</th>
          </tr>
        </thead>
        <tbody className="text-xs font-medium text-slate-300 divide-y divide-white/5">
          {comercialBreakdown.map((item) => (
            <tr key={item.category} className="hover:bg-white/[0.02] transition-colors">
              <td className="py-3 pr-4 font-bold text-white uppercase">{item.category}</td>
              <td className="py-3 px-4 text-center text-slate-500 font-mono">{item.stockQty ?? 0} u.</td>
              <td className="py-3 px-4 text-right text-slate-400">
                R$ {(item.investedCost ?? 0).toLocaleString("pt-BR")}
              </td>
              <td className="py-3 px-4 text-right text-slate-400 font-bold">{item.markupMargin ?? 0}%</td>
              <td className="py-3 px-4 text-right font-bold text-blue-400">
                R$ {(item.revenue ?? 0).toLocaleString("pt-BR")}
              </td>
              <td className="py-3 pl-4 text-right font-black text-emerald-400">
                R$ {(item.grossProfit ?? 0).toLocaleString("pt-BR")}
              </td>
            </tr>
          ))}
          <tr className="bg-white/[0.02] font-black text-white text-xs">
            <td className="py-4 pr-4" colSpan={2}>Subtotal Comercial</td>
            <td className="py-4 px-4 text-right text-slate-300">R$ {totals.investido.toLocaleString("pt-BR")}</td>
            <td className="py-4 px-4 text-right text-slate-500">—</td>
            <td className="py-4 px-4 text-right text-blue-400">R$ {totals.faturamento.toLocaleString("pt-BR")}</td>
            <td className="py-4 px-4 text-right text-emerald-400">R$ {totals.lucroBruto.toLocaleString("pt-BR")}</td>
          </tr>
        </tbody>
      </table>
    </div>
  );
}
