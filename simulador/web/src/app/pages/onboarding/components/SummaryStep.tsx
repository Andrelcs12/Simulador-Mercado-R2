"use client";

import React, { useMemo, useState, useEffect } from "react";
import { motion } from "framer-motion";
import {
  CheckCircle2,
  AlertTriangle,
  TrendingUp,
  Users,
  BarChart3,
  DollarSign,
  Target,
} from "lucide-react";

import { AppConfig } from "../types/onboarding";
import { useOnboarding, COMERCIAL_PRICES } from "../context/OnboardingContext";

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

const CATEGORIAS = [
  { id: "pereciveis" as const, label: "Perecíveis" },
  { id: "mercearia" as const, label: "Mercearia" },
  { id: "eletro" as const, label: "Eletrodomésticos" },
  { id: "hipel" as const, label: "Higiene & Limpeza" },
];

const COMERCIAL_MAX_STOCK: Record<string, number> = {
  pereciveis: 5000,
  mercearia: 4000,
  eletro: 400,
  hipel: 3000,
};

function calculateCSAT(operadoresCaixa: number, quizScore: number): number {
  const operatorFactor = Math.min(operadoresCaixa / 10, 1);
  const quizFactor = Math.min(Math.max(quizScore / 100, 0), 1);
  return Math.round(operatorFactor * quizFactor * 100);
}

function calculateSLA(serviceOps: number): number {
  if (serviceOps >= 8) return 95;
  if (serviceOps >= 6) return 85;
  if (serviceOps >= 4) return 75;
  if (serviceOps >= 2) return 60;
  return 40;
}

