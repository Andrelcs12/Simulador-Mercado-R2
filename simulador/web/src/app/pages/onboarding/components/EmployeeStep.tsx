"use client";

import React from "react";
import { Info } from "lucide-react";

interface AppConfig {
  operadores: number;
  quizScore?: number;
}

interface Props {
  config: AppConfig;
  setConfig: React.Dispatch<React.SetStateAction<any>>;
}

const EmployeeStep = ({ config, setConfig }: Props) => {
  const operadores = config?.operadores ?? 0;
  const quiz = config?.quizScore ?? 100;

  // COMPONENTES DO CSAT (conforme regra do jogo)
  const csatOperadores = (operadores / 10) * 100; // %
  const csatQuiz = quiz; // já está em %

  const csatFinal = (csatOperadores / 100) * (csatQuiz / 100) * 100;

  const sla =
    operadores >= 10 ? 1 :
    operadores >= 8 ? 2 :
    operadores >= 6 ? 3 :
    operadores >= 4 ? 4 :
    operadores >= 2 ? 5 : 6;

  return (
    <div className="space-y-8">

      {/* HEADER */}
      <div className="flex flex-col md:flex-row justify-between gap-4 border-l-4 border-cencosud-orange pl-6">
        <div>
          <h2 className="text-3xl md:text-4xl font-black italic uppercase text-cencosud-orange">
            Operadores <span className="text-cencosud-blue">Equipe</span>
          </h2>
        </div>

        <div className="bg-white border rounded-2xl px-6 py-4">
          <p className="text-[10px] font-black text-gray-400 uppercase">CSAT Final</p>
          <p className="text-2xl font-black text-cencosud-blue">
            {csatFinal.toFixed(0)}%
          </p>
        </div>
      </div>

      {/* SLIDER */}
      <input
        type="range"
        min={0}
        max={10}
        value={operadores}
        onChange={(e) =>
          setConfig((prev: any) => ({
            ...prev,
            operadores: Number(e.target.value),
          }))
        }
        className="w-full accent-cencosud-orange"
      />

      {/* BREAKDOWN CSAT (IMPORTANTE) */}
      <div className="grid md:grid-cols-3 gap-4">

        <div className="bg-white border rounded-2xl p-4">
          <p className="text-[10px] font-black text-gray-400 uppercase">Operadores</p>
          <p className="text-xl font-black text-cencosud-blue">
            {csatOperadores.toFixed(0)}%
          </p>
        </div>

        <div className="bg-white border rounded-2xl p-4">
          <p className="text-[10px] font-black text-gray-400 uppercase">Quiz</p>
          <p className="text-xl font-black text-cencosud-orange">
            {csatQuiz.toFixed(0)}%
          </p>
        </div>

        <div className="bg-white border rounded-2xl p-4">
          <p className="text-[10px] font-black text-gray-400 uppercase">CSAT Final</p>
          <p className="text-xl font-black text-cencosud-blue">
            {csatFinal.toFixed(0)}%
          </p>
        </div>

      </div>

      {/* SLA */}
      <div className="bg-gray-50 p-4 rounded-2xl flex gap-2 items-center">
        <Info size={14} />
        <p className="text-sm font-bold">
          SLA atual: <b>{sla} dia(s)</b>
        </p>
      </div>

    </div>
  );
};

export default EmployeeStep;