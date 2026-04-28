"use client";

import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Trophy, Medal, TrendingUp, DollarSign,
  ArrowRight, RotateCcw, Star, BarChart2, Crown
} from 'lucide-react';
import { io, Socket } from 'socket.io-client';
import toast, { Toaster } from 'react-hot-toast';
import { useRouter } from 'next/navigation';

interface RankEntry {
  position: number;
  playerId: string;
  storeName: string;
  playerName: string;
  ebitda: number;
  netProfit: number;
  marketShare?: number;
  nps?: number;
}

const PODIUM_COLORS = [
  { bg: 'bg-yellow-400', border: 'border-yellow-500', text: 'text-yellow-900', shadow: 'shadow-yellow-400/40', label: '1º Lugar', icon: <Crown size={28} /> },
  { bg: 'bg-slate-300',  border: 'border-slate-400',  text: 'text-slate-900',  shadow: 'shadow-slate-300/40',  label: '2º Lugar', icon: <Medal size={28} /> },
  { bg: 'bg-amber-600',  border: 'border-amber-700',  text: 'text-amber-100',  shadow: 'shadow-amber-600/40',  label: '3º Lugar', icon: <Medal size={28} /> },
];

const AdminResultsPage = () => {
  const router = useRouter();
  const socketRef = useRef<Socket | null>(null);
  const [rankData, setRankData] = useState<RankEntry[]>([]);
  const [loading, setLoading] = useState(true);
  const [session, setSession] = useState<any>(null);

  const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:4000';

  useEffect(() => {
    // 1. Tenta pegar dados do localStorage (enviados pelo socket simulation:finished)
    const saved = localStorage.getItem('rank_data');
    if (saved) {
      try {
        const parsed: RankEntry[] = JSON.parse(saved);
        const sorted = [...parsed].sort((a, b) => b.ebitda - a.ebitda).map((e, i) => ({ ...e, position: i + 1 }));
        setRankData(sorted);
      } catch { /* ignora */ }
    }

    const sessionId = localStorage.getItem('admin_session_id');
    const adminName = localStorage.getItem('admin_name') ?? 'Admin';

    if (sessionId) {
      // 2. Também busca do backend para garantir dados atualizados
      fetch(`${API_URL}/minigame/session/${sessionId}`)
        .then(r => r.json())
        .then(data => setSession(data))
        .catch(() => {});

      fetch(`${API_URL}/minigame/results/${sessionId}`)
        .then(r => r.json())
        .then((data: RankEntry[]) => {
          if (Array.isArray(data) && data.length > 0) {
            const sorted = [...data].sort((a, b) => b.ebitda - a.ebitda).map((e, i) => ({ ...e, position: i + 1 }));
            setRankData(sorted);
          }
        })
        .catch(() => {})
        .finally(() => setLoading(false));

      // 3. Conecta socket para ouvir eventos de próxima rodada
      const socket = io(`${API_URL}/simulation`, { reconnection: true });
      socketRef.current = socket;
      socket.emit('join_session', { sessionId, name: adminName, isAdmin: true });
    } else {
      setLoading(false);
    }

    return () => { socketRef.current?.disconnect(); };
  }, [API_URL]);

  // ── Próxima rodada ──────────────────────────────────────────────────────────
  const proximaRodada = async () => {
    if (!session) return;

    try {
      await fetch(`${API_URL}/minigame/next-round`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ sessionId: session.id }),
      });

      // Limpa dados de ranking para a nova rodada
      localStorage.removeItem('rank_data');

      toast('🔄 Nova rodada preparada! Voltando ao lobby...', {
        style: { background: '#002350', color: '#fff', fontWeight: 'bold' },
        duration: 2000,
      });

      setTimeout(() => router.push('/pages/admin/dashboard'), 2200);
    } catch {
      toast.error('Erro ao avançar para a próxima rodada.');
    }
  };

  // ── Loading ─────────────────────────────────────────────────────────────────
  if (loading) return (
    <div className="min-h-screen bg-[#002350] flex flex-col items-center justify-center gap-4">
      <motion.div
        animate={{ rotate: 360 }}
        transition={{ repeat: Infinity, duration: 1, ease: 'linear' }}
        className="w-16 h-16 border-4 border-yellow-400 border-t-transparent rounded-full"
      />
      <span className="text-white font-black tracking-widest text-xs uppercase italic">Calculando ranking final...</span>
    </div>
  );

  const top3 = rankData.slice(0, 3);
  const rest = rankData.slice(3);

  return (
    <div className="min-h-screen bg-[#002350] font-sans overflow-x-hidden">
      <Toaster position="top-right" />

      {/* HEADER */}
      <header className="w-full px-6 md:px-12 py-6 flex justify-between items-center border-b border-white/10">
        <div className="flex items-center gap-4">
          <div className="w-10 h-10 bg-orange-500 rounded-xl flex items-center justify-center font-black text-white text-lg">C</div>
          <div>
            <h1 className="text-white font-black text-sm uppercase italic tracking-tight">
              SIMULADOR <span className="text-orange-500">CENCOSUD</span>
            </h1>
            <p className="text-blue-300 text-[9px] font-black uppercase tracking-widest">Ranking Final de Simulação</p>
          </div>
        </div>

        {/* BOTÃO PRÓXIMA RODADA */}
        <motion.button
          whileHover={{ scale: 1.03 }}
          whileTap={{ scale: 0.97 }}
          onClick={proximaRodada}
          className="flex items-center gap-3 bg-orange-500 hover:bg-orange-400 text-white px-8 py-4 rounded-2xl font-black text-xs uppercase italic tracking-widest shadow-xl shadow-orange-500/20 transition-colors border-b-4 border-orange-700"
        >
          <RotateCcw size={16} /> Próxima Rodada
          <ArrowRight size={16} />
        </motion.button>
      </header>

      <main className="max-w-6xl mx-auto p-6 md:p-10 space-y-12">

        {/* TÍTULO */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center space-y-3"
        >
          <div className="flex items-center justify-center gap-3 mb-2">
            <Trophy size={40} className="text-yellow-400" />
            <h2 className="text-5xl font-black text-white uppercase italic tracking-tighter">
              Ranking <span className="text-orange-500">Final</span>
            </h2>
            <Trophy size={40} className="text-yellow-400" />
          </div>
          <p className="text-blue-300 font-black text-xs uppercase tracking-[0.3em]">
            Classificação por EBITDA Operacional • Sessão {session?.code ?? '---'}
          </p>
        </motion.div>

        {/* ── PÓDIO (TOP 3) ── */}
        {top3.length > 0 && (
          <div className="flex items-end justify-center gap-4 md:gap-8">
            {/* Reordena para exibição: 2º → 1º → 3º */}
            {[top3[1], top3[0], top3[2]].filter(Boolean).map((entry, displayIdx) => {
              const actualPos = entry.position - 1; // índice 0-based
              const color = PODIUM_COLORS[actualPos];
              const heights = ['h-40', 'h-52', 'h-32']; // 2º, 1º, 3º
              const podiumHeight = displayIdx === 0 ? heights[0] : displayIdx === 1 ? heights[1] : heights[2];

              return (
                <motion.div
                  key={entry.playerId}
                  initial={{ opacity: 0, y: 40 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: displayIdx * 0.15, type: 'spring', stiffness: 120 }}
                  className="flex flex-col items-center gap-3 flex-1 max-w-[200px]"
                >
                  {/* Card do player */}
                  <div className={`w-full bg-white/10 border border-white/20 rounded-[2rem] p-5 text-center backdrop-blur-sm ${displayIdx === 1 ? 'ring-2 ring-yellow-400 ring-offset-2 ring-offset-[#002350]' : ''}`}>
                    <div className={`w-14 h-14 ${color.bg} rounded-full flex items-center justify-center mx-auto mb-3 shadow-xl ${color.shadow} text-white`}>
                      {color.icon}
                    </div>
                    <p className="text-white font-black text-sm uppercase italic tracking-tight leading-tight mb-1">
                      {entry.storeName}
                    </p>
                    <p className="text-blue-300 text-[9px] font-bold uppercase">{entry.playerName}</p>
                    <div className="mt-3 pt-3 border-t border-white/10">
                      <p className="text-[9px] text-blue-300 font-black uppercase tracking-widest">EBITDA</p>
                      <p className="text-yellow-400 font-black text-lg">
                        R$ {entry.ebitda.toLocaleString('pt-BR')}
                      </p>
                    </div>
                  </div>

                  {/* Base do pódio */}
                  <div className={`w-full ${podiumHeight} ${color.bg} rounded-t-2xl flex items-center justify-center shadow-2xl ${color.shadow} relative overflow-hidden`}>
                    <span className={`text-4xl font-black ${color.text} relative z-10`}>{entry.position}º</span>
                    <div className="absolute inset-0 bg-gradient-to-b from-white/10 to-transparent" />
                  </div>
                </motion.div>
              );
            })}
          </div>
        )}

        {/* ── TABELA COMPLETA ── */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.5 }}
          className="bg-white/5 border border-white/10 rounded-[2.5rem] overflow-hidden backdrop-blur-sm"
        >
          <div className="p-6 border-b border-white/10 flex items-center gap-3">
            <BarChart2 size={20} className="text-orange-500" />
            <h3 className="text-white font-black uppercase italic tracking-widest text-sm">Classificação Completa</h3>
          </div>

          {rankData.length === 0 ? (
            <div className="py-20 text-center text-white/30 font-black uppercase tracking-widest text-sm">
              Nenhum resultado disponível
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b border-white/10">
                    <th className="px-6 py-4 text-left text-[9px] font-black text-blue-300 uppercase tracking-widest">Pos.</th>
                    <th className="px-6 py-4 text-left text-[9px] font-black text-blue-300 uppercase tracking-widest">Loja</th>
                    <th className="px-6 py-4 text-left text-[9px] font-black text-blue-300 uppercase tracking-widest">Jogador</th>
                    <th className="px-6 py-4 text-right text-[9px] font-black text-blue-300 uppercase tracking-widest">EBITDA</th>
                    <th className="px-6 py-4 text-right text-[9px] font-black text-blue-300 uppercase tracking-widest">Lucro Líquido</th>
                    {rankData[0]?.marketShare !== undefined && (
                      <th className="px-6 py-4 text-right text-[9px] font-black text-blue-300 uppercase tracking-widest">Market Share</th>
                    )}
                    {rankData[0]?.nps !== undefined && (
                      <th className="px-6 py-4 text-right text-[9px] font-black text-blue-300 uppercase tracking-widest">NPS</th>
                    )}
                  </tr>
                </thead>
                <tbody>
                  <AnimatePresence>
                    {rankData.map((entry, idx) => {
                      const isTop3 = entry.position <= 3;
                      const posColor = entry.position === 1 ? 'text-yellow-400' : entry.position === 2 ? 'text-slate-300' : entry.position === 3 ? 'text-amber-500' : 'text-white/50';

                      return (
                        <motion.tr
                          key={entry.playerId}
                          initial={{ opacity: 0, x: -20 }}
                          animate={{ opacity: 1, x: 0 }}
                          transition={{ delay: 0.6 + idx * 0.05 }}
                          className={`border-b border-white/5 transition-colors ${isTop3 ? 'bg-white/5' : 'hover:bg-white/5'}`}
                        >
                          <td className="px-6 py-4">
                            <span className={`font-black text-xl ${posColor}`}>{entry.position}º</span>
                          </td>
                          <td className="px-6 py-4">
                            <div className="flex items-center gap-3">
                              {isTop3 && (
                                <div className={`w-8 h-8 rounded-xl flex items-center justify-center ${PODIUM_COLORS[entry.position - 1].bg}`}>
                                  <Star size={14} className="text-white" />
                                </div>
                              )}
                              <span className="text-white font-black text-sm uppercase italic">{entry.storeName}</span>
                            </div>
                          </td>
                          <td className="px-6 py-4">
                            <span className="text-blue-300 font-bold text-sm">{entry.playerName}</span>
                          </td>
                          <td className="px-6 py-4 text-right">
                            <div className="flex items-center justify-end gap-1">
                              <TrendingUp size={12} className="text-emerald-400" />
                              <span className="text-emerald-400 font-black text-sm">
                                R$ {entry.ebitda.toLocaleString('pt-BR')}
                              </span>
                            </div>
                          </td>
                          <td className="px-6 py-4 text-right">
                            <div className="flex items-center justify-end gap-1">
                              <DollarSign size={12} className="text-orange-400" />
                              <span className="text-orange-400 font-black text-sm">
                                R$ {entry.netProfit.toLocaleString('pt-BR')}
                              </span>
                            </div>
                          </td>
                          {entry.marketShare !== undefined && (
                            <td className="px-6 py-4 text-right">
                              <span className="text-white/70 font-black text-sm">{entry.marketShare}%</span>
                            </td>
                          )}
                          {entry.nps !== undefined && (
                            <td className="px-6 py-4 text-right">
                              <span className={`font-black text-sm ${entry.nps >= 80 ? 'text-emerald-400' : entry.nps >= 60 ? 'text-yellow-400' : 'text-red-400'}`}>
                                {entry.nps}
                              </span>
                            </td>
                          )}
                        </motion.tr>
                      );
                    })}
                  </AnimatePresence>
                </tbody>
              </table>
            </div>
          )}
        </motion.div>

        {/* BOTÃO INFERIOR PRÓXIMA RODADA */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 1 }}
          className="flex justify-center pb-8"
        >
          <button
            onClick={proximaRodada}
            className="flex items-center gap-4 bg-orange-500 hover:bg-orange-400 text-white px-14 py-6 rounded-[2rem] font-black text-base uppercase italic tracking-widest shadow-2xl shadow-orange-500/20 transition-all hover:scale-[1.02] active:scale-95 border-b-8 border-orange-700"
          >
            <RotateCcw size={22} />
            Próxima Rodada
            <ArrowRight size={22} />
          </button>
        </motion.div>
      </main>
    </div>
  );
};

export default AdminResultsPage;
