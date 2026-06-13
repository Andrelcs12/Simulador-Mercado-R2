"use client";

import React, { useEffect, useMemo, useRef, useState } from "react";
import { motion } from "framer-motion";
import { Crown, Medal, Trophy, TrendingUp, BarChart3, ArrowLeft, LogOut } from "lucide-react";
import { useRouter } from "next/navigation";

interface RankRow {
  position: number;
  storeId: string;
  storeName: string;
  playerName: string;
  ebitda: number;
  pct: number; // % EBITDA (final) ou market share (ao vivo)
}

const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:4000";

const fmtBRL = (v: number) => `R$ ${Math.round(v ?? 0).toLocaleString("pt-BR")}`;

const ORDINAL_WORDS: Record<number, string> = {
  1: "primeiro", 2: "segundo", 3: "terceiro", 4: "quarto", 5: "quinto",
  6: "sexto", 7: "sétimo", 8: "oitavo", 9: "nono", 10: "décimo",
};
const positionLabel = (p: number) => ORDINAL_WORDS[p] ?? `${p}º`;

// Estilos por colocação: ouro / prata / bronze / padrão.
const POS_STYLE: Record<number, { ring: string; chip: string; text: string; bar: string; Icon: any }> = {
  1: { ring: "ring-amber-400/40", chip: "bg-amber-500/20 text-amber-400 border-amber-500/30", text: "text-amber-400", bar: "from-amber-500/30 to-amber-500/5", Icon: Crown },
  2: { ring: "ring-slate-300/30", chip: "bg-slate-400/20 text-slate-300 border-slate-400/30", text: "text-slate-300", bar: "from-slate-400/25 to-slate-400/5", Icon: Medal },
  3: { ring: "ring-orange-700/30", chip: "bg-orange-700/20 text-orange-400 border-orange-700/30", text: "text-orange-400", bar: "from-orange-700/25 to-orange-700/5", Icon: Medal },
};
const styleFor = (p: number) =>
  POS_STYLE[p] ?? { ring: "ring-white/10", chip: "bg-white/5 text-slate-300 border-white/10", text: "text-slate-300", bar: "from-white/10 to-transparent", Icon: Trophy };

