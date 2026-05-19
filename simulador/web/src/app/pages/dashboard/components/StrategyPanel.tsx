"use client";

import React from "react";
import { ShieldCheck, Cpu, ShieldAlert } from "lucide-react";

export default function StrategyPanel({ configurations = [], sla = 0 }: { configurations: any[]; sla: number }) {
  const config = configurations?.[0];
  const capex = config?.capexSelections ?? [];
  const operators = config?.operatorsQty ?? 0;
  const srvOperators = config?.serviceOperatorsQty ?? 0;

  // Determinação de Faixa de SLA com base nos parâmetros da dinâmica
  let slaLabel = "Sem Operação";
  let slaColor = "text-rose-400 bg-rose-500/10 border-rose-500/20";
  
  if (srvOperators >= 6) {
    slaLabel = "Excelente (95%)";
    slaColor = "text-emerald-400 border-emerald-500/20 bg-emerald-500/10";
  } else if (srvOperators >= 4) {
    slaLabel = "Bom (90%)";
    slaColor = "text-sky-400 border-sky-500/20 bg-sky-500/10";
  } else if (srvOperators >= 2) {
    slaLabel = "Regular (80%)";
    slaColor = "text-orange-400 border-orange-500/20 bg-orange-500/10";
  } else if (srvOperators === 1) {
    slaLabel = "Crítico (50%)";
    slaColor = "text-amber-500 border-amber-500/20 bg-amber-500/10";
  }

  return (
    <div className="space-y-6">
      {/* Bloco de SLA Comercial */}
      <div>
        <h2 className="text-sm font-black uppercase text-white tracking-wider mb-4 flex items-center gap-2">
          <Cpu size={14} className="text-orange-500" /> Infraestrutura & SLA
        </h2>
        
        <div className="space-y-3 bg-[#0B1220]/40 p-4 rounded-xl border border-white/[0.04]">
          <div className="flex justify-between items-center text-xs">
            <span className="text-slate-400 font-semibold uppercase">Contratação Comercial:</span>
            <span className="font-black text-white">{operators} Operadores</span>
          </div>
          <div className="flex justify-between items-center text-xs">
            <span className="text-slate-400 font-semibold uppercase">Time de Suporte Técnico:</span>
            <span className="font-black text-white">{srvOperators} Operadores</span>
          </div>
          <div className="pt-2 border-t border-white/5 flex justify-between items-center">
            <span className="text-[11px] text-slate-500 uppercase font-black tracking-wider">Status Resolução SLA:</span>
            <span className={`px-2.5 py-1 text-[10px] uppercase font-black tracking-wider rounded-lg border ${slaColor}`}>
              {slaLabel}
            </span>
          </div>
        </div>
      </div>

      {/* Bloco de Ativos CAPEX */}
      <div>
        <h2 className="text-sm font-black uppercase text-white tracking-wider mb-3 flex items-center gap-2">
          <ShieldCheck size={14} className="text-orange-500" /> Capex Aprovado
        </h2>

        <div className="space-y-2 max-h-[220px] overflow-y-auto pr-1">
          {capex.length === 0 ? (
            <div className="text-center py-6 border border-dashed border-white/10 rounded-xl">
              <ShieldAlert size={20} className="text-slate-600 mx-auto mb-1" />
              <p className="text-slate-500 text-xs font-semibold uppercase tracking-wider">Nenhum CAPEX Ativado</p>
            </div>
          ) : (
            capex.map((c: any) => (
              <div
                key={c.capexId}
                className="flex justify-between items-center text-xs bg-[#0B1220]/30 border border-white/[0.04] p-3 rounded-xl"
              >
                <div className="min-w-0">
                  <p className="font-black text-white truncate">{c.capex?.name ?? "CAPEX Ativo"}</p>
                  <p className="text-[9px] text-slate-500 uppercase font-bold tracking-tight mt-0.5">Garantia Integrada</p>
                </div>
                <span className="text-orange-400 font-black font-mono shrink-0 ml-2">
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