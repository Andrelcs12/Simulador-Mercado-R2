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

const CATEGORY_ID_MAP: Record<string, string> = {
  pereciveis: "cat_pereciveis",
  mercearia: "cat_mercearia",
  eletro: "cat_eletro",
  hipel: "cat_hipel",
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

  const [player, setPlayer] = useState<PlayerData | null>(null);
  const [round, setRound] = useState<RoundData | null>(null);
  const [timeLeft, setTimeLeft] = useState(0);
  const [submitted, setSubmitted] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [timeUp, setTimeUp] = useState(false);

  const startTimer = useCallback((endTimeMs: number) => {
    if (timerRef.current) clearInterval(timerRef.current);

    const tick = () => {
      const diff = Math.max(0, Math.floor((endTimeMs - Date.now()) / 1000));
      setTimeLeft(diff);
    };

    tick();
    timerRef.current = setInterval(tick, 1000);
  }, []);

  useEffect(() => {
    const saved = localStorage.getItem("player_data");
    if (!saved) {
      router.push("/pages/registro-do-usuario");
      return;
    }

    const p: PlayerData = JSON.parse(saved);
    setPlayer(p);

    const savedRound = localStorage.getItem("round_data");
    if (savedRound) {
      const r: RoundData = JSON.parse(savedRound);
      const endMs = normalizeEndTime(r.endTime);
      if (endMs) {
        setRound({ ...r, endTime: endMs });
        if (endMs > Date.now()) startTimer(endMs);
      }
    }

    const socket = io(`${API_URL}/simulation`, { reconnection: true });
    socketRef.current = socket;

    socket.on("connect", () => {
      socket.emit("join_session", {
        sessionId: p.sessionId,
        playerId: p.id,
      });

      socket.emit("session:get_state", {
        sessionId: p.sessionId,
      });
    });

    // STATE SYNC (backend source of truth)
    socket.on("session:state", (session: any) => {
      const activeRound = session?.rounds?.find(
        (r: any) => r.status === "OPEN"
      );

      if (!activeRound?.endsAt) return;

      const endMs = new Date(activeRound.endsAt).getTime();
      if (isNaN(endMs)) return;

      const synced: RoundData = {
        roundId: activeRound.id,
        roundNumber: session.currentRound ?? 0,
        duration: activeRound.startsAt
          ? Math.round(
              (new Date(activeRound.endsAt).getTime() -
                new Date(activeRound.startsAt).getTime()) /
                1000
            )
          : 0,
        endTime: endMs,
      };

      localStorage.setItem("round_data", JSON.stringify(synced));
      setRound(synced);

      if (endMs > Date.now()) startTimer(endMs);
    });

    // ROUND START
    socket.on("round:started", (data: any) => {
      const endMs = normalizeEndTime(data.endTime);

      const normalized: RoundData = {
        roundId: data.roundId,
        roundNumber: data.roundNumber,
        duration: data.duration,
        endTime: endMs,
      };

      localStorage.setItem("round_data", JSON.stringify(normalized));
      setRound(normalized);

      setSubmitted(false);
      setSubmitting(false);
      setTimeUp(false);

      if (endMs) startTimer(endMs);

      toast.success(`Rodada ${data.roundNumber} iniciada`);
      router.push("/pages/onboarding");
    });

    // ROUND FINISHED (único evento real)
    socket.on("round:finished", () => {
      setSubmitting(false);

      setSubmitted((was) => {
        if (!was) {
          setTimeout(() => router.push("/pages/dashboard"), 800);
        }
        return was;
      });
    });

    // SUBMIT SUCCESS
    socket.on("submit:success", () => {
      setSubmitted(true);
      setSubmitting(false);
      toast.success("Enviado!");
      router.push("/pages/processing");
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

  const submit = useCallback(
    (payload: {
      playerId: string;
      sessionId: string;
      roundId: string;
      storeId?: string;
      config: AppConfig;
    }) => {
      if (!socketRef.current || submitting || submitted) return;

      const { config } = payload;

      const formatted: SubmitPayload = {
        playerId: payload.playerId,
        sessionId: payload.sessionId,
        roundId: payload.roundId,
        storeId: payload.storeId,

        operatorsQty:
          config.operadoresCaixa + config.operadoresAtendimento,
        serviceOperatorsQty: config.operadoresAtendimento,
        quizScore: config.quizScore,

        stockInputs: Object.entries(config.comercial).map(
          ([key, val]) => ({
            categoryId: CATEGORY_ID_MAP[key] ?? key,
            buyQty: val.estoque,
            commercialMargin: val.margem,
            expectedSellPrice: 0,
          })
        ),

        capexSelections: Object.entries(config.capex)
          .filter(([, v]) => v)
          .map(([capexId]) => ({ capexId })),
      };

      setSubmitting(true);
      socketRef.current.emit("player:submit_config", formatted);
    },
    [submitting, submitted]
  );

  return {
    player,
    round,
    timeLeft,
    submitted,
    submitting,
    timeUp,
    submit,
  };
}