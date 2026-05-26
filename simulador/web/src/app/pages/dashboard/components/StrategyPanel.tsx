"use client";

import React from "react";
import { Cpu, ShieldCheck, ShieldAlert } from "lucide-react";

export default function StrategyPanel({ configurations = [], sla = 0 }: { configurations: any[]; sla: number }) {
  const config = configurations?.[0];
  const capex = config?.capexSelections ?? [];
  const operators = config?.operatorsQty ?? 0;
  const srvOperators = config?.serviceOperatorsQty ?? 0;

  // Lógica de SLA
  let slaLabel = "Sem Operação";
  let slaColor = "text-rose-400 border-rose-500/20 bg-rose-500/10";
  
  if (srvOperators >= 6) { slaLabel = "Excelente (95%)"; slaColor = "text-emerald-400 border-emerald-500/20 bg-emerald-500/10"; }
  else if (srvOperators >= 4) { slaLabel = "Bom (90%)"; slaColor = "text-sky-400 border-sky-500/20 bg-sky-500/10"; }
  else if (srvOperators >= 2) { slaLabel = "Regular (80%)"; slaColor = "text-orange-400 border-orange-500/20 bg-orange-500/10"; }
  else if (srvOperators === 1) { slaLabel = "Crítico (50%)"; slaColor = "text-amber-500 border-amber-500/20 bg-amber-500/10"; }

  return (
    <div className="space-y-8">
      {/* SLA BLOCK */}
      <div>
        <h2 className="text-[10px] font-black uppercase text-slate-500 tracking-[0.2em] mb-4 flex items-center gap-2">
          <Cpu size={14} className="text-orange-500" /> Infraestrutura & SLA
        </h2>
        
        <div className="space-y-3 bg-white/[0.02] p-4 rounded-xl border border-white/5">
          <div className="flex justify-between items-center text-xs">
            <span className="text-slate-400 font-bold uppercase">Operação:</span>
            <span className="font-black text-white">{operators} Operadores</span>
          </div>
          <div className="flex justify-between items-center text-xs">
            <span className="text-slate-400 font-bold uppercase">Suporte Técnico:</span>
            <span className="font-black text-white">{srvOperators} Operadores</span>
          </div>
          <div className="pt-3 border-t border-white/5 flex justify-between items-center">
            <span className="text-[10px] text-slate-500 uppercase font-black tracking-wider">Eficiência SLA:</span>
            <span className={`px-3 py-1 text-[10px] uppercase font-black tracking-wider rounded-lg border ${slaColor}`}>
              {slaLabel}
            </span>
          </div>
        </div>
      </div>

      {/* CAPEX BLOCK */}
      <div>
        <h2 className="text-[10px] font-black uppercase text-slate-500 tracking-[0.2em] mb-4 flex items-center gap-2">
          <ShieldCheck size={14} className="text-orange-500" /> Investimentos CAPEX
        </h2>

        <div className="space-y-2">
          {capex.length === 0 ? (
            <div className="text-center py-6 border border-dashed border-white/10 rounded-xl">
              <ShieldAlert size={20} className="text-slate-700 mx-auto mb-1" />
              <p className="text-slate-600 text-[10px] font-black uppercase tracking-wider">Nenhum Ativo</p>
            </div>
          ) : (
            capex.map((c: any) => (
              <div key={c.capexId} className="flex justify-between items-center text-xs bg-white/[0.02] border border-white/5 p-3 rounded-xl">
                <div>
                  <p className="font-black text-white uppercase">{c.capex?.name ?? "CAPEX"}</p>
                </div>
                <span className="text-orange-500 font-black font-mono">
                  R$ {c.capex?.cost?.toLocaleString("pt-BR") ?? 0}
                </span>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
}