export default function ParticipantFinalPage() {
  const router = useRouter();
  const [rows, setRows] = useState<RankRow[]>([]);
  const [myStoreId, setMyStoreId] = useState<string | null>(null);
  const [isFinal, setIsFinal] = useState(false);
  const [loading, setLoading] = useState(true);
  const fetchedRef = useRef(false);

  useEffect(() => {
    if (fetchedRef.current) return;
    fetchedRef.current = true;

    let sessionId: string | null = null;
    let storeId: string | null = null;
    try {
      const saved = sessionStorage.getItem("player_data");
      if (saved) {
        const p = JSON.parse(saved);
        sessionId = p?.sessionId ?? null;
        storeId = p?.storeId || p?.store?.id || null;
        setMyStoreId(storeId);
      }
    } catch {
      /* ignora */
    }

    if (!sessionId) {
      setLoading(false);
      return;
    }

    const load = async () => {
      // 1) Ranking final (existe após o término do jogo)
      try {
        const res = await fetch(`${API_URL}/minigame/session/${sessionId}/final-ranking`);
        const data = res.ok ? await res.json() : [];
        if (Array.isArray(data) && data.length) {
          setIsFinal(true);
          setRows(
            [...data]
              .sort((a, b) => a.position - b.position)
              .map((e: any) => ({
                position: e.position,
                storeId: e.storeId,
                storeName: e.storeName,
                playerName: e.playerName,
                ebitda: e.finalEbitda ?? 0,
                pct: e.finalEbitdaMargin ?? 0,
              }))
          );
          return;
        }
      } catch {
        /* tenta o ao vivo */
      }

      // 2) Fallback: ranking ao vivo (durante o jogo)
      try {
        const url = storeId
          ? `${API_URL}/minigame/session/${sessionId}/dashboard/latest?storeId=${storeId}`
          : `${API_URL}/minigame/session/${sessionId}/dashboard/latest`;
        const res = await fetch(url);
        const data = res.ok ? await res.json() : null;
        const ranking = Array.isArray(data?.ranking) ? data.ranking : [];
        setIsFinal(false);
        setRows(
          [...ranking]
            .sort((a: any, b: any) => (a.position ?? 99) - (b.position ?? 99))
            .map((e: any) => ({
              position: e.position,
              storeId: e.storeId,
              storeName: e.name ?? e.storeName ?? "Loja",
              playerName: e.playerName ?? "",
              ebitda: e.ebitda ?? 0,
              pct: e.marketShare ?? 0,
            }))
        );
      } catch {
        /* sem dados */
      }
    };

    load().finally(() => setLoading(false));
  }, []);

  const me = useMemo(() => rows.find((r) => r.storeId === myStoreId) ?? null, [rows, myStoreId]);
  const top3 = useMemo(() => rows.slice(0, 3), [rows]);
  const rest = useMemo(() => rows.slice(3), [rows]);
  const podiumOrder = useMemo(() => {
    const byPos = (p: number) => top3.find((e) => e.position === p);
    return [byPos(2), byPos(1), byPos(3)].filter(Boolean) as RankRow[];
  }, [top3]);
  const lastPodiumPos = useMemo(
    () => (top3.length ? Math.max(...top3.map((e) => e.position)) : 1),
    [top3]
  );

  const pctLabel = isFinal ? "% EBITDA" : "Market Share";

  if (loading) {
    return (
      <div className="min-h-screen bg-[#080D17] flex flex-col items-center justify-center gap-4">
        <motion.div
          animate={{ rotate: 360 }}
          transition={{ repeat: Infinity, duration: 1, ease: "linear" }}
          className="w-14 h-14 border-4 border-orange-500 border-t-transparent rounded-full"
        />
        <span className="text-slate-400 font-black tracking-[0.25em] text-[11px] uppercase">
          Apurando o ranking...
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
              <h1 className="text-2xl font-black tracking-tight">
                {isFinal ? "Resultado Final" : "Ranking Atual"}
              </h1>
              <p className="text-[10px] uppercase tracking-[0.25em] text-slate-400 font-bold mt-0.5">
                {isFinal ? "Classificação por % de EBITDA" : "Comparativo de mercado ao vivo"}
              </p>
            </div>
          </div>

          {isFinal ? (
            <button
              onClick={() => {
                sessionStorage.removeItem("player_data");
                sessionStorage.removeItem("round_data");
                router.push("/");
              }}
              className="flex items-center gap-2 px-5 py-2.5 rounded-xl bg-orange-500 hover:bg-orange-400 text-white text-sm font-black uppercase tracking-wide transition cursor-pointer"
            >
              <LogOut size={16} /> Sair
            </button>
          ) : (
            <button
              onClick={() => router.push("/pages/dashboard")}
              className="flex items-center gap-2 px-5 py-2.5 rounded-xl bg-white/5 border border-white/10 text-sm font-bold text-slate-200 hover:bg-white/10 transition cursor-pointer"
            >
              <ArrowLeft size={16} /> Voltar
            </button>
          )}
        </div>
      </header>

      <main className="max-w-6xl mx-auto px-6 py-8 space-y-10">
        {rows.length === 0 ? (
          <div className="rounded-3xl border border-dashed border-white/10 bg-white/[0.02] p-16 text-center">
            <Trophy size={36} className="mx-auto text-slate-700 mb-4" />
            <h3 className="text-sm font-black uppercase tracking-widest text-slate-300">
              Ranking indisponível
            </h3>
            <p className="text-xs text-slate-600 mt-2">
              Os dados aparecem assim que houver resultados de rodada.
            </p>
          </div>
        ) : (
          <>
            {/* SUA POSIÇÃO */}
            {me && (
              <motion.div
                initial={{ opacity: 0, y: 16 }}
                animate={{ opacity: 1, y: 0 }}
                className={`rounded-2xl border bg-white/5 px-6 py-5 flex flex-col sm:flex-row sm:items-center gap-4 ${styleFor(me.position).chip}`}
              >
                {React.createElement(styleFor(me.position).Icon, {
                  size: 26,
                  className: `${styleFor(me.position).text} shrink-0`,
                })}
                <div className="min-w-0">
                  <p className="text-lg md:text-xl font-black">
                    Você está em{" "}
                    <span className={styleFor(me.position).text}>
                      {positionLabel(me.position)} lugar
                    </span>
                  </p>
                  <p className="text-xs text-slate-400 font-medium truncate">
                    {me.storeName} · {pctLabel}: {me.pct.toFixed(1)}% · EBITDA {fmtBRL(me.ebitda)}
                  </p>
                </div>

                <button
                  onClick={() => router.push(`/pages/dashboard/final/${me.storeId}`)}
                  className="sm:ml-auto shrink-0 flex items-center justify-center gap-2 px-5 py-2.5 rounded-xl bg-orange-500 hover:bg-orange-400 text-white text-xs font-black uppercase tracking-wide transition cursor-pointer"
                >
                  <BarChart3 size={16} />
                  Ver mais detalhes
                </button>
              </motion.div>
            )}

            {/* PÓDIO (TOP 3) */}
            <section>
              <div className="flex items-center gap-2 mb-8 justify-center">
                <Crown size={18} className="text-amber-400" />
                <h2 className="text-[11px] font-black uppercase tracking-[0.3em] text-slate-300">Pódio</h2>
              </div>

              <div className="flex items-end justify-center gap-3 md:gap-6">
                {podiumOrder.map((entry) => {
                  const style = styleFor(entry.position);
                  const Icon = style.Icon;
                  const isChamp = entry.position === 1;
                  const isMe = entry.storeId === myStoreId;
                  const barHeight = isChamp ? "h-44" : entry.position === 2 ? "h-32" : "h-24";
                  const revealDelay = (lastPodiumPos - entry.position) * 0.7;

                  return (
                    <motion.div
                      key={entry.storeId}
                      initial={{ opacity: 0, y: 40 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: revealDelay, duration: 0.6, type: "spring", stiffness: 90, damping: 15 }}
                      className="flex flex-col items-center gap-3 flex-1 max-w-[230px]"
                    >
                      <div
                        className={`w-full rounded-3xl border bg-white/5 p-5 text-center ${
                          isMe ? "border-orange-500/40 ring-2 ring-orange-500/40 ring-offset-2 ring-offset-[#080D17]" : `border-white/10 ${isChamp ? `ring-2 ${style.ring} ring-offset-2 ring-offset-[#080D17]` : ""}`
                        }`}
                      >
                        <div className="flex justify-center -mt-10 mb-2">
                          <div className={`w-14 h-14 rounded-2xl bg-[#0B1220] border border-white/10 flex items-center justify-center ${style.text}`}>
                            <Icon size={24} />
                          </div>
                        </div>

                        <span className={`inline-block px-3 py-1 rounded-lg text-[10px] font-black uppercase tracking-[0.15em] border ${style.chip}`}>
                          {entry.position}º Lugar
                        </span>

                        <p className="text-white font-black text-base mt-3 truncate">
                          {entry.storeName}
                          {isMe && <span className="text-[9px] text-orange-400 ml-1">(Você)</span>}
                        </p>
                        <p className="text-[10px] text-slate-400 font-bold uppercase tracking-wider truncate">
                          {entry.playerName}
                        </p>

                        <div className="mt-4 pt-4 border-t border-white/10 space-y-2">
                          <div>
                            <p className="text-[9px] text-slate-500 font-black uppercase tracking-widest">{pctLabel}</p>
                            <p className={`font-black text-xl ${style.text}`}>{entry.pct.toFixed(1)}%</p>
                          </div>
                          <div className={`flex items-center justify-center gap-1 ${entry.ebitda >= 0 ? "text-emerald-400" : "text-red-400"}`}>
                            <TrendingUp size={12} />
                            <span className="font-mono font-black text-sm">{fmtBRL(entry.ebitda)}</span>
                          </div>
                        </div>

                        <button
                          onClick={() => router.push(`/pages/dashboard/final/${entry.storeId}`)}
                          className="mt-4 w-full px-3 py-2 rounded-xl bg-white/5 border border-white/10 text-[11px] font-black uppercase tracking-wide text-slate-200 hover:bg-white/10 transition cursor-pointer"
                        >
                          Ver detalhes
                        </button>
                      </div>

                      <div className={`w-full ${barHeight} rounded-t-2xl border-x border-t border-white/10 bg-gradient-to-b ${style.bar} flex items-start justify-center pt-4`}>
                        <span className={`text-5xl font-black ${style.text}`}>{entry.position}</span>
                      </div>
                    </motion.div>
                  );
                })}
              </div>
            </section>

            {/* DEMAIS COLOCADOS */}
            {rest.length > 0 && (
              <motion.section
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: lastPodiumPos * 0.7 + 0.5, duration: 0.5 }}
                className="rounded-3xl border border-white/10 bg-white/[0.02] overflow-hidden"
              >
                <div className="px-6 py-5 border-b border-white/10 flex items-center gap-3">
                  <BarChart3 size={18} className="text-orange-400" />
                  <h3 className="text-[11px] font-black uppercase tracking-[0.25em] text-slate-300">Demais Colocados</h3>
                </div>

                <div className="overflow-x-auto">
                  <table className="w-full min-w-[560px]">
                    <thead>
                      <tr className="border-b border-white/10">
                        <th className="px-6 py-4 text-left text-[9px] font-black text-slate-500 uppercase tracking-widest">Pos.</th>
                        <th className="px-6 py-4 text-left text-[9px] font-black text-slate-500 uppercase tracking-widest">Loja</th>
                        <th className="px-6 py-4 text-left text-[9px] font-black text-slate-500 uppercase tracking-widest">Gerente</th>
                        <th className="px-6 py-4 text-right text-[9px] font-black text-slate-500 uppercase tracking-widest">{pctLabel}</th>
                        <th className="px-6 py-4 text-right text-[9px] font-black text-slate-500 uppercase tracking-widest">EBITDA</th>
                        <th className="px-6 py-4 text-right text-[9px] font-black text-slate-500 uppercase tracking-widest">Detalhes</th>
                      </tr>
                    </thead>
                    <tbody>
                      {rest.map((entry) => {
                        const isMe = entry.storeId === myStoreId;
                        return (
                          <tr key={entry.storeId} className={`border-b border-white/5 ${isMe ? "bg-orange-500/10" : "hover:bg-white/[0.03]"} transition-colors`}>
                            <td className="px-6 py-4"><span className="font-black text-lg text-slate-400">{entry.position}º</span></td>
                            <td className="px-6 py-4">
                              <span className={`font-black text-sm ${isMe ? "text-orange-400" : "text-white"}`}>
                                {entry.storeName}
                                {isMe && <span className="text-[9px] opacity-70 ml-1">(Você)</span>}
                              </span>
                            </td>
                            <td className="px-6 py-4"><span className="text-slate-400 font-bold text-sm">{entry.playerName}</span></td>
                            <td className="px-6 py-4 text-right"><span className="text-white font-black text-sm tabular-nums">{entry.pct.toFixed(1)}%</span></td>
                            <td className="px-6 py-4 text-right">
                              <span className={`font-mono font-black text-sm ${entry.ebitda >= 0 ? "text-emerald-400" : "text-red-400"}`}>
                                {fmtBRL(entry.ebitda)}
                              </span>
                            </td>
                            <td className="px-6 py-4 text-right">
                              <button
                                onClick={() => router.push(`/pages/dashboard/final/${entry.storeId}`)}
                                className="px-3 py-1.5 rounded-lg bg-white/5 border border-white/10 text-[10px] font-black uppercase tracking-wide text-slate-200 hover:bg-white/10 transition cursor-pointer whitespace-nowrap"
                              >
                                Ver detalhes
                              </button>
                            </td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                </div>
              </motion.section>
            )}

            {isFinal && (
              <p className="text-center text-[11px] uppercase tracking-[0.25em] text-slate-600 font-black pb-4">
                🏁 Simulação encerrada
              </p>
            )}
          </>
        )}
      </main>
    </div>
  );
}
