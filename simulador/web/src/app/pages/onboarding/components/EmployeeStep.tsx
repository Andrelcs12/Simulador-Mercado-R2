"use client";

import React from "react";
import { Info } from "lucide-react";
import { AppConfig } from "../types/onboarding";

interface Props {
  config: AppConfig;
  setConfig: React.Dispatch<React.SetStateAction<AppConfig>>;
}

const EmployeeStep = ({ config, setConfig }: Props) => {
  const operadores = config.operadores ?? 0;

  // CSAT baseado apenas em operadores (conforme seu backend atual)
  const csatOperadores = (operadores / 10) * 100;

  const csatFinal = csatOperadores;

  const sla =
    operadores >= 10
      ? 1
      : operadores >= 8
      ? 2
      : operadores >= 6
      ? 3
      : operadores >= 4
      ? 4
      : operadores >= 2
      ? 5
      : 6;

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
          <p className="text-[10px] font-black text-gray-400 uppercase">
            CSAT Final
          </p>
          <p className="text-2xl font-black text-cencosud-blue">
            {csatFinal.toFixed(0)}%
          </p>
        </div>
      </div>

      {/* SLIDER */}
      <div className="space-y-2">
        <label className="text-sm font-bold text-gray-600">
          Número de operadores (impacta CSAT e SLA)
        </label>

        <input
          type="range"
          min={0}
          max={10}
          value={operadores}
          onChange={(e) =>
            setConfig((prev) => ({
              ...prev,
              operadores: Number(e.target.value),
            }))
          }
          className="w-full accent-cencosud-orange"
        />
      </div>

      {/* BREAKDOWN */}
      <div className="grid md:grid-cols-2 gap-4">

        <div className="bg-white border rounded-2xl p-4">
          <p className="text-[10px] font-black text-gray-400 uppercase">
            Eficiência Operacional
          </p>
          <p className="text-xl font-black text-cencosud-blue">
            {csatOperadores.toFixed(0)}%
          </p>
          <p className="text-xs text-gray-500 mt-1">
            Baseado na quantidade de operadores disponíveis
          </p>
        </div>

        <div className="bg-white border rounded-2xl p-4">
          <p className="text-[10px] font-black text-gray-400 uppercase">
            CSAT Final
          </p>
          <p className="text-xl font-black text-cencosud-orange">
            {csatFinal.toFixed(0)}%
          </p>
          <p className="text-xs text-gray-500 mt-1">
            Impacto direto na experiência do cliente
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