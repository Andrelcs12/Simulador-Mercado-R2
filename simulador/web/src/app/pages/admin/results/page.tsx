"use client";

import React, { useEffect, useMemo, useRef, useState } from "react";
import { motion } from "framer-motion";
import { Crown, Medal, Trophy, TrendingUp, ArrowLeft, BarChart3 } from "lucide-react";
import { useRouter } from "next/navigation";

interface FinalRankEntry {
  position: number;
  storeId: string;
  storeName: string;
  playerName: string;
  playerId: string;
  finalEbitda: number;
  finalEbitdaMargin: number; // %
  finalMarketShare: number; // %
  finalCash: number;
  totalRevenue: number;
  totalExpenses: number;
}

const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:4000";

const fmtBRL = (v: number) =>
  `R$ ${Math.round(v ?? 0).toLocaleString("pt-BR")}`;

// Estilos por colocação alinhados ao restante do programa
const POS_STYLE: Record<number, { ring: string; chip: string; text: string; bar: string; Icon: any }> = {
  1: { ring: "ring-amber-400/40", chip: "bg-amber-500/20 text-amber-400 border-amber-500/30", text: "text-amber-400", bar: "from-amber-500/30 to-amber-500/5", Icon: Crown },
  2: { ring: "ring-slate-300/30", chip: "bg-slate-400/20 text-slate-300 border-slate-400/30", text: "text-slate-300", bar: "from-slate-400/25 to-slate-400/5", Icon: Medal },
  3: { ring: "ring-orange-700/30", chip: "bg-orange-700/20 text-orange-400 border-orange-700/30", text: "text-orange-400", bar: "from-orange-700/25 to-orange-700/5", Icon: Medal },
};

