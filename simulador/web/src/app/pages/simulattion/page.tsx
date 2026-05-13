"use client";

import React, { useState, useEffect, useRef, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Timer,
  ShoppingCart,
  Building2,
  CheckCircle2,
  AlertTriangle,
  Loader2,
  Send,
  TrendingUp,
  Package,
  Wallet,
} from "lucide-react";
import toast, { Toaster } from "react-hot-toast";
import { io, Socket } from "socket.io-client";
import { useRouter } from "next/navigation";

// ─── Types ─────────────────────────────────────

interface Category {
  id: string;
  name: string;
  unitCost: number;
  defaultMargin: number;
}

interface CapexItem {
  id: string;
  name: string;
  cost: number;
  description?: string;
}

interface StockInput {
  categoryId: string;
  buyQty: number;
  appliedMargin: number;
}

interface PlayerData {
  id: string;
  name: string;
  storeName: string;
  sessionId: string;
  store?: { id: string };
}

interface RoundData {
  roundNumber: number;
  duration: number;
  endTime: string;
}

const BUDGET_LIMIT = 700_000;

export default function SimulacaoPage() {
  const router = useRouter();
  const socketRef = useRef<Socket | null>(null);
  const timerRef = useRef<NodeJS.Timeout | null>(null);

  const [player, setPlayer] = useState<PlayerData | null>(null);
  const [roundData, setRoundData] = useState<RoundData | null>(null);

  const [categories, setCategories] = useState<Category[]>([]);
  const [capexItems, setCapexItems] = useState<CapexItem[]>([]);
  const [balance, setBalance] = useState(BUDGET_LIMIT);

  const [stockInputs, setStockInputs] = useState<Record<string, StockInput>>({});
  const [selectedCapex, setSelectedCapex] = useState<Set<string>>(new Set());

  const [timeLeft, setTimeLeft] = useState(0);
  const [isTimeUp, setIsTimeUp] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSubmitted, setIsSubmitted] = useState(false);

  const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:4000";

  // ─────────────────────────────────────────────
  // TIMER SAFE
  // ─────────────────────────────────────────────
  const startTimer = useCallback((endTime: string) => {
    if (timerRef.current) clearInterval(timerRef.current);

    const tick = () => {
      const remaining = Math.max(
        0,
        Math.floor((new Date(endTime).getTime() - Date.now()) / 1000)
      );

      setTimeLeft(remaining);

      if (remaining <= 0) {
        clearInterval(timerRef.current!);
        setIsTimeUp(true);
      }
    };

    tick();
    timerRef.current = setInterval(tick, 1000);
  }, []);

  // ─────────────────────────────────────────────
  // INIT + SOCKET
  // ─────────────────────────────────────────────
  useEffect(() => {
    const savedPlayer = localStorage.getItem("player_data");
    const savedRound = localStorage.getItem("round_data");

    if (!savedPlayer || !savedRound) {
      router.push("/pages/lobby");
      return;
    }

    const p: PlayerData = JSON.parse(savedPlayer);
    const r: RoundData = JSON.parse(savedRound);

    setPlayer(p);
    setRoundData(r);

    startTimer(r.endTime);

    const load = async () => {
      const [masterRes] = await Promise.all([
        fetch(`${API_URL}/minigame/master-data`),
      ]);

      if (masterRes.ok) {
        const master = await masterRes.json();

        setCategories(master.categories ?? []);
        setCapexItems(master.capex ?? []);

        const init: Record<string, StockInput> = {};
        (master.categories ?? []).forEach((c: Category) => {
          init[c.id] = {
            categoryId: c.id,
            buyQty: 0,
            appliedMargin: c.defaultMargin,
          };
        });

        setStockInputs(init);
      }
    };

    load();

    const socket = io(`${API_URL}/simulation`, {
      reconnection: true,
    });

    socketRef.current = socket;

    socket.emit("join_session", {
      sessionId: p.sessionId,
      playerId: p.id,
    });

    // ─────────────────────────────
    // ROUND EVENTS
    // ─────────────────────────────

    socket.on("round:time_up", () => {
      setIsTimeUp(true);
      setTimeLeft(0);
      if (timerRef.current) clearInterval(timerRef.current);
    });

    socket.on(
      "round:started",
      (data: { round: number; endTime: string }) => {
        // RESET TOTAL DA RODADA
        setRoundData({
          roundNumber: data.round,
          duration: 0,
          endTime: data.endTime,
        });

        setIsSubmitted(false);
        setIsTimeUp(false);
        setSelectedCapex(new Set());

        // reset inputs
        setStockInputs((prev) => {
          const reset: Record<string, StockInput> = {};
          Object.values(prev).forEach((p) => {
            reset[p.categoryId] = { ...p, buyQty: 0 };
          });
          return reset;
        });

        startTimer(data.endTime);

        toast.success(`Rodada ${data.round} iniciada`);
      }
    );

    socket.on("simulation:finished", (data: { rankData: any[] }) => {
      localStorage.setItem("rank_data", JSON.stringify(data.rankData));
      router.push("/pages/results");
    });

    return () => {
      socket.disconnect();
      if (timerRef.current) clearInterval(timerRef.current);
    };
  }, [API_URL, router, startTimer]);

  // ─────────────────────────────────────────────
  // COST CALC
  // ─────────────────────────────────────────────
  const totalCost = Object.values(stockInputs).reduce((acc, s) => {
    const cat = categories.find((c) => c.id === s.categoryId);
    return acc + (cat?.unitCost ?? 0) * s.buyQty;
  }, 0);

  const capexCost = [...selectedCapex].reduce((acc, id) => {
    const c = capexItems.find((x) => x.id === id);
    return acc + (c?.cost ?? 0);
  }, 0);

  const finalCost = totalCost + capexCost;
  const isOverBudget = finalCost > BUDGET_LIMIT;

  // ─────────────────────────────────────────────
  // SUBMIT (IDEMPOTENTE)
  // ─────────────────────────────────────────────
  const handleSubmit = async () => {
    if (!player || !roundData) return;
    if (isSubmitted || isTimeUp) return;

    setIsSubmitting(true);

    try {
      const res = await fetch(`${API_URL}/minigame/submit-config`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          storeId: player.id,
          sessionId: player.sessionId,
          roundNumber: roundData.roundNumber,
          stockInputs: Object.values(stockInputs).filter((s) => s.buyQty > 0),
          capexSelections: [...selectedCapex].map((id) => ({
            capexId: id,
          })),
        }),
      });

      if (res.ok) {
        setIsSubmitted(true);
        socketRef.current?.emit("player:submitted", {
          playerId: player.id,
          round: roundData.roundNumber,
        });

        toast.success("Enviado");
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  // ─────────────────────────────────────────────
  // UI STATES
  // ─────────────────────────────────────────────
  if (isSubmitted) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <CheckCircle2 />
        <div>Aguardando próxima rodada...</div>
      </div>
    );
  }

  if (isTimeUp) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <AlertTriangle />
        <div>Tempo esgotado</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen p-6">
      <Toaster />

      <header className="flex justify-between">
        <h1>Rodada {roundData?.roundNumber}</h1>
        <div>{timeLeft}s</div>
      </header>

      <main>
        <div>Total: {finalCost}</div>
        <div>Budget: {BUDGET_LIMIT}</div>
      </main>

      <button onClick={handleSubmit} disabled={isSubmitting}>
        Enviar
      </button>
    </div>
  );
}