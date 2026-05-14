"use client";

import React from "react";
import { useLobbySocket } from "./hooks/useLobbySocket";
import { LobbyHeader } from "./components/LobbyHeader";
import { InfoCards } from "./components/InfoCards";
import { StatsMetrics } from "./components/StatsMetrics";
import { ReadyBanner } from "./components/ReadyBanner";
import { RoundStartOverlay } from "./components/RoundStartOverlay";

const LobbyPage = () => {
  const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:4000";

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

  return (
    <div className="min-h-screen bg-[#F4F7FB] relative overflow-hidden">
      {/* BG sutil */}
      <div className="absolute inset-0 opacity-[0.03] pointer-events-none">
        <div
          className="w-full h-full"
          style={{
            backgroundImage: "radial-gradient(#001F3F 1px, transparent 1px)",
            backgroundSize: "28px 28px",
          }}
        />
      </div>

      {/* Overlay de início de rodada */}
      <RoundStartOverlay
        isGameStarted={isGameStarted}
        roundLabel={roundLabel}
        tempoRestante={tempoRestante}
      />

      <div className="relative z-10 max-w-7xl mx-auto px-4 lg:px-8 py-8">
        <LobbyHeader
          sessionCode={sessionCode}
          isGameStarted={isGameStarted}
          tempoRestante={tempoRestante}
        />

        <InfoCards
          myPlayerData={myPlayerData}
          config={config}
          connected={connected}
          roundLabel={roundLabel}
          isReady={isReady}
        />

        <StatsMetrics players={players} connected={connected} />

        <ReadyBanner isReady={isReady} onConfirm={confirmarPronto} />
      </div>
    </div>
  );
};

export default LobbyPage;