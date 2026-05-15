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
import {
  ModalEncerrarSessao,
  ModalExpulsarJogador,
} from "./components/Modals";

import { Player } from "./types";
import AdminRoundRanking from "./components/RoundRankingBoard";

const AdminMestre = () => {
  const router = useRouter();

  const API_URL =
    process.env.NEXT_PUBLIC_API_URL || "http://localhost:4000";

  const [adminName, setAdminName] = useState("Administrador");

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
    () => players.filter((p) => !!p.submittedAt).length,
    [players]
  );

  const readyCount = useMemo(
    () => players.filter((p: any) => p?.isReady === true).length,
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

  // ================= LOAD =================
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

  // ================= TIMER =================
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

  // ================= ACTIONS =================
  const iniciarRodada = () => {
    emit("admin:start_round", {
      sessionId: session?.id,
      duration: totalDurationSeconds,
      round: config.roundNumber,
      interval: config.intervalMinutes * 60,
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

  // ================= LOADING =================
  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[#080D17]">
        <RefreshCw className="animate-spin text-orange-500" size={36} />
      </div>
    );
  }

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

      {/* CONTAINER PRINCIPAL (SEM CARDS INTERNOS) */}
      <main className="w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">

        <div className="grid grid-cols-1 xl:grid-cols-12 gap-6">

          {/* LEFT */}
          <div className="xl:col-span-8 space-y-6">

            <StatsCards
              session={session}
              players={players}
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
              readyCount={readyCount}
            />

            <RoundConfigPanel
              config={config}
              gameStarted={gameStarted}
              showConfig={showConfig}
              canGoNext={(session?.currentRound ?? 0) > 0}
              onToggle={() => setShowConfig((v) => !v)}
              onConfigChange={(patch) =>
                setConfig((prev) => ({ ...prev, ...patch }))
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

          {/* RIGHT */}
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