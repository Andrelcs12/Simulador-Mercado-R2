"use client";

import React, { useEffect, useMemo, useRef, useState, useCallback } from "react";
import { io, Socket } from "socket.io-client";
import { useRouter } from "next/navigation";
import toast, { Toaster } from "react-hot-toast";
import { motion, AnimatePresence } from "framer-motion";
import {
  Play, Square, SkipForward, LogOut, Users, Timer, Settings,
  CheckCircle2, Clock, Hash, AlertTriangle, Wifi, WifiOff,
  ChevronDown, ChevronUp, RefreshCw
} from "lucide-react";

// --- TYPES ---
interface Player {
  id: string;
  name: string;
  storeName: string;
  submittedAt?: string;
  isReady?: boolean;
}

interface Session {
  id: string;
  code: string;
  status: string;
  currentRound: number;
  totalRounds: number;
}

interface RoundConfig {
  durationMinutes: number;
  durationSeconds: number;
  roundNumber: number;
  intervalMinutes: number;
}

const DURATION_PRESETS = [
  { label: "5 min", minutes: 5 },
  { label: "15 min", minutes: 15 },
  { label: "30 min", minutes: 30 },
  { label: "60 min", minutes: 60 },
];

const INTERVAL_PRESETS = [
  { label: "Sem intervalo", minutes: 0 },
  { label: "5 min", minutes: 5 },
  { label: "10 min", minutes: 10 },
];

