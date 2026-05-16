"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { io, Socket } from "socket.io-client";
import { useRouter } from "next/navigation";
import toast from "react-hot-toast";
import { PlayerData, RoundData, AppConfig } from "../types/onboarding";

type SubmitPayload = {
  playerId:  string;
  sessionId: string;
  roundId:   string;
  storeId?:  string;
  operatorsQty:        number;
  serviceOperatorsQty: number;
  quizScore:           number;
  stockInputs: {
    categoryId:        string;
    buyQty:            number;
    commercialMargin:  number;
    expectedSellPrice: number;
  }[];
  capexSelections: { capexId: string }[];
};

// IDs que o backend espera — ajuste para bater com categoryMaster no banco
const CATEGORY_ID_MAP: Record<string, string> = {
  pereciveis: "cat_pereciveis",
  mercearia:  "cat_mercearia",
  eletro:     "cat_eletro",
  hipel:      "cat_hipel",
};

function normalizeEndTime(raw: any): number | null {
  if (!raw) return null;
  if (typeof raw === "number") return raw;
  const ms = new Date(raw).getTime();
  return isNaN(ms) ? null : ms;
}

export function useOnboardingSession(API_URL: string) {
  const router    = useRouter();
  const socketRef = useRef<Socket | null>(null);
  const timerRef  = useRef<NodeJS.Timeout | null>(null);

  const [player,     setPlayer]     = useState<PlayerData | null>(null);
  const [round,      setRound]      = useState<RoundData | null>(null);
  const [timeLeft,   setTimeLeft]   = useState(0);
  const [submitted,  setSubmitted]  = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [timeUp,     setTimeUp]     = useState(false);

  // ── Timer ──────────────────────────────────────────────────
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

    tick(); // executa imediatamente para evitar 00:00 inicial
    timerRef.current = setInterval(tick, 1000);
  }, []);

  // ── Efeito principal ───────────────────────────────────────
  useEffect(() => {
    const saved = localStorage.getItem("player_data");
    if (!saved) {
      router.push("/pages/registro-do-usuario");
      return;
    }

    const p: PlayerData = JSON.parse(saved);
    setPlayer(p);

    // Restaura round do localStorage para timer imediato
    const savedRound = localStorage.getItem("round_data");
    if (savedRound) {
      try {
        const r: RoundData = JSON.parse(savedRound);
        const endMs = normalizeEndTime(r.endTime);
        setRound({ ...r, endTime: endMs });
        if (endMs && endMs > Date.now()) startTimer(endMs);
      } catch {}
    }

    const socket = io(`${API_URL}/simulation`, { reconnection: true });
    socketRef.current = socket;

    socket.on("connect", () => {
      socket.emit("join_session", { sessionId: p.sessionId, playerId: p.id });
      // Sincroniza com servidor — recupera endTime real mesmo após reload
      socket.emit("session:get_state", { sessionId: p.sessionId });
    });

    // ── session:state: fonte de verdade do timer ──
    socket.on("session:state", (session: any) => {
      if (!session) return;
      const activeRound = Array.isArray(session.rounds)
        ? session.rounds.find((r: any) => r.status === "OPEN")
        : null;
      if (!activeRound?.endsAt) return;

      const endsAtMs = new Date(activeRound.endsAt).getTime();
      if (isNaN(endsAtMs)) return;

      const duration = activeRound.startsAt
        ? Math.round((endsAtMs - new Date(activeRound.startsAt).getTime()) / 1000)
        : 0;

      const synced: RoundData = {
        roundId:     activeRound.id,
        roundNumber: session.currentRound ?? 0,
        duration,
        endTime:     endsAtMs,
      };

      localStorage.setItem("round_data", JSON.stringify(synced));
      setRound(synced);
      if (endsAtMs > Date.now()) startTimer(endsAtMs);
    });

    // ── Nova rodada iniciada (admin clicou iniciar) ──
    socket.on("round:started", (data: any) => {
      const endMs = normalizeEndTime(data.endTime);

      const normalized: RoundData = {
        roundId:     data.roundId,
        roundNumber: data.roundNumber,
        duration:    data.duration,
        endTime:     endMs,
      };

      localStorage.setItem("round_data", JSON.stringify(normalized));
      setRound(normalized);
      setSubmitted(false);
      setSubmitting(false);
      setTimeUp(false);

      if (endMs && endMs > Date.now()) startTimer(endMs);
      toast.success(`▶ Rodada ${normalized.roundNumber} iniciada!`);

      // Garante que o player está na página certa
      router.push("/pages/onboarding");
    });

    // ── Tempo esgotado pelo servidor ──
    // Player não enviou — vai direto pro dashboard
    socket.on("round:time_up", () => {
      setTimeUp(true);
      setTimeLeft(0);
      if (timerRef.current) clearInterval(timerRef.current);
      toast.error("⏱ Tempo esgotado");
      setTimeout(() => router.push("/pages/dashboard"), 1500);
    });

    // ── Admin parou a rodada manualmente ──
    socket.on("round:stopped", () => {
      setTimeUp(true);
      setSubmitting(false);
      if (timerRef.current) clearInterval(timerRef.current);
      toast("Rodada encerrada pelo facilitador", { icon: "⚠️" });
      setTimeout(() => router.push("/pages/dashboard"), 1500);
    });

    // ── round:finished: encerramento geral ──
    // Se player já submeteu → submit:success já redirecionou pro /processing
    // Se não submeteu → vai pro /dashboard
    socket.on("round:finished", () => {
      if (timerRef.current) clearInterval(timerRef.current);
      setSubmitting(false);

      // Lê o estado atual de submitted sem criar closure stale
      setSubmitted((wasSubmitted) => {
        if (!wasSubmitted) {
          setTimeout(() => router.push("/pages/dashboard"), 800);
        }
        return wasSubmitted;
      });
    });

    // ── Submit com sucesso ──
    // Fluxo: submit → processing (loading 5s) → dashboard
    socket.on("submit:success", () => {
      setSubmitted(true);
      setSubmitting(false);
      toast.success("✅ Configuração enviada!");
      setTimeout(() => router.push("/pages/processing"), 800);
    });

    socket.on("submit:error", ({ message }: { message?: string }) => {
      setSubmitting(false);
      toast.error(message || "Erro ao enviar configuração");
    });

    return () => {
      socket.removeAllListeners();
      socket.disconnect();
      if (timerRef.current) clearInterval(timerRef.current);
    };
  }, [API_URL, router, startTimer]);

  // ── Submit ─────────────────────────────────────────────────
  const submit = useCallback(
    (payload: {
      playerId:  string;
      sessionId: string;
      roundId:   string;
      storeId?:  string;
      config:    AppConfig;
    }) => {
      if (!socketRef.current || submitting || submitted) return;

      const { config } = payload;

      const formatted: SubmitPayload = {
        playerId:  payload.playerId,
        sessionId: payload.sessionId,
        roundId:   payload.roundId,
        storeId:   payload.storeId,

        // SimulationService.calculateRoundResult usa:
        //   operatorsQty = caixa + atendimento (total p/ custo operacional)
        //   serviceOperatorsQty = só atendimento (p/ calcular SLA)
        operatorsQty:        config.operadoresCaixa + config.operadoresAtendimento,
        serviceOperatorsQty: config.operadoresAtendimento,
        quizScore:           config.quizScore,

        stockInputs: Object.entries(config.comercial).map(([key, val]) => ({
          categoryId:        CATEGORY_ID_MAP[key] ?? key,
          buyQty:            val.estoque,
          commercialMargin:  val.margem,
          expectedSellPrice: 0, // backend calcula via unitCost + margin
        })),

        capexSelections: Object.entries(config.capex)
          .filter(([, selected]) => selected)
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