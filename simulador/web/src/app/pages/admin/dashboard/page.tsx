"use client";


import { useRouter } from "next/navigation";
import { useEffect, useMemo, useRef, useState } from "react";
import toast, { Toaster } from "react-hot-toast";
import { RefreshCw, Clock } from "lucide-react"; // Importado Clock para a UI de tempo



import { Header } from "./components/Header";
import { ModalEncerrarSessao, ModalExpulsarJogador } from "./components/Modals";
import { PlayersTable } from "./components/PlayersTable";
import { RoundConfigPanel } from "./components/RoundConfigPanel";
import AdminRoundRanking from "./components/RoundRankingBoard";
import { RoundTimer } from "./components/RoundTimer";
import { StatsCards } from "./components/StatsCard";
import { useAdminSocket } from "./hooks/useAdminSocket";
import { useOnboarding } from "../../onboarding/context/OnboardingContext";


type DashboardState = {
  ranking?: Parameters<typeof AdminRoundRanking>[0]["ranking"];
};
import { Player, RoundConfig } from "./types";

const AdminMestre = () => {
  const router = useRouter();
  const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:4000";

  // Desestruturada a nova função 'alterarTempoRodada' do hook
  const {
    connected,
    players,
    setPlayers,
    gameStarted,
    endTime,
    session,
    setSession,
    conectar,
    emit,
    alterarTempoRodada, 
  } = useAdminSocket(API_URL);

  const [adminName, setAdminName] = useState("Administrador");
  const [loading, setLoading] = useState(true);
  const [timeLeft, setTimeLeft] = useState(0);
  const [showConfig, setShowConfig] = useState(true);
  const [confirmFinish, setConfirmFinish] = useState(false);
  const [confirmKick, setConfirmKick] = useState<Player | null>(null);
  const [dashboard] = useState<DashboardState | null>(null);

  const connectedRef = useRef(false);

  const {
    maxStockPericiveis,
    setMaxStockPericiveis,
    maxStockMercearia,
    setMaxStockMercearia,
    maxStockEletro,
    setMaxStockEletro,
    maxStockHipel,
    setMaxStockHipel,
  } = useOnboarding();

  const [config, setConfig] = useState<RoundConfig>({
    durationMinutes: 15,
    durationSeconds: 0,
    roundNumber: 1,
    intervalMinutes: 5,
    maxPereciveis: maxStockPericiveis,
    maxMercearia: maxStockMercearia,
    maxEletro: maxStockEletro,
    maxHipel: maxStockHipel,
  });

  const submittedCount = useMemo(
    () => players.filter((p) => !!p.submittedAt).length,
    [players]
  );

  const readyCount = useMemo(
    () => players.filter((p) => p?.isReady).length,
    [players]
  );

  const totalDurationSeconds =
    config.durationMinutes * 60 + config.durationSeconds;

  const progressPercent =
    endTime && totalDurationSeconds > 0
      ? Math.max(
          0,
          Math.min(100, (timeLeft / (totalDurationSeconds * 1000)) * 100)
        )
      : 0;

  const ranking = dashboard?.ranking ?? [];

  const handleConfigChange = (patch: Partial<RoundConfig>) => {
    const nextConfig = { ...config, ...patch };

    setConfig(nextConfig);

    if (patch.maxPereciveis !== undefined) {
      setMaxStockPericiveis(nextConfig.maxPereciveis);
    }

    if (patch.maxMercearia !== undefined) {
      setMaxStockMercearia(nextConfig.maxMercearia);
    }

    if (patch.maxEletro !== undefined) {
      setMaxStockEletro(nextConfig.maxEletro);
    }

    if (patch.maxHipel !== undefined) {
      setMaxStockHipel(nextConfig.maxHipel);
    }
  };

  // =========================
  // LOAD INITIAL
  // =========================
  useEffect(() => {
    const sessionId = localStorage.getItem("admin_session_id");
    const admin = localStorage.getItem("admin_name");

    if (admin) setAdminName(admin);

    if (!sessionId) {
      router.push("/pages/admin/dashboard/setup");
      return;
    }

    const fetchAll = async () => {
      try {
        const [resSess, resPlay] = await Promise.all([
          fetch(`${API_URL}/minigame/session/${sessionId}`),
          fetch(`${API_URL}/minigame/players/${sessionId}`),
        ]);

        const sessionData = await resSess.json();
        const playersData = await resPlay.json();

        setSession(sessionData);
        setPlayers(playersData || []);

        if (!connectedRef.current) {
          conectar(sessionData.id);
          connectedRef.current = true;
        }

        setConfig((prev) => ({
          ...prev,
          roundNumber: (sessionData.currentRound ?? 0) + 1,
        }));
      } catch {
        toast.error("Erro ao carregar sessão");
      } finally {
        setLoading(false);
      }
    };

    fetchAll();
  }, [API_URL, conectar, router, setPlayers, setSession]);

  // =========================
  // TIMER
  // =========================
  useEffect(() => {
    if (!endTime || !gameStarted) return;

    const tick = () => {
      const diff = endTime - Date.now();
      setTimeLeft(diff <= 0 ? 0 : diff);
    };

    tick();
    const interval = setInterval(tick, 500);

    return () => clearInterval(interval);
  }, [endTime, gameStarted]);

  // =========================
  // ACTIONS
  // =========================
  const iniciarRodada = () => {
    emit("admin:start_round", {
      sessionId: session?.id,
      duration: totalDurationSeconds,
      round: config.roundNumber,
      interval: config.intervalMinutes * 60,
      maxStock: {
        pereciveis: config.maxPereciveis,
        mercearia: config.maxMercearia,
        eletro: config.maxEletro,
        hipel: config.maxHipel,
      },
    });

    setPlayers((prev) =>
      prev.map((p) => ({ ...p, submittedAt: undefined }))
    );
  };

  const pararRodada = () =>
    emit("admin:force_stop_round", { sessionId: session?.id });

  const proximaRodada = () =>
    emit("admin:start_next_round", { sessionId: session?.id });

  const expulsarJogador = (player: Player) => {
    emit("admin:kick_player", {
      sessionId: session?.id,
      playerId: player.id,
    });

    setPlayers((prev) => prev.filter((p) => p.id !== player.id));
    setConfirmKick(null);
  };

  const encerrarSessao = () => {
    emit("admin:finish_session", { sessionId: session?.id });
    router.push("/pages/admin/setup");
  };

  // Função disparada pelos botões rápidos de controle de tempo
  const handleAlterarTempoRapido = (minutos: number) => {
    if (!session?.id) return;
    alterarTempoRodada(minutos, session.id);
  };

  // =========================
  // LOADING
  // =========================
  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[#080D17]">
        <RefreshCw className="animate-spin text-orange-500" size={36} />
      </div>
    );
  }

  // =========================
  // UI
  // =========================
  return (
    <div className="min-h-screen bg-[#080D17] text-white">
      <Toaster position="top-right" />

      <Header
        session={session}
        connected={connected}
        gameStarted={gameStarted}
        currentRoundNumber={config.roundNumber}
        playersCount={players.length}
        adminName={adminName}
        onEncerrar={() => setConfirmFinish(true)}
      />

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">

        <div className="mb-4"> 
          <StatsCards
              session={session}
              players={players}
              playersCount={players.length}
              submittedCount={submittedCount}
            />
        </div>
        
        <div className="grid grid-cols-1 xl:grid-cols-12 gap-6">

          <div className="xl:col-span-8 space-y-6">

            <RoundTimer
              gameStarted={gameStarted}
              timeLeft={timeLeft}
              progressPercent={progressPercent}
              roundNumber={config.roundNumber}
              playersCount={players.length}
              submittedCount={submittedCount}
              readyCount={readyCount}
            />

            {/* ======================================================= */}
            {/* COMPONENTE VISUAL INJETADO: PRESETS DE CONTROLE DE TEMPO */}
            {/* ======================================================= */}
            {gameStarted && (
              <div className="bg-[#0f192b] border border-slate-800 p-4 rounded-xl flex flex-wrap items-center justify-between gap-4">
                <div className="flex items-center gap-2">
                  <Clock className="text-orange-500" size={20} />
                  <div>
                    <h3 className="font-semibold text-sm">Controle de Tempo em Tempo Real</h3>
                    <p className="text-xs text-slate-400">Modifique a duração restante da rodada atual para todos.</p>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <button 
                    onClick={() => handleAlterarTempoRapido(1)}
                    className="px-3 py-1.5 bg-emerald-600 hover:bg-emerald-500 rounded text-xs font-medium transition"
                  >
                    +1 Minuto
                  </button>
                  <button 
                    onClick={() => handleAlterarTempoRapido(5)}
                    className="px-3 py-1.5 bg-emerald-700 hover:bg-emerald-600 rounded text-xs font-medium transition"
                  >
                    +5 Minutos
                  </button>
                  <button 
                    onClick={() => handleAlterarTempoRapido(-1)}
                    className="px-3 py-1.5 bg-rose-700 hover:bg-rose-600 rounded text-xs font-medium transition"
                  >
                    -1 Minuto
                  </button>
                </div>
              </div>
            )}
            {/* ======================================================= */}

            <RoundConfigPanel
              config={config}
              gameStarted={gameStarted}
              showConfig={showConfig}
              canGoNext={(session?.currentRound ?? 0) > 0}
              onToggle={() => setShowConfig((v) => !v)}
              onConfigChange={handleConfigChange}
              onIniciar={iniciarRodada}
              onParar={pararRodada}
              onProxima={proximaRodada}
            />

            <AdminRoundRanking
              ranking={ranking}
              roundNumber={config.roundNumber}
            />
          </div>

          <div className="xl:col-span-4">
            <div className="sticky top-24">
              <PlayersTable
                players={players}
                submittedCount={submittedCount}
                onKick={setConfirmKick}
              />
            </div>
          </div>

        </div>
      </main>

      <ModalEncerrarSessao
        open={confirmFinish}
        onClose={() => setConfirmFinish(false)}
        onConfirm={encerrarSessao}
      />

      <ModalExpulsarJogador
        player={confirmKick}
        onClose={() => setConfirmKick(null)}
        onConfirm={expulsarJogador}
      />
    </div>
  );
};

export default AdminMestre;
