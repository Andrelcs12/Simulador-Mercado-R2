"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { io, Socket } from "socket.io-client";
import { useRouter } from "next/navigation";

interface RoundData {
  roundId: string;
  roundNumber: number;
  duration: number;
  endTime: number | null;
}

interface PlayerData {
  id: string;
  sessionId: string;
  storeName: string;
  store?: { id: string };
}

export function useOnboardingSession(API_URL: string) {
  const router = useRouter();

  const socketRef = useRef<Socket | null>(null);
  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null);

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

      if (diff <= 0) {
        clearInterval(timerRef.current!);
        setTimeUp(true);
      }
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

    const socket = io(`${API_URL}/simulation`, {
      reconnection: true,
      reconnectionDelay: 1000,
    });

    socketRef.current = socket;

    socket.on("connect", () => {
      socket.emit("join_session", {
        sessionId: p.sessionId,
        playerId: p.id,
      });

      socket.emit("session:get_state", { sessionId: p.sessionId });
    });

    socket.on("round:started", (data: any) => {
      const endTimeMs =
        typeof data.endTime === "number"
          ? data.endTime
          : new Date(data.endTime).getTime();

      const normalized: RoundData = {
        roundId: data.roundId,
        roundNumber: data.roundNumber,
        duration: data.duration,
        endTime: endTimeMs,
      };

      setRound(normalized);
      setSubmitted(false);
      setSubmitting(false);
      setTimeUp(false);

      startTimer(endTimeMs);
    });

    socket.on("session:state", (session: any) => {
      const activeRound = session?.rounds?.find(
        (r: any) => r.status === "OPEN",
      );

      if (!activeRound) return;

      const endTimeMs = new Date(activeRound.endsAt).getTime();

      setRound({
        roundId: activeRound.id,
        roundNumber: session.currentRound,
        duration: Math.round(
          (new Date(activeRound.endsAt).getTime() -
            new Date(activeRound.startsAt).getTime()) /
            1000,
        ),
        endTime: endTimeMs,
      });

      if (endTimeMs > Date.now()) startTimer(endTimeMs);
    });

    socket.on("round:time_up", () => {
      setTimeUp(true);
      setTimeLeft(0);
    });

    socket.on("submit:success", () => {
      setSubmitted(true);
      setSubmitting(false);
      router.push("/pages/onboarding/processing");
    });

    socket.on("submit:error", () => {
      setSubmitting(false);
    });

    return () => {
      socket.disconnect();
      if (timerRef.current) clearInterval(timerRef.current);
    };
  }, [API_URL, router, startTimer]);

  const submit = (payload: any) => {
    if (!socketRef.current || submitting) return;

    setSubmitting(true);

    socketRef.current.emit("player:submit_config", payload);
  };

  return {
    player,
    round,
    timeLeft,
    submitted,
    submitting,
    timeUp,
    submit,
    setPlayer,
  };
}