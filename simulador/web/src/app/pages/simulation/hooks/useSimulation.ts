import { useCallback, useEffect, useRef, useState } from "react";
import { io, Socket } from "socket.io-client";
import { useRouter } from "next/navigation";
import toast from "react-hot-toast";

export interface Category {
  id: string;
  name: string;
  unitCost: number;
  defaultMargin: number;
}

export interface CapexItem {
  id: string;
  name: string;
  cost: number;
  description?: string;
}

export interface StockInput {
  categoryId: string;
  buyQty: number;
  appliedMargin: number;
}

export interface PlayerData {
  id: string;
  name: string;
  storeName: string;
  sessionId: string;
  store?: { id: string };
}

export interface RoundData {
  roundNumber: number;
  duration: number;
  endTime: number; // ms epoch
  roundId?: string;
}

export const useSimulation = (API_URL: string) => {
  const router = useRouter();
  const socketRef = useRef<Socket | null>(null);
  const timerRef = useRef<NodeJS.Timeout | null>(null);

  const [player, setPlayer] = useState<PlayerData | null>(null);
  const [roundData, setRoundData] = useState<RoundData | null>(null);
  const [categories, setCategories] = useState<Category[]>([]);
  const [capexItems, setCapexItems] = useState<CapexItem[]>([]);
  const [stockInputs, setStockInputs] = useState<Record<string, StockInput>>({});
  const [selectedCapex, setSelectedCapex] = useState<Set<string>>(new Set());
  const [timeLeft, setTimeLeft] = useState(0);
  const [isTimeUp, setIsTimeUp] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSubmitted, setIsSubmitted] = useState(false);
  const [masterLoaded, setMasterLoaded] = useState(false);

  // ── Timer ─────────────────────────────────────────────────
  const startTimer = useCallback((endTimeMs: number) => {
    if (timerRef.current) clearInterval(timerRef.current);
    const tick = () => {
      const remaining = Math.max(0, Math.floor((endTimeMs - Date.now()) / 1000));
      setTimeLeft(remaining);
      if (remaining <= 0) {
        clearInterval(timerRef.current!);
        setIsTimeUp(true);
      }
    };
    tick();
    timerRef.current = setInterval(tick, 1000);
  }, []);

  // ── Inicializa inputs de estoque quando categorias carregam ──
  const initStockInputs = useCallback((cats: Category[]) => {
    setStockInputs((prev) => {
      const init: Record<string, StockInput> = {};
      cats.forEach((c) => {
        init[c.id] = prev[c.id] ?? {
          categoryId: c.id,
          buyQty: 0,
          appliedMargin: c.defaultMargin,
        };
      });
      return init;
    });
  }, []);

  // ── Carga principal ───────────────────────────────────────
  useEffect(() => {
    const savedPlayer = localStorage.getItem("player_data");
    const savedRound = localStorage.getItem("round_data");

    if (!savedPlayer || !savedRound) {
      router.push("/pages/lobby");
      return;
    }

    const p: PlayerData = JSON.parse(savedPlayer);
    const r: RoundData = JSON.parse(savedRound);

    // endTime pode ter sido salvo como string ISO pelo onboarding antigo
    const endTimeMs =
      typeof r.endTime === "number"
        ? r.endTime
        : new Date(r.endTime as any).getTime();

    const normalizedRound = { ...r, endTime: endTimeMs };
    setPlayer(p);
    setRoundData(normalizedRound);
    startTimer(endTimeMs);

    // Master data
    fetch(`${API_URL}/minigame/master-data`)
      .then((res) => res.ok ? res.json() : null)
      .then((master) => {
        if (!master) return;
        setCategories(master.categories ?? []);
        setCapexItems(master.capex ?? []);
        initStockInputs(master.categories ?? []);
        setMasterLoaded(true);
      })
      .catch(console.error);

    // Socket
    const socket = io(`${API_URL}/simulation`, { reconnection: true });
    socketRef.current = socket;

    socket.on("connect", () => {
      socket.emit("join_session", { sessionId: p.sessionId, playerId: p.id });
      // Pede estado da sessão para sincronizar endTime caso a página tenha recarregado
      socket.emit("session:get_state", { sessionId: p.sessionId });
    });

    // Sincroniza rodada ativa + endTime a partir do estado do servidor
    socket.on("session:state", (session: any) => {
      if (!session) return;

      const activeRound = Array.isArray(session.rounds)
        ? session.rounds.find((r: any) => r.status === "OPEN")
        : null;

      if (!activeRound?.endsAt) return;

      const endsAtMs = new Date(activeRound.endsAt).getTime();
      if (endsAtMs <= Date.now()) return; // rodada já expirou

      const duration = activeRound.startsAt
        ? Math.round((endsAtMs - new Date(activeRound.startsAt).getTime()) / 1000)
        : 0;

      const syncedRound: RoundData = {
        roundId: activeRound.id,
        roundNumber: session.currentRound ?? 0,
        duration,
        endTime: endsAtMs,
      };

      localStorage.setItem("round_data", JSON.stringify(syncedRound));
      setRoundData(syncedRound);
      startTimer(endsAtMs);
    });

    // Nova rodada — reseta tudo
    socket.on("round:started", (data: any) => {
      const endTimeMs =
        typeof data.endTime === "number"
          ? data.endTime
          : new Date(data.endTime).getTime();

      const newRound: RoundData = {
        roundId: data.roundId,
        roundNumber: data.roundNumber,
        duration: data.duration,
        endTime: endTimeMs,
      };

      localStorage.setItem("round_data", JSON.stringify(newRound));
      setRoundData(newRound);
      setIsSubmitted(false);
      setIsTimeUp(false);
      setSelectedCapex(new Set());
      initStockInputs(categories);
      startTimer(endTimeMs);
      toast.success(`▶ Rodada ${data.roundNumber} iniciada`);
    });

    socket.on("round:time_up", () => {
      setIsTimeUp(true);
      setTimeLeft(0);
      if (timerRef.current) clearInterval(timerRef.current);
      toast.error("⏱ Tempo esgotado");
    });

    socket.on("round:stopped", () => {
      setIsTimeUp(true);
      toast("Rodada encerrada", { icon: "⚠️" });
    });

    socket.on("submit:success", () => {
      setIsSubmitted(true);
      setIsSubmitting(false);
      toast.success("✅ Configuração enviada!");
    });

    socket.on("submit:error", ({ message }: { message: string }) => {
      setIsSubmitting(false);
      toast.error(message || "Erro ao enviar");
    });

    return () => {
      socket.disconnect();
      if (timerRef.current) clearInterval(timerRef.current);
    };
  }, [API_URL, router, startTimer, initStockInputs]);

  // ── Submit ────────────────────────────────────────────────
  const handleSubmit = useCallback(() => {
    if (!socketRef.current || !player || !roundData) return;
    if (isSubmitted || isTimeUp || isSubmitting) return;

    setIsSubmitting(true);

    socketRef.current.emit("player:submit_config", {
      playerId: player.id,
      storeId: player.store?.id ?? player.id,
      sessionId: player.sessionId,
      roundId: roundData.roundId,
      stockInputs: Object.values(stockInputs).filter((s) => s.buyQty > 0),
      capexSelections: [...selectedCapex].map((id) => ({ capexId: id })),
    });
  }, [player, roundData, stockInputs, selectedCapex, isSubmitted, isTimeUp, isSubmitting]);

  // ── Custo total ───────────────────────────────────────────
  const totalStockCost = Object.values(stockInputs).reduce((acc, s) => {
    const cat = categories.find((c) => c.id === s.categoryId);
    return acc + (cat?.unitCost ?? 0) * s.buyQty;
  }, 0);

  const totalCapexCost = [...selectedCapex].reduce((acc, id) => {
    const c = capexItems.find((x) => x.id === id);
    return acc + (c?.cost ?? 0);
  }, 0);

  const totalCost = totalStockCost + totalCapexCost;

  const toggleCapex = useCallback((id: string) => {
    setSelectedCapex((prev) => {
      const next = new Set(prev);
      next.has(id) ? next.delete(id) : next.add(id);
      return next;
    });
  }, []);

  const updateStock = useCallback((categoryId: string, field: keyof StockInput, value: number) => {
    setStockInputs((prev) => ({
      ...prev,
      [categoryId]: { ...prev[categoryId], [field]: value },
    }));
  }, []);

  return {
    player,
    roundData,
    categories,
    capexItems,
    stockInputs,
    selectedCapex,
    timeLeft,
    isTimeUp,
    isSubmitting,
    isSubmitted,
    masterLoaded,
    totalStockCost,
    totalCapexCost,
    totalCost,
    handleSubmit,
    toggleCapex,
    updateStock,
  };
};