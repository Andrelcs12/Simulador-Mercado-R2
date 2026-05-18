"use client";
import { useCallback, useEffect, useRef, useState } from "react";
import { io, Socket } from "socket.io-client";
import { useRouter } from "next/navigation";
import toast from "react-hot-toast";
import { PlayerData, RoundData, AppConfig } from "../types/onboarding";

type SubmitPayload = {
  playerId: string;
  sessionId: string;
  roundId: string;
  storeId?: string;
  operatorsQty: number;
  serviceOperatorsQty: number;
  quizScore: number;
  stockInputs: {
    categoryId: string;
    buyQty: number;
    commercialMargin: number;
    expectedSellPrice: number;
  }[];
  capexSelections: { capexId: string }[];
};

function normalizeEndTime(raw: any): number | null {
  if (!raw) return null;
  if (typeof raw === "number") return raw;
  const ms = new Date(raw).getTime();
  return isNaN(ms) ? null : ms;
}

export function useOnboardingSession(API_URL: string) {
  const router = useRouter();
  const socketRef = useRef<Socket | null>(null);
  const timerRef = useRef<NodeJS.Timeout | null>(null);
  const joinedRef = useRef(false);
  const redirectRef = useRef(false);

  const [player, setPlayer] = useState<PlayerData | null>(null);
  const [round, setRound] = useState<RoundData | null>(null);
  const [timeLeft, setTimeLeft] = useState(0);
  const [submitted, setSubmitted] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [categoryMap, setCategoryMap] = useState<Record<string, string>>({});
  const [categoriesLoaded, setCategoriesLoaded] = useState(false);

  const timeUp = timeLeft <= 0;

  const startTimer = useCallback((endTimeMs: number) => {
    if (timerRef.current) clearInterval(timerRef.current);

    const tick = () => {
      const diff = Math.max(0, Math.floor((endTimeMs - Date.now()) / 1000));
      setTimeLeft(diff);
    };

    tick();
    timerRef.current = setInterval(tick, 1000);
  }, []);

  // =========================
  // INIT SOCKET
  // =========================
  useEffect(() => {
    const saved = localStorage.getItem("player_data");
    if (!saved) {
      router.replace("/pages/registro-do-usuario");
      return;
    }

    const p: PlayerData = JSON.parse(saved);
    setPlayer(p);

    const savedRound = localStorage.getItem("round_data");
    if (savedRound) {
      const r: RoundData = JSON.parse(savedRound);
      const endMs = normalizeEndTime(r.endTime);
      if (endMs && endMs > Date.now()) {
        setRound({ ...r, endTime: endMs });
        startTimer(endMs);
      }
    }

    const socket = io(`${API_URL}/simulation`, {
      reconnection: true,
      reconnectionAttempts: Infinity,
      reconnectionDelay: 1000,
    });

    socketRef.current = socket;

    socket.on("connect", () => {
      if (!p) return;

      if (!joinedRef.current) {
        socket.emit("join_session", {
          sessionId: p.sessionId,
          playerId: p.id,
        });
        joinedRef.current = true;
      }

      socket.emit("session:get_state", {
        sessionId: p.sessionId,
      });
    });

    socket.on("session:state", (session: any) => {
      const activeRound = session?.rounds?.find((r: any) => r.status === "OPEN");
      if (!activeRound?.endsAt) return;

      const endMs = new Date(activeRound.endsAt).getTime();
      if (isNaN(endMs)) return;

      const synced: RoundData = {
        roundId: activeRound.id,
        roundNumber: session.currentRound,
        duration: activeRound.startsAt
          ? Math.round(
              (new Date(activeRound.endsAt).getTime() -
                new Date(activeRound.startsAt).getTime()) / 1000
            )
          : 0,
        endTime: endMs,
      };

      setRound(synced);
      localStorage.setItem("round_data", JSON.stringify(synced));
      if (endMs > Date.now()) startTimer(endMs);
    });

    socket.on("round:started", (data: any) => {
      const endMs = normalizeEndTime(data.endTime);
      const normalized: RoundData = {
        roundId: data.roundId,
        roundNumber: data.roundNumber,
        duration: data.duration,
        endTime: endMs,
      };

      setRound(normalized);
      localStorage.setItem("round_data", JSON.stringify(normalized));
      setSubmitted(false);
      setSubmitting(false);

      if (endMs) startTimer(endMs);
      toast.success(`Rodada ${data.roundNumber} iniciada`);
      router.replace("/pages/onboarding");
    });

    socket.on("round:finished", () => {
      setSubmitting(false);
      if (!redirectRef.current) {
        redirectRef.current = true;
        router.replace("/pages/dashboard");
      }
    });

    socket.on("submit:success", () => {
      setSubmitted(true);
      setSubmitting(false);
      if (!redirectRef.current) {
        redirectRef.current = true;
        router.replace("/pages/processing");
      }
    });

    socket.on("submit:error", ({ message }) => {
      setSubmitting(false);
      toast.error(message || "Erro ao enviar");
    });

    return () => {
      socket.disconnect();
      if (timerRef.current) clearInterval(timerRef.current);
    };
  }, [API_URL, router, startTimer]);

  // =========================
  // CATEGORIES
  // =========================
  useEffect(() => {
    async function loadCategories() {
      try {
        const res = await fetch(`${API_URL}/minigame/categories`);
        const data = await res.json();

        if (!Array.isArray(data)) return;

        const map: Record<string, string> = {};
        for (const c of data) {
          if (c?.name && c?.id) {
            const name = c.name;
            map[name] = c.id;
            map[name.toLowerCase()] = c.id;
            // Remove acentos
            const normalized = name
              .normalize("NFD")
              .replace(/[\u0300-\u036f]/g, "")
              .toLowerCase();
            map[normalized] = c.id;
          }
        }

        setCategoryMap(map);
        setCategoriesLoaded(true);
      } catch (err) {
        console.error("Erro ao carregar categorias:", err);
        setCategoriesLoaded(false);
      }
    }

    loadCategories();
  }, [API_URL]);

  // =========================
  // SUBMIT
  // =========================
  const submit = useCallback(
    (payload: {
      playerId: string;
      sessionId: string;
      roundId: string;
      storeId?: string;
      config: AppConfig;
    }) => {
      if (!socketRef.current) return;
      if (submitting || submitted) return;
      if (!categoriesLoaded) {
        toast.error("Categorias ainda não carregadas");
        return;
      }

      const { config } = payload;

      const stockInputs = Object.entries(config.comercial).map(([key, val]) => {
        const categoryId =
          categoryMap[key] ||
          categoryMap[key.toLowerCase()] ||
          categoryMap[
            key.normalize("NFD").replace(/[\u0300-\u036f]/g, "").toLowerCase()
          ] ||
          key;

        return {
          categoryId,
          buyQty: val.estoque,
          commercialMargin: val.margem,
          expectedSellPrice: 0,
        };
      });

      const formatted: SubmitPayload = {
        playerId: payload.playerId,
        sessionId: payload.sessionId,
        roundId: payload.roundId,
        storeId: payload.storeId,
        operatorsQty: config.operadoresCaixa + config.operadoresAtendimento,
        serviceOperatorsQty: config.operadoresAtendimento,
        quizScore: config.quizScore,
        stockInputs,
        capexSelections: Object.entries(config.capex)
          .filter(([, v]) => v)
          .map(([capexId]) => ({ capexId })),
      };

      setSubmitting(true);
      socketRef.current.emit("player:submit_config", formatted);
    },
    [submitting, submitted, categoryMap, categoriesLoaded]
  );

  return {
    player,
    round,
    timeLeft,
    timeUp,
    submitted,
    submitting,
    submit,
    categoriesLoaded,
    categoryMap,
  };
}