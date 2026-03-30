"use client";

import React, { useState, useEffect, useRef } from 'react';
import { io, Socket } from 'socket.io-client';
import { 
  Play, Users, Radio, CheckCircle2, 
  Settings2, Trophy, Activity, LayoutDashboard,
  Signal, Wifi, Clock
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

const AdminMestre = () => {
  const [session, setSession] = useState<any>(null);
  const [players, setPlayers] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [gameStarted, setGameStarted] = useState(false);
  
  const [config, setConfig] = useState({
    durationMinutes: 45, 
    round: 1,
    adminName: "Facilitador Cencosud"
  });

  const socketRef = useRef<Socket | null>(null);

  const formatTime = (minutes: number) => {
    const totalSeconds = minutes * 60;
    const m = Math.floor(totalSeconds / 60);
    const s = totalSeconds % 60;
    return `${m.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}`;
  };

  useEffect(() => {
    const carregarSessaoExistente = async () => {
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
        const res = await fetch(`http://localhost:4000/minigame/session/${sessionId}`);
        const data = await res.json();
        setSession(data);
        
        const resPlayers = await fetch(`http://localhost:4000/minigame/players/${sessionId}`);
        const playersData = await resPlayers.json();
        setPlayers(playersData.map((p: any) => ({ ...p, isReady: p.isActive })));

        conectarSocket(data.id, savedAdminName || config.adminName);
      } catch (error) {
        console.error("Erro ao recuperar dados:", error);
      } finally {
        setLoading(false);
      }
    };

    carregarSessaoExistente();
    return () => { socketRef.current?.disconnect(); };
  }, []);

  useEffect(() => {
    if (socketRef.current && session) {
      socketRef.current.emit('admin:update_config', {
        sessionId: session.id,
        duration: config.durationMinutes * 60,
        round: config.round,
        adminName: config.adminName
      });
    }
  }, [config, session]);

  const conectarSocket = (sessionId: string, currentAdminName: string) => {
    const socket = io('http://localhost:4000/simulation');
    socketRef.current = socket;

    socket.emit('join_session', { sessionId, name: currentAdminName, isAdmin: true });

    socket.on('lobby:player_entered', (player) => {
      setPlayers(prev => {
        const exists = prev.find(p => p.id === player.id);
        if (exists) return prev;
        return [...prev, { ...player, isReady: false }];
      });
    });

    socket.on('lobby:player_ready', ({ playerId }) => {
      setPlayers(prev => prev.map(p => p.id === playerId ? { ...p, isReady: true } : p));
    });
  };

  const dispararRodada = () => {
    if (!session || players.length < 1) return;
    const durationSeconds = config.durationMinutes * 60;

    socketRef.current?.emit('admin:start_round', { 
      sessionId: session.id, 
      duration: durationSeconds, 
      round: config.round 
    });
    setGameStarted(true);
  };

  if (loading) return (
    <div className="min-h-screen bg-[#002350] flex flex-col items-center justify-center gap-4">
      <motion.div
        animate={{ rotate: 360 }}
        transition={{ repeat: Infinity, duration: 1, ease: "linear" }}
        className="w-16 h-16 border-4 border-orange-500 border-t-transparent rounded-full"
      />
      <span className="text-white font-black tracking-widest text-xs uppercase italic">Sincronizando Centro de Comando...</span>
    </div>
  );

  return (
    <div className="min-h-screen bg-[#F8FAFC] text-[#002350] flex flex-col items-center relative overflow-x-hidden font-sans">
      
      {/* HEADER CORPORATIVO */}
      <header className="w-full bg-[#002350] p-4 md:px-12 flex justify-between items-center shadow-lg z-20 border-b-4 border-orange-500">
          <div className="flex items-center gap-4">
          <img src="/imagens/logo.png" alt="Cencosud Logo" className="h-10 object-contain" />
          <div className="h-6 w-px bg-gray-200 mx-2" />
          <div>
            <h1 className="text-white text-lg font-black leading-none tracking-tight italic uppercase">SIMULADOR <span className="text-orange-500">CENCOSUD</span></h1>
            <p className="text-blue-300 text-[9px] font-black tracking-widest uppercase italic">Painel de Controle Interno</p>
          </div>
        </div>
        
        <div className="flex items-center gap-6">
          <div className="hidden md:flex flex-col items-end">
            <span className="text-blue-200 text-[9px] font-black tracking-widest uppercase">Facilitador Ativo</span>
            <span className="text-white text-xs font-black uppercase italic">{config.adminName}</span>
          </div>
          <div className="h-10 w-[1px] bg-white/10 hidden md:block" />
          <Activity className="text-orange-500 animate-pulse shadow-orange-500/50" size={20} />
        </div>
      </header>

      <main className="w-full max-w-[1600px] grid grid-cols-1 lg:grid-cols-12 gap-6 p-6 md:p-10 z-10">
        
        {/* COLUNA DE CONTROLE */}
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

          {/* PARÂMETROS DA SIMULAÇÃO */}
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
                  <Clock size={12} className="text-orange-500"/> Duração (Min)
                </label>
                <input 
                  type="number" 
                  value={config.durationMinutes}
                  onChange={(e) => setConfig({...config, durationMinutes: Number(e.target.value)})}
                  className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-4 text-lg font-black text-orange-500 outline-none focus:bg-white/10 transition-all shadow-inner"
                />
                <p className="text-[9px] text-blue-400 font-black italic uppercase">Total: {formatTime(config.durationMinutes)}</p>
              </div>
              <div className="space-y-2">
                <label className="text-[10px] font-black text-blue-300 uppercase flex items-center gap-2 italic">
                  <Trophy size={12} className="text-orange-500"/> Fase Atual
                </label>
                <select 
                  value={config.round}
                  onChange={(e) => setConfig({...config, round: Number(e.target.value)})}
                  className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-4 text-lg font-black text-white outline-none cursor-pointer focus:bg-white/10"
                >
                  {[1, 2, 3, 4, 5].map(r => <option key={r} value={r} className="bg-[#002350]">Rodada {r}</option>)}
                </select>
              </div>
            </div>

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
          </motion.div>
        </div>

        {/* MONITOR DE UNIDADES (SQUADS) */}
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
                  <p className="text-[11px] text-slate-400 font-black uppercase tracking-widest">{players.length} Unidades conectadas agora</p>
                </div>
              </div>
              <div className="flex items-center gap-3 px-5 py-2.5 bg-emerald-50 text-emerald-700 rounded-full text-[10px] font-black border border-emerald-200 shadow-sm uppercase tracking-wider">
                <Signal size={14} className="animate-bounce text-emerald-500" /> Monitoramento em Tempo Real
              </div>
            </div>

            <div className="flex-1 overflow-y-auto p-8 custom-scrollbar bg-[radial-gradient(#e2e8f0_1px,transparent_1px)] [background-size:20px_20px]">
              <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-6">
                <AnimatePresence mode="popLayout">
                  {players.length === 0 ? (
                    <div className="col-span-full py-32 text-center opacity-10 flex flex-col items-center">
                      <LayoutDashboard size={100} className="mb-6" />
                      <p className="font-black uppercase tracking-[0.5em] text-sm italic">Aguardando Gestores de Loja...</p>
                    </div>
                  ) : (
                    players.map((p) => (
                      <motion.div 
                        key={p.id}
                        layout
                        initial={{ scale: 0.9, opacity: 0 }}
                        animate={{ scale: 1, opacity: 1 }}
                        exit={{ scale: 0.8, opacity: 0 }}
                        className={`group relative p-6 rounded-[2.5rem] border-2 transition-all duration-500 ${
                          p.isReady 
                          ? 'bg-white border-emerald-500 shadow-[0_20px_40px_rgba(16,185,129,0.08)]' 
                          : 'bg-white border-slate-100 hover:border-orange-300 shadow-sm'
                        }`}
                      >
                        <div className="flex flex-col gap-4">
                          <div className="flex justify-between items-start">
                            <div className={`w-12 h-12 rounded-2xl flex items-center justify-center transition-all ${p.isReady ? 'bg-emerald-500 text-white' : 'bg-slate-100 text-slate-400 group-hover:bg-orange-500 group-hover:text-white'}`}>
                              <Users size={24} />
                            </div>
                            {p.isReady ? (
                              <div className="bg-emerald-500 text-white p-1.5 rounded-full shadow-lg">
                                <CheckCircle2 size={18} />
                              </div>
                            ) : (
                              <div className="flex items-center gap-1.5 text-[9px] font-black text-orange-500 animate-pulse bg-orange-50 px-3 py-1 rounded-full border border-orange-100 uppercase">
                                <div className="w-1.5 h-1.5 bg-orange-500 rounded-full" /> Aguardando
                              </div>
                            )}
                          </div>
                          
                          <div>
                            <p className={`font-black text-[11px] uppercase tracking-wider mb-1 italic ${p.isReady ? 'text-emerald-600' : 'text-[#002350]'}`}>
                              {p.storeName || 'Loja não identificada'}
                            </p>
                            <p className="text-base font-bold text-slate-500 truncate italic">{p.name}</p>
                          </div>
                        </div>
                      </motion.div>
                    ))
                  )}
                </AnimatePresence>
              </div>
            </div>
          </motion.div>
        </div>
      </main>

      {/* RODAPÉ TÉCNICO */}
      <footer className="w-full max-w-[1600px] px-10 py-8 mt-auto flex justify-between items-center text-[10px] font-black text-slate-400 uppercase tracking-[0.3em] z-10 border-t border-slate-200/60 italic">
        <div className="flex gap-10">
          <span className="flex items-center gap-2">Protocolo: <span className="text-[#002350]">CENC-SYS-ATIVO</span></span>
          <span className="flex items-center gap-2 text-orange-500 underline underline-offset-4">Conexão Segura AES-256</span>
        </div>
        <div className="font-mono text-slate-300">ID_SESSAO: {session?.id?.slice(-8).toUpperCase()}</div>
      </footer>

      <style jsx global>{`
        .custom-scrollbar::-webkit-scrollbar { width: 5px; }
        .custom-scrollbar::-webkit-scrollbar-track { background: transparent; }
        .custom-scrollbar::-webkit-scrollbar-thumb { background: #CBD5E1; border-radius: 10px; }
        .custom-scrollbar::-webkit-scrollbar-thumb:hover { background: #002350; }
      `}</style>
    </div>
  );
};

export default AdminMestre;