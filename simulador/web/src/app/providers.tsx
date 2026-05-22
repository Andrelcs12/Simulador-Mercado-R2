"use client";

import type { ReactNode } from "react";

import { OnboardingProvider } from "./pages/onboarding/context/OnboardingContext";

export function Providers({ children }: { children: ReactNode }) {
  return <OnboardingProvider>{children}</OnboardingProvider>;
}
