"use client";

import React, {
  useEffect,
  useMemo,
  useRef,
  useState,
  useCallback,
} from "react";
import { io, Socket } from "socket.io-client";
import { useRouter } from "next/navigation";
import toast, { Toaster } from "react-hot-toast";
import { motion, AnimatePresence } from "framer-motion";
import {
  Play,
  Square,
  LogOut,
  Users,
  Timer,
  Settings,
  CheckCircle2,
  Clock,
  AlertTriangle,
  Wifi,
  WifiOff,
  ChevronDown,
  ChevronUp,
  RefreshCw,
  UserMinus,
  Hash,
  Trophy,
  BarChart2,
  CircleDot,
  SkipForward,
} from "lucide-react";

// ─────────────────────────────────────────────
// TIPOS
// ─────────────────────────────────────────────
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
  currentRound?: number;
  totalRounds?: number;
}

interface RoundConfig {
  durationMinutes: number;
  durationSeconds: number;
  roundNumber: number;
  intervalMinutes: number;
}

// ─────────────────────────────────────────────
// PRESETS
// ─────────────────────────────────────────────
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

// ─────────────────────────────────────────────
// HELPERS
// ─────────────────────────────────────────────
function formatMs(ms: number): string {
  const total = Math.ceil(ms / 1000);
  const m = Math.floor(total / 60);
  const s = total % 60;
  return `${String(m).padStart(2, "0")}:${String(s).padStart(2, "0")}`;
}

