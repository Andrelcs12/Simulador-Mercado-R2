"use client";

import { OnboardingProvider } from "./context/OnboardingContext";

export default function Layout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <OnboardingProvider>{children}</OnboardingProvider>;
}