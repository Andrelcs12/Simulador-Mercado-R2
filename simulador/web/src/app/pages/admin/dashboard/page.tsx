"use client";

import { useRouter } from "next/navigation";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import toast, { Toaster } from "react-hot-toast";
import { RefreshCw, Clock, Users } from "lucide-react";

import { Header } from "./components/Header";
import { ModalEncerrarSessao, ModalExpulsarJogador } from "./components/Modals";
import { PlayersTable } from "./components/PlayersTable";
import { RoundConfigPanel } from "./components/RoundConfigPanel";
import AdminRoundRanking from "./components/RoundRankingBoard";
import { RoundTimer } from "./components/RoundTimer";
import { StatsCards } from "./components/StatsCard";
import { useAdminSocket } from "./hooks/useAdminSocket";
import { useOnboarding, MaxStockConfig } from "../../onboarding/context/OnboardingContext";
import { Player, RoundConfig } from "./types";

type DashboardState = {
  ranking?: Parameters<typeof AdminRoundRanking>[0]["ranking"];
};

type RoundRankingBoardItem = {
  roundId: string;
  roundNumber: number;
  rankings: Array<{
    position: number;
    playerId: string;
    playerName: string;
    storeId: string;
    score: number;
    marketShare: number;
  }>;
};

type RoundRankingBoard = RoundRankingBoardItem[];

