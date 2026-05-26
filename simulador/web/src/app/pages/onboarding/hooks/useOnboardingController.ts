"use client";

import { useCallback } from "react";
import { useRouter } from "next/navigation"; 
import { useOnboarding } from "../context/OnboardingContext";
import { useOnboardingSession } from "../hooks/useOnboardingSession";

export function useOnboardingController(round: any) {
  const router = useRouter();
  const { player, submitting, submitted } = useOnboarding();
  const { submit } = useOnboardingSession(
    process.env.NEXT_PUBLIC_API_URL || "http://localhost:4000"
  );

  const finalize = useCallback(async () => {
    if (!round?.roundId || !player) return;
    if (submitting || submitted) return;

    // 1. Executa o envio
    await submit({
      playerId: player.id,
      sessionId: player.sessionId,
      roundId: round.roundId,
    });

    // 2. Redireciona imediatamente para a tela de loading/processing
    // O backend continua processando os dados, e o ProcessingPage 
    // aguardará o evento 'round:finished' do servidor.
    router.push("/pages/processing");

  }, [round, player, submitting, submitted, submit, router]);

  return { finalize };
}