const AdminMestre = () => {
  const router = useRouter();
  const socketRef = useRef<Socket | null>(null);
  const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:4000";

  // --- STATE ---
  const [session, setSession] = useState<Session | null>(null);
  const [players, setPlayers] = useState<Player[]>([]);
  const [loading, setLoading] = useState(true);
  const [connected, setConnected] = useState(false);
  const [gameStarted, setGameStarted] = useState(false);
  const [endTime, setEndTime] = useState<number | null>(null);
  const [timeLeft, setTimeLeft] = useState<number>(0);
  const [currentRoundId, setCurrentRoundId] = useState<string | null>(null);
  const [showConfig, setShowConfig] = useState(true);
  const [confirmFinish, setConfirmFinish] = useState(false);

  const [config, setConfig] = useState<RoundConfig>({
    durationMinutes: 15,
    durationSeconds: 0,
    roundNumber: 1,
    intervalMinutes: 5,
  });

  // --- COMPUTED ---
  const submittedCount = useMemo(() => players.filter((p) => p.submittedAt).length, [players]);
  const readyCount = useMemo(() => players.filter((p) => p.isReady).length, [players]);
  const allSubmitted = players.length > 0 && submittedCount === players.length;
  const totalDurationSeconds = config.durationMinutes * 60 + config.durationSeconds;

  // --- SOCKET LOGIC ---
  const conectarSocket = useCallback((sessionId: string) => {
    if (socketRef.current) return;

    const socket = io(`${API_URL}/simulation`, { reconnection: true });
    socketRef.current = socket;

    socket.on("connect", () => setConnected(true));
    socket.on("disconnect", () => setConnected(false));

    socket.emit("join_session", { sessionId, playerId: "ADMIN", isAdmin: true });

    socket.on("session:players_updated", (data: Player[]) => setPlayers(data));
    
    socket.on("player:joined", (player: Player) => {
      setPlayers((prev) => prev.some(p => p.id === player.id) ? prev : [...prev, player]);
      toast(`🎮 ${player.storeName} entrou`);
    });

    socket.on("player:submitted", ({ playerId }: { playerId: string }) => {
      const now = new Date().toLocaleTimeString("pt-BR");
      setPlayers(prev => prev.map(p => p.id === playerId ? { ...p, submittedAt: now } : p));
    });

    socket.on("round:started", (data: any) => {
      setGameStarted(true);
      setEndTime(data.endTime);
      setCurrentRoundId(data.roundId);
      setSession(s => s ? { ...s, currentRound: data.roundNumber, status: "IN_PROGRESS" } : s);
      toast.success(`▶ Rodada ${data.roundNumber} iniciada`);
    });

    socket.on("round:stopped", () => {
      setGameStarted(false);
      setEndTime(null);
      toast("🛑 Rodada encerrada");
    });

    return () => {
      socket.disconnect();
      socketRef.current = null;
    };
  }, [API_URL]);

  // --- INITIAL LOAD ---
  useEffect(() => {
    const sessionId = localStorage.getItem("admin_session_id");
    if (!sessionId) {
      router.push("/pages/admin/dashboard/setup");
      return;
    }

    const fetchData = async () => {
      try {
        const [resSess, resPlay] = await Promise.all([
          fetch(`${API_URL}/minigame/session/${sessionId}`),
          fetch(`${API_URL}/minigame/players/${sessionId}`),
        ]);

        if (!resSess.ok) throw new Error();
        
        const sessionData: Session = await resSess.json();
        const playersData: Player[] = await resPlay.json();

        setSession(sessionData);
        setPlayers(playersData || []);
        
        // CORREÇÃO DO ERRO: Check se sessionData existe antes de acessar propriedades
        if (sessionData) {
          setConfig(c => ({
            ...c,
            roundNumber: (sessionData.currentRound || 0) + 1
          }));
          conectarSocket(sessionData.id);
        }
      } catch (err) {
        toast.error("Erro ao carregar dados da sessão");
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [API_URL, router, conectarSocket]);

  // --- TIMER EFFECT ---
  useEffect(() => {
    if (!endTime || !gameStarted) return;

    const tick = () => {
      const now = Date.now();
      const diff = endTime - now;
      if (diff <= 0) {
        setTimeLeft(0);
        setGameStarted(false);
      } else {
        setTimeLeft(diff);
      }
    };

    const timer = setInterval(tick, 500);
    return () => clearInterval(timer);
  }, [endTime, gameStarted]);

  // --- HANDLERS ---
  const startRound = () => {
    if (!session || totalDurationSeconds <= 0) return toast.error("Duração inválida");
    
    setPlayers(prev => prev.map(p => ({ ...p, submittedAt: undefined })));
    socketRef.current?.emit("admin:start_round", {
      sessionId: session.id,
      duration: totalDurationSeconds,
      round: config.roundNumber,
      interval: config.intervalMinutes * 60,
    });
  };

  const forceStopRound = () => {
    socketRef.current?.emit("admin:force_stop_round", { sessionId: session?.id });
  };

  const formatMs = (ms: number) => {
    const total = Math.ceil(ms / 1000);
    const m = Math.floor(total / 60);
    const s = total % 60;
    return `${String(m).padStart(2, '0')}:${String(s).padStart(2, '0')}`;
  };

  if (loading) return (
    <div className="min-h-screen flex items-center justify-center bg-[#0B1220]">
      <RefreshCw className="animate-spin text-orange-500" size={40} />
    </div>
  );

  return (
    <div className="min-h-screen bg-[#0B1220] text-white p-6 font-sans">
      <Toaster position="top-right" />
      
      {/* Header */}
      <header className="max-w-7xl mx-auto flex justify-between items-center mb-8 border-b border-white/10 pb-4">
        <div className="flex items-center gap-4">
          <h1 className="font-black italic text-2xl uppercase tracking-tighter">Master Control</h1>
          <span className="bg-orange-500 px-3 py-1 rounded-full text-xs font-bold">#{session?.code}</span>
          <div className={`flex items-center gap-2 text-xs ${connected ? "text-emerald-400" : "text-red-400"}`}>
            {connected ? <Wifi size={14}/> : <WifiOff size={14}/>}
            {connected ? "LIVE" : "OFFLINE"}
          </div>
        </div>
        <button 
          onClick={() => setConfirmFinish(true)}
          className="text-red-400 border border-red-400/20 px-4 py-2 rounded-xl hover:bg-red-400/10 transition-all font-bold text-sm"
        >
          Encerrar Sessão
        </button>
      </header>

      <main className="max-w-7xl mx-auto grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* Lado Esquerdo: Status e Config */}
        <div className="lg:col-span-2 space-y-6">
          
          {/* Card de Timer */}
          <section className="bg-[#1A2235] p-8 rounded-3xl border border-white/10 relative overflow-hidden">
            <div className="flex justify-between items-center mb-4">
              <span className="text-slate-400 text-xs font-black uppercase tracking-widest">Cronômetro da Rodada</span>
              <Timer className={gameStarted ? "text-orange-500 animate-pulse" : "text-slate-600"} />
            </div>
            <div className={`text-7xl font-mono font-black ${gameStarted ? "text-white" : "text-slate-700"}`}>
              {gameStarted ? formatMs(timeLeft) : "00:00"}
            </div>
            {gameStarted && (
               <div className="mt-6 h-2 bg-white/5 rounded-full overflow-hidden">
                  <motion.div 
                    initial={{ width: "100%" }}
                    animate={{ width: `${(timeLeft / (totalDurationSeconds * 1000)) * 100}%` }}
                    className="h-full bg-orange-500"
                  />
               </div>
            )}
          </section>

          {/* Configuração */}
          <section className="bg-[#1A2235] rounded-3xl border border-white/10 overflow-hidden">
            <button onClick={() => setShowConfig(!showConfig)} className="w-full p-6 flex justify-between items-center hover:bg-white/5 transition-all">
              <div className="flex items-center gap-3">
                <Settings className="text-orange-500" size={20} />
                <span className="font-black uppercase text-sm">Ajustes da Rodada {config.roundNumber}</span>
              </div>
              {showConfig ? <ChevronUp /> : <ChevronDown />}
            </button>

            <AnimatePresence>
              {showConfig && (
                <motion.div 
                  initial={{ height: 0 }} animate={{ height: "auto" }} exit={{ height: 0 }}
                  className="px-6 pb-6 overflow-hidden border-t border-white/10 pt-6 space-y-6"
                >
                  <div>
                    <label className="text-xs font-black text-slate-500 uppercase block mb-3">Duração</label>
                    <div className="flex flex-wrap gap-2 mb-4">
                      {DURATION_PRESETS.map(p => (
                        <button 
                          key={p.minutes}
                          onClick={() => setConfig({...config, durationMinutes: p.minutes, durationSeconds: 0})}
                          className={`px-4 py-2 rounded-xl text-xs font-bold transition-all ${config.durationMinutes === p.minutes ? "bg-orange-500" : "bg-white/5 hover:bg-white/10"}`}
                        >
                          {p.label}
                        </button>
                      ))}
                    </div>
                  </div>

                  <div className="flex gap-4">
                     <button 
                       disabled={gameStarted}
                       onClick={startRound}
                       className="flex-1 bg-orange-500 py-4 rounded-2xl font-black uppercase hover:bg-orange-400 disabled:opacity-50 transition-all flex items-center justify-center gap-3"
                     >
                       <Play size={20} /> Iniciar Rodada
                     </button>
                     {gameStarted && (
                       <button 
                        onClick={forceStopRound}
                        className="bg-yellow-500 text-black px-8 rounded-2xl font-black uppercase hover:bg-yellow-400 transition-all"
                       >
                         <Square />
                       </button>
                     )}
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </section>
        </div>

        {/* Lado Direito: Jogadores */}
        <aside className="space-y-4">
          <div className="flex items-center justify-between px-2">
             <div className="flex items-center gap-2 font-black uppercase text-sm text-slate-400">
               <Users size={16} /> Jogadores ({players.length})
             </div>
             <div className="text-xs font-bold text-emerald-400">{submittedCount} Enviados</div>
          </div>
          
          <div className="space-y-2 max-h-[600px] overflow-y-auto pr-2 custom-scrollbar">
            {players.map((player) => (
              <motion.div 
                layout
                key={player.id} 
                className="bg-[#1A2235] p-4 rounded-2xl border border-white/5 flex items-center justify-between"
              >
                <div>
                  <div className="font-bold text-sm">{player.storeName}</div>
                  <div className="text-[10px] text-slate-500 uppercase font-black">{player.name}</div>
                </div>
                <div>
                  {player.submittedAt ? (
                    <div className="bg-emerald-500/10 text-emerald-500 p-2 rounded-lg" title={`Enviado às ${player.submittedAt}`}>
                      <CheckCircle2 size={18} />
                    </div>
                  ) : (
                    <div className="bg-white/5 text-slate-600 p-2 rounded-lg">
                      <Clock size={18} />
                    </div>
                  )}
                </div>
              </motion.div>
            ))}
          </div>
        </aside>
      </main>

      {/* Modal de Confirmação */}
      {confirmFinish && (
        <div className="fixed inset-0 bg-black/80 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <motion.div 
            initial={{ scale: 0.9, opacity: 0 }} animate={{ scale: 1, opacity: 1 }}
            className="bg-[#1A2235] p-8 rounded-3xl border border-white/10 max-w-sm w-full text-center"
          >
            <AlertTriangle className="text-red-400 mx-auto mb-4" size={48} />
            <h2 className="text-xl font-black mb-2">Encerrar Simulação?</h2>
            <p className="text-slate-400 text-sm mb-6">Isso desconectará todos os jogadores e finalizará os relatórios.</p>
            <div className="flex gap-3">
              <button onClick={() => setConfirmFinish(false)} className="flex-1 py-3 font-bold text-slate-400 hover:text-white">Cancelar</button>
              <button 
                onClick={() => {
                   socketRef.current?.emit("admin:finish_session", { sessionId: session?.id });
                   router.push("/pages/admin/dashboard/setup");
                }}
                className="flex-1 bg-red-500 py-3 rounded-xl font-bold hover:bg-red-400 transition-all"
              >
                Encerrar
              </button>
            </div>
          </motion.div>
        </div>
      )}
    </div>
  );
};

export default AdminMestre;