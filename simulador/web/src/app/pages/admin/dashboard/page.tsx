"use client";

import React, { useState, useEffect, useRef } from 'react';
import { io, Socket } from 'socket.io-client';
import {
  Play, Users, Radio, CheckCircle2,
  Settings2, Trophy, Activity, LayoutDashboard,
  Signal, Wifi, Clock, StopCircle, XCircle
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import toast, { Toaster } from 'react-hot-toast';
import { useRouter } from 'next/navigation';

interface Player {
  id: string;
  name: string;
  storeName: string;
  isReady: boolean;
  submittedAt?: string;
}

const AdminMestre = () => {
  const router = useRouter();
  const [session, setSession] = useState<any>(null);
  const [players, setPlayers] = useState<Player[]>([]);
  const [loading, setLoading] = useState(true);
  const [gameStarted, setGameStarted] = useState(false);
  const [submittedCount, setSubmittedCount] = useState(0);

  const [config, setConfig] = useState({
    durationMinutes: 45,
    round: 1,
    adminName: 'Facilitador Cencosud',
  });

  const socketRef = useRef<Socket | null>(null);

  const formatTime = (minutes: number) => {
    const m = Math.floor(minutes);
    const s = 0;
    return `${m.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}`;
  };

  // ── Carrega sessão e conecta socket ─────────────────────────────────────────
  useEffect(() => {
    const carregarSessao = async () => {
      const sessionId = localStorage.getItem('admin_session_id');
      const savedAdminName = localStorage.getItem('admin_name');

      if (!sessionId) {
        window.location.href = '/pages/admin/dashboard/setup';
        return;
      }

      if (savedAdminName) {
        setConfig(prev => ({ ...prev, adminName: savedAdminName }));
      }

      try {
        const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/minigame/session/${sessionId}`);
        const data = await res.json();
        setSession(data);

        const resPlayers = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/minigame/players/${sessionId}`);
        const playersData = await resPlayers.json();
        setPlayers(playersData.map((p: any) => ({ ...p, isReady: p.isActive, submittedAt: undefined })));

        conectarSocket(data.id, savedAdminName || config.adminName);
      } catch (error) {
        console.error('Erro ao recuperar dados:', error);
        toast.error('Erro ao carregar sessão.');
      } finally {
        setLoading(false);
      }
    };

    carregarSessao();
    return () => { socketRef.current?.disconnect(); };
  }, []);

  // ── Emite config atualizada para todos os players ───────────────────────────
  useEffect(() => {
    if (socketRef.current && session) {
      socketRef.current.emit('admin:update_config', {
        sessionId: session.id,
        duration: config.durationMinutes * 60,
        round: config.round,
        adminName: config.adminName,
      });
    }
  }, [config, session]);

  const conectarSocket = (sessionId: string, currentAdminName: string) => {
    const socket = io(`${process.env.NEXT_PUBLIC_API_URL}/simulation`, {
      reconnection: true,
      reconnectionAttempts: Infinity,
      reconnectionDelay: 1000,
    });
    socketRef.current = socket;

    socket.emit('join_session', { sessionId, name: currentAdminName, isAdmin: true });

    // ✅ Novo player entrou no lobby
    socket.on('lobby:player_entered', (player: Player) => {
      setPlayers(prev => {
        const exists = prev.find(p => p.id === player.id);
        if (exists) return prev;
        return [...prev, { ...player, isReady: false }];
      });
    });

    // Player confirmou que está pronto (squad validado)
    socket.on('lobby:player_ready', ({ playerId }: { playerId: string }) => {
      setPlayers(prev => prev.map(p => p.id === playerId ? { ...p, isReady: true } : p));
    });

    // ✅ Player enviou decisões → card fica verde com ícone e timestamp
    socket.on('admin:player_submitted', ({ playerId, storeName }: { playerId: string; storeName: string }) => {
      const now = new Date().toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit', second: '2-digit' });

      setPlayers(prev =>
        prev.map(p =>
          p.id === playerId
            ? { ...p, isReady: true, submittedAt: now }
            : p
        )
      );

      setSubmittedCount(c => c + 1);

      toast.success(`${storeName} enviou as decisões! ✅`, {
        style: { background: '#002350', color: '#fff', fontWeight: 'bold', borderRadius: '15px' },
        iconTheme: { primary: '#f97316', secondary: '#fff' },
      });
    });

    // ✅ Simulação finalizada → vai para tela de ranking
    socket.on('simulation:finished', ({ rankData }: { rankData: any[] }) => {
      localStorage.setItem('rank_data', JSON.stringify(rankData ?? []));
      toast('🏆 Simulação encerrada! Redirecionando para o Ranking...', {
        duration: 2000,
        style: { background: '#002350', color: '#fff', fontWeight: 'bold' },
      });
      setTimeout(() => router.push('/pages/admin/results'), 2200);
    });
  };

  // ── Disparar rodada ─────────────────────────────────────────────────────────
  const dispararRodada = () => {
    if (!session || players.length < 1) return;
    const durationSeconds = config.durationMinutes * 60;

    socketRef.current?.emit('admin:start_round', {
      sessionId: session.id,
      duration: durationSeconds,
      round: config.round,
    });

    setGameStarted(true);
    // Reset de submissões para a nova rodada
    setSubmittedCount(0);
    setPlayers(prev => prev.map(p => ({ ...p, submittedAt: undefined })));

    toast('🚀 Rodada liberada para todos os players!', {
      style: { background: '#f97316', color: '#fff', fontWeight: 'bold' },
    });
  };

  // ── Forçar encerramento da rodada ───────────────────────────────────────────
  const forcerEncerramento = () => {
    if (!session) return;
    socketRef.current?.emit('admin:force_stop_round', { sessionId: session.id });
    setGameStarted(false);
    toast('⏹ Rodada encerrada pelo administrador.', {
      style: { background: '#002350', color: '#fff', fontWeight: 'bold' },
    });
  };

  // ── Encerrar simulação (última rodada) ──────────────────────────────────────
  const encerrarSimulacao = () => {
    if (!session) return;
    socketRef.current?.emit('admin:finish_simulation', { sessionId: session.id });
  };

  // ── Loading ─────────────────────────────────────────────────────────────────
  if (loading) return (
    <div className="min-h-screen bg-[#002350] flex flex-col items-center justify-center gap-4">
      <motion.div
        animate={{ rotate: 360 }}
        transition={{ repeat: Infinity, duration: 1, ease: 'linear' }}
        className="w-16 h-16 border-4 border-orange-500 border-t-transparent rounded-full"
      />
      <span className="text-white font-black tracking-widest text-xs uppercase italic">Sincronizando Centro de Comando...</span>
    </div>
  );

  const allSubmitted = players.length > 0 && submittedCount >= players.length;

  return (
    <div className="min-h-screen bg-[#F8FAFC] text-[#002350] flex flex-col items-center relative overflow-x-hidden font-sans">
      <Toaster position="top-right" />

      {/* HEADER */}
      <header className="w-full bg-[#002350] p-4 md:px-12 flex justify-between items-center shadow-lg z-20 border-b-4 border-orange-500">
        <div className="flex items-center gap-4">
          <div className="w-10 h-10 bg-orange-500 rounded-xl flex items-center justify-center font-black text-white text-lg">C</div>
          <div className="h-6 w-px bg-white/20 mx-2" />
          <div>
            <h1 className="text-white text-lg font-black leading-none tracking-tight italic uppercase">
              SIMULADOR <span className="text-orange-500">CENCOSUD</span>
            </h1>
            <p className="text-blue-300 text-[9px] font-black tracking-widest uppercase italic">Painel de Controle Interno</p>
          </div>
        </div>

        <div className="flex items-center gap-6">
          <div className="hidden md:flex flex-col items-end">
            <span className="text-blue-200 text-[9px] font-black tracking-widest uppercase">Facilitador Ativo</span>
            <span className="text-white text-xs font-black uppercase italic">{config.adminName}</span>
          </div>
          <div className="h-10 w-[1px] bg-white/10 hidden md:block" />
          <Activity className="text-orange-500 animate-pulse" size={20} />
        </div>
      </header>

      <main className="w-full max-w-[1600px] grid grid-cols-1 lg:grid-cols-12 gap-6 p-6 md:p-10 z-10">

        {/* ── COLUNA DE CONTROLE ── */}
        <div className="lg:col-span-4 space-y-6">

          {/* CÓDIGO DE ACESSO */}
          <motion.div
            initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }}
            className="bg-white border border-slate-200 p-8 rounded-[2.5rem] shadow-sm relative overflow-hidden group"
          >
            <div className="absolute top-0 right-0 p-4 opacity-[0.05] group-hover:opacity-10 transition-opacity">
              <Wifi size={80} />
            </div>
            <span className="text-slate-400 font-black tracking-[0.2em] uppercase text-[10px] mb-2 block italic">Código de Acesso</span>
            <div className="text-7xl font-black tracking-tighter text-[#002350]">
              {session?.code || '----'}
            </div>
            <div className="mt-4 flex items-center gap-2 text-emerald-600 font-black text-[10px] italic uppercase tracking-wider">
              <div className="w-2 h-2 bg-emerald-500 rounded-full animate-ping" />
              Sessão Aberta para Conexão
            </div>
          </motion.div>

          {/* CONFIGURAÇÃO DA RODADA */}
          <motion.div
            initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: 0.1 }}
            className="bg-[#002350] text-white p-8 rounded-[2.5rem] shadow-xl space-y-6 border-b-8 border-orange-500"
          >
            <div className="flex items-center gap-2 text-orange-500 font-black text-xs uppercase tracking-widest italic">
              <Settings2 size={16} /> Configuração da Rodada
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <label className="text-[10px] font-black text-blue-300 uppercase flex items-center gap-2 italic">
                  <Clock size={12} className="text-orange-500" /> Duração (Min)
                </label>
                <input
                  type="number"
                  value={config.durationMinutes}
                  onChange={(e) => setConfig({ ...config, durationMinutes: Number(e.target.value) })}
                  className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-4 text-lg font-black text-orange-500 outline-none focus:bg-white/10 transition-all shadow-inner"
                />
                <p className="text-[9px] text-blue-400 font-black italic uppercase">Total: {formatTime(config.durationMinutes)}</p>
              </div>
              <div className="space-y-2">
                <label className="text-[10px] font-black text-blue-300 uppercase flex items-center gap-2 italic">
                  <Trophy size={12} className="text-orange-500" /> Fase Atual
                </label>
                <select
                  value={config.round}
                  onChange={(e) => setConfig({ ...config, round: Number(e.target.value) })}
                  className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-4 text-lg font-black text-white outline-none cursor-pointer focus:bg-white/10"
                >
                  {[1, 2, 3, 4, 5].map(r => (
                    <option key={r} value={r} className="bg-[#002350]">Rodada {r}</option>
                  ))}
                </select>
              </div>
            </div>

            {/* BOTÃO INICIAR / EM CURSO */}
            <button
              onClick={dispararRodada}
              disabled={players.length < 1 || gameStarted}
              className={`w-full py-7 rounded-2xl font-black text-lg flex items-center justify-center gap-4 transition-all shadow-2xl uppercase italic ${
                gameStarted
                  ? 'bg-emerald-500 text-white cursor-default'
                  : players.length < 1
                  ? 'bg-white/5 text-white/20 cursor-not-allowed border border-dashed border-white/10'
                  : 'bg-orange-500 hover:bg-orange-600 text-white hover:scale-[1.02] active:scale-95 shadow-orange-500/20'
              }`}
            >
              {gameStarted ? (
                <>Simulação em Curso <Radio size={24} className="animate-pulse" /></>
              ) : (
                <>Liberar Operação <Play fill="currentColor" size={24} /></>
              )}
            </button>

            {/* ✅ BOTÃO ENCERRAR RODADA ANTES DO TEMPO */}
            {gameStarted && (
              <motion.button
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                onClick={forcerEncerramento}
                className="w-full py-4 rounded-2xl font-black text-sm flex items-center justify-center gap-3 uppercase italic border-2 border-red-500/30 text-red-400 hover:bg-red-500/10 transition-all active:scale-95"
              >
                <StopCircle size={18} /> Encerrar Rodada Agora
              </motion.button>
            )}

            {/* PROGRESSO DE SUBMISSÕES */}
            {gameStarted && (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="space-y-2"
              >
                <div className="flex justify-between items-center text-[10px] font-black uppercase">
                  <span className="text-blue-300 tracking-widest">Submissões Recebidas</span>
                  <span className={`${allSubmitted ? 'text-emerald-400' : 'text-orange-400'}`}>
                    {submittedCount} / {players.length}
                  </span>
                </div>
                <div className="h-2 bg-white/10 rounded-full overflow-hidden">
                  <motion.div
                    animate={{ width: players.length > 0 ? `${(submittedCount / players.length) * 100}%` : '0%' }}
                    className={`h-full rounded-full transition-colors ${allSubmitted ? 'bg-emerald-500' : 'bg-orange-500'}`}
                  />
                </div>
                {allSubmitted && (
                  <motion.div
                    initial={{ opacity: 0, y: 6 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="space-y-3"
                  >
                    <p className="text-emerald-400 text-[9px] font-black uppercase tracking-widest text-center animate-pulse">
                      ✅ Todos os squads enviaram!
                    </p>
                    <button
                      onClick={() => router.push('/pages/admin/results')}
                      className="w-full py-4 rounded-2xl font-black text-sm flex items-center justify-center gap-3 uppercase italic bg-emerald-500 hover:bg-emerald-400 text-white transition-all active:scale-95 shadow-lg shadow-emerald-500/20"
                    >
                      <Trophy size={18} /> Ver Ranking
                    </button>
                  </motion.div>
                )}
              </motion.div>
            )}
          </motion.div>

          {/* ✅ BOTÃO ENCERRAR SIMULAÇÃO (última rodada) */}
          {config.round >= 5 && (
            <motion.button
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              onClick={encerrarSimulacao}
              className="w-full py-5 rounded-[2rem] font-black text-sm flex items-center justify-center gap-3 uppercase italic bg-red-600 hover:bg-red-700 text-white shadow-lg active:scale-95 transition-all border-b-4 border-red-900"
            >
              <XCircle size={20} /> Encerrar Simulação Final
            </motion.button>
          )}
        </div>

        {/* ── MONITOR DE UNIDADES ── */}
        <div className="lg:col-span-8">
          <motion.div
            initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}
            className="bg-white border border-slate-200 rounded-[3rem] shadow-sm flex flex-col h-full min-h-[650px] overflow-hidden"
          >
            <div className="p-8 border-b border-slate-100 flex justify-between items-center bg-slate-50/50">
              <div className="flex items-center gap-4">
                <div className="p-4 bg-[#002350] rounded-2xl text-orange-500 shadow-xl shadow-blue-900/20">
                  <Users size={28} />
                </div>
                <div>
                  <h3 className="text-2xl font-black text-[#002350] italic uppercase tracking-tighter">Monitor de Unidades</h3>
                  <p className="text-[11px] text-slate-400 font-black uppercase tracking-widest">
                    {players.length} Unidades conectadas agora
                  </p>
                </div>
              </div>
              <div className="flex items-center gap-3 px-5 py-2.5 bg-emerald-50 text-emerald-700 rounded-full text-[10px] font-black border border-emerald-200 shadow-sm uppercase tracking-wider">
                <Signal size={14} className="animate-bounce text-emerald-500" /> Monitoramento em Tempo Real
              </div>
            </div>

            <div className="flex-1 overflow-y-auto p-8 [&::-webkit-scrollbar]:w-1.5 [&::-webkit-scrollbar-thumb]:bg-slate-200 [&::-webkit-scrollbar-thumb]:rounded-full bg-[radial-gradient(#e2e8f0_1px,transparent_1px)] [background-size:20px_20px]">
              <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-6">
                <AnimatePresence mode="popLayout">
                  {players.length === 0 ? (
                    <div className="col-span-full py-32 text-center opacity-10 flex flex-col items-center">
                      <LayoutDashboard size={100} className="mb-6" />
                      <p className="font-black uppercase tracking-[0.5em] text-sm italic">Aguardando Gestores de Loja...</p>
                    </div>
                  ) : (
                    players.map((p) => {
                      // ✅ Card verde com ✅ e timestamp quando player submeteu
                      const submitted = !!p.submittedAt;

                      return (
                        <motion.div
                          key={p.id}
                          layout
                          initial={{ scale: 0.9, opacity: 0 }}
                          animate={{ scale: 1, opacity: 1 }}
                          exit={{ scale: 0.8, opacity: 0 }}
                          className={`group relative p-6 rounded-[2.5rem] border-2 transition-all duration-500 ${
                            submitted
                              ? 'bg-emerald-50 border-emerald-500 shadow-[0_20px_40px_rgba(16,185,129,0.12)]'
                              : p.isReady
                              ? 'bg-white border-blue-200 shadow-sm'
                              : 'bg-white border-slate-100 hover:border-orange-300 shadow-sm'
                          }`}
                        >
                          <div className="flex flex-col gap-4">
                            <div className="flex justify-between items-start">
                              <div className={`w-12 h-12 rounded-2xl flex items-center justify-center transition-all ${
                                submitted ? 'bg-emerald-500 text-white'
                                : p.isReady ? 'bg-blue-100 text-blue-600'
                                : 'bg-slate-100 text-slate-400 group-hover:bg-orange-500 group-hover:text-white'
                              }`}>
                                <Users size={24} />
                              </div>

                              {/* ✅ Ícone de status */}
                              {submitted ? (
                                <div className="bg-emerald-500 text-white p-1.5 rounded-full shadow-lg">
                                  <CheckCircle2 size={18} />
                                </div>
                              ) : p.isReady ? (
                                <div className="flex items-center gap-1.5 text-[9px] font-black text-blue-600 bg-blue-50 px-3 py-1 rounded-full border border-blue-100 uppercase">
                                  <div className="w-1.5 h-1.5 bg-blue-500 rounded-full animate-pulse" /> Pronto
                                </div>
                              ) : (
                                <div className="flex items-center gap-1.5 text-[9px] font-black text-orange-500 animate-pulse bg-orange-50 px-3 py-1 rounded-full border border-orange-100 uppercase">
                                  <div className="w-1.5 h-1.5 bg-orange-500 rounded-full" /> Aguardando
                                </div>
                              )}
                            </div>

                            <div>
                              <p className={`font-black text-[11px] uppercase tracking-wider mb-1 italic ${
                                submitted ? 'text-emerald-700' : p.isReady ? 'text-blue-700' : 'text-[#002350]'
                              }`}>
                                {p.storeName || 'Loja não identificada'}
                              </p>
                              <p className="text-sm font-bold text-slate-500 truncate italic">{p.name}</p>
                            </div>

                            {/* ✅ Timestamp de submissão */}
                            {submitted && p.submittedAt && (
                              <motion.div
                                initial={{ opacity: 0, y: 4 }}
                                animate={{ opacity: 1, y: 0 }}
                                className="flex items-center gap-2 text-[9px] font-black text-emerald-600 bg-emerald-100 px-3 py-1.5 rounded-xl"
                              >
                                <CheckCircle2 size={10} /> Enviado às {p.submittedAt}
                              </motion.div>
                            )}
                          </div>
                        </motion.div>
                      );
                    })
                  )}
                </AnimatePresence>
              </div>
            </div>
          </motion.div>
        </div>
      </main>

      {/* RODAPÉ */}
      <footer className="w-full max-w-[1600px] px-10 py-8 mt-auto flex justify-between items-center text-[10px] font-black text-slate-400 uppercase tracking-[0.3em] z-10 border-t border-slate-200/60 italic">
        <div className="flex gap-10">
          <span className="flex items-center gap-2">Protocolo: <span className="text-[#002350]">CENC-SYS-ATIVO</span></span>
          <span className="flex items-center gap-2 text-orange-500 underline underline-offset-4">Conexão Segura AES-256</span>
        </div>
        <div className="font-mono text-slate-300">ID_SESSAO: {session?.id?.slice(-8).toUpperCase()}</div>
      </footer>

    </div>
  );
};

export default AdminMestre;
