"use client";

import React from "react";
import { motion } from "framer-motion";
import {
  ShieldAlert,
  Wrench,
  HardDrive,
  Monitor,
  ReceiptText,
  RefreshCw,
  ShoppingBasket,
  Package,
  Computer,
  Droplets,
  CheckCircle2,
  AlertTriangle,
  ClipboardList,
  TrendingUp,
  Users,
  Clock,
  Target,
} from "lucide-react";
import { AppConfig } from "../types/onboarding";

interface Props {
  config: AppConfig;
}

const ORCAMENTO = 700000;

// ── CAPEX META ─────────────────────────────
const CAPEX_META: Record<string, { label: string; Icon: any; value: number }> =
{
  seguranca: { label: "Segurança", Icon: ShieldAlert, value: 50000 },
  equipamentos: { label: "Equipamentos", Icon: Wrench, value: 75000 },
  redes: { label: "Redes", Icon: HardDrive, value: 80000 },
  site: { label: "Plataforma Digital", Icon: Monitor, value: 65000 },
  selfcheckout: { label: "Self Checkout", Icon: ReceiptText, value: 80000 },
  melhoria: { label: "Melhoria Contínua", Icon: RefreshCw, value: 45000 },
};

// ── COMERCIAL META ─────────────────────────
const CATEGORIAS = [
  { id: "pereciveis" as const, label: "Perecíveis", Icon: ShoppingBasket, custoUn: 15.5 },
  { id: "mercearia" as const, label: "Mercearia", Icon: Package, custoUn: 8.9 },
  { id: "eletro" as const, label: "Eletrônicos", Icon: Computer, custoUn: 12.4 },
  { id: "hipel" as const, label: "Higiene & Limpeza", Icon: Droplets, custoUn: 6.2 },
];

function calcSLA(caixa: number, atendimento: number) {
  const total = caixa + atendimento;
  if (total >= 16) return 1;
  if (total >= 12) return 2;
  if (total >= 8) return 3;
  if (total >= 4) return 4;
  return 5;
}