const AdminMestre = () => {
  const router = useRouter();
  const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:4000";

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

  const {
    maxStockPericiveis,
    maxStockMercearia,
    maxStockEletro,
    maxStockHipel,
    setMaxStockConfig,
  } = useOnboarding();

  const [adminName, setAdminName] = useState("Administrador");
  const [loading, setLoading] = useState(true);
  const [timeLeft, setTimeLeft] = useState(0);
  const [showConfig, setShowConfig] = useState(true);
  const [confirmFinish, setConfirmFinish] = useState(false);
  const [confirmKick, setConfirmKick] = useState<Player | null>(null);
  const [dashboard] = useState<DashboardState | null>(null);
  const [roundRankingBoard, setRoundRankingBoard] = useState<RoundRankingBoard>([]);

  const connectedRef = useRef(false);

  const fetchRoundRankingBoard = useCallback(
    async (sessionId: string) => {
      try {
        const response = await fetch(
          `${API_URL}/minigame/session/${sessionId}/dashboard/round-ranking-board`,
        );

        if (!response.ok) return;

        const data = await response.json();

        setRoundRankingBoard(Array.isArray(data) ? data : []);
      } catch (error) {
        console.warn("Erro ao carregar ranking por rodada", error);
      }
    },
    [API_URL],
  );

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

  const activeRound = useMemo(() => {
    const currentRoundNumber =
      session?.currentRound ||
      roundRankingBoard[roundRankingBoard.length - 1]?.roundNumber ||
      0;

    return (
      roundRankingBoard.find((round) => round.roundNumber === currentRoundNumber) ||
      roundRankingBoard[roundRankingBoard.length - 1] ||
      null
    );
  }, [roundRankingBoard, session?.currentRound]);

  // Rótulo do board deve refletir a rodada DOS DADOS exibidos, não a próxima a configurar.
  const rankingRoundNumber = activeRound?.roundNumber ?? config.roundNumber;

  const ranking = useMemo(() => {
    if (!activeRound) return [];

    return activeRound.rankings.map((item) => ({
      storeId: item.storeId,
      name: item.playerName,
      position: item.position,
      finalScore: item.score,
      marketShare: item.marketShare ?? 0,
      submitted: true,
      ready: true,
      rounds: roundRankingBoard.map((round) => {
        const rank = round.rankings.find((r) => r.storeId === item.storeId);
        return {
          round: round.roundNumber,
          score: rank?.score ?? 0,
          marketShare: rank?.marketShare ?? 0,
        };
      }),
    }));
  }, [activeRound, roundRankingBoard]);

  const handleConfigChange = (patch: Partial<RoundConfig>) => {
    const nextConfig = { ...config, ...patch };
    setConfig(nextConfig);

    const maxStockPatch: Partial<MaxStockConfig> = {};
    if (patch.maxPereciveis !== undefined) maxStockPatch.pereciveis = nextConfig.maxPereciveis;
    if (patch.maxMercearia !== undefined)  maxStockPatch.mercearia  = nextConfig.maxMercearia;
    if (patch.maxEletro !== undefined)     maxStockPatch.eletro     = nextConfig.maxEletro;
    if (patch.maxHipel !== undefined)      maxStockPatch.hipel      = nextConfig.maxHipel;

    if (Object.keys(maxStockPatch).length > 0) {
      setMaxStockConfig((prev) => ({ ...prev, ...maxStockPatch }));
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

        fetchRoundRankingBoard(sessionData.id);
      } catch {
        toast.error("Erro ao carregar sessão");
      } finally {
        setLoading(false);
      }
    };

    fetchAll();
  }, [API_URL, conectar, fetchRoundRankingBoard, router, setPlayers, setSession]);

  useEffect(() => {
    if (!session?.id) return;
    if (gameStarted) return;

    fetchRoundRankingBoard(session.id);
  }, [fetchRoundRankingBoard, gameStarted, session?.id]);

  // Atualização em tempo real do ranking: cada submissão chega via socket
  // (player:submitted → submittedCount). Re-busca o board mesmo com a rodada aberta.
  useEffect(() => {
    if (!session?.id) return;
    fetchRoundRankingBoard(session.id);
  }, [submittedCount, session?.id, fetchRoundRankingBoard]);

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

 // 🚀 PADRONIZAÇÃO: O handle de alteração agora é direto
  const handleAlterarTempo = (deltaMinutes: number) => {
    if (session?.id) {
      alterarTempoRodada(deltaMinutes, session.id);
    }
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

            

            <RoundConfigPanel
        config={config}
        gameStarted={gameStarted}
        showConfig={showConfig}
        canGoNext={(session?.currentRound ?? 0) > 0}
        currentRound={session?.currentRound ? session.currentRound + 1 : config.roundNumber}
        totalRounds={session?.totalRounds ?? 3}
        sessionId={session?.id ?? ""}
        timeLeft={timeLeft}
        onToggle={() => setShowConfig((v) => !v)}
        onConfigChange={handleConfigChange}
        onIniciar={iniciarRodada}
        onParar={pararRodada}
        onProxima={proximaRodada}
        // Passamos a função padronizada aqui
        onAlterarTempoTempoReal={handleAlterarTempo}
      />

            <AdminRoundRanking
              ranking={ranking}
              roundNumber={rankingRoundNumber}
            />

            <div className="mb-6 space-y-4">
              <section className="rounded-3xl border border-white/[0.06] bg-[#111827] overflow-hidden">
                <div className="px-5 py-5 border-b border-white/[0.06] bg-[#0F172A]">
                  <div className="flex items-center justify-between gap-4 flex-wrap">
                    <div className="flex items-center gap-3">
                      <div className="w-11 h-11 rounded-2xl bg-orange-500/10 border border-orange-500/10 flex items-center justify-center">
                        <Clock size={20} className="text-orange-400" />
                      </div>
                      <div>
                        <h2 className="text-sm font-black uppercase tracking-[0.18em] text-white">
                          Ranking por Rodada
                        </h2>
                        <p className="text-[10px] uppercase tracking-[0.22em] text-slate-500 mt-1">
                          múltiplas rodadas agrupadas por rodada
                        </p>
                      </div>
                    </div>
                  </div>
                </div>
                <div className="p-4 space-y-4">
                  {roundRankingBoard.length === 0 ? (
                    <div className="rounded-3xl border border-dashed border-white/[0.06] bg-[#0B1220] p-10 text-center">
                      <Users size={34} className="mx-auto text-slate-700 mb-4" />
                      <h3 className="text-sm font-black uppercase tracking-widest text-slate-300">
                        Nenhum ranking por rodada disponível
                      </h3>
                      <p className="text-xs text-slate-600 mt-2">
                        Aguardando resultados de rodada para exibir o board.
                      </p>
                    </div>
                  ) : (
                    roundRankingBoard.map((round) => (
                      <div
                        key={round.roundId}
                        className="rounded-3xl border border-white/[0.06] bg-[#0B1220] overflow-hidden"
                      >
                        <div className="px-5 py-4 border-b border-white/[0.06]">
                          <h3 className="text-sm font-black text-white">
                            Rodada {round.roundNumber}
                          </h3>
                        </div>
                        <div className="p-4">
                          <div className="grid gap-3">
                            {round.rankings.map((item) => (
                              <div
                                key={item.storeId}
                                className="grid grid-cols-[auto_1fr_auto] gap-4 rounded-2xl border border-white/[0.08] bg-[#111827] p-4"
                              >
                                <div className="text-white font-black text-lg">
                                  #{item.position}
                                </div>
                                <div>
                                  <p className="text-sm font-bold text-white">
                                    {item.playerName}
                                  </p>
                                  <p className="text-xs uppercase tracking-[0.18em] text-slate-500">
                                    {item.storeId}
                                  </p>
                                </div>
                                <div className="text-right">
                                  <p className="text-[10px] uppercase tracking-[0.18em] text-slate-500 font-black">
                                    Score
                                  </p>
                                  <p className="text-lg font-black text-white">
                                    {item.score.toFixed(0)} pts
                                  </p>
                                </div>
                              </div>
                            ))}
                          </div>
                        </div>
                      </div>
                    ))
                  )}
                </div>
              </section>
            </div>
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