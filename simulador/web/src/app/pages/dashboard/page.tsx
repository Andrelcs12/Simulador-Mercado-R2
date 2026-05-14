"use client";

import React, { useEffect, useState } from "react";
import toast, { Toaster } from "react-hot-toast";
import { useRoundWatcher } from "@/app/hooks/useRoundWatcher";

import DashboardHeader from "./components/DashboardHeader";
import KPISection from "./components/KPISection";
import RankingPanel from "./components/RankingPanel";
import StrategyPanel from "./components/StrategyPanel";
import WaitingStatus from "./components/WaitingStatus";

import { DashboardResponse } from "./types";

export default function DashboardPage() {
  const API_URL =
    process.env.NEXT_PUBLIC_API_URL || "http://localhost:4000";

  const [data, setData] = useState<DashboardResponse | null>(null);

  useRoundWatcher(API_URL);

  const sessionId =
    typeof window !== "undefined"
      ? localStorage.getItem("session_id")
      : null;

  const roundId =
    typeof window !== "undefined"
      ? localStorage.getItem("round_id")
      : null;

  useEffect(() => {
    async function load() {
      if (!sessionId || !roundId) return;

      const res = await fetch(
        `${API_URL}/dashboard/${sessionId}/${roundId}`
      );

      const json = await res.json();
      setData(json);

      toast.success(
        `Rodada ${json.session.currentRound} sincronizada`,
        {
          style: {
            background: "#002350",
            color: "#fff",
            fontWeight: "bold",
            borderRadius: "15px",
          },
        }
      );
    }

    load();
  }, [sessionId, roundId]);

  if (!data) return <WaitingStatus />;

  return (
    <div className="min-h-screen bg-[#F8FAFC]">
      <Toaster position="top-right" />

      <div className="p-6 md:p-10 max-w-[1600px] mx-auto space-y-10">
        <DashboardHeader
          roundNumber={data.session.currentRound}
        />

        <KPISection results={data.results} />

        <div className="grid lg:grid-cols-3 gap-8">
          <RankingPanel ranking={data.ranking} />
          <StrategyPanel configurations={data.configurations} />
        </div>
      </div>
    </div>
  );
}