export default function SummaryStep({ config }: Props) {
  const capex = config.capex ?? {};

  // CAPEX TOTAL
  const totalCapex = Object.entries(capex)
    .filter(([, v]) => v > 0)
    .reduce((acc, [id]) => acc + (CAPEX_META[id]?.value ?? 0), 0);

  // ESTOQUE TOTAL
  const totalEstoque = CATEGORIAS.reduce((acc, c) => {
    return acc + (config.comercial[c.id]?.estoque ?? 0) * c.custoUn;
  }, 0);

  const investimentoTotal = totalCapex + totalEstoque;
  const saldo = ORCAMENTO - investimentoTotal;

  const okBudget = saldo >= 0;

  const margemMedia =
    CATEGORIAS.reduce(
      (a, c) => a + (config.comercial[c.id]?.margem ?? 0),
      0
    ) / CATEGORIAS.length;

  // ── EQUIPE
  const opCaixa = config.operadoresCaixa ?? 0;
  const opAtendimento = config.operadoresAtendimento ?? 0;
  const quiz = config.quizScore ?? 100;

  const csatBase = Math.min(opCaixa / 10, 1);
  const csat = Math.round(csatBase * quiz);

  const sla = calcSLA(opCaixa, opAtendimento);

  const capexSelecionados = Object.entries(capex).filter(([, v]) => v > 0);

  return (
    <div className="space-y-8">

      {/* HEADER */}
      <div className="border-l-4 border-[#001F3F] pl-5">
        <p className="text-[11px] font-black uppercase tracking-[0.25em] text-[#FF6D00]">
          Passo 4 de 4
        </p>
        <h2 className="text-3xl font-black text-[#001F3F]">
          Resumo <span className="text-[#FF6D00]">Executivo</span>
        </h2>
        <p className="text-sm text-slate-500 mt-2">
          Validação final antes do envio da configuração da loja.
        </p>
      </div>

      {/* ORÇAMENTO */}
      <div className="bg-white border rounded-2xl p-5 space-y-3">
        <div className="flex justify-between">
          <p className="text-xs font-black uppercase text-slate-400">
            Uso do orçamento
          </p>
          <p className={`text-sm font-black ${okBudget ? "text-emerald-600" : "text-red-500"}`}>
            R$ {investimentoTotal.toLocaleString("pt-BR")} / R$ {ORCAMENTO.toLocaleString("pt-BR")}
          </p>
        </div>

        <div className="h-3 bg-slate-100 rounded-full overflow-hidden">
          <motion.div
            className={`h-full ${okBudget ? "bg-[#FF6D00]" : "bg-red-500"}`}
            animate={{ width: `${Math.min((investimentoTotal / ORCAMENTO) * 100, 100)}%` }}
          />
        </div>

        <div className={`text-sm font-black flex items-center gap-2 ${okBudget ? "text-emerald-600" : "text-red-500"}`}>
          {okBudget ? (
            <>
              <CheckCircle2 size={16} />
              Saldo disponível: R$ {saldo.toLocaleString("pt-BR")}
            </>
          ) : (
            <>
              <AlertTriangle size={16} />
              Orçamento excedido em R$ {Math.abs(saldo).toLocaleString("pt-BR")}
            </>
          )}
        </div>
      </div>

      {/* GRID PRINCIPAL */}
      <div className="grid lg:grid-cols-3 gap-5">

        {/* CAPEX */}
        <div className="bg-white border rounded-2xl overflow-hidden">
          <div className="bg-[#001F3F] px-4 py-3 flex gap-2">
            <ClipboardList size={14} className="text-[#FF6D00]" />
            <p className="text-xs font-black text-white uppercase">
              CAPEX
            </p>
          </div>

          <div className="p-4 space-y-2">
            {capexSelecionados.length === 0 ? (
              <p className="text-xs text-slate-400">Nenhum investimento</p>
            ) : (
              capexSelecionados.map(([id]) => {
                const item = CAPEX_META[id];
                return (
                  <div key={id} className="flex justify-between text-xs">
                    <span className="font-medium text-[#001F3F]">
                      {item.label}
                    </span>
                    <span className="font-black">
                      R$ {item.value.toLocaleString("pt-BR")}
                    </span>
                  </div>
                );
              })
            )}

            <div className="border-t pt-2 flex justify-between text-xs">
              <span className="text-slate-400 font-bold">Total</span>
              <span className="font-black text-[#001F3F]">
                R$ {totalCapex.toLocaleString("pt-BR")}
              </span>
            </div>
          </div>
        </div>

        {/* COMERCIAL */}
        <div className="bg-white border rounded-2xl overflow-hidden">
          <div className="bg-[#001F3F] px-4 py-3 flex gap-2">
            <TrendingUp size={14} className="text-[#FF6D00]" />
            <p className="text-xs font-black text-white uppercase">
              Comercial
            </p>
          </div>

          <div className="p-4 space-y-2">
            {CATEGORIAS.map((c) => {
              const d = config.comercial[c.id];
              const subtotal = (d?.estoque ?? 0) * c.custoUn;

              return (
                <div key={c.id} className="flex justify-between text-xs">
                  <span className="text-[#001F3F] font-medium">
                    {c.label}
                  </span>
                  <span className="font-black">
                    R$ {subtotal.toLocaleString("pt-BR")}
                  </span>
                </div>
              );
            })}

            <div className="border-t pt-2 text-xs space-y-1">
              <div className="flex justify-between">
                <span className="text-slate-400">Estoque</span>
                <span className="font-black">{totalEstoque.toLocaleString("pt-BR")}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-400">Margem média</span>
                <span className="font-black text-[#FF6D00]">
                  {margemMedia.toFixed(1)}%
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* EQUIPE */}
        <div className="bg-white border rounded-2xl overflow-hidden">
          <div className="bg-[#001F3F] px-4 py-3 flex gap-2">
            <Users size={14} className="text-[#FF6D00]" />
            <p className="text-xs font-black text-white uppercase">
              Operação
            </p>
          </div>

          <div className="p-4 space-y-2">
            <div className="flex justify-between text-xs">
              <span>Caixa</span>
              <span className="font-black">{opCaixa}</span>
            </div>

            <div className="flex justify-between text-xs">
              <span>Atendimento</span>
              <span className="font-black">{opAtendimento}</span>
            </div>

            <div className="border-t pt-2 space-y-1 text-xs">
              <div className="flex justify-between">
                <span>CSAT</span>
                <span className="font-black text-emerald-600">{csat}%</span>
              </div>

              <div className="flex justify-between">
                <span>SLA</span>
                <span className="font-black text-[#001F3F]">{sla} dia(s)</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* ALERT FINAL */}
      <div
        className={`rounded-2xl p-4 border flex gap-3 items-start ${
          okBudget ? "bg-emerald-50 border-emerald-200" : "bg-red-50 border-red-200"
        }`}
      >
        {okBudget ? (
          <CheckCircle2 className="text-emerald-600" size={18} />
        ) : (
          <AlertTriangle className="text-red-600" size={18} />
        )}

        <p className={`text-sm font-bold ${okBudget ? "text-emerald-700" : "text-red-700"}`}>
          {okBudget
            ? "Configuração válida. Você pode enviar a simulação."
            : "Orçamento negativo. Ajuste CAPEX ou estoque antes de continuar."}
        </p>
      </div>
    </div>
  );
}