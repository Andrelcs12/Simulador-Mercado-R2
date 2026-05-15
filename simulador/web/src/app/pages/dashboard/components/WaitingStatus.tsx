"use client";

import React, { useEffect, useState } from "react";
import { Clock, Loader2 } from "lucide-react";

export default function WaitingStatus() {
  const [dots, setDots] = useState(0);

  useEffect(() => {
    const interval = setInterval(() => {
      setDots((d) => (d + 1) % 4);
    }, 500);

    return () => clearInterval(interval);
  }, []);

  return (
    <div className="min-h-screen flex items-center justify-center bg-[#002350] text-white relative overflow-hidden">
      {/* subtle background glow */}
      <div className="absolute w-[600px] h-[600px] bg-orange-500/10 blur-3xl rounded-full top-[-200px] right-[-200px]" />
      <div className="absolute w-[500px] h-[500px] bg-blue-400/10 blur-3xl rounded-full bottom-[-200px] left-[-200px]" />

      <div className="relative text-center space-y-6 max-w-md px-6">
        {/* icon cluster */}
        <div className="flex justify-center items-center gap-3">
          <Clock className="animate-pulse" size={34} />
          <Loader2 className="animate-spin text-orange-400" size={22} />
        </div>

        <div className="space-y-2">
          <h2 className="text-2xl md:text-3xl font-black uppercase tracking-wide">
            Aguardando próxima rodada
            <span className="inline-block w-6 text-left">
              {".".repeat(dots)}
            </span>
          </h2>

          <p className="text-sm text-white/70 leading-relaxed">
            O sistema está sincronizando com o servidor.
            Assim que o facilitador liberar, a rodada será iniciada automaticamente.
          </p>
        </div>

        {/* subtle progress indicator */}
        <div className="w-full h-1 bg-white/10 rounded-full overflow-hidden">
          <div className="h-full w-1/3 bg-orange-400 animate-pulse" />
        </div>

        <p className="text-[10px] uppercase tracking-[0.3em] text-white/40">
          Sincronização ativa
        </p>
      </div>
    </div>
  );
}