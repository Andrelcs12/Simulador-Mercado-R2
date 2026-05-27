"use client";

import React, { useMemo } from "react";
import { Toaster } from "react-hot-toast";
import DashboardHeader from "./components/DashboardHeader";
import KPISection from "./components/KPISection";
import RankingPanel from "./components/RankingPanel";
import StrategyPanel from "./components/StrategyPanel";
import RoundSummary from "./components/RoundSummary";
import ComercialDetails from "./components/ComercialDetails";
import { useDashboard } from "./hooks/useDashboard";
import WaitingStatus from "./components/WaitingStatus";

const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:4000";

export default function DashboardPage() {
  const { currentData, history, activeRound, setActiveRound, loading } = useDashboard(API_URL);

  // Descobre qual é a maior rodada presente no histórico para saber se o usuário está na mais recente
  const latestRoundInHistory = useMemo(() => {
    const keys = Object.keys(history).map(Number);
    return keys.length > 0 ? Math.max(...keys) : 0;
  }, [history]);

  if (loading) {
    return (
      <div className="min-h-screen bg-[#080D17] text-white flex items-center justify-center font-bold uppercase tracking-wider text-xs">
        <WaitingStatus />
      </div>
    );
  }

  const isLatestRound = activeRound === latestRoundInHistory;

  return (
    <div className="min-h-screen bg-[#080D17] text-white">
      <Toaster />
      
      {/* 🌟 CORREÇÃO: Propriedades repassadas em conformidade com a interface Props do Header */}
      <DashboardHeader 
        roundNumber={activeRound} 
        totalRounds={currentData.totalRounds} 
        isLatestRound={isLatestRound}
        myStore={currentData.myStore} 
      />

      <main className="max-w-7xl mx-auto px-6 py-8 space-y-8">
        
        {/* Navbar horizontal de seleção de rodadas cadastradas no histórico */}
        <RoundSummary 
          history={history} 
          activeRound={activeRound} 
          onSelectRound={setActiveRound} 
        />

        {/* Painel de KPIs Superiores reativos à rodada ativa */}
        <KPISection 
          results={currentData.myStore?.kpis} 
          cashBalance={currentData.myStore?.kpis?.cash || 0} 
          isProjected={currentData.myStore?.isProjected || false}
        />

        {/* Layout Split Screen */}
        <div className="grid grid-cols-1 xl:grid-cols-12 gap-8">
          
          {/* Lado Esquerdo - Visibilidade de Mercado e Performance Comercial */}
          <div className="xl:col-span-8 space-y-8">
            <RankingPanel 
              ranking={currentData.ranking || []} 
              myStoreId={currentData.myStore?.storeId} 
            />
            
            <ComercialDetails 
              comercialBreakdown={currentData.myStore?.comercialBreakdown || []} 
              isProjected={currentData.myStore?.isProjected || false}
            />
          </div>

          {/* Lado Direito - Backoffice Operacional (SLA / CAPEX) */}
          <div className="xl:col-span-4">
            <StrategyPanel 
              operatorsQty={currentData.myStore?.configurations?.operatorsQty || 0}
              serviceOperatorsQty={currentData.myStore?.configurations?.serviceOperatorsQty || 0}
              quizScore={currentData.myStore?.configurations?.quizScore || 0}
              capexSelections={currentData.myStore?.capexSelections || []}
            />
          </div>

        </div>
      </main>
    </div>
  );
}
