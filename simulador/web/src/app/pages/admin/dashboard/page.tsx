"use client";

import React, { useEffect, useMemo, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import toast, { Toaster } from "react-hot-toast";
import { RefreshCw } from "lucide-react";

import { RoundConfig } from "./types";
import { useAdminSocket } from "./hooks/useAdminSocket";

import { Header } from "./components/Header";
import { StatsCards } from "./components/StatsCard";
import { RoundTimer } from "./components/RoundTimer";
import { RoundConfigPanel } from "./components/RoundConfigPanel";
import { PlayersTable } from "./components/PlayersTable";
import { ModalEncerrarSessao, ModalExpulsarJogador } from "./components/Modals";
import AdminRoundRanking from "./components/RoundRankingBoard";

import { Player } from "./types";

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
  } = useAdminSocket(API_URL);

  const [loading, setLoading] = useState(true);
  const [timeLeft, setTimeLeft] = useState(0);
  const [showConfig, setShowConfig] = useState(true);
  const [confirmFinish, setConfirmFinish] = useState(false);
  const [confirmKick, setConfirmKick] = useState<Player | null>(null);

  const [dashboard, setDashboard] = useState<any>(null);

  const connectedRef = useRef(false);

  const [config, setConfig] = useState<RoundConfig>({
    durationMinutes: 15,
    durationSeconds: 0,
    roundNumber: 1,
    intervalMinutes: 5,
  });

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

  const ranking = dashboard?.ranking ?? [];

  // ================= LOAD =================
  useEffect(() => {
    const sessionId = localStorage.getItem("admin_session_id");

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

        // evita conexão duplicada
        if (!connectedRef.current) {
          conectar(sessionData.id, () => {
            // callback round finished (opcional)
          });
          connectedRef.current = true;
        }

        const roundId = sessionData.currentRoundId;

        if (roundId) {
          const resDash = await fetch(
            `${API_URL}/dashboard/${sessionData.id}/${roundId}`
          );
          const dash = await resDash.json();
          setDashboard(dash);
        }

        setConfig((c) => ({
          ...c,
          roundNumber: (sessionData.currentRound ?? 0) + 1,
        }));
      } catch {
        toast.error("Erro ao carregar sessão");
      } finally {
        setLoading(false);
      }
    };

    fetchAll();
  }, [API_URL]);

  // ================= TIMER =================
  useEffect(() => {
    if (!endTime || !gameStarted) return;

    const tick = () => {
      const diff = endTime - Date.now();
      setTimeLeft(diff <= 0 ? 0 : diff);
    };

    const id = setInterval(tick, 500);
    return () => clearInterval(id);
  }, [endTime, gameStarted]);

  // ================= ACTIONS =================
  const iniciarRodada = () => {
    if (!session || totalDurationSeconds <= 0)
      return toast.error("Duração inválida");

    setPlayers((prev) =>
      prev.map((p) => ({ ...p, submittedAt: undefined }))
    );

    emit("admin:start_round", {
      sessionId: session.id,
      duration: totalDurationSeconds,
      round: config.roundNumber,
      interval: config.intervalMinutes * 60,
    });
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

    toast(`🚫 ${player.storeName} removido`);
  };

  const encerrarSessao = () => {
    emit("admin:finish_session", { sessionId: session?.id });
    router.push("/pages/admin/setup");
  };

  // ================= LOADING =================
  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[#080D17]">
        <RefreshCw className="animate-spin text-orange-500" size={36} />
      </div>
    );
  }

  // ================= RENDER =================
  return (
    <div className="min-h-screen bg-[#080D17] text-white font-sans">
      <Toaster position="top-right" />

      <Header
        session={session}
        connected={connected}
        gameStarted={gameStarted}
        currentRoundNumber={config.roundNumber}
        playersCount={players.length}
        onEncerrar={() => setConfirmFinish(true)}
      />

      <main className="max-w-7xl mx-auto px-4 md:px-8 py-6 grid grid-cols-1 lg:grid-cols-3 gap-5">

        <div className="lg:col-span-2 space-y-5">

          <StatsCards
            session={session}
            playersCount={players.length}
            submittedCount={submittedCount}
          />

          <RoundTimer
            gameStarted={gameStarted}
            timeLeft={timeLeft}
            progressPercent={progressPercent}
            roundNumber={config.roundNumber}
            playersCount={players.length}
            submittedCount={submittedCount}
          />

          <RoundConfigPanel
            config={config}
            gameStarted={gameStarted}
            showConfig={showConfig}
            canGoNext={(session?.currentRound ?? 0) > 0}
            onToggle={() => setShowConfig((v) => !v)}
            onConfigChange={(patch) =>
              setConfig((c) => ({ ...c, ...patch }))
            }
            onIniciar={iniciarRodada}
            onParar={pararRodada}
            onProxima={proximaRodada}
          />

          <AdminRoundRanking
            ranking={ranking}
            roundNumber={config.roundNumber}
          />
        </div>

        <PlayersTable
          players={players}
          submittedCount={submittedCount}
          onKick={setConfirmKick}
        />
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