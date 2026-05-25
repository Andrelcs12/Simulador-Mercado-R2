"use client";

import type React from "react";
import { useMemo, useState, useEffect } from "react";
import { motion } from "framer-motion";
import {
  CheckCircle2,
  AlertTriangle,
  TrendingUp,
  Users,
  BarChart3,
  DollarSign,
  Target,
  Layers,
} from "lucide-react";

import { useOnboarding } from "../context/OnboardingContext";
import type { AppConfig, CategoriaKey } from "../types/onboarding";

interface SummaryStepProps {
  config: AppConfig;
}

const CAPEX_META: Record<string, { label: string; value: number }> = {
  seguranca: { label: "CAPEX Segurança", value: 50000 },
  equipamentos: { label: "CAPEX Balança / Freezer", value: 75000 },
  redes: { label: "CAPEX Redes", value: 80000 },
  site: { label: "CAPEX Plataforma Digital", value: 65000 },
  selfcheckout: { label: "CAPEX Self Checkout", value: 80000 },
  melhoria: { label: "CAPEX Melhoria Contínua", value: 45000 },
};

const CATEGORIAS: Array<{ id: CategoriaKey; label: string }> = [
  { id: "pereciveis", label: "Perecíveis" },
  { id: "mercearia", label: "Mercearia" },
  { id: "eletro", label: "Eletrodomésticos" },
  { id: "hipel", label: "Higiene & Limpeza" },
];

