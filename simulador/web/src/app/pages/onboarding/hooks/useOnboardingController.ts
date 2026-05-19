"use client";

import { useCallback } from "react";
import { useOnboarding } from "../context/OnboardingContext";
import { useOnboardingSession } from "../hooks/useOnboardingSession";

export function useOnboardingController(round: any) {
  const {
    player,
    submitting,
    submitted,
  } = useOnboarding();

  const { submit } = useOnboardingSession(
    process.env.NEXT_PUBLIC_API_URL || "http://localhost:4000"
  );

  const finalize = useCallback(async () => {
    if (!round?.roundId) return;
    if (!player) return;
    if (submitting || submitted) return;

    await submit({
      playerId: player.id,
      sessionId: player.sessionId,
      roundId: round.roundId,
    });
  }, [round, player, submitting, submitted, submit]);

  return {
    finalize,
  };
}