"use client";

import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  ShieldCheck, Box, BarChart4, Wallet, 
  CheckCircle2, ArrowRight, Trophy, Activity, Timer, User, Signal
} from 'lucide-react';
import { io, Socket } from 'socket.io-client';
import { useRouter } from 'next/navigation';

interface Player {
  id: string;
  name: string;
  storeName: string;
  sessionId: string;
}

interface GameConfig {
  duration: number;
  round: number;
  adminName: string;
}

let socket: Socket;

const LobbyPage = () => {
  const router = useRouter();
  const [players, setPlayers] = useState<Player[]>([]);
  const [isGameStarted, setIsGameStarted] = useState(false);
  const [myPlayerData, setMyPlayerData] = useState<Player | null>(null);
  const [isReady, setIsReady] = useState(false);
  
  // Estados de Configuração em Tempo Real
  const [config, setConfig] = useState<GameConfig>({
    duration: 2700, // Padrão: 45 min em segundos
    round: 1,
    adminName: "Aguardando Mestre..."
  });
  
  const [tempoRestante, setTempoRestante] = useState(2700);

  useEffect(() => {
  const savedData = localStorage.getItem('player_data');
  if (!savedData) {
    router.push('/pages/registro');
    return;
  }
  const player = JSON.parse(savedData);
  setMyPlayerData(player);

  const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:4000';
  const sessionId = player.sessionId;

  // Conexão do Socket
  socket = io(`${API_URL}/simulation`);

  socket.emit('join_session', { 
    sessionId, 
    playerId: player.id, 
    name: player.name 
  });

  // ESCUTAS
  socket.on('simulation:config_update', (newConfig) => {
    setConfig(newConfig);
    if (!isGameStarted) setTempoRestante(newConfig.duration);
  });

  socket.on('lobby:player_entered', (newPlayer) => {
    console.log("Novo player na área:", newPlayer);
    setPlayers(prev => {
      // Evita duplicatas pelo ID
      const exists = prev.find(p => p.id === newPlayer.id);
      if (exists) return prev;
      return [...prev, newPlayer];
    });
  });

  socket.on('round:started', (data) => {
    setIsGameStarted(true);
    setTempoRestante(data.duration);
  });

  // SINCRONIZAÇÃO INICIAL (Busca quem já estava lá)
  fetch(`${API_URL}/minigame/session/${sessionId}`)
    .then(res => res.json())
    .then(data => {
      // Como alteramos o service para 'include: { players: true }', 
      // a lista vem dentro de data.players
      if (data.players) {
        setPlayers(data.players);
      }
      if (data.adminName) {
        setConfig(prev => ({ ...prev, adminName: data.adminName }));
      }
    })
    .catch(err => console.error("Erro ao sincronizar sessão:", err));

  return () => { socket.disconnect(); };
}, [router, isGameStarted]);

  // Função de Formatação Profissional MM:SS
  const formatTime = (seconds: number) => {
    const m = Math.floor(seconds / 60);
    const s = seconds % 60;
    return `${m.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}`;
  };

  const handleConfirmReady = () => {
    if (!myPlayerData) return;
    socket.emit('player:ready', { playerId: myPlayerData.id });
    setIsReady(true);
  };

  return (
    <div className="min-h-screen bg-[#F8FAFC] p-4 lg:p-8 font-sans selection:bg-orange-500">
      
      {/* CABEÇALHO CORPORATIVO */}
      <div className="max-w-7xl mx-auto mb-8 flex flex-col md:flex-row justify-between items-center gap-6">
        <motion.div initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} className="flex items-center gap-4 bg-white px-6 py-3 rounded-2xl shadow-sm border border-gray-100 border-b-4 border-blue-900">
          <div className="w-10 h-10 bg-blue-900 rounded-lg flex items-center justify-center font-black text-white">C</div>
          <div className="flex flex-col">
            <span className="text-[10px] font-black text-gray-400 uppercase tracking-widest leading-tight">SQUAD ATIVO</span>
            <span className="text-sm font-black text-blue-900 uppercase italic">#{myPlayerData?.sessionId || '---'}</span>
          </div>
        </motion.div>

        {/* RELÓGIO DINÂMICO (Cencosud Style) */}
        <motion.div 
          animate={isGameStarted ? { scale: [1, 1.03, 1] } : {}}
          transition={{ repeat: Infinity, duration: 2 }}
          className={`${isGameStarted ? 'bg-orange-500' : 'bg-blue-900'} text-white px-10 py-5 rounded-[2.5rem] shadow-2xl flex items-center gap-6 border-b-8 border-black/20 transition-all relative overflow-hidden`}
        >
          <Timer className={isGameStarted ? 'animate-pulse text-white' : 'text-orange-500'} size={40} />
          <div className="flex flex-col relative z-10">
            <span className="text-[10px] font-black uppercase tracking-[0.2em] opacity-80 italic">
              {isGameStarted ? `Protocolo Etapa ${config.round}` : 'Aguardando Início'}
            </span>
            <span className="text-5xl font-black font-mono tracking-tighter leading-none">{formatTime(tempoRestante)}</span>
          </div>
          {isGameStarted && <div className="absolute inset-0 bg-white/5 animate-pulse" />}
        </motion.div>

        {/* MESTRE DO JOGO */}
        <div className="flex items-center gap-4 bg-white px-6 py-4 rounded-2xl shadow-sm border border-gray-100">
          <div className="p-2 bg-orange-100 rounded-xl">
             <User size={20} className="text-orange-600" />
          </div>
          <div className="flex flex-col">
            <span className="text-[10px] text-gray-400 font-black uppercase tracking-widest">Master Op</span>
            <span className="text-xs font-black text-blue-900 uppercase italic">{config.adminName}</span>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto grid lg:grid-cols-12 gap-8">
        
        {/* COLUNA ESQUERDA: LISTA DE PLAYERS */}
        <div className="lg:col-span-4 space-y-6">
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="bg-white p-8 rounded-[3rem] shadow-sm border border-gray-100">
            <div className="flex justify-between items-center mb-6">
              <h3 className="font-black text-blue-900 flex items-center gap-2 uppercase text-xs tracking-tighter">
                <Trophy size={18} className="text-orange-500" /> Squads Conectados
              </h3>
              <span className="bg-blue-900 text-white text-[10px] font-black px-2 py-0.5 rounded-full">{players.length}</span>
            </div>
            
            <div className="space-y-3 max-h-[350px] overflow-y-auto pr-2 custom-scrollbar">
              {players.map((p) => (
                <div key={p.id} className={`flex items-center justify-between p-4 rounded-2xl border-2 transition-all ${p.id === myPlayerData?.id ? 'bg-blue-50 border-blue-900/10' : 'bg-gray-50 border-transparent opacity-60'}`}>
                  <div className="flex flex-col">
                    <span className="font-black text-blue-900 text-[11px] uppercase tracking-tight">{p.storeName}</span>
                    <span className="text-[9px] text-gray-500 font-bold uppercase italic">{p.name} {p.id === myPlayerData?.id && "(Você)"}</span>
                  </div>
                  <div className="flex items-center gap-1.5">
                    <div className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-ping" />
                  </div>
                </div>
              ))}
            </div>
          </motion.div>

          {/* CARD DE MISSÃO */}
          <div className="bg-blue-900 p-10 rounded-[3rem] text-white relative overflow-hidden shadow-2xl border-b-[10px] border-orange-500">
             <div className="relative z-10 font-black italic text-2xl mb-3 tracking-tighter uppercase">Missão Operacional</div>
             <p className="relative z-10 text-blue-100 text-xs font-bold leading-relaxed opacity-70 mb-4">
               Fase {config.round}: Otimização de KPIs e Gestão de Fluxo. Siga as instruções do facilitador <span className="text-orange-500">{config.adminName}</span>.
             </p>
             <div className="relative z-10 flex items-center gap-2 text-[10px] font-black text-orange-500">
                <Signal size={12} /> CONEXÃO ENCRIPTADA ATIVA
             </div>
             <Activity className="absolute -right-8 -bottom-8 w-40 h-40 opacity-[0.03] rotate-12" />
          </div>
        </div>

        {/* COLUNA DIREITA: ESCALA DO TIME */}
        <div className="lg:col-span-8">
          <motion.div initial={{ opacity: 0, scale: 0.98 }} animate={{ opacity: 1, scale: 1 }} className="bg-white p-8 lg:p-14 rounded-[3.5rem] shadow-sm border border-gray-100 h-full relative">
            <div className="mb-12">
              <h2 className="text-5xl font-black text-blue-900 mb-2 tracking-tighter uppercase italic">
                Escala <span className="text-orange-500">Squad</span>
              </h2>
              <p className="text-gray-400 font-bold uppercase text-[10px] tracking-[0.3em] flex items-center gap-2">
                <ShieldCheck size={14} className="text-emerald-500" /> Atribuição de Funções Técnicas
              </p>
            </div>

            <div className="grid md:grid-cols-2 gap-6 mb-10">
              {[
                { label: 'Gerente de Serviços', icon: <ShieldCheck />, desc: 'CAPEX & Infraestrutura' },
                { label: 'Abastecimento', icon: <Box />, desc: 'Estoque & Aging' },
                { label: 'Comercial', icon: <BarChart4 />, desc: 'Pricing & Margem' },
                { label: 'Operacional', icon: <Wallet />, desc: 'PDV & Equipe' },
              ].map((cargo, idx) => (
                <div key={idx} className="p-6 rounded-3xl bg-slate-50 border-2 border-transparent focus-within:border-orange-500/20 focus-within:bg-white transition-all shadow-inner">
                  <div className="flex items-center gap-3 mb-4 text-blue-900">
                    <div className="p-2.5 bg-white rounded-2xl shadow-sm text-orange-500">{cargo.icon}</div>
                    <div>
                      <span className="block font-black uppercase text-[8px] tracking-widest leading-none mb-1 opacity-40">{cargo.desc}</span>
                      <span className="font-black text-xs uppercase italic tracking-tight">{cargo.label}</span>
                    </div>
                  </div>
                  <input type="text" placeholder="Nome do integrante" className="w-full bg-transparent outline-none font-bold text-blue-900 placeholder:text-slate-300 text-sm" />
                </div>
              ))}
            </div>

            <motion.div 
              layout 
              className={`p-8 rounded-[2.5rem] flex flex-col md:flex-row items-center justify-between gap-6 border-b-8 transition-all ${isReady ? 'bg-emerald-500 border-emerald-700' : 'bg-[#002350] border-orange-500'}`}
            >
              <div className="flex items-center gap-5 text-left">
                <div className={`w-14 h-14 rounded-2xl flex items-center justify-center shadow-lg ${isReady ? 'bg-white text-emerald-600' : 'bg-orange-500 text-white'}`}>
                  {isReady ? <CheckCircle2 size={32} /> : <Activity size={32} />}
                </div>
                <div>
                  <h4 className="text-lg font-black text-white uppercase italic tracking-tighter leading-tight">
                    {isReady ? 'Escala Validada!' : 'Aguardando Confirmação'}
                  </h4>
                  <p className="text-white/60 text-[9px] font-black uppercase tracking-widest">
                    {isReady ? 'O mestre já visualizou seu squad' : 'Revise os dados antes de prosseguir'}
                  </p>
                </div>
              </div>
              
              {!isReady && (
                <button 
                  onClick={handleConfirmReady}
                  className="group flex items-center gap-3 bg-white text-blue-900 px-10 py-5 rounded-2xl font-black text-xs uppercase hover:bg-orange-500 hover:text-white transition-all active:scale-95 shadow-xl italic tracking-widest"
                >
                  Confirmar Squad <ArrowRight size={18} className="group-hover:translate-x-2 transition-transform" />
                </button>
              )}
            </motion.div>
          </motion.div>
        </div>
      </div>
      
      <style jsx global>{`
        .custom-scrollbar::-webkit-scrollbar { width: 4px; }
        .custom-scrollbar::-webkit-scrollbar-track { background: transparent; }
        .custom-scrollbar::-webkit-scrollbar-thumb { background: #E2E8F0; border-radius: 10px; }
      `}</style>
    </div>
  );
};

export default LobbyPage;