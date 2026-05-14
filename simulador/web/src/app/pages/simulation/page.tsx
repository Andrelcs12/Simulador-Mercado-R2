"use client";

import React from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Package,
  Wallet,
  TrendingUp,
  CheckCircle2,
  AlertTriangle,
  Loader2,
  Zap,
  ShoppingCart,
} from "lucide-react";
import toast, { Toaster } from "react-hot-toast";
import { useSimulation } from "./hooks/useSimulation";

// ─────────────────────────────────────────────
// HELPERS
// ─────────────────────────────────────────────
const BUDGET_LIMIT = 700_000;

function formatTime(seconds: number): string {
  const m = Math.floor(seconds / 60);
  const s = seconds % 60;
  return `${String(m).padStart(2, "0")}:${String(s).padStart(2, "0")}`;
}

function formatBRL(value: number): string {
  return value.toLocaleString("pt-BR", { style: "currency", currency: "BRL", maximumFractionDigits: 0 });
}

// ─────────────────────────────────────────────
// COMPONENTE PRINCIPAL
// ─────────────────────────────────────────────
export default function SimulacaoPage() {
  const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:4000";

  const {
    player,
    roundData,
    categories,
    capexItems,
    stockInputs,
    selectedCapex,
    timeLeft,
    isTimeUp,
    isSubmitting,
    isSubmitted,
    masterLoaded,
    totalStockCost,
    totalCapexCost,
    totalCost,
    handleSubmit,
    toggleCapex,
    updateStock,
  } = useSimulation(API_URL);

  const isOverBudget = totalCost > BUDGET_LIMIT;
  const budgetUsed = Math.min((totalCost / BUDGET_LIMIT) * 100, 100);

  const timerColor =
    timeLeft > 120
      ? "text-emerald-400"
      : timeLeft > 30
      ? "text-yellow-400"
      : "text-red-400 animate-pulse";

  // ── Tela de enviado ───────────────────────────────────────
  if (isSubmitted) {
    return (
      <div className="min-h-screen bg-[#0B1220] flex items-center justify-center">
        <motion.div
          initial={{ scale: 0.8, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          className="text-center px-8"
        >
          <div className="w-24 h-24 rounded-full bg-emerald-500/20 border-2 border-emerald-500 flex items-center justify-center mx-auto mb-6">
            <CheckCircle2 className="text-emerald-400" size={48} />
          </div>
          <h2 className="text-3xl font-black text-white mb-3">Enviado!</h2>
          <p className="text-slate-400 font-medium">
            Rodada {roundData?.roundNumber} — aguardando o facilitador
          </p>
        </motion.div>
      </div>
    );
  }

  // ── Tela de tempo esgotado ────────────────────────────────
  if (isTimeUp && !isSubmitted) {
    return (
      <div className="min-h-screen bg-[#0B1220] flex items-center justify-center">
        <motion.div
          initial={{ scale: 0.8, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          className="text-center px-8"
        >
          <div className="w-24 h-24 rounded-full bg-red-500/20 border-2 border-red-500 flex items-center justify-center mx-auto mb-6">
            <AlertTriangle className="text-red-400" size={48} />
          </div>
          <h2 className="text-3xl font-black text-white mb-3">Tempo Esgotado</h2>
          <p className="text-slate-400 font-medium">
            Rodada {roundData?.roundNumber} encerrada
          </p>
        </motion.div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#0B1220] text-white flex flex-col">
      <Toaster
        position="top-right"
        toastOptions={{
          style: { background: "#1A2235", color: "#fff", border: "1px solid rgba(255,255,255,0.08)" },
        }}
      />

      {/* ══════════════════════════════════════════
          HEADER
      ══════════════════════════════════════════ */}
      <header className="sticky top-0 z-30 bg-[#080D17]/95 backdrop-blur border-b border-white/[0.06]">
        <div className="max-w-7xl mx-auto px-4 md:px-8 py-3 flex items-center justify-between gap-4">

          {/* Info da rodada + loja */}
          <div className="flex items-center gap-3 flex-wrap">
            <div className="flex items-center gap-2 bg-orange-500 px-4 py-2 rounded-xl">
              <span className="text-[10px] uppercase tracking-widest font-black text-orange-100">
                Rodada
              </span>
              <span className="text-xl font-black tabular-nums">
                {roundData?.roundNumber ?? "—"}
              </span>
            </div>

            {player && (
              <div className="hidden sm:flex items-center gap-2 text-sm text-slate-400 font-semibold bg-white/[0.04] border border-white/[0.06] px-3 py-2 rounded-xl">
                <span className="w-2 h-2 rounded-full bg-orange-400" />
                {player.storeName}
              </div>
            )}
          </div>

          {/* Timer */}
          <div className="flex items-center gap-4">
            <div className="text-right">
              <div className={`text-3xl md:text-4xl font-black font-mono tabular-nums ${timerColor}`}>
                {formatTime(timeLeft)}
              </div>
              <div className="text-[10px] uppercase tracking-widest text-slate-600 font-black text-right">
                restante
              </div>
            </div>
          </div>
        </div>

        {/* Barra de progresso do tempo */}
        <div className="h-1 bg-white/5">
          <motion.div
            className={`h-full transition-colors ${
              timeLeft > 120 ? "bg-emerald-400" : timeLeft > 30 ? "bg-yellow-400" : "bg-red-400"
            }`}
            animate={{
              width: roundData?.duration
                ? `${(timeLeft / roundData.duration) * 100}%`
                : "0%",
            }}
            transition={{ ease: "linear", duration: 1 }}
          />
        </div>
      </header>

      {/* ══════════════════════════════════════════
          BUDGET BAR
      ══════════════════════════════════════════ */}
      <div className="bg-[#0D1528] border-b border-white/[0.06] px-4 md:px-8 py-3">
        <div className="max-w-7xl mx-auto flex items-center gap-4 flex-wrap">
          <div className="flex items-center gap-2 text-xs font-black uppercase tracking-wider text-slate-500">
            <Wallet size={14} />
            Orçamento
          </div>

          <div className="flex-1 min-w-[120px] h-2 bg-white/5 rounded-full overflow-hidden">
            <motion.div
              className={`h-full rounded-full ${isOverBudget ? "bg-red-500" : "bg-orange-500"}`}
              animate={{ width: `${budgetUsed}%` }}
              transition={{ duration: 0.3 }}
            />
          </div>

          <div className="flex items-center gap-3 text-sm font-black">
            <span className={isOverBudget ? "text-red-400" : "text-orange-400"}>
              {formatBRL(totalCost)}
            </span>
            <span className="text-slate-600">/</span>
            <span className="text-slate-400">{formatBRL(BUDGET_LIMIT)}</span>
            {isOverBudget && (
              <span className="text-red-400 text-xs bg-red-500/10 border border-red-500/20 px-2 py-0.5 rounded-full">
                Acima do limite
              </span>
            )}
          </div>
        </div>
      </div>

      {/* ══════════════════════════════════════════
          MAIN CONTENT
      ══════════════════════════════════════════ */}
      <main className="flex-1 max-w-7xl mx-auto w-full px-4 md:px-8 py-6 grid grid-cols-1 xl:grid-cols-3 gap-6">

        {/* ── Coluna esquerda: Estoque (2/3) ── */}
        <div className="xl:col-span-2 space-y-4">
          <div className="flex items-center gap-2 mb-2">
            <ShoppingCart size={18} className="text-orange-500" />
            <h2 className="font-black uppercase text-sm tracking-wider text-slate-300">
              Configuração de Estoque
            </h2>
          </div>

          {!masterLoaded ? (
            <div className="bg-[#111827] border border-white/[0.06] rounded-2xl p-8 flex items-center justify-center gap-3 text-slate-500">
              <Loader2 className="animate-spin" size={20} />
              Carregando categorias...
            </div>
          ) : (
            <div className="space-y-3">
              {categories.map((cat:any) => {
                const input = stockInputs[cat.id];
                if (!input) return null;
                const lineCost = cat.unitCost * input.buyQty;

                return (
                  <div
                    key={cat.id}
                    className="bg-[#111827] border border-white/[0.06] rounded-2xl p-5"
                  >
                    <div className="flex items-center justify-between mb-4">
                      <div>
                        <div className="font-black text-white">{cat.name}</div>
                        <div className="text-xs text-slate-500 font-medium mt-0.5">
                          Custo unitário: {formatBRL(cat.unitCost)}
                        </div>
                      </div>
                      <div className="text-right">
                        <div className="text-sm font-black text-orange-400">
                          {formatBRL(lineCost)}
                        </div>
                        <div className="text-[10px] text-slate-600 font-bold uppercase">
                          subtotal
                        </div>
                      </div>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      {/* Quantidade */}
                      <div>
                        <label className="text-[10px] uppercase tracking-widest font-black text-slate-500 block mb-2">
                          Qtd. Compra
                        </label>
                        <div className="flex items-center gap-2">
                          <button
                            onClick={() =>
                              updateStock(cat.id, "buyQty", Math.max(0, input.buyQty - 100))
                            }
                            className="w-9 h-9 rounded-lg bg-white/5 hover:bg-white/10 text-white font-black transition-all flex items-center justify-center"
                          >
                            −
                          </button>
                          <input
                            type="number"
                            min={0}
                            value={input.buyQty}
                            onChange={(e) =>
                              updateStock(cat.id, "buyQty", Math.max(0, Number(e.target.value)))
                            }
                            className="flex-1 bg-white/5 border border-white/10 rounded-xl px-3 py-2 text-white font-bold text-center text-sm focus:outline-none focus:border-orange-500 tabular-nums"
                          />
                          <button
                            onClick={() =>
                              updateStock(cat.id, "buyQty", input.buyQty + 100)
                            }
                            className="w-9 h-9 rounded-lg bg-white/5 hover:bg-white/10 text-white font-black transition-all flex items-center justify-center"
                          >
                            +
                          </button>
                        </div>
                      </div>

                      {/* Margem */}
                      <div>
                        <label className="text-[10px] uppercase tracking-widest font-black text-slate-500 block mb-2">
                          Margem (%)
                        </label>
                        <div className="flex items-center gap-2">
                          <input
                            type="number"
                            min={0}
                            max={100}
                            step={0.5}
                            value={input.appliedMargin}
                            onChange={(e) =>
                              updateStock(cat.id, "appliedMargin", Number(e.target.value))
                            }
                            className="flex-1 bg-white/5 border border-white/10 rounded-xl px-3 py-2 text-white font-bold text-center text-sm focus:outline-none focus:border-orange-500"
                          />
                          <span className="text-slate-500 font-black text-sm">%</span>
                        </div>
                        <div className="text-[10px] text-slate-600 mt-1 font-medium">
                          Padrão: {cat.defaultMargin}%
                        </div>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>

        {/* ── Coluna direita: CAPEX + Resumo ── */}
        <div className="space-y-4">

          {/* CAPEX */}
          <div>
            <div className="flex items-center gap-2 mb-3">
              <Zap size={16} className="text-yellow-400" />
              <h2 className="font-black uppercase text-sm tracking-wider text-slate-300">
                Investimentos (CAPEX)
              </h2>
            </div>

            {!masterLoaded ? (
              <div className="bg-[#111827] border border-white/[0.06] rounded-2xl p-6 flex items-center justify-center">
                <Loader2 className="animate-spin text-slate-500" size={18} />
              </div>
            ) : (
              <div className="space-y-2">
                {capexItems.map((item:any) => {
                  const selected = selectedCapex.has(item.id);
                  return (
                    <button
                      key={item.id}
                      onClick={() => toggleCapex(item.id)}
                      className={`w-full p-4 rounded-2xl border text-left transition-all ${
                        selected
                          ? "bg-yellow-500/10 border-yellow-500/30 text-white"
                          : "bg-[#111827] border-white/[0.06] text-slate-300 hover:border-white/20"
                      }`}
                    >
                      <div className="flex items-center justify-between">
                        <div className="font-bold text-sm">{item.name}</div>
                        <div
                          className={`w-5 h-5 rounded-full border-2 flex items-center justify-center transition-all ${
                            selected
                              ? "bg-yellow-500 border-yellow-500"
                              : "border-white/20"
                          }`}
                        >
                          {selected && <span className="text-black text-[10px] font-black">✓</span>}
                        </div>
                      </div>
                      <div className="text-xs text-slate-500 mt-1 font-medium">
                        {formatBRL(item.cost)}
                        {item.description && ` · ${item.description}`}
                      </div>
                    </button>
                  );
                })}
              </div>
            )}
          </div>

          {/* Resumo de custos */}
          <div className="bg-[#111827] border border-white/[0.06] rounded-2xl p-5 space-y-3">
            <div className="flex items-center gap-2 mb-1">
              <TrendingUp size={16} className="text-slate-400" />
              <span className="text-xs font-black uppercase tracking-wider text-slate-500">
                Resumo
              </span>
            </div>

            <div className="flex justify-between text-sm">
              <span className="text-slate-400 font-medium">Estoque</span>
              <span className="font-black text-white tabular-nums">
                {formatBRL(totalStockCost)}
              </span>
            </div>

            <div className="flex justify-between text-sm">
              <span className="text-slate-400 font-medium">CAPEX</span>
              <span className="font-black text-white tabular-nums">
                {formatBRL(totalCapexCost)}
              </span>
            </div>

            <div className="border-t border-white/[0.06] pt-3 flex justify-between">
              <span className="font-black text-white text-sm uppercase tracking-wider">
                Total
              </span>
              <span
                className={`font-black text-lg tabular-nums ${
                  isOverBudget ? "text-red-400" : "text-orange-400"
                }`}
              >
                {formatBRL(totalCost)}
              </span>
            </div>

            <div className="flex justify-between text-xs text-slate-600">
              <span>Limite</span>
              <span>{formatBRL(BUDGET_LIMIT)}</span>
            </div>

            {isOverBudget && (
              <div className="bg-red-500/10 border border-red-500/20 rounded-xl p-3 text-red-400 text-xs font-bold text-center">
                ⚠️ Orçamento excedido em {formatBRL(totalCost - BUDGET_LIMIT)}
              </div>
            )}
          </div>

          {/* Botão de envio */}
          <button
            onClick={handleSubmit}
            disabled={isSubmitting || isTimeUp || isSubmitted || isOverBudget}
            className="w-full py-4 rounded-2xl font-black uppercase text-sm transition-all flex items-center justify-center gap-3 bg-orange-500 hover:bg-orange-400 disabled:opacity-40 disabled:cursor-not-allowed shadow-lg"
          >
            {isSubmitting ? (
              <>
                <Loader2 className="animate-spin" size={18} />
                Enviando...
              </>
            ) : isSubmitted ? (
              <>
                <CheckCircle2 size={18} />
                Enviado
              </>
            ) : (
              <>
                <Package size={18} />
                Confirmar Configuração
              </>
            )}
          </button>
        </div>
      </main>
    </div>
  );
}