// ─────────────────────────────────────────────
// COMPONENTE PRINCIPAL
// ─────────────────────────────────────────────
const AdminMestre = () => {
  const router = useRouter();
  const socketRef = useRef<Socket | null>(null);
  const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:4000";

  // ── Estado ──────────────────────────────────
  const [session, setSession] = useState<Session | null>(null);
  const [players, setPlayers] = useState<Player[]>([]);
  const [loading, setLoading] = useState(true);
  const [connected, setConnected] = useState(false);
  const [gameStarted, setGameStarted] = useState(false);
  const [endTime, setEndTime] = useState<number | null>(null);
  const [timeLeft, setTimeLeft] = useState(0);
  const [showConfig, setShowConfig] = useState(true);
  const [confirmFinish, setConfirmFinish] = useState(false);
  const [confirmKick, setConfirmKick] = useState<Player | null>(null);

  const [config, setConfig] = useState<RoundConfig>({
    durationMinutes: 15,
    durationSeconds: 0,
    roundNumber: 1,
    intervalMinutes: 5,
  });

  // ── Derivados ────────────────────────────────
  const submittedCount = useMemo(
    () => players.filter((p) => p.submittedAt).length,
    [players]
  );
  const totalDurationSeconds =
    config.durationMinutes * 60 + config.durationSeconds;
  const progressPercent =
    endTime && totalDurationSeconds > 0
      ? (timeLeft / (totalDurationSeconds * 1000)) * 100
      : 0;

  // ── Socket ───────────────────────────────────
  const conectarSocket = useCallback(
    (sessionId: string) => {
      if (socketRef.current) return;

      const socket = io(`${API_URL}/simulation`, { reconnection: true });
      socketRef.current = socket;

      socket.on("connect", () => setConnected(true));
      socket.on("disconnect", () => setConnected(false));

      socket.emit("join_session", {
        sessionId,
        playerId: "ADMIN",
        isAdmin: true,
      });

      socket.on("session:players_updated", (data: Player[]) =>
        setPlayers(data)
      );

      socket.on("player:joined", (player: Player) => {
        setPlayers((prev) =>
          prev.some((p) => p.id === player.id) ? prev : [...prev, player]
        );
        toast(`🎮 ${player.storeName} entrou na sala`);
      });

      socket.on("player:submitted", ({ playerId }: { playerId: string }) => {
        const now = new Date().toLocaleTimeString("pt-BR");
        setPlayers((prev) =>
          prev.map((p) =>
            p.id === playerId ? { ...p, submittedAt: now } : p
          )
        );
      });

      socket.on("player:kicked", ({ playerId }: { playerId: string }) => {
        setPlayers((prev) => prev.filter((p) => p.id !== playerId));
      });

      socket.on("round:started", (data: any) => {
        setGameStarted(true);
        setEndTime(data.endTime);
        setSession((s) =>
          s ? { ...s, currentRound: data.roundNumber, status: "IN_PROGRESS" } : s
        );
        toast.success(`▶ Rodada ${data.roundNumber} iniciada`);
      });

      socket.on("round:stopped", () => {
        setGameStarted(false);
        setEndTime(null);
        toast("🛑 Rodada encerrada");
      });

      socket.on("round:finished", () => {
        setGameStarted(false);
        setEndTime(null);
        setConfig((c) => ({ ...c, roundNumber: c.roundNumber + 1 }));
      });
    },
    [API_URL]
  );

  // ── Carga inicial ─────────────────────────────
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

        if (!resSess.ok) throw new Error("Sessão não encontrada");

        const sessionData: Session = await resSess.json();
        const playersData: Player[] = await resPlay.json();

        setSession(sessionData);
        setPlayers(playersData || []);

        if (sessionData) {
          setConfig((c) => ({
            ...c,
            roundNumber: (sessionData.currentRound ?? 0) + 1,
          }));
          conectarSocket(sessionData.id);
        }
      } catch {
        toast.error("Erro ao carregar a sessão");
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [API_URL, router, conectarSocket]);

  // ── Timer ─────────────────────────────────────
  useEffect(() => {
    if (!endTime || !gameStarted) return;
    const tick = () => {
      const diff = endTime - Date.now();
      if (diff <= 0) {
        setTimeLeft(0);
        setGameStarted(false);
      } else {
        setTimeLeft(diff);
      }
    };
    const id = setInterval(tick, 500);
    return () => clearInterval(id);
  }, [endTime, gameStarted]);

  // ── Ações ─────────────────────────────────────
  const iniciarRodada = () => {
    if (!session || totalDurationSeconds <= 0)
      return toast.error("Duração inválida");
    setPlayers((prev) => prev.map((p) => ({ ...p, submittedAt: undefined })));
    socketRef.current?.emit("admin:start_round", {
      sessionId: session.id,
      duration: totalDurationSeconds,
      round: config.roundNumber,
      interval: config.intervalMinutes * 60,
    });
  };

  const pararRodada = () => {
    socketRef.current?.emit("admin:force_stop_round", {
      sessionId: session?.id,
    });
  };

  const proximaRodada = () => {
    socketRef.current?.emit("admin:start_next_round", {
      sessionId: session?.id,
    });
  };

  const expulsarJogador = (player: Player) => {
    socketRef.current?.emit("admin:kick_player", {
      sessionId: session?.id,
      playerId: player.id,
    });
    setPlayers((prev) => prev.filter((p) => p.id !== player.id));
    setConfirmKick(null);
    toast(`🚫 ${player.storeName} removido da sala`);
  };

  const encerrarSessao = () => {
    socketRef.current?.emit("admin:finish_session", {
      sessionId: session?.id,
    });
    router.push("/pages/admin/dashboard/setup");
  };

  // ── Loading ───────────────────────────────────
  if (loading)
    return (
      <div className="min-h-screen flex items-center justify-center bg-[#080D17]">
        <RefreshCw className="animate-spin text-orange-500" size={36} />
      </div>
    );

  // ─────────────────────────────────────────────
  // RENDER
  // ─────────────────────────────────────────────
  return (
    <div className="min-h-screen bg-[#080D17] text-white font-sans">
      <Toaster position="top-right" toastOptions={{ style: { background: "#1A2235", color: "#fff", border: "1px solid rgba(255,255,255,0.08)" } }} />

      {/* ── HEADER ───────────────────────────────────────────── */}
<header className="sticky top-0 z-40 w-full border-b border-white/[0.06] bg-[#080D17]/90 backdrop-blur-xl">
  <div className="max-w-7xl mx-auto px-4 md:px-6 lg:px-8 py-4 flex flex-col lg:flex-row items-start lg:items-center justify-between gap-4">

    {/* LEFT */}
    <div className="flex flex-col gap-3 w-full lg:w-auto">

      {/* TOP INFO */}
      <div className="flex flex-wrap items-center gap-3">

        {/* TITLE */}
        <div>
          <h1 className="font-black italic uppercase tracking-tight text-xl md:text-2xl text-white leading-none">
            Central Mestre
          </h1>

          <p className="text-[10px] md:text-[11px] uppercase tracking-[0.28em] text-slate-500 font-black mt-1">
            Painel de Controle da Simulação
          </p>
        </div>

        {/* STATUS */}
        <div
          className={`flex items-center gap-2 px-3 py-1.5 rounded-full border text-[11px] font-black uppercase tracking-wider ${
            connected
              ? "bg-emerald-500/10 border-emerald-500/20 text-emerald-400"
              : "bg-red-500/10 border-red-500/20 text-red-400"
          }`}
        >
          {connected ? (
            <Wifi className="animate-pulse" size={13} />
          ) : (
            <WifiOff size={13} />
          )}

          {connected ? "Conectado" : "Desconectado"}
        </div>
      </div>

      {/* ROOM CODE */}
      <div className="flex flex-wrap items-center gap-3">

        <div className="bg-orange-500 rounded-2xl px-5 py-3 shadow-xl border-b-4 border-orange-700">
          <div className="flex items-center gap-2 mb-1">
            <Hash size={14} className="text-orange-100" />

            <span className="text-[10px] uppercase tracking-[0.25em] text-orange-100 font-black">
              Código da Sala
            </span>
          </div>

          <div className="text-2xl md:text-3xl font-black tracking-[0.35em] text-white leading-none">
            {session?.code || "----"}
          </div>
        </div>

        {/* SESSION INFO */}
        <div className="flex flex-col justify-center bg-white/[0.03] border border-white/[0.06] rounded-2xl px-4 py-3 min-h-[76px]">

          <span className="text-[10px] uppercase tracking-[0.22em] text-slate-500 font-black mb-1">
            Status da Sessão
          </span>

          <div className="flex items-center gap-2">
            <div
              className={`w-2.5 h-2.5 rounded-full ${
                gameStarted
                  ? "bg-orange-500 animate-pulse"
                  : "bg-emerald-400"
              }`}
            />

            <span className="font-black uppercase text-sm text-white">
              {gameStarted
                ? `Rodada ${config.roundNumber} em andamento`
                : "Lobby aguardando início"}
            </span>
          </div>

          <span className="text-xs text-slate-500 mt-1">
            {players.length} participante(s) conectado(s)
          </span>
        </div>
      </div>
    </div>

    {/* RIGHT ACTIONS */}
    <div className="flex items-center gap-3 w-full lg:w-auto">

      {/* ROUND INFO */}
      <div className="hidden md:flex items-center gap-3 bg-[#121826] border border-white/[0.06] rounded-2xl px-5 py-3">

        <div className="w-11 h-11 rounded-xl bg-orange-500/10 flex items-center justify-center">
          <Timer className="text-orange-500" size={20} />
        </div>

        <div>
          <div className="text-[10px] uppercase tracking-[0.22em] text-slate-500 font-black">
            Rodada Atual
          </div>

          <div className="text-lg font-black text-white">
            {config.roundNumber}
          </div>
        </div>
      </div>

      {/* FINISH */}
      <button
        onClick={() => setConfirmFinish(true)}
        className="group flex items-center justify-center gap-2 bg-red-500/10 hover:bg-red-500 text-red-400 hover:text-white border border-red-500/20 hover:border-red-500 px-4 md:px-5 py-3 rounded-2xl transition-all duration-200 font-black uppercase text-xs md:text-sm shadow-lg w-full lg:w-auto"
      >
        <LogOut
          size={16}
          className="group-hover:-translate-x-0.5 transition-transform"
        />

        <span>Encerrar Sessão</span>
      </button>
    </div>
  </div>
</header>

      {/* ── Conteúdo ── */}
      <main className="max-w-7xl mx-auto px-4 md:px-8 py-6 grid grid-cols-1 lg:grid-cols-3 gap-5">

        {/* ═══ Coluna esquerda (2/3) ═══ */}
        <div className="lg:col-span-2 space-y-5">

          {/* Painel de Informações da Sessão */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
            {[
              {
                icon: <CircleDot size={16} className="text-orange-400" />,
                label: "Status",
                value:
                  session?.status === "IN_PROGRESS"
                    ? "Em Progresso"
                    : session?.status === "FINISHED"
                    ? "Encerrada"
                    : "Aguardando",
              },
              {
                icon: <Trophy size={16} className="text-yellow-400" />,
                label: "Rodada Atual",
                value: `${session?.currentRound ?? 0} / ${session?.totalRounds ?? "—"}`,
              },
              {
                icon: <Users size={16} className="text-sky-400" />,
                label: "Jogadores",
                value: players.length,
              },
              {
                icon: <BarChart2 size={16} className="text-emerald-400" />,
                label: "Enviaram",
                value: `${submittedCount} / ${players.length}`,
              },
            ].map((stat) => (
              <div
                key={stat.label}
                className="bg-[#111827] border border-white/[0.06] rounded-2xl px-4 py-3 flex flex-col gap-2"
              >
                <div className="flex items-center gap-1.5 text-slate-500 text-xs font-black uppercase tracking-wider">
                  {stat.icon}
                  {stat.label}
                </div>
                <div className="text-xl font-black text-white">
                  {stat.value}
                </div>
              </div>
            ))}
          </div>

          {/* Cronômetro */}
          <section className="bg-[#111827] border border-white/[0.06] rounded-3xl p-6 md:p-8">
            <div className="flex items-center justify-between mb-5">
              <span className="text-xs font-black text-slate-500 uppercase tracking-widest">
                Cronômetro — Rodada {config.roundNumber}
              </span>
              <Timer
                size={18}
                className={
                  gameStarted ? "text-orange-500 animate-pulse" : "text-slate-600"
                }
              />
            </div>

            <div
              className={`text-6xl md:text-8xl font-mono font-black tabular-nums leading-none ${
                gameStarted ? "text-white" : "text-slate-700"
              }`}
            >
              {gameStarted ? formatMs(timeLeft) : "00:00"}
            </div>

            {/* Barra de progresso */}
            <div className="mt-6 h-2 bg-white/5 rounded-full overflow-hidden">
              <motion.div
                className="h-full bg-orange-500 rounded-full"
                initial={{ width: "100%" }}
                animate={{ width: `${gameStarted ? progressPercent : 0}%` }}
                transition={{ ease: "linear", duration: 0.5 }}
              />
            </div>

            {/* Sub-info */}
            {gameStarted && players.length > 0 && (
              <div className="mt-4 flex items-center gap-2 text-xs text-slate-500 font-medium">
                <CheckCircle2 size={13} className="text-emerald-500" />
                {submittedCount} de {players.length} jogadores já enviaram
              </div>
            )}
          </section>

          {/* Configuração da Rodada */}
          <section className="bg-[#111827] border border-white/[0.06] rounded-3xl overflow-hidden">
            <button
              onClick={() => setShowConfig(!showConfig)}
              className="w-full px-6 py-5 flex justify-between items-center hover:bg-white/[0.03] transition-colors"
            >
              <div className="flex items-center gap-3">
                <Settings size={18} className="text-orange-500" />
                <span className="font-black uppercase text-sm">
                  Configurar Rodada {config.roundNumber}
                </span>
              </div>
              {showConfig ? (
                <ChevronUp size={18} className="text-slate-500" />
              ) : (
                <ChevronDown size={18} className="text-slate-500" />
              )}
            </button>

            <AnimatePresence initial={false}>
              {showConfig && (
                <motion.div
                  initial={{ height: 0, opacity: 0 }}
                  animate={{ height: "auto", opacity: 1 }}
                  exit={{ height: 0, opacity: 0 }}
                  transition={{ duration: 0.25 }}
                  className="overflow-hidden"
                >
                  <div className="px-6 pb-6 pt-2 border-t border-white/[0.06] space-y-5">

                    {/* Duração */}
                    <div>
                      <label className="text-xs font-black text-slate-500 uppercase block mb-3">
                        Duração da Rodada
                      </label>
                      <div className="flex flex-wrap gap-2">
                        {DURATION_PRESETS.map((p) => (
                          <button
                            key={p.minutes}
                            disabled={gameStarted}
                            onClick={() =>
                              setConfig((c) => ({
                                ...c,
                                durationMinutes: p.minutes,
                                durationSeconds: 0,
                              }))
                            }
                            className={`px-4 py-2 rounded-xl text-sm font-bold transition-all disabled:opacity-40 ${
                              config.durationMinutes === p.minutes
                                ? "bg-orange-500 text-white"
                                : "bg-white/5 hover:bg-white/10 text-slate-300"
                            }`}
                          >
                            {p.label}
                          </button>
                        ))}
                      </div>
                    </div>

                    {/* Intervalo */}
                    <div>
                      <label className="text-xs font-black text-slate-500 uppercase block mb-3">
                        Intervalo entre Rodadas
                      </label>
                      <div className="flex flex-wrap gap-2">
                        {INTERVAL_PRESETS.map((p) => (
                          <button
                            key={p.minutes}
                            disabled={gameStarted}
                            onClick={() =>
                              setConfig((c) => ({
                                ...c,
                                intervalMinutes: p.minutes,
                              }))
                            }
                            className={`px-4 py-2 rounded-xl text-sm font-bold transition-all disabled:opacity-40 ${
                              config.intervalMinutes === p.minutes
                                ? "bg-slate-500 text-white"
                                : "bg-white/5 hover:bg-white/10 text-slate-300"
                            }`}
                          >
                            {p.label}
                          </button>
                        ))}
                      </div>
                    </div>

                    {/* Número manual da rodada */}
                    <div>
                      <label className="text-xs font-black text-slate-500 uppercase block mb-3">
                        Número da Rodada
                      </label>
                      <input
                        type="number"
                        min={1}
                        value={config.roundNumber}
                        disabled={gameStarted}
                        onChange={(e) =>
                          setConfig((c) => ({
                            ...c,
                            roundNumber: Math.max(1, Number(e.target.value)),
                          }))
                        }
                        className="w-24 bg-white/5 border border-white/10 rounded-xl px-3 py-2 text-white font-bold text-sm focus:outline-none focus:border-orange-500 disabled:opacity-40"
                      />
                    </div>

                    {/* Botões de ação */}
                    <div className="flex flex-wrap gap-3 pt-1">
                      <button
                        disabled={gameStarted}
                        onClick={iniciarRodada}
                        className="flex items-center gap-2 bg-orange-500 hover:bg-orange-400 disabled:opacity-40 disabled:cursor-not-allowed px-6 py-3 rounded-2xl font-black uppercase text-sm transition-all"
                      >
                        <Play size={16} /> Iniciar Rodada
                      </button>

                      {gameStarted && (
                        <button
                          onClick={pararRodada}
                          className="flex items-center gap-2 bg-yellow-500 hover:bg-yellow-400 text-black px-5 py-3 rounded-2xl font-black uppercase text-sm transition-all"
                        >
                          <Square size={16} /> Parar
                        </button>
                      )}

                      {!gameStarted && (session?.currentRound ?? 0) > 0 && (
                        <button
                          onClick={proximaRodada}
                          className="flex items-center gap-2 bg-sky-500/20 hover:bg-sky-500/30 text-sky-400 border border-sky-400/20 px-5 py-3 rounded-2xl font-black uppercase text-sm transition-all"
                        >
                          <SkipForward size={16} /> Próxima Rodada
                        </button>
                      )}
                    </div>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </section>
        </div>

        {/* ═══ Coluna direita — Jogadores ═══ */}
        <aside className="space-y-3">
          <div className="flex items-center justify-between px-1">
            <div className="flex items-center gap-2 text-xs font-black text-slate-400 uppercase">
              <Users size={14} />
              Jogadores ({players.length})
            </div>
            <div className="text-xs font-bold text-emerald-400">
              {submittedCount} enviaram
            </div>
          </div>

          <div className="space-y-2 max-h-[70vh] overflow-y-auto pr-1">
            <AnimatePresence>
              {players.length === 0 && (
                <motion.div
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  className="bg-[#111827] border border-white/[0.06] rounded-2xl p-6 text-center text-slate-600 text-sm"
                >
                  Nenhum jogador conectado
                </motion.div>
              )}

              {players.map((player) => (
                <motion.div
                  layout
                  key={player.id}
                  initial={{ opacity: 0, y: 8 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, scale: 0.95 }}
                  className="bg-[#111827] border border-white/[0.06] rounded-2xl p-4 flex items-center justify-between gap-3 group"
                >
                  <div className="min-w-0">
                    <div className="font-bold text-sm truncate">
                      {player.storeName}
                    </div>
                    <div className="text-[11px] text-slate-500 font-semibold truncate">
                      {player.name}
                    </div>
                    {player.submittedAt && (
                      <div className="text-[10px] text-emerald-500 font-bold mt-0.5">
                        Enviado às {player.submittedAt}
                      </div>
                    )}
                  </div>

                  <div className="flex items-center gap-2 shrink-0">
                    {/* Status de envio */}
                    {player.submittedAt ? (
                      <div
                        className="bg-emerald-500/10 text-emerald-500 p-1.5 rounded-lg"
                        title="Enviado"
                      >
                        <CheckCircle2 size={16} />
                      </div>
                    ) : (
                      <div
                        className="bg-white/5 text-slate-600 p-1.5 rounded-lg"
                        title="Aguardando"
                      >
                        <Clock size={16} />
                      </div>
                    )}

                    {/* Botão expulsar */}
                    <button
                      onClick={() => setConfirmKick(player)}
                      className="opacity-0 group-hover:opacity-100 bg-red-500/10 text-red-400 hover:bg-red-500/20 p-1.5 rounded-lg transition-all"
                      title="Remover jogador"
                    >
                      <UserMinus size={16} />
                    </button>
                  </div>
                </motion.div>
              ))}
            </AnimatePresence>
          </div>
        </aside>
      </main>

      {/* ── Modal: Encerrar Sessão ── */}
      <AnimatePresence>
        {confirmFinish && (
          <Modal onClose={() => setConfirmFinish(false)}>
            <AlertTriangle className="text-red-400 mx-auto mb-4" size={44} />
            <h2 className="text-xl font-black mb-2">Encerrar Simulação?</h2>
            <p className="text-slate-400 text-sm mb-6">
              Todos os jogadores serão desconectados e os relatórios serão
              finalizados.
            </p>
            <div className="flex gap-3">
              <button
                onClick={() => setConfirmFinish(false)}
                className="flex-1 py-3 font-bold text-slate-400 hover:text-white transition-colors"
              >
                Cancelar
              </button>
              <button
                onClick={encerrarSessao}
                className="flex-1 bg-red-500 hover:bg-red-400 py-3 rounded-xl font-bold transition-all"
              >
                Encerrar
              </button>
            </div>
          </Modal>
        )}
      </AnimatePresence>

      {/* ── Modal: Expulsar Jogador ── */}
      <AnimatePresence>
        {confirmKick && (
          <Modal onClose={() => setConfirmKick(null)}>
            <UserMinus className="text-orange-400 mx-auto mb-4" size={44} />
            <h2 className="text-xl font-black mb-2">Remover Jogador?</h2>
            <p className="text-slate-400 text-sm mb-1">
              <span className="text-white font-bold">{confirmKick.storeName}</span>
            </p>
            <p className="text-slate-500 text-xs mb-6">
              O jogador será desconectado da sessão.
            </p>
            <div className="flex gap-3">
              <button
                onClick={() => setConfirmKick(null)}
                className="flex-1 py-3 font-bold text-slate-400 hover:text-white transition-colors"
              >
                Cancelar
              </button>
              <button
                onClick={() => expulsarJogador(confirmKick)}
                className="flex-1 bg-orange-500 hover:bg-orange-400 py-3 rounded-xl font-bold transition-all"
              >
                Remover
              </button>
            </div>
          </Modal>
        )}
      </AnimatePresence>
    </div>
  );
};

// ─────────────────────────────────────────────
// SUBCOMPONENTE: Modal genérico
// ─────────────────────────────────────────────
const Modal = ({
  children,
  onClose,
}: {
  children: React.ReactNode;
  onClose: () => void;
}) => (
  <motion.div
    initial={{ opacity: 0 }}
    animate={{ opacity: 1 }}
    exit={{ opacity: 0 }}
    className="fixed inset-0 bg-black/70 backdrop-blur-sm flex items-center justify-center z-50 p-4"
    onClick={onClose}
  >
    <motion.div
      initial={{ scale: 0.92, opacity: 0 }}
      animate={{ scale: 1, opacity: 1 }}
      exit={{ scale: 0.92, opacity: 0 }}
      onClick={(e) => e.stopPropagation()}
      className="bg-[#111827] border border-white/10 p-8 rounded-3xl max-w-sm w-full text-center shadow-2xl"
    >
      {children}
    </motion.div>
  </motion.div>
);

export default AdminMestre;