export default function AdminResultsPage() {
  const router = useRouter();
  const [ranking, setRanking] = useState<FinalRankEntry[]>([]);
  const [loading, setLoading] = useState(true);
  const fetchedRef = useRef(false);

  useEffect(() => {
    if (fetchedRef.current) return;
    fetchedRef.current = true;

    // 1) Fallback instantâneo: payload salvo pelo socket session:finalized
    try {
      const cached = sessionStorage.getItem("final_ranking");
      if (cached) {
        const parsed = JSON.parse(cached);
        if (Array.isArray(parsed) && parsed.length) setRanking(parsed);
      }
    } catch {
      /* ignora */
    }

    // 2) Fonte da verdade: endpoint do backend
    const sessionId =
      typeof window !== "undefined" ? localStorage.getItem("admin_session_id") : null;

    if (!sessionId) {
      setLoading(false);
      return;
    }

    fetch(`${API_URL}/minigame/session/${sessionId}/final-ranking`)
      .then((r) => (r.ok ? r.json() : []))
      .then((data: FinalRankEntry[]) => {
        if (Array.isArray(data) && data.length) {
          setRanking([...data].sort((a, b) => a.position - b.position));
        }
      })
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  const top3 = useMemo(() => ranking.slice(0, 3), [ranking]);
  const rest = useMemo(() => ranking.slice(3), [ranking]);

  // Ordem de exibição do pódio: 2º, 1º, 3º (centro = campeão)
  const podiumOrder = useMemo(() => {
    const byPos = (p: number) => top3.find((e) => e.position === p);
    return [byPos(2), byPos(1), byPos(3)].filter(Boolean) as FinalRankEntry[];
  }, [top3]);

  // Pior colocação do pódio — usada para revelar do último ao campeão (suspense).
  const lastPodiumPos = useMemo(
    () => (top3.length ? Math.max(...top3.map((e) => e.position)) : 1),
    [top3]
  );

  if (loading) {
    return (
      <div className="min-h-screen bg-[#080D17] flex flex-col items-center justify-center gap-4">
        <motion.div
          animate={{ rotate: 360 }}
          transition={{ repeat: Infinity, duration: 1, ease: "linear" }}
          className="w-14 h-14 border-4 border-orange-500 border-t-transparent rounded-full"
        />
        <span className="text-slate-400 font-black tracking-[0.25em] text-[11px] uppercase">
          Calculando ranking final...
        </span>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#080D17] text-white font-sans">
      {/* HEADER */}
      <header className="sticky top-0 z-40 bg-[#080D17]/90 backdrop-blur-xl border-b border-white/10">
        <div className="max-w-6xl mx-auto px-6 py-5 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-11 h-11 rounded-2xl bg-orange-500/10 border border-orange-500/20 flex items-center justify-center">
              <Trophy size={20} className="text-orange-400" />
            </div>
            <div>
              <h1 className="text-2xl font-black tracking-tight">Resultado Final</h1>
              <p className="text-[10px] uppercase tracking-[0.25em] text-slate-400 font-bold mt-0.5">
                Classificação por % de EBITDA
              </p>
            </div>
          </div>

          <button
            onClick={() => router.push("/pages/admin/dashboard")}
            className="flex items-center gap-2 px-5 py-2.5 rounded-xl bg-white/5 border border-white/10 text-sm font-bold text-slate-200 hover:bg-white/10 transition cursor-pointer"
          >
            <ArrowLeft size={16} /> Voltar ao Painel
          </button>
        </div>
      </header>

      <main className="max-w-6xl mx-auto px-6 py-10 space-y-12">
        {ranking.length === 0 ? (
          <div className="rounded-3xl border border-dashed border-white/10 bg-white/[0.02] p-16 text-center">
            <Trophy size={36} className="mx-auto text-slate-700 mb-4" />
            <h3 className="text-sm font-black uppercase tracking-widest text-slate-300">
              Nenhum resultado disponível
            </h3>
            <p className="text-xs text-slate-600 mt-2">
              O ranking final aparece aqui quando a última rodada é finalizada.
            </p>
          </div>
        ) : (
          <>
            {/* ===== PÓDIO (TOP 3) ===== */}
            <section>
              <div className="flex items-center gap-2 mb-8 justify-center">
                <Crown size={18} className="text-amber-400" />
                <h2 className="text-[11px] font-black uppercase tracking-[0.3em] text-slate-300">
                  Pódio
                </h2>
              </div>

              <div className="flex items-end justify-center gap-3 md:gap-6">
                {podiumOrder.map((entry) => {
                  const style = POS_STYLE[entry.position] ?? POS_STYLE[3];
                  const Icon = style.Icon;
                  const isChamp = entry.position === 1;
                  // alturas: 2º, 1º, 3º
                  const barHeight = isChamp ? "h-44" : entry.position === 2 ? "h-32" : "h-24";
                  // Revela do pior colocado ao campeão (campeão por último).
                  const revealDelay = (lastPodiumPos - entry.position) * 0.7;

                  return (
                    <motion.div
                      key={entry.storeId}
                      initial={{ opacity: 0, y: 40 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: revealDelay, duration: 0.6, type: "spring", stiffness: 90, damping: 15 }}
                      className="flex flex-col items-center gap-3 flex-1 max-w-[230px]"
                    >
                      {/* Card do colocado */}
                      <div
                        className={`w-full rounded-3xl border border-white/10 bg-white/5 p-5 text-center ${
                          isChamp ? `ring-2 ${style.ring} ring-offset-2 ring-offset-[#080D17]` : ""
                        }`}
                      >
                        <div className="flex justify-center -mt-10 mb-2">
                          <div
                            className={`w-14 h-14 rounded-2xl bg-[#0B1220] border border-white/10 flex items-center justify-center ${style.text}`}
                          >
                            <Icon size={24} />
                          </div>
                        </div>

                        <span
                          className={`inline-block px-3 py-1 rounded-lg text-[10px] font-black uppercase tracking-[0.15em] border ${style.chip}`}
                        >
                          {entry.position}º Lugar
                        </span>

                        <p className="text-white font-black text-base mt-3 truncate">
                          {entry.storeName}
                        </p>
                        <p className="text-[10px] text-slate-400 font-bold uppercase tracking-wider truncate">
                          {entry.playerName}
                        </p>

                        <div className="mt-4 pt-4 border-t border-white/10 space-y-2">
                          <div>
                            <p className="text-[9px] text-slate-500 font-black uppercase tracking-widest">
                              % EBITDA
                            </p>
                            <p className={`font-black text-xl ${style.text}`}>
                              {entry.finalEbitdaMargin.toFixed(1)}%
                            </p>
                          </div>
                          <div className="flex items-center justify-center gap-1 text-emerald-400">
                            <TrendingUp size={12} />
                            <span className="font-mono font-black text-sm">
                              {fmtBRL(entry.finalEbitda)}
                            </span>
                          </div>
                        </div>

                        <button
                          onClick={() => router.push(`/pages/admin/results/${entry.storeId}`)}
                          className="mt-4 w-full px-3 py-2 rounded-xl bg-white/5 border border-white/10 text-[11px] font-black uppercase tracking-wide text-slate-200 hover:bg-white/10 transition cursor-pointer"
                        >
                          Ver detalhes
                        </button>
                      </div>

                      {/* Base do pódio */}
                      <div
                        className={`w-full ${barHeight} rounded-t-2xl border-x border-t border-white/10 bg-gradient-to-b ${style.bar} flex items-start justify-center pt-4`}
                      >
                        <span className={`text-5xl font-black ${style.text}`}>
                          {entry.position}
                        </span>
                      </div>
                    </motion.div>
                  );
                })}
              </div>
            </section>

            {/* ===== DEMAIS COLOCADOS (4º+) ===== */}
            {rest.length > 0 && (
              <motion.section
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: lastPodiumPos * 0.7 + 0.5, duration: 0.5 }}
                className="rounded-3xl border border-white/10 bg-white/[0.02] overflow-hidden"
              >
                <div className="px-6 py-5 border-b border-white/10 bg-white/[0.02] flex items-center gap-3">
                  <BarChart3 size={18} className="text-orange-400" />
                  <h3 className="text-[11px] font-black uppercase tracking-[0.25em] text-slate-300">
                    Demais Colocados
                  </h3>
                </div>

                <div className="overflow-x-auto">
                  <table className="w-full min-w-[640px]">
                    <thead>
                      <tr className="border-b border-white/10">
                        <th className="px-6 py-4 text-left text-[9px] font-black text-slate-500 uppercase tracking-widest">Pos.</th>
                        <th className="px-6 py-4 text-left text-[9px] font-black text-slate-500 uppercase tracking-widest">Loja</th>
                        <th className="px-6 py-4 text-left text-[9px] font-black text-slate-500 uppercase tracking-widest">Gerente</th>
                        <th className="px-6 py-4 text-right text-[9px] font-black text-slate-500 uppercase tracking-widest">% EBITDA</th>
                        <th className="px-6 py-4 text-right text-[9px] font-black text-slate-500 uppercase tracking-widest">EBITDA</th>
                        <th className="px-6 py-4 text-right text-[9px] font-black text-slate-500 uppercase tracking-widest">Market Share</th>
                        <th className="px-6 py-4 text-right text-[9px] font-black text-slate-500 uppercase tracking-widest">Caixa Final</th>
                        <th className="px-6 py-4 text-right text-[9px] font-black text-slate-500 uppercase tracking-widest">Detalhes</th>
                      </tr>
                    </thead>
                    <tbody>
                      {rest.map((entry, idx) => (
                        <motion.tr
                          key={entry.storeId}
                          initial={{ opacity: 0, x: -16 }}
                          animate={{ opacity: 1, x: 0 }}
                          transition={{ delay: lastPodiumPos * 0.7 + 0.7 + idx * 0.12, duration: 0.4 }}
                          className="border-b border-white/5 hover:bg-white/[0.03] transition-colors"
                        >
                          <td className="px-6 py-4">
                            <span className="font-black text-lg text-slate-400">{entry.position}º</span>
                          </td>
                          <td className="px-6 py-4">
                            <span className="text-white font-black text-sm">{entry.storeName}</span>
                          </td>
                          <td className="px-6 py-4">
                            <span className="text-slate-400 font-bold text-sm">{entry.playerName}</span>
                          </td>
                          <td className="px-6 py-4 text-right">
                            <span className="text-white font-black text-sm tabular-nums">
                              {entry.finalEbitdaMargin.toFixed(1)}%
                            </span>
                          </td>
                          <td className="px-6 py-4 text-right">
                            <span
                              className={`font-mono font-black text-sm ${
                                entry.finalEbitda >= 0 ? "text-emerald-400" : "text-red-400"
                              }`}
                            >
                              {fmtBRL(entry.finalEbitda)}
                            </span>
                          </td>
                          <td className="px-6 py-4 text-right">
                            <span className="text-slate-300 font-black text-sm tabular-nums">
                              {entry.finalMarketShare.toFixed(1)}%
                            </span>
                          </td>
                          <td className="px-6 py-4 text-right">
                            <span className="text-slate-300 font-mono font-black text-sm">
                              {fmtBRL(entry.finalCash)}
                            </span>
                          </td>
                          <td className="px-6 py-4 text-right">
                            <button
                              onClick={() => router.push(`/pages/admin/results/${entry.storeId}`)}
                              className="px-3 py-1.5 rounded-lg bg-white/5 border border-white/10 text-[10px] font-black uppercase tracking-wide text-slate-200 hover:bg-white/10 transition cursor-pointer whitespace-nowrap"
                            >
                              Ver detalhes
                            </button>
                          </td>
                        </motion.tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </motion.section>
            )}
          </>
        )}
      </main>
    </div>
  );
}
