"use client";

import React, { useEffect, useRef, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { motion } from "framer-motion";
import { ArrowLeft, Store } from "lucide-react";

import KPISection from "../../../dashboard/components/KPISection";
import ComercialDetails from "../../../dashboard/components/ComercialDetails";
import StrategyPanel from "../../../dashboard/components/StrategyPanel";
import type { DashboardResponse } from "../../../dashboard/types";

const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:4000";

const POS_TEXT: Record<number, string> = {
  1: "text-amber-400",
  2: "text-slate-300",
  3: "text-orange-400",
};

export default function AdminParticipantDetailPage() {
  const router = useRouter();
  const params = useParams();
  const storeId = String(params?.storeId ?? "");

  const [data, setData] = useState<DashboardResponse["myStore"] | null>(null);
  const [loading, setLoading] = useState(true);
  const fetchedRef = useRef(false);

  useEffect(() => {
    if (fetchedRef.current) return;
    fetchedRef.current = true;

    const sessionId =
      typeof window !== "undefined" ? localStorage.getItem("admin_session_id") : null;

    if (!sessionId || !storeId) {
      setLoading(false);
      return;
    }

    fetch(`${API_URL}/minigame/session/${sessionId}/dashboard/latest?storeId=${storeId}`)
      .then((r) => (r.ok ? r.json() : null))
      .then((json: DashboardResponse | null) => {
        if (json?.myStore) setData(json.myStore);
      })
      .catch(() => {})
      .finally(() => setLoading(false));
  }, [storeId]);

  if (loading) {
    return (
      <div className="min-h-screen bg-[#080D17] flex items-center justify-center">
        <div className="w-14 h-14 border-4 border-orange-500 border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  if (!data) {
    return (
      <div className="min-h-screen bg-[#080D17] text-white flex flex-col items-center justify-center gap-4 px-6 text-center">
        <Store size={40} className="text-slate-700" />
        <h1 className="text-lg font-black uppercase tracking-widest text-slate-300">
          Detalhes indisponíveis
        </h1>
        <p className="text-sm text-slate-500 max-w-sm">
          Não encontramos os dados desta loja.
        </p>
        <button
          onClick={() => router.push("/pages/admin/results")}
          className="mt-2 px-6 py-2.5 rounded-xl bg-white/5 border border-white/10 text-sm font-bold hover:bg-white/10 transition cursor-pointer"
        >
          Voltar ao ranking
        </button>
      </div>
    );
  }

  const posText = data.position ? POS_TEXT[data.position] ?? "text-slate-300" : "text-slate-300";

  return (
    <div className="min-h-screen bg-[#080D17] text-white font-sans">
      {/* HEADER */}
      <header className="sticky top-0 z-40 bg-[#080D17]/90 backdrop-blur-xl border-b border-white/10">
        <div className="max-w-7xl mx-auto px-6 py-5 flex items-center justify-between gap-4">
          <div className="flex items-center gap-3 min-w-0">
            <div className="w-11 h-11 rounded-2xl bg-orange-500/10 border border-orange-500/20 flex items-center justify-center shrink-0">
              <Store size={20} className="text-orange-400" />
            </div>
            <div className="min-w-0">
              <p className="text-[10px] uppercase tracking-[0.25em] text-orange-500 font-black">
                Detalhes do Participante
              </p>
              <h1 className="text-2xl font-black tracking-tight truncate">{data.name}</h1>
              <p className="text-xs text-slate-400 mt-0.5">
                Posição:{" "}
                <span className={`font-black ${posText}`}>
                  {data.position ? `${data.position}º Lugar` : "—"}
                </span>
              </p>
            </div>
          </div>

          <button
            onClick={() => router.push("/pages/admin/results")}
            className="flex items-center gap-2 px-5 py-2.5 rounded-xl bg-white/5 border border-white/10 text-sm font-bold text-slate-200 hover:bg-white/10 transition cursor-pointer shrink-0"
          >
            <ArrowLeft size={16} /> Voltar ao ranking
          </button>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-6 py-8 space-y-8">
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
        >
          {/* KPIs */}
          <KPISection
            results={data.kpis}
            cashBalance={data.kpis?.cash || 0}
            isProjected={data.isProjected || false}
          />
        </motion.div>

        <div className="grid grid-cols-1 xl:grid-cols-12 gap-8">
          {/* Esquerda: gôndola */}
          <div className="xl:col-span-8 space-y-8">
            <ComercialDetails
              comercialBreakdown={data.comercialBreakdown || []}
              isProjected={data.isProjected || false}
            />
          </div>

          {/* Direita: RH/SLA + CAPEX */}
          <div className="xl:col-span-4">
            <StrategyPanel
              operatorsQty={data.configurations?.operatorsQty || 0}
              serviceOperatorsQty={data.configurations?.serviceOperatorsQty || 0}
              quizScore={data.configurations?.quizScore || 0}
              capexSelections={data.capexSelections || []}
            />
          </div>
        </div>
      </main>
    </div>
  );
}