export default function SummaryStep({ config }: SummaryStepProps) {
  const [isMounted, setIsMounted] = useState(false);

  useEffect(() => {
    setIsMounted(true);
  }, []);

  // 1. Consumindo dados 100% processados do Contexto Global
  const {
    budget,
    capexTotal,
    comercialTotal,
    remainingBudget,
    maxStockPericiveis,
    maxStockMercearia,
    maxStockEletro,
    maxStockHipel,
    estoqueAnalysis,
    faturamentoAnalysis,
    lucroAnalysis,
    faturamentoPrevistoTotal,
    lucroPrevistoTotal,
    performanceMetrics, // 🟢 Todas as contas complexas saíram daqui!
  } = useOnboarding();

  const maxStockByCategory = useMemo<Record<CategoriaKey, number>>(
    () => ({
      pereciveis: maxStockPericiveis,
      mercearia: maxStockMercearia,
      eletro: maxStockEletro,
      hipel: maxStockHipel,
    }),
    [maxStockPericiveis, maxStockMercearia, maxStockEletro, maxStockHipel]
  );

  const okBudget = remainingBudget >= 0;
  const investimentoTotal = capexTotal + comercialTotal;
  const progressPct = Math.min((investimentoTotal / budget) * 100, 100);

  const capexSelecionados = useMemo(() => {
    return Object.entries(config.capex ?? {}).filter(([, v]) => (v ?? 0) > 0);
  }, [config.capex]);

  if (!isMounted) {
    return <div className="p-8 text-slate-400 text-sm">Carregando resumo da simulação...</div>;
  }

  const csatColor = performanceMetrics.csat >= 80 
    ? "text-emerald-400" 
    : performanceMetrics.csat >= 60 
      ? "text-amber-400" 
      : "text-rose-400";

  return (
    <div className="space-y-8">
      {/* HEADER ESCURO */}
      <div className="border-l-4 border-orange-500 pl-5">
        <p className="text-[11px] uppercase tracking-[0.3em] font-black text-orange-500">
          Resumo executivo
        </p>
        <h2 className="text-3xl font-black text-white tracking-tight">
          Performance da <span className="text-orange-500">Simulação</span>
        </h2>
        <p className="text-sm text-slate-400 mt-2">
          Consolidação de decisão operacional, comercial e financeira de mercado.
        </p>
      </div>

      {/* ORÇAMENTO INTEGRADO */}
      <div className="rounded-2xl border border-white/10 bg-white/5 p-5">
        <div className="flex justify-between text-[10px] font-black text-slate-400 uppercase tracking-wider">
          <span>Orçamento da Operação</span>
          <span className="text-white">
            R$ {investimentoTotal.toLocaleString("pt-BR", { minimumFractionDigits: 2 })} / R$ {budget.toLocaleString("pt-BR", { minimumFractionDigits: 2 })}
          </span>
        </div>

        <div className="h-2.5 bg-white/5 rounded-full overflow-hidden mt-3 border border-white/5">
          <motion.div
            className={`h-full ${okBudget ? "bg-orange-500" : "bg-rose-500"}`}
            initial={{ width: 0 }}
            animate={{ width: `${progressPct}%` }}
            transition={{ duration: 0.5, ease: "easeOut" }}
          />
        </div>

        <p className={`text-xs font-black mt-3 uppercase tracking-wider ${okBudget ? "text-emerald-400" : "text-rose-400"}`}>
          {okBudget
            ? `Saldo positivo disponível da loja: R$ ${remainingBudget.toLocaleString("pt-BR", { minimumFractionDigits: 2 })}`
            : `Orçamento excedido em R$ ${Math.abs(remainingBudget).toLocaleString("pt-BR", { minimumFractionDigits: 2 })}`}
        </p>
      </div>

      {/* KPIs PRINCIPAIS */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <KPI label="CSAT" value={`${performanceMetrics.csat}%`} icon={<Users size={14} />} color={csatColor} />
        <KPI label="SLA" value={`${performanceMetrics.sla}%`} icon={<Target size={14} />} color="text-sky-400" />
        <KPI label="Margem Média" value={`${performanceMetrics.margemMedia.toFixed(1)}%`} icon={<TrendingUp size={14} />} color="text-amber-400" />
        <KPI label="EBITDA Previsto" value={`R$ ${performanceMetrics.ebitdaPrevisto.toLocaleString("pt-BR", { maximumFractionDigits: 0 })}`} icon={<DollarSign size={14} />} color={performanceMetrics.ebitdaPrevisto >= 0 ? "text-emerald-400" : "text-rose-400"} />
      </div>

      {/* BREAKDOWN FINANCEIRO */}
      <div className="grid grid-cols-1 gap-6">
        
        {/* TABELA COMERCIAL COMPLETA */}
        <div className="rounded-2xl border border-white/10 bg-white/5 p-5 overflow-x-auto">
          <div className="flex items-center gap-2 mb-4">
            <Layers size={14} className="text-orange-500" />
            <p className="text-[10px] font-black uppercase tracking-wider text-slate-400">
              Detalhamento Comercial por Categoria de Gôndola
            </p>
          </div>
          
          <table className="w-full text-left border-collapse min-w-[620px]">
            <thead>
              <tr className="border-b border-white/10 text-[10px] uppercase font-black text-slate-400 tracking-wider">
                <th className="py-3 pr-4">Categoria</th>
                <th className="py-3 px-4 text-center">Qtd / Máx</th>
                <th className="py-3 px-4 text-right">Investido (Custo)</th>
                <th className="py-3 px-4 text-right">Margem</th>
                <th className="py-3 px-4 text-right">Faturamento Ideal</th>
                <th className="py-3 pl-4 text-right">Lucro Bruto</th>
              </tr>
            </thead>
            <tbody className="text-xs font-medium text-slate-300 divide-y divide-white/5">
              {CATEGORIAS.map((c) => {
                const qtd = config.comercial?.[c.id]?.estoque ?? 0;
                const maxEstoque = maxStockByCategory[c.id];
                const margem = config.comercial?.[c.id]?.margem ?? 0;
                
                const investido = estoqueAnalysis[c.id]?.custoTotal ?? 0;
                const faturamento = faturamentoAnalysis[c.id] ?? 0;
                const lucroBruto = lucroAnalysis[c.id] ?? 0;

                return (
                  <tr key={c.id} className="hover:bg-white/[0.02] transition-colors">
                    <td className="py-3 pr-4 font-bold text-white">{c.label}</td>
                    <td className="py-3 px-4 text-center text-slate-500 font-mono">{qtd} / {maxEstoque} u.</td>
                    <td className="py-3 px-4 text-right font-semibold text-slate-400">
                      R$ {investido.toLocaleString("pt-BR", { minimumFractionDigits: 2 })}
                    </td>
                    <td className="py-3 px-4 text-right text-slate-400 font-bold">{margem}%</td>
                    <td className="py-3 px-4 text-right font-bold text-blue-400">
                      R$ {faturamento.toLocaleString("pt-BR", { minimumFractionDigits: 2 })}
                    </td>
                    <td className="py-3 pl-4 text-right font-black text-emerald-400">
                      R$ {lucroBruto.toLocaleString("pt-BR", { minimumFractionDigits: 2 })}
                    </td>
                  </tr>
                );
              })}
              {/* LINHA DE TOTAIS COMERCIAIS */}
              <tr className="bg-white/[0.02] font-black text-white text-xs">
                <td className="py-4 pr-4" colSpan={2}>Subtotal Comercial</td>
                <td className="py-4 px-4 text-right text-slate-300">
                  R$ {comercialTotal.toLocaleString("pt-BR", { minimumFractionDigits: 2 })}
                </td>
                <td className="py-4 px-4 text-right text-slate-500">—</td>
                <td className="py-4 px-4 text-right text-blue-400">
                  R$ {faturamentoPrevistoTotal.toLocaleString("pt-BR", { minimumFractionDigits: 2 })}
                </td>
                <td className="py-4 px-4 text-right text-emerald-400">
                  R$ {lucroPrevistoTotal.toLocaleString("pt-BR", { minimumFractionDigits: 2 })}
                </td>
              </tr>
            </tbody>
          </table>
        </div>

        {/* APLICAÇÕES EM CAPEX */}
        <Card title="Aplicações em CAPEX">
          {capexSelecionados.length > 0 ? (
            capexSelecionados.map(([id]) => (
              <Row
                key={id}
                label={CAPEX_META[id]?.label ?? id}
                value={CAPEX_META[id]?.value ?? 0}
              />
            ))
          ) : (
            <p className="text-xs text-slate-500 italic py-2">Nenhum investimento em CAPEX selecionado.</p>
          )}
          {capexSelecionados.length > 0 && (
            <div className="pt-3 mt-2 border-t border-white/10 flex justify-between text-xs font-black text-white">
              <span>Subtotal CAPEX</span>
              <span className="text-orange-400">R$ {capexTotal.toLocaleString("pt-BR", { minimumFractionDigits: 2 })}</span>
            </div>
          )}
        </Card>
      </div>

      {/* DETALHAMENTO DO MODELO FINANCEIRO ESTIMADO */}
      <div className="rounded-2xl border border-white/10 bg-white/5 p-5">
        <div className="flex items-center gap-2 mb-4">
          <BarChart3 size={14} className="text-orange-500" />
          <p className="text-[10px] uppercase font-black text-slate-400 tracking-wider">Modelo Financeiro Estimado da Loja</p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <MiniStat label="Investimento Total" value={`R$ ${investimentoTotal.toLocaleString("pt-BR", { maximumFractionDigits: 0 })}`} />
          <MiniStat label="Faturamento Bruto" value={`R$ ${faturamentoPrevistoTotal.toLocaleString("pt-BR", { maximumFractionDigits: 0 })}`} />
          <MiniStat label="Lucro Bruto Comercial" value={`R$ ${lucroPrevistoTotal.toLocaleString("pt-BR", { maximumFractionDigits: 0 })}`} />
          <MiniStat label="Margem EBITDA" value={`${performanceMetrics.ebitdaMargin.toFixed(1)}%`} />
        </div>
      </div>

      {/* STATUS FINAL DE VALIDAÇÃO */}
      <div className={`rounded-2xl border p-4 flex items-center gap-3 transition-colors duration-200 ${
        okBudget ? "bg-emerald-500/10 border-emerald-500/20" : "bg-rose-500/10 border-rose-500/20"
      }`}>
        {okBudget ? (
          <CheckCircle2 className="text-emerald-400 flex-shrink-0" size={18} />
        ) : (
          <AlertTriangle className="text-rose-400 flex-shrink-0" size={18} />
        )}
        <p className={`font-black text-xs uppercase tracking-wider ${okBudget ? "text-emerald-400" : "text-rose-400"}`}>
          {okBudget
            ? "Simulação aprovada: O modelo atende às restrições orçamentárias de mercado."
            : "Simulação recusada: Alocação estourou o caixa. Reduza o estoque ou corte investimentos de CAPEX."}
        </p>
      </div>
    </div>
  );
}

// ─────────────────────────────────────────────
// COMPONENTES AUXILIARES ADAPTADOS AO DARK MODE
// ─────────────────────────────────────────────
interface KPICardProps {
  label: string;
  value: string;
  icon: React.ReactNode;
  color?: string;
}

function KPI({ label, value, icon, color }: KPICardProps) {
  return (
    <div className="rounded-2xl border border-white/10 bg-white/5 p-4 transition-all duration-200 hover:border-white/20">
      <div className="flex items-center gap-2 text-slate-400 text-[10px] font-black uppercase tracking-wider">
        <span className="text-slate-500">{icon}</span>
        {label}
      </div>
      <p className={`text-2xl font-black mt-2 tracking-tight ${color ?? "text-white"}`}>
        {value}
      </p>
    </div>
  );
}

interface StructuralCardProps {
  title: string;
  children: React.ReactNode;
}

function Card({ title, children }: StructuralCardProps) {
  return (
    <div className="rounded-2xl border border-white/10 bg-white/5 p-5">
      <p className="text-[10px] font-black uppercase tracking-wider text-slate-400 mb-4">
        {title}
      </p>
      <div className="space-y-1">{children}</div>
    </div>
  );
}

interface RowProps {
  label: string;
  value: number;
}

function Row({ label, value }: RowProps) {
  return (
    <div className="flex justify-between items-center text-xs py-2.5 border-b border-white/5 last:border-0 gap-4">
      <span className="font-semibold text-slate-300 flex-1">{label}</span>
      <span className="font-bold text-white font-mono">
        R$ {value.toLocaleString("pt-BR", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
      </span>
    </div>
  );
}

interface MiniStatProps {
  label: string;
  value: string;
}

function MiniStat({ label, value }: MiniStatProps) {
  return (
    <div className="p-4 rounded-xl bg-white/[0.02] border border-white/5">
      <p className="text-[9px] uppercase font-black text-slate-500 tracking-wider">
        {label}
      </p>
      <p className="text-base font-black text-white mt-1 tracking-tight">
        {value}
      </p>
    </div>
  );
}