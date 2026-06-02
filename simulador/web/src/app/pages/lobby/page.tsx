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
    isMounted, // Pegando a flag de montagem criada no hook
  } = useLobbySocket(API_URL);

  const readyCount = players.filter((p) => p.isReady).length;

  // Se ainda não foi montado no cliente, renderiza um esqueleto/loading com a mesma estrutura de fundo
  // Isso mata 100% o Hydration Error gerado pelo localStorage ou IDs assíncronos
  if (!isMounted) {
    return (
      <div className="min-h-screen bg-[#0B1220] text-white relative overflow-hidden flex items-center justify-center">
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
        <div className="text-slate-400 text-sm tracking-widest uppercase animate-pulse">
          Sincronizando Sessão...
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#0B1220] text-white relative overflow-hidden">

      {/* GRID BACKGROUND */}
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

      {/* CONTAINER */}
      <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-6">

        {/* HEADER */}
        <LobbyHeader
          sessionCode={sessionCode}
          isGameStarted={isGameStarted}
          tempoRestante={tempoRestante}
          connected={connected}
        />

        {/* MAIN GRID */}
        <section className="grid grid-cols-1 xl:grid-cols-3 gap-6">

          {/* LEFT */}
          <div className="xl:col-span-2 space-y-6">

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

          {/* RIGHT SIDEBAR */}
          <aside className="space-y-6">

            {/* SESSION STATUS */}
            <div className="bg-[#111827] border border-white/[0.06] rounded-3xl p-5 space-y-4">

              <div className="flex items-center justify-between">
                <h3 className="text-[11px] uppercase tracking-[0.25em] text-slate-500 font-black">
                  Status da Sessão
                </h3>

                <div
                  className={`w-2.5 h-2.5 rounded-full ${
                    connected ? "bg-emerald-400" : "bg-red-400"
                  }`}
                />
              </div>

              <div className="space-y-3 text-sm">

                <div className="flex justify-between text-slate-300">
                  <span>Conexão</span>
                  <span className={connected ? "text-emerald-400" : "text-red-400"}>
                    {connected ? "Ativo" : "Offline"}
                  </span>
                </div>

                <div className="flex justify-between text-slate-300">
                  <span>Jogadores</span>
                  <span className="text-white font-semibold">
                    {players.length}
                  </span>
                </div>

                <div className="flex justify-between text-slate-300">
                  <span>Prontos</span>
                  <span className="text-white font-semibold">
                    {readyCount}
                  </span>
                </div>

                <div className="flex justify-between text-slate-300">
                  <span>Status</span>
                  <span className="text-white font-semibold">
                    {isGameStarted ? "Rodando" : "Lobby"}
                  </span>
                </div>

              </div>
            </div>

            {/* READY BANNER */}
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