export default function SummaryStep({ config }: SummaryStepProps) {
  const [isMounted, setIsMounted] = useState(false);

  useEffect(() => {
    setIsMounted(true);
  }, []);

  const { budget, capexTotal, comercialTotal, remainingBudget } = useOnboarding();

  const opCaixa = config.operadoresCaixa ?? 5;
  const opAtendimento = config.operadoresAtendimento ?? 3;
  const quiz = config.quizScore ?? 100;

  const okBudget = remainingBudget >= 0;
  const investimentoTotal = capexTotal + comercialTotal;
  const progressPct = Math.min((investimentoTotal / budget) * 100, 100);

  const performanceData = useMemo(() => {
    const totalOps = opCaixa + opAtendimento;
    const csat = calculateCSAT(opCaixa, quiz);
    const sla = calculateSLA(opAtendimento);

    const totalCategorias = CATEGORIAS.length;
    const margemMedia = totalCategorias > 0
      ? CATEGORIAS.reduce((acc, c) => acc + (config.comercial?.[c.id]?.margem ?? 0), 0) / totalCategorias
      : 0;

    const revenue = comercialTotal * 1.65 * (1 + margemMedia / 100);
    const opex = (investimentoTotal * 0.08) + (totalOps * 2400);
    const ebitda = revenue - opex;
    const ebitdaMargin = revenue > 0 ? (ebitda / revenue) * 100 : 0;

    return { csat, sla, margemMedia, revenue, opex, ebitda, ebitdaMargin };
  }, [opCaixa, opAtendimento, quiz, config.comercial, comercialTotal, investimentoTotal]);

  const capexSelecionados = useMemo(() => {
    return Object.entries(config.capex ?? {}).filter(([, v]) => (v ?? 0) > 0);
  }, [config.capex]);

  if (!isMounted) {
    return <div className="p-8 text-slate-400 text-sm">Carregando resumo da simulação...</div>;
  }

  const csatColor = performanceData.csat >= 80 
    ? "text-emerald-600" 
    : performanceData.csat >= 60 
      ? "text-yellow-600" 
      : "text-red-500";

  return (
    <div className="space-y-10">
      {/* HEADER */}
      <div className="border-l-4 border-orange-500 pl-5">
        <p className="text-[11px] uppercase tracking-[0.35em] font-black text-orange-500">
          Resumo executivo
        </p>
        <h2 className="text-3xl font-black text-slate-900 tracking-tight">
          Performance da <span className="text-orange-500">Simulação</span>
        </h2>
        <p className="text-sm text-slate-500 mt-1">
          Consolidação de decisão operacional, comercial e financeira.
        </p>
      </div>

      {/* ORÇAMENTO INTEGRADO */}
      <div className="rounded-2xl border border-slate-200/80 bg-white p-5 shadow-sm">
        <div className="flex justify-between text-xs font-black text-slate-500 uppercase tracking-wider">
          <span>Orçamento da Operação</span>
          <span>
            R$ {investimentoTotal.toLocaleString("pt-BR", { minimumFractionDigits: 2 })} / R$ {budget.toLocaleString("pt-BR", { minimumFractionDigits: 2 })}
          </span>
        </div>

        <div className="h-2.5 bg-slate-100 rounded-full overflow-hidden mt-3">
          <motion.div
            className={`h-full ${okBudget ? "bg-orange-500" : "bg-red-500"}`}
            initial={{ width: 0 }}
            animate={{ width: `${progressPct}%` }}
            transition={{ duration: 0.5, ease: "easeOut" }}
          />
        </div>

        <p className={`text-sm font-black mt-3 ${okBudget ? "text-emerald-600" : "text-red-600"}`}>
          {okBudget
            ? `Saldo positivo disponível da loja: R$ ${remainingBudget.toLocaleString("pt-BR", { minimumFractionDigits: 2 })}`
            : `Orçamento excedido em R$ ${Math.abs(remainingBudget).toLocaleString("pt-BR", { minimumFractionDigits: 2 })}`}
        </p>
      </div>

      {/* KPIs PRINCIPAIS */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <KPI label="CSAT" value={`${performanceData.csat}%`} icon={<Users size={16} />} color={csatColor} />
        <KPI label="SLA" value={`${performanceData.sla}%`} icon={<Target size={16} />} />
        <KPI label="Margem Média" value={`${performanceData.margemMedia.toFixed(1)}%`} icon={<TrendingUp size={16} />} />
        <KPI label="EBITDA Proved" value={`R$ ${performanceData.ebitda.toLocaleString("pt-BR", { minimumFractionDigits: 2 })}`} icon={<DollarSign size={16} />} color={performanceData.ebitda >= 0 ? "text-emerald-600" : "text-red-500"} />
      </div>

      {/* BREAKDOWN FINANCEIRO */}
      <div className="grid md:grid-cols-2 gap-5">
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
            <p className="text-xs text-slate-400 italic py-2">Nenhum investimento em CAPEX selecionado.</p>
          )}
          {capexSelecionados.length > 0 && (
            <div className="pt-2.5 mt-2 border-t border-slate-100 flex justify-between text-xs font-black text-slate-900">
              <span>Subtotal CAPEX</span>
              <span>R$ {capexTotal.toLocaleString("pt-BR", { minimumFractionDigits: 2 })}</span>
            </div>
          )}
        </Card>

        <Card title="Alocação Comercial de Estoque">
          <div className="flex justify-between text-[10px] uppercase font-black text-slate-400 px-0.5 mb-2 gap-4 tracking-wider">
            <span className="flex-1">Categoria</span>
            <span className="min-w-[95px] text-center">Qtd / Máx</span>
            <span className="min-w-[50px] text-right">Part. %</span>
            <span className="min-w-[100px] text-right">Total Investido</span>
          </div>

          {CATEGORIAS.map((c) => {
            const qtd = config.comercial?.[c.id]?.estoque ?? 0;
            const maxEstoque = COMERCIAL_MAX_STOCK[c.id] || 1;
            const custoUnitarioReal = COMERCIAL_PRICES[c.id] || 0;
            const itemTotalCost = qtd * custoUnitarioReal;

            // Formatação limpa com un. embutido conforme solicitado
            const fractionLabel = `${qtd} / ${maxEstoque} un.`;
            const stockCapacityPercentage = (qtd / maxEstoque) * 100;

            return (
              <Row
                key={c.id}
                label={c.label}
                fraction={fractionLabel}
                percentage={`${stockCapacityPercentage.toFixed(1)}%`}
                value={itemTotalCost}
              />
            );
          })}
          <div className="pt-2.5 mt-2 border-t border-slate-100 flex justify-between text-xs font-black text-slate-900">
            <span>Subtotal Estoque</span>
            <span className="min-w-[100px] text-right">R$ {comercialTotal.toLocaleString("pt-BR", { minimumFractionDigits: 2 })}</span>
          </div>
        </Card>
      </div>

      {/* DETALHAMENTO DO MODELO FINANCEIRO ESTIMADO */}
      <div className="rounded-2xl border border-slate-200/80 bg-white p-5 shadow-sm">
        <div className="flex items-center gap-2 mb-4">
          <BarChart3 size={16} className="text-orange-500" />
          <p className="font-black text-slate-900">Modelo Financeiro Estimado</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
          <MiniStat label="Receita Bruta Estimada" value={`R$ ${performanceData.revenue.toLocaleString("pt-BR", { minimumFractionDigits: 2 })}`} />
          <MiniStat label="OPEX Projetado (Equipe + Operações)" value={`R$ ${performanceData.opex.toLocaleString("pt-BR", { minimumFractionDigits: 2 })}`} />
          <MiniStat label="Margem EBITDA" value={`${performanceData.ebitdaMargin.toFixed(1)}%`} />
        </div>
      </div>

      {/* STATUS FINAL DE VALIDAÇÃO */}
      <div className={`rounded-2xl border p-4 flex items-center gap-3 transition-colors duration-200 ${
        okBudget ? "bg-emerald-50/60 border-emerald-200" : "bg-red-50/60 border-red-200"
      }`}>
        {okBudget ? (
          <CheckCircle2 className="text-emerald-600 flex-shrink-0" size={20} />
        ) : (
          <AlertTriangle className="text-red-600 flex-shrink-0" size={20} />
        )}
        <p className={`font-black text-sm ${okBudget ? "text-emerald-700" : "text-red-700"}`}>
          {okBudget
            ? "Simulação aprovada: O modelo atende às restrições orçamentárias de mercado."
            : "Simulação recusada: Corrija a alocação de estoque ou remova investimentos em CAPEX."}
        </p>
      </div>
    </div>
  );
}

