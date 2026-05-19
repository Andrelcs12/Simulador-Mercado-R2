"use client";

import React, { useEffect, useState } from "react";
import toast, { Toaster } from "react-hot-toast";
import { 
  Trophy, 
  Store, 
  TrendingUp, 
  Copy, 
  Activity, 
  Clock, 
  ShieldCheck,
  AlertTriangle
} from "lucide-react";

import { useRoundWatcher } from "@/app/hooks/useRoundWatcher";
import KPISection from "./components/KPISection";
import RankingPanel from "./components/RankingPanel";
import StrategyPanel from "./components/StrategyPanel";

import { DashboardResponse, EMPTY_DASHBOARD } from "./types";

export default function DashboardPage() {
  const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:4000";
  const [data, setData] = useState<DashboardResponse>(EMPTY_DASHBOARD);
  const [loading, setLoading] = useState(true);

  useRoundWatcher(API_URL);

  const copySessionCode = async () => {
    if (!data.sessionId) return;
    await navigator.clipboard.writeText(data.sessionId);
    toast.success("Código da sala copiado!");
  };

  useEffect(() => {
    async function load() {
      try {
        const playerRaw = localStorage.getItem("player_data");
        if (!playerRaw) {
          setLoading(false);
          return;
        }

        const player = JSON.parse(playerRaw);
        const sessionId = player.sessionId;
        const storeId = player.storeId || player.id;

        if (!sessionId) {
          setLoading(false);
          return;
        }

        // Requisição correta passando o storeId via Query string
        const res = await fetch(
          `${API_URL}/minigame/session/${sessionId}/dashboard/latest?storeId=${storeId}`
        );

        if (!res.ok) {
          setLoading(false);
          return;
        }

        const json = await res.json();

        setData({
          ...EMPTY_DASHBOARD,
          ...json,
          myStore: {
            ...EMPTY_DASHBOARD.myStore,
            ...(json.myStore ?? {}),
            kpis: {
              ...EMPTY_DASHBOARD.myStore.kpis,
              ...(json.myStore?.kpis ?? {}),
            },
          },
          ranking: json.ranking ?? [],
        });

        if (json.roundNumber > (json.totalRounds ?? 3)) {
          toast.success("Simulação Concluída! Resultado final disponível.");
        } else {
          toast.success(`Rodada ${json.roundNumber ?? "-"} Sincronizada`);
        }
      } catch (error) {
        console.error("Erro ao carregar dados:", error);
        toast.error("Servidor Offline");
      } finally {
        setLoading(false);
      }
    }

    load();
  }, [API_URL]);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[#080D17]">
        <div className="w-10 h-10 border-2 border-orange-500 border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  const isGameOver = data.roundNumber > data.totalRounds;

  return (
    <div className="min-h-screen bg-[#080D17] text-white relative overflow-hidden font-sans">
      {/* Background Glows */}
      <div className="absolute inset-0 pointer-events-none">
        <div className="absolute w-[600px] h-[600px] bg-orange-500/5 blur-[140px] rounded-full top-[-200px] right-[-200px]" />
        <div className="absolute w-[500px] h-[500px] bg-sky-500/5 blur-[140px] rounded-full bottom-[-200px] left-[-200px]" />
      </div>

      <Toaster position="top-right" />

      {/* HEADER INTEGRADO (PADRÃO CENTRAL MESTRE) */}
      <header className="lg:sticky lg:top-0 z-40 border-b border-white/[0.06] bg-[#080D17]/95 backdrop-blur-xl">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-5">
          <div className="flex flex-col gap-5">
            
            {/* Top Info */}
            <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
              <div>
                <h1 className="text-2xl font-black text-white leading-none tracking-tight uppercase">
                  {isGameOver ? "Encerramento do Jogo" : "Terminal do Operador"}
                </h1>
                <p className="text-[11px] uppercase tracking-[0.3em] text-slate-500 mt-1 font-black">
                  {isGameOver ? "Resultado Final Auditado" : "Análise de Desempenho e Mercado"}
                </p>
              </div>

              <span className={`flex items-center gap-2 px-3 py-1.5 rounded-xl border text-[11px] uppercase font-black tracking-widest w-fit
                ${isGameOver 
                  ? "text-amber-400 border-amber-500/20 bg-amber-500/10" 
                  : "text-emerald-400 border-emerald-500/20 bg-emerald-500/10"}`}
              >
                <Activity size={13} className={isGameOver ? "" : "animate-pulse"} />
                {isGameOver ? "Sessão Finalizada" : "Live Sync Ativo"}
              </span>
            </div>

            {/* Grid dos Cards Principais */}
            <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-3 w-full">
              
              {/* Card 1: Unidade de Operação */}
              <div className="w-full flex items-center justify-between gap-3 bg-gradient-to-br from-orange-500 to-orange-600 shadow-lg shadow-orange-500/10 px-5 py-4 rounded-2xl min-h-[96px]">
                <div className="min-w-0">
                  <p className="text-[10px] uppercase tracking-widest font-black text-orange-100 flex items-center gap-1">
                    <Store size={10} /> Operação Ativa
                  </p>
                  <div className="text-xl font-black text-white leading-tight mt-1 truncate">
                    {data.myStore.name}
                  </div>
                </div>
              </div>

              {/* Card 2: Status da Rodada */}
              <div className="w-full px-5 py-4 rounded-2xl bg-[#111827] border border-white/[0.06] min-h-[96px] flex flex-col justify-center">
                <p className="text-[10px] uppercase tracking-widest text-slate-500 font-black flex items-center gap-1.5">
                  <Clock size={11} className="text-orange-400" />
                  Progresso
                </p>
                <div className="text-2xl font-black text-white mt-1">
                  {isGameOver ? (
                    <span className="text-amber-500 text-lg uppercase tracking-wider">Finalizado</span>
                  ) : (
                    <>
                      {data.roundNumber}
                      <span className="text-sm text-slate-500 font-bold ml-1">/ {data.totalRounds}</span>
                    </>
                  )}
                </div>
              </div>

              {/* Card 3: Colocação de Mercado */}
              <div className="w-full px-5 py-4 rounded-2xl bg-[#111827] border border-white/[0.06] min-h-[96px] flex flex-col justify-center">
                <p className="text-[10px] uppercase tracking-widest text-slate-500 font-black flex items-center gap-1.5">
                  <Trophy size={11} className="text-sky-400" />
                  Posicionamento
                </p>
                <div className="text-2xl font-black text-white mt-1">
                  {data.myStore.position ? `${data.myStore.position}º` : "---"}
                  <span className="text-xs text-slate-500 font-bold ml-1.5 uppercase tracking-wider">
                    Lugar
                  </span>
                </div>
              </div>

              {/* Card 4: Market Share Atualizado */}
              <div className="w-full px-5 py-4 rounded-2xl bg-[#111827] border border-white/[0.06] min-h-[96px] flex flex-col justify-center">
                <p className="text-[10px] uppercase tracking-widest text-slate-500 font-black flex items-center gap-1.5">
                  <TrendingUp size={11} className="text-violet-400" />
                  Market Share
                </p>
                <div className="text-2xl font-black text-white mt-1">
                  {((data.myStore.marketShare ?? 0) * 100).toFixed(1)}%
                </div>
              </div>

            </div>

          </div>
        </div>
      </header>

      {/* CONTEÚDO */}
      <main className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
        
        {/* KPIs (Tratando juros se estourar caixa de 700k) */}
        <KPISection results={data.myStore.kpis} cashBalance={data.myStore.kpis.cash} />

        {/* Alerta de Caixa Negativo / Juros */}
        {data.myStore.kpis.cash < 0 && (
          <div className="flex items-center gap-3 bg-red-500/10 border border-red-500/20 text-red-400 rounded-xl p-4 text-xs font-semibold">
            <AlertTriangle size={16} className="shrink-0" />
            <span>
              Atenção: Limite do caixa de R$ 700k excedido. Sistema aplicando taxa punitiva de 12% de juros sobre o saldo devedor.
            </span>
          </div>
        )}

        {/* Grid Interativo */}
        <div className="grid grid-cols-1 xl:grid-cols-12 gap-6">
          
          {/* Esquerda: Painel do Ranking Detalhado */}
          <div className="xl:col-span-8">
            <div className="bg-[#111827]/60 backdrop-blur-xl border border-white/[0.06] rounded-2xl p-6 shadow-xl">
              <RankingPanel ranking={data.ranking} myStoreId={data.myStore.storeId} />
            </div>
          </div>

          {/* Direita: Configurações de CAPEX / SLA / Estratégia */}
          <div className="xl:col-span-4 space-y-6">
            <div className="bg-[#111827]/60 backdrop-blur-xl border border-white/[0.06] rounded-2xl p-6 shadow-xl">
              <StrategyPanel configurations={data.configurations} sla={data.myStore.kpis.sla} />
            </div>

            {/* Rodapé de Status do Terminal */}
            <div className="flex items-center justify-between bg-[#111827]/40 border border-white/[0.04] rounded-xl px-4 py-3 text-[11px] text-slate-500 font-bold tracking-wider uppercase">
              <span className="flex items-center gap-1.5">
                <span className="w-1.5 h-1.5 bg-emerald-500 rounded-full animate-ping" />
                Estações Sincronizadas
              </span>
              <button 
                onClick={copySessionCode}
                className="hover:text-white transition-colors flex items-center gap-1 cursor-pointer"
              >
                <Copy size={12} /> Copiar ID
              </button>
            </div>
          </div>

        </div>
      </main>
    </div>
  );
}