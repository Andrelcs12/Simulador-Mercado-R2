"use client";

import { useState, useEffect, useMemo } from "react";
import { io, Socket } from "socket.io-client";
import { useRouter } from "next/navigation";
import toast from "react-hot-toast";
import { DashboardResponse, EMPTY_DASHBOARD } from "../types";

const MAX_STOCK_STORAGE_KEY = "minigame_max_stock_config";
const MAX_STOCK_UPDATED_EVENT = "max_stock_config_updated";

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
    window.dispatchEvent(new Event(MAX_STOCK_UPDATED_EVENT));
  } catch (error) {
    console.error("Erro ao persistir maxStockConfig no watcher:", error);
  }
}

export function useDashboard(API_URL: string) {
  const router = useRouter();
  const [history, setHistory] = useState<Record<number, DashboardResponse>>({});
  const [activeRound, setActiveRound] = useState<number>(0);
  const [loading, setLoading] = useState(true);

  // Reatividade em cadeia: se activeRound mudar, a interface inteira muda
  const currentData = useMemo(() => history[activeRound] || EMPTY_DASHBOARD, [history, activeRound]);

  const loadDashboardData = async (sessionId: string, storeId?: string) => {
    try {
      const url = storeId 
        ? `${API_URL}/minigame/session/${sessionId}/dashboard/latest?storeId=${storeId}`
        : `${API_URL}/minigame/session/${sessionId}/dashboard/latest`;

      const res = await fetch(url);
      if (!res.ok) throw new Error();
      const json: DashboardResponse = await res.json();
      
      setHistory((prev) => ({ ...prev, [json.roundNumber]: json }));
      setActiveRound(json.roundNumber);
    } catch (err) {
      toast.error("Erro ao carregar dados do servidor.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    const saved = localStorage.getItem("player_data");
    if (!saved) {
      setLoading(false);
      return;
    }
    const player = JSON.parse(saved);

    if (!player.sessionId) {
      setLoading(false);
      return;
    }

    loadDashboardData(player.sessionId, player.storeId || player.id);

    const socket: Socket = io(`${API_URL}/simulation`, {
      transports: ["websocket"],
      reconnection: true,
      reconnectionDelay: 1000,
    });

    socket.on("connect", () => {
      socket.emit("join_session", { sessionId: player.sessionId, playerId: player.id });
    });

    socket.on("dashboard:updated", (updatedData: DashboardResponse) => {
      setHistory((prev) => ({ ...prev, [updatedData.roundNumber]: updatedData }));
      setActiveRound(updatedData.roundNumber);
      toast.success(`Resultados da Rodada ${updatedData.roundNumber} computados!`);
    });

    socket.on("round:started", (data: any) => {
      if (data.maxStock) {
        persistMaxStockConfig(data.maxStock);
      }

      const endTimeMs = typeof data.endTime === "number" ? data.endTime : new Date(data.endTime).getTime();

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

      toast.success(`▶ Rodada ${data.roundNumber} iniciada — Redirecionando...`);

      setTimeout(() => {
        router.push("/pages/onboarding");
      }, 800);
    });

    socket.on("session:finished", () => {
      toast("Simulação encerrada pelo facilitador", { icon: "🏁" });
    });

    return () => {
      socket.disconnect();
    };
  }, [API_URL, router]);

  return { currentData, history, activeRound, setActiveRound, loading };
}