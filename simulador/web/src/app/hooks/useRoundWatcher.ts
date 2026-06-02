"use client";

import { useEffect, useRef } from "react";
import { io, Socket } from "socket.io-client";
import { useRouter } from "next/navigation";
import toast from "react-hot-toast";

// Importando as constantes e chaves que você já definiu no OnboardingContext
import { 
  MAX_STOCK_STORAGE_KEY, 
  MAX_STOCK_UPDATED_EVENT 
} from "../pages/onboarding/context/OnboardingContext";

/**
 * Função auxiliar para persistir a configuração de estoque máximo recebida do backend
 * e disparar o CustomEvent para que o OnboardingProvider atualize o estado imediatamente.
 */
function persistMaxStockConfig(maxStock: any) {
  if (!maxStock || typeof window === "undefined") return;
  
  try {
    const serialized = JSON.stringify({
      pereciveis: Number(maxStock.pereciveis || 5000),
      mercearia: Number(maxStock.mercearia || 4000),
      eletro: Number(maxStock.eletro || 400),
      hipel: Number(maxStock.hipel || 3000),
    });
    
    window.localStorage.setItem(MAX_STOCK_STORAGE_KEY, serialized);
    // Dispara o evento que o useEffect do seu OnboardingProvider já está ouvindo
    window.dispatchEvent(new Event(MAX_STOCK_UPDATED_EVENT));
  } catch (error) {
    console.error("Erro ao persistir maxStockConfig no watcher:", error);
  }
}

/**
 * useRoundWatcher
 * * Use este hook em páginas onde o player está aguardando
 * (dashboard, resultados) para ser redirecionado automaticamente
 * quando o admin iniciar uma nova rodada.
 */
export const useRoundWatcher = (API_URL: string) => {
  const router = useRouter();
  const socketRef = useRef<Socket | null>(null);

  useEffect(() => {
    const savedPlayer = localStorage.getItem("player_data");
    if (!savedPlayer) return;

    let player: any;
    try {
      player = JSON.parse(savedPlayer);
    } catch (e) {
      return;
    }
    
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