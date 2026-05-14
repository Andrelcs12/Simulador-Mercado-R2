"use client";

import React from "react";
import { Clock } from "lucide-react";

interface Props {
  roundNumber: number;
}

export default function DashboardHeader({ roundNumber }: Props) {
  return (
    <header className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
      <div>
        <span className="bg-[#002350] text-white text-[10px] px-4 py-1 rounded-full font-black uppercase">
          Rodada {roundNumber}
        </span>

        <h1 className="text-4xl font-black text-[#002350] uppercase italic mt-3">
          Performance <span className="text-orange-500">Analítica</span>
        </h1>
      </div>

      <div className="flex items-center gap-3 bg-white border rounded-2xl px-6 py-4">
        <Clock className="text-orange-500" />
        <div>
          <p className="text-[10px] uppercase font-black text-gray-400">
            Próxima rodada
          </p>
          <p className="text-sm font-black text-[#002350]">
            Aguardando facilitador
          </p>
        </div>
      </div>
    </header>
  );
}