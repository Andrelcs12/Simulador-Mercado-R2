"use client";

import React, { useEffect, useState } from "react";
import toast, { Toaster } from "react-hot-toast";
import { useRoundWatcher } from "@/app/hooks/useRoundWatcher";

import DashboardHeader from "./components/DashboardHeader";
import KPISection from "./components/KPISection";
import RankingPanel from "./components/RankingPanel";
import WaitingStatus from "./components/WaitingStatus";

import { DashboardResponse } from "./types";

export default function DashboardPage() {
  const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:4000";

  const [data, setData] = useState<DashboardResponse | null>(null);
  const [loading, setLoading] = useState(true);

  useRoundWatcher(API_URL);

  useEffect(() => {
    async function load() {
      try {
        const sessionId = localStorage.getItem("session_id");
        const roundId = localStorage.getItem("round_id");

        if (!sessionId || !roundId) {
          setLoading(false);
          return;
        }

        const res = await fetch(
          `${API_URL}/minigame/session/${sessionId}/dashboard/${roundId}`
        );

        if (!res.ok) throw new Error("Erro ao carregar dashboard");

        const json: DashboardResponse = await res.json();

        setData(json);

        toast.success(`Rodada ${json.roundNumber ?? "-"} sincronizada`, {
          style: {
            background: "#002350",
            color: "#fff",
            fontWeight: "bold",
            borderRadius: "15px",
          },
        });
      } catch (err) {
        console.error(err);
        toast.error("Falha ao carregar dashboard");
      } finally {
        setLoading(false);
      }
    }

    load();
  }, [API_URL]);

  if (loading) return <WaitingStatus />;

  if (!data?.roundNumber) return <WaitingStatus />;

  return (
    <div className="min-h-screen bg-[#F8FAFC]">
      <Toaster position="top-right" />

      <div className="p-6 md:p-10 max-w-[1600px] mx-auto space-y-10">
        <DashboardHeader roundNumber={data.roundNumber} />

        <KPISection results={data.myStore?.kpis} />

        <div className="grid lg:grid-cols-3 gap-8">
          <RankingPanel ranking={data.ranking ?? []} />
        </div>
      </div>
    </div>
  );
}