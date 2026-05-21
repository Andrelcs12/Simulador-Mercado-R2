"use client";

import { useEffect, useRef } from "react";
import { io, Socket } from "socket.io-client";
import { useRouter } from "next/navigation";
import toast from "react-hot-toast";
import { persistMaxStockConfig } from "../pages/onboarding/context/OnboardingContext";

/**
 * useRoundWatcher
 * 
 * Use este hook em páginas onde o player está aguardando
 * (dashboard, resultados) para ser redirecionado automaticamente
 * quando o admin iniciar uma nova rodada.
 * 
 * Uso: basta chamar useRoundWatcher() dentro do componente.
 */
export const useRoundWatcher = (API_URL: string) => {
  const router = useRouter();
  const socketRef = useRef<Socket | null>(null);

  useEffect(() => {
    const savedPlayer = localStorage.getItem("player_data");
    if (!savedPlayer) return;

    const player = JSON.parse(savedPlayer);
    if (!player?.sessionId) return;

    const socket = io(`${API_URL}/simulation`, {
      reconnection: true,
      reconnectionDelay: 1000,
    });
    socketRef.current = socket;

    socket.on("connect", () => {
      socket.emit("join_session", {
        sessionId: player.sessionId,
        playerId: player.id,
      });
    });

    // Nova rodada iniciada pelo admin → salva dados e vai pro onboarding
    socket.on("round:started", (data: any) => {
      if (data.maxStock) {
        persistMaxStockConfig(data.maxStock);
      }

      const endTimeMs =
        typeof data.endTime === "number"
          ? data.endTime
          : new Date(data.endTime).getTime();

      localStorage.setItem(
        "round_data",
        JSON.stringify({
          roundId: data.roundId,
          roundNumber: data.roundNumber,
          duration: data.duration,
          endTime: endTimeMs,
          maxStock: data.maxStock,
        })
      );

      toast.success(`▶ Rodada ${data.roundNumber} iniciada — prepare-se!`);

      setTimeout(() => {
        router.push("/pages/onboarding");
      }, 600);
    });

    socket.on("session:finished", () => {
      toast("Simulação encerrada pelo facilitador", { icon: "🏁" });
    });

    return () => {
      socket.disconnect();
    };
  }, [API_URL, router]);
};
