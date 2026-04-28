"use client";

import React from 'react';
import { useState } from 'react';
import { motion } from 'framer-motion';
import { Users, Minus, Plus, Info, Briefcase } from 'lucide-react';

interface AppConfig {
}

interface EmployeeProps {
  config: AppConfig;
  setConfig: React.Dispatch<React.SetStateAction<any>>;
}

const EmployeeStep = ({config, setConfig}: EmployeeProps) => {

    const [valor, setValor] = useState(0);

    const taxaSLA = () => (valor < 6 ? 6 - valor : 1);

    return(
        <div className="space-y-8">
            {/* HEADER LOCAL */}
      <div className="flex flex-col md:flex-row justify-between items-end gap-4 border-l-4 border-cencosud-orange pl-6 py-2">
        <div>
          <h2 className="text-4xl font-black text-cencosud-orange tracking-tight uppercase italic">
            Contratar <span className="text-cencosud-blue">Operadores</span>
          </h2>
          <p className="text-gray-500 font-bold text-xs mt-1">Sessão de Contratação de Operadores - Rodada 03</p>
        </div>
        
        <div className="bg-white px-6 py-4 rounded-2xl shadow-sm border border-gray-100">
          <span className="text-[10px] font-black text-gray-400 uppercase tracking-widest block mb-1">MARGEM(%) DE OPERADORES CONTRATADOS</span>
          <span className={`text-2xl font-black font-mono`}>
            {valor / 10 * 100}
          </span>
        </div>
      </div>

      <p className="text-base text-blue-800 font-bold leading-relaxed">
          Indique a quantidade de operadores de serviço necessária:
      </p>

      <div className="bg-blue-50 border border-blue-100 p-6 rounded-[2rem] flex items-center gap-4">
              <div className="bg-white p-3 rounded-xl text-cencosud-blue shadow-sm">
                <Info size={20} />
              </div>
              <p className="text-xs text-blue-800 font-bold leading-relaxed">
                <span className="text-cencosud-blue font-black uppercase mr-2">Dica:</span> 
                A margem(%) de operadores contratados é diretamente proporcional ao CSAT final.
              </p>
            </div>

      <div className="bg-white rounded-[2.5rem] shadow-sm border border-gray-100 overflow-hidden py-5">
        <div className="col-span-3 px-4 text-center">
              <span className="text-[12px] font-black text-gray-300 uppercase block mb-2">Número de operadores de serviço a ser contratado:</span>
              <div className="px-4">
        <input 
          type="range" 
          min="0" 
          max="10" 
          step="1" 
          value={valor}
          onChange={(e) => setValor(Number(e.target.value))}
          className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer accent-cencosud-orange"
          style={{
              background: `linear-gradient(to right, #FF6B00 0%, #FF6B00 ${(valor / 10) * 100}%, #E5E7EB ${(valor / 10) * 100}%, #E5E7EB 100%)`
            }}
        />
        <div className="flex justify-between w-full mt-2 px-1">
          {[...Array(11)].map((_, i) => (
            <span 
                key={i} 
                className={`text-[10px] font-extrabold ${i <= valor ? 'text-cencosud-orange' : 'text-gray-300'}`}
              >
                {i}
              </span>
          ))}
        </div>
      </div>
      <div className="mt-4 bg-slate-50 border border-slate-100 p-3 rounded-xl flex items-start gap-3 whitespace-pre-line">
                    <Info size={16} className="text-cencosud-blue shrink-0 mt-0.5" />
                    <p className="text-[12px] text-slate-500 font-medium leading-relaxed">
                      <span className="text-cencosud-blue font-black uppercase mr-1">Taxa SLA:</span>
                      {taxaSLA()}
                    </p>
                  </div>
            </div>
      </div>
      
  </div>
    );
};

export default EmployeeStep;