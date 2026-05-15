"use client";

import React from "react";
import { useLobbySocket } from "./hooks/useLobbySocket";
import { LobbyHeader } from "./components/LobbyHeader";
import { InfoCards } from "./components/InfoCards";
import { StatsMetrics } from "./components/StatsMetrics";
import { ReadyBanner } from "./components/ReadyBanner";
import { RoundStartOverlay } from "./components/RoundStartOverlay";

const LobbyPage = () => {
  const API_URL =
    process.env.NEXT_PUBLIC_API_URL || "http://localhost:4000";

  const {
    connected,
    players,
    isReady,
    isGameStarted,
    tempoRestante,
    roundLabel,
    sessionCode,
    config,
    myPlayerData,
    confirmarPronto,
  } = useLobbySocket(API_URL);

  const readyCount = players.filter((p) => p.isReady).length;

  return (
    <div className="min-h-screen bg-[#0B1220] text-white relative overflow-hidden">

      {/* GRID BACKGROUND (PADRÃO SAAS) */}
      <div className="absolute inset-0 opacity-[0.04] pointer-events-none">
        <div
          className="w-full h-full"
          style={{
            backgroundImage:
              "linear-gradient(to right, #1f2937 1px, transparent 1px), linear-gradient(to bottom, #1f2937 1px, transparent 1px)",
            backgroundSize: "36px 36px",
          }}
        />
      </div>

      {/* ROUND OVERLAY */}
      <RoundStartOverlay
        isGameStarted={isGameStarted}
        roundLabel={roundLabel}
        tempoRestante={tempoRestante}
      />

      {/* CONTAINER PRINCIPAL */}
      <div className="relative z-10 max-w-7xl mx-auto px-4 md:px-6 lg:px-8 py-8 space-y-6">

        {/* ================= HEADER ================= */}
        <LobbyHeader
          sessionCode={sessionCode}
          isGameStarted={isGameStarted}
          tempoRestante={tempoRestante}
          connected={connected}
        />

        {/* ================= STATUS DO JOGADOR ================= */}
        <section className="grid grid-cols-1 lg:grid-cols-3 gap-5">

          <div className="lg:col-span-2 space-y-5">

            <InfoCards
              myPlayerData={myPlayerData}
              config={config}
              connected={connected}
              roundLabel={roundLabel}
              isReady={isReady}
            />

            <StatsMetrics
  players={players}
  connected={connected}
/>
          </div>

          {/* SIDEBAR FIXA DE AÇÃO */}
          <aside className="space-y-5">

            <div className="bg-[#111827] border border-white/10 rounded-2xl p-5">
              <h3 className="text-xs uppercase tracking-widest text-slate-400 mb-3">
                Status da Sessão
              </h3>

              <div className="space-y-2 text-sm">
                <div className="flex justify-between">
                  <span>Conexão</span>
                  <span className={connected ? "text-emerald-400" : "text-red-400"}>
                    {connected ? "Ativo" : "Offline"}
                  </span>
                </div>

                <div className="flex justify-between">
                  <span>Jogadores</span>
                  <span>{players.length}</span>
                </div>

                <div className="flex justify-between">
                  <span>Prontos</span>
                  <span>{readyCount}</span>
                </div>

                <div className="flex justify-between">
                  <span>Status</span>
                  <span>{isGameStarted ? "Rodando" : "Lobby"}</span>
                </div>
              </div>
            </div>

            <ReadyBanner
              isReady={isReady}
              onConfirm={confirmarPronto}
            />
          </aside>
        </section>

      </div>
    </div>
  );
};

export default LobbyPage;