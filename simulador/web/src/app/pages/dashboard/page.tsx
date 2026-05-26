"use client";

import React from "react";
import toast, { Toaster } from "react-hot-toast";
import KPISection from "./components/KPISection";
import RankingPanel from "./components/RankingPanel";
import StrategyPanel from "./components/StrategyPanel";
import RoundSummary from "./components/RoundSummary";
import { useDashboard } from "./hooks/useDashboard";

const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:4000";

export default function DashboardPage() {
  const { currentData, history, loading } = useDashboard(API_URL);

  if (loading) {
    return <div className="min-h-screen bg-[#080D17] text-white flex items-center justify-center">Carregando painel de controle...</div>;
  }

  const isGameOver = currentData.roundNumber > (currentData.totalRounds ?? 3);

  return (
    <div className="min-h-screen bg-[#080D17] text-white">
      <Toaster />
      
      <header className="border-b border-white/10 bg-[#080D17]/80 backdrop-blur-md sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-6 py-6 flex justify-between items-center">
          <div>
            <h1 className="text-2xl font-black uppercase">Terminal do Operador</h1>
            <p className="text-[10px] text-slate-500 font-bold uppercase tracking-widest">
              {isGameOver ? "Fim da Sessão" : `Rodada Atual: ${currentData.roundNumber}`}
            </p>
          </div>
          <span className={`px-3 py-1 rounded-lg text-[9px] font-black uppercase border ${isGameOver ? "border-rose-500/20 text-rose-500" : "border-emerald-500/20 text-emerald-500"}`}>
            {isGameOver ? "Offline" : "Live Sync"}
          </span>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-6 py-8 space-y-8">
        {/* Passando os dados consolidados vindos direto do Backend */}
        <KPISection results={currentData.myStore?.kpis} cashBalance={currentData.myStore?.kpis?.cash || 0} />

        <div className="grid grid-cols-1 xl:grid-cols-12 gap-8">
          <div className="xl:col-span-8 space-y-8">
             <RankingPanel ranking={currentData.ranking || []} myStoreId={currentData.myStore?.storeId} />
          </div>

          <div className="xl:col-span-4 space-y-6">
            <RoundSummary history={history} />
            <StrategyPanel configurations={currentData.configurations || []} sla={currentData.myStore?.kpis?.sla || 0} />
          </div>
        </div>
      </main>
    </div>
  );
}