"use client";

import React from "react";
import { Clock } from "lucide-react";

export default function WaitingStatus() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-[#002350] text-white">
      <div className="text-center space-y-4">
        <Clock className="mx-auto animate-pulse" size={40} />
        <h2 className="text-2xl font-black uppercase">
          Aguardando próxima rodada
        </h2>
        <p className="text-sm opacity-70">
          O facilitador ainda não liberou o jogo
        </p>
      </div>
    </div>
  );
}