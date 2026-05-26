"use client";

import React, { useEffect, useState, useMemo } from "react";
import toast, { Toaster } from "react-hot-toast";
import { Activity, AlertTriangle, BarChart3, Layers, Copy } from "lucide-react";

import KPISection from "./components/KPISection";
import RankingPanel from "./components/RankingPanel";
import StrategyPanel from "./components/StrategyPanel";
import RoundSummary from "./components/RoundSummary"; // Novo componente
import { DashboardResponse, EMPTY_DASHBOARD } from "./types";

export default function DashboardPage() {
  const [history, setHistory] = useState<Record<number, DashboardResponse>>({});
  const [activeRound, setActiveRound] = useState<number>(0);
  const [loading, setLoading] = useState(true);

  // Data memoizada
  const data = useMemo(() => history[activeRound] || EMPTY_DASHBOARD, [history, activeRound]);
  const isGameOver = data.roundNumber > (data.totalRounds ?? 3);

  useEffect(() => {
    // Aqui seria onde você chamaria o Context se tivesse um
    loadDashboard();
  }, []);

  async function loadDashboard() {
    try {
      const player = JSON.parse(localStorage.getItem("player_data") || "{}");
      if (!player.sessionId) return;
      
      // Otimização: Chamar o backend para buscar o estado atual
      const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/minigame/session/${player.sessionId}/dashboard/latest`);
      const json = await res.json();
      
      setHistory((prev) => ({ ...prev, [json.roundNumber]: json }));
      setActiveRound(json.roundNumber);
    } catch {
      toast.error("Erro ao atualizar dados");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="min-h-screen bg-[#080D17] text-white">
      <Toaster />
      
      <header className="border-b border-white/10 bg-[#080D17]/80 backdrop-blur-md sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-6 py-6 flex justify-between items-center">
          <div>
            <h1 className="text-2xl font-black uppercase">Terminal do Operador</h1>
            <p className="text-[10px] text-slate-500 font-bold uppercase tracking-widest">{isGameOver ? "Fim da Sessão" : "Monitoramento Live"}</p>
          </div>
          <span className={`px-3 py-1 rounded-lg text-[9px] font-black uppercase border ${isGameOver ? "border-rose-500/20 text-rose-500" : "border-emerald-500/20 text-emerald-500"}`}>
            {isGameOver ? "Offline" : "Live Sync"}
          </span>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-6 py-8 space-y-8">
        <KPISection results={data.myStore?.kpis} cashBalance={data.myStore?.kpis?.cash || 0} />

        <div className="grid grid-cols-1 xl:grid-cols-12 gap-8">
          {/* Lado Esquerdo */}
          <div className="xl:col-span-8 space-y-8">
             <RankingPanel ranking={data.ranking || []} myStoreId={data.myStore?.storeId} />
          </div>

          {/* Lado Direito */}
          <div className="xl:col-span-4 space-y-6">
            <RoundSummary history={history} />
            <StrategyPanel configurations={data.configurations || []} sla={data.myStore?.kpis?.sla || 0} />
          </div>
        </div>
      </main>
    </div>
  );
}