// ─────────────────────────────────────────────
// COMPONENTES SUB-UI AUXILIARES
// ─────────────────────────────────────────────
interface KPICardProps {
  label: string;
  value: string;
  icon: React.ReactNode;
  color?: string;
}

function KPI({ label, value, icon, color }: KPICardProps) {
  return (
    <div className="rounded-2xl border border-slate-200/80 bg-white p-4 shadow-sm transition-all hover:shadow-md">
      <div className="flex items-center gap-2 text-slate-400 text-xs font-black uppercase tracking-wider">
        {icon}
        {label}
      </div>
      <p className={`text-2xl font-black mt-2 tracking-tight ${color ?? "text-slate-900"}`}>
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
    <div className="rounded-2xl border border-slate-200/80 bg-white p-5 shadow-sm">
      <p className="text-xs font-black uppercase tracking-wider text-slate-400 mb-4">
        {title}
      </p>
      <div className="space-y-3">{children}</div>
    </div>
  );
}

interface RowProps {
  label: string;
  fraction?: string;    
  percentage?: string;  
  value: number;
}

function Row({ label, fraction, percentage, value }: RowProps) {
  return (
    <div className="flex justify-between items-center text-xs text-slate-600 py-2 border-b border-slate-100/70 last:border-0 gap-4">
      <span className="font-medium text-slate-700 min-w-[100px] flex-1">{label}</span>
      
      {/* Coluna 2: Qtd / Máx com a mesma família de fontes elegante */}
      {fraction && (
        <span className="font-medium text-slate-400 text-center min-w-[95px]">
          {fraction}
        </span>
      )}

      {/* Coluna 3: Part. % alinhada */}
      {percentage && (
        <span className="font-semibold text-slate-500 text-right min-w-[50px]">
          {percentage}
        </span>
      )}
      
      {/* Coluna 4: Total Investido */}
      <span className="font-bold text-slate-900 text-right min-w-[100px]">
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
    <div className="p-4 rounded-xl bg-slate-50 border border-slate-100">
      <p className="text-[10px] uppercase font-black text-slate-400 tracking-wider">
        {label}
      </p>
      <p className="text-lg font-black text-slate-900 mt-1 tracking-tight">
        {value}
      </p>
    </div>
  );
}