"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { io, Socket } from "socket.io-client";
import toast from "react-hot-toast";
import { AppConfig, RoundData } from "../types/onboarding";

import { useOnboarding } from "../context/OnboardingContext";

const normalizeEndTime = (raw: any): number | null => {
  if (!raw) return null;
  const ms = typeof raw === "number" ? raw : new Date(raw).getTime();
  return isNaN(ms) ? null : ms;
};

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

export function useOnboardingSession(API_URL: string) {
  const {
    player,
    setPlayer,

    round,
    setRound,

    timeLeft,
    setTimeLeft,

    submitted,
    setSubmitted,

    submitting,
    setSubmitting,

    config,
  } = useOnboarding();

  const socketRef = useRef<Socket | null>(null);
  const joinedRef = useRef(false);
  const timerRef = useRef<NodeJS.Timeout | null>(null);

  const [categoryMap, setCategoryMap] = useState<Record<string, string>>({});
  const [categoriesLoaded, setCategoriesLoaded] = useState(false);

  const timeUp = timeLeft <= 0;

  // ─────────────────────────────
  // TIMER
  // ─────────────────────────────

  const startTimer = useCallback(
    (endTimeMs: number) => {
      if (timerRef.current) clearInterval(timerRef.current);

      const tick = () => {
        const diff = Math.max(
          0,
          Math.floor((endTimeMs - Date.now()) / 1000)
        );
        setTimeLeft(diff);
      };

      tick();
      timerRef.current = setInterval(tick, 1000);
    },
    [setTimeLeft]
  );

  // ─────────────────────────────
  // SOCKET INIT
  // ─────────────────────────────

  useEffect(() => {
    const saved = localStorage.getItem("player_data");

    if (!saved) return;

    const p = JSON.parse(saved);
    setPlayer(p);

    const socket = io(`${API_URL}/simulation`);
    socketRef.current = socket;

    socket.on("connect", () => {
      if (joinedRef.current) return;

      socket.emit("join_session", {
        sessionId: p.sessionId,
        playerId: p.id,
      });

      socket.emit("session:get_state", {
        sessionId: p.sessionId,
      });

      joinedRef.current = true;
    });

    socket.on("session:state", (session: any) => {
      const active = session?.rounds?.find(
        (r: any) => r.status === "OPEN"
      );

      if (!active?.endsAt) return;

      const endMs = new Date(active.endsAt).getTime();
      if (isNaN(endMs)) return;

      const synced = {
        roundId: active.id,
        roundNumber: session.currentRound,
        duration: active.startsAt
          ? Math.round(
              (new Date(active.endsAt).getTime() -
                new Date(active.startsAt).getTime()) /
                1000
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

      const normalized = {
        roundId: data.roundId,
        roundNumber: data.roundNumber,
        duration: data.duration,
        endTime: endMs,
      };

      setRound(normalized);

      setSubmitted(false);
      setSubmitting(false);

      localStorage.setItem("round_data", JSON.stringify(normalized));

      if (endMs) startTimer(endMs);

      toast.success(`Rodada ${data.roundNumber} iniciada`);
    });

    // ==========================================
    // ESCUTAR ALTERAÇÃO DE TEMPO (ADMIN -> PLAYER)
    // ==========================================
   socket.on("round:time_updated", (data: { endTime: number; duration: number }) => {
  const endMs = normalizeEndTime(data.endTime);

  // Agora o TypeScript aceitará a função perfeitamente
  setRound((prev) => {
    if (!prev) return null;
    
    const updated: RoundData = {
      ...prev,
      duration: data.duration,
      endTime: endMs,
    };
    
    localStorage.setItem("round_data", JSON.stringify(updated));
    return updated;
  });

  if (endMs) {
    startTimer(endMs);
    toast("⏱️ O administrador alterou o tempo da rodada!");
  }
});

    socket.on("submit:error", ({ message }) => {
      setSubmitting(false);
      setSubmitted(false);
      toast.error(message || "Erro ao enviar");
    });

    return () => {
      socket.disconnect();
      if (timerRef.current) clearInterval(timerRef.current);
    };
  }, [API_URL, setPlayer, setRound, setSubmitting, setSubmitted, startTimer]);

  // ─────────────────────────────
  // CATEGORIES MAP RECONCILIATION
  // ─────────────────────────────

  useEffect(() => {
    async function load() {
      try {
        const res = await fetch(`${API_URL}/minigame/categories`);
        const data = await res.json();

        const map: Record<string, string> = {};

        for (const c of data || []) {
          if (!c?.id || !c?.name) continue;

          const n = c.name;
          const norm = n
            .normalize("NFD")
            .replace(/\p{Diacritic}/gu, "")
            .toLowerCase();

          map[n] = c.id;
          map[n.toLowerCase()] = c.id;
          map[norm] = c.id;

          if (norm.includes("pereci")) map["pereciveis"] = c.id;
          if (norm.includes("mercea")) map["mercearia"] = c.id;
          if (norm.includes("eletro")) map["eletro"] = c.id;
          if (norm.includes("higien") || norm.includes("limp")) map["hipel"] = c.id;
        }

        setCategoryMap(map);
        setCategoriesLoaded(true);
      } catch (error) {
        console.error("Falha ao reconciliar mapa de categorias do banco:", error);
        setCategoriesLoaded(false);
      }
    }

    load();
  }, [API_URL]);

  // ─────────────────────────────
  // SUBMIT CONFIG
  // ─────────────────────────────

  const submit = useCallback(
    (payload: {
      playerId: string;
      sessionId: string;
      roundId: string;
      storeId?: string;
    }) => {
      if (!socketRef.current) return;
      if (submitting || submitted) return;
      if (!categoriesLoaded) {
        toast.error("Aguarde o carregamento das categorias estruturais.");
        return;
      }

      try {
        const stockInputs = Object.entries(config.comercial).map(
          ([key, val]) => {
            const categoryId = categoryMap[key];

            if (!categoryId) {
              throw new Error(`Falha de sincronização. Chave local: "${key}" não mapeia para nenhum UUID de categoria ativo.`);
            }

            return {
              categoryId,
              buyQty: val.estoque,
              commercialMargin: val.margem,
              expectedSellPrice: 0,
            };
          }
        );

        const formatted: SubmitPayload = {
          playerId: payload.playerId,
          sessionId: payload.sessionId,
          roundId: payload.roundId,
          storeId: payload.storeId,
          operatorsQty: config.operadoresCaixa,
          serviceOperatorsQty: config.operadoresAtendimento,
          quizScore: config.quizScore,
          stockInputs,
          capexSelections: Object.entries(config.capex)
            .filter(([, v]) => (v ?? 0) > 0)
            .map(([capexId]) => ({ capexId })),
        };

        setSubmitting(true);
        setSubmitted(true);

        socketRef.current.emit("player:submit_config", formatted);
        toast.success("Configurações enviadas com sucesso!");
        
      } catch (error: any) {
        setSubmitting(false);
        setSubmitted(false);
        toast.error(error.message || "Erro ao mapear inputs de simulação");
      }
    },
    [
      categoryMap,
      categoriesLoaded,
      submitting,
      submitted,
      config,
      setSubmitting,
      setSubmitted,
    ]
  );

  return {
    submit,
    categoriesLoaded,
    timeUp,
  };
}