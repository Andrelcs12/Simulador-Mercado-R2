"use client";

import React, { useEffect, useState } from "react";
import toast, { Toaster } from "react-hot-toast";

import { useRoundWatcher } from "@/app/hooks/useRoundWatcher";

import DashboardHeader from "./components/DashboardHeader";
import KPISection from "./components/KPISection";
import RankingPanel from "./components/RankingPanel";
import StrategyPanel from "./components/StrategyPanel";

import {
  DashboardResponse,
  EMPTY_DASHBOARD,
} from "./types";

export default function DashboardPage() {
  const API_URL =
    process.env.NEXT_PUBLIC_API_URL || "http://localhost:4000";

  const [data, setData] = useState<DashboardResponse>(EMPTY_DASHBOARD);
  const [loading, setLoading] = useState(true);

  useRoundWatcher(API_URL);

  useEffect(() => {
    async function load() {
      try {
        const sessionId = localStorage.getItem("session_id");

        if (!sessionId) {
          setLoading(false);
          return;
        }

        const res = await fetch(
          `${API_URL}/minigame/session/${sessionId}/dashboard/latest`
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

        toast.success(`Rodada ${json.roundNumber ?? "-"} sincronizada`);
      } catch {
        toast.error("Dashboard offline");
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

  return (
    <div className="min-h-screen bg-[#080D17] text-white relative overflow-hidden">

      {/* BACKGROUND SYSTEM (IDENTIDADE LOBBY) */}
      <div className="absolute inset-0">
        <div className="absolute w-[600px] h-[600px] bg-orange-500/10 blur-[140px] rounded-full top-[-200px] right-[-200px]" />
        <div className="absolute w-[500px] h-[500px] bg-sky-500/10 blur-[140px] rounded-full bottom-[-200px] left-[-200px]" />
      </div>

      <Toaster position="top-right" />

      {/* HEADER */}
      <DashboardHeader
        roundNumber={data.roundNumber}
        totalRounds={data.totalRounds}
        sessionId={data.sessionId}
        myStore={data.myStore}
      />

      <main className="relative z-10 max-w-7xl mx-auto px-4 lg:px-8 py-8 space-y-8">

        {/* KPI ROW */}
        <KPISection results={data.myStore.kpis} />

        {/* GRID PRINCIPAL */}
        <div className="grid grid-cols-1 xl:grid-cols-12 gap-6">

          {/* LEFT */}
          <div className="xl:col-span-8 space-y-6">

            <div className="bg-[#0B1220]/70 backdrop-blur-xl border border-white/5 rounded-2xl p-5">
              <RankingPanel ranking={data.ranking} />
            </div>

          </div>

          {/* RIGHT */}
          <div className="xl:col-span-4 space-y-6">

            <div className="bg-[#0B1220]/70 backdrop-blur-xl border border-white/5 rounded-2xl p-5">
              <StrategyPanel configurations={data.configurations} />
            </div>

            {/* STATUS BOX */}
            <div className="bg-[#0B1220]/50 border border-white/5 rounded-2xl p-5 text-xs text-slate-400">
              Sistema ativo • sincronização em tempo real
            </div>

          </div>

        </div>
      </main>
    </div>
  );
}