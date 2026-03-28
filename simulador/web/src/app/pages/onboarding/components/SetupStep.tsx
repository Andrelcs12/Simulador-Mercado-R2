"use client";

import React from 'react';
import { motion } from 'framer-motion';
import { 
  ShieldAlert, HardDrive, Truck, Megaphone, 
  Info, LucideIcon 
} from 'lucide-react';

interface SetupProps {
  config: any;
  setConfig: React.Dispatch<React.SetStateAction<any>>;
}

// Definimos a estrutura dos itens para facilitar o loop
interface CapexItem {
  id: string;
  label: string;
  Icon: LucideIcon; // Usamos o tipo do componente, não o elemento
  desc: string;
  color: string;
  bg: string;
}

const SetupStep = ({ config, setConfig }: SetupProps) => {
  
  const handleCapexChange = (field: string, value: number) => {
    setConfig({
      ...config,
      capex: { ...config.capex, [field]: value }
    });
  };

  const totalGasto = Object.values(config.capex).reduce((a: any, b: any) => a + b, 0);
  const saldoRestante = 700000 - (totalGasto as number);

  const capexItems: CapexItem[] = [
    { 
      id: 'seguranca', 
      label: 'Cyber Security', 
      Icon: ShieldAlert, 
      desc: 'Previne ataques hacker que podem fechar sua loja.',
      color: 'text-red-500',
      bg: 'bg-red-50'
    },
    { 
      id: 'ti', 
      label: 'Infraestrutura TI', 
      Icon: HardDrive, 
      desc: 'Garante o uptime dos PDVs e Self-Checkouts.',
      color: 'text-blue-500',
      bg: 'bg-blue-50'
    },
    { 
      id: 'logistica', 
      label: 'Eficiência Logística', 
      Icon: Truck, 
      desc: 'Reduz perdas no transporte e acelera o recebimento.',
      color: 'text-green-500',
      bg: 'bg-green-50'
    },
    { 
      id: 'marketing', 
      label: 'Trade Marketing', 
      Icon: Megaphone, 
      desc: 'Aumenta o tráfego de clientes na loja física.',
      color: 'text-cencosud-orange',
      bg: 'bg-orange-50'
    },
  ];

  return (
    <div className="space-y-8">
      {/* HEADER LOCAL */}
      <div className="flex flex-col md:flex-row justify-between items-end gap-4 border-l-4 border-cencosud-orange pl-6 py-2">
        <div>
          <h2 className="text-4xl font-black text-cencosud-blue tracking-tight uppercase italic">
            Investimento <span className="text-cencosud-orange">CAPEX</span>
          </h2>
          <p className="text-gray-500 font-bold text-xs mt-1">Sessão de Alocação de Capital - Rodada 01</p>
        </div>
        
        <div className="bg-white px-6 py-4 rounded-2xl shadow-sm border border-gray-100">
          <span className="text-[10px] font-black text-gray-400 uppercase tracking-widest block mb-1">Saldo para Mercadorias</span>
          <span className={`text-2xl font-black font-mono ${saldoRestante < 0 ? 'text-red-500' : 'text-cencosud-blue'}`}>
            R$ {saldoRestante.toLocaleString('pt-BR')}
          </span>
        </div>
      </div>

      {/* GRID DE CARDS */}
      <div className="grid md:grid-cols-2 gap-6">
        {capexItems.map(({ id, label, Icon, desc, color, bg }) => (
          <motion.div 
            key={id}
            whileHover={{ y: -4 }}
            className="bg-white p-6 rounded-[2rem] shadow-sm border border-gray-100"
          >
            <div className="flex items-center gap-4 mb-6">
              <div className={`p-4 rounded-2xl ${bg} ${color}`}>
                <Icon size={28} /> {/* Aqui o size funciona perfeitamente */}
              </div>
              <div>
                <h4 className="text-lg font-black text-cencosud-blue">{label}</h4>
                <p className="text-[10px] text-gray-400 font-black uppercase tracking-widest">Investimento Crítico</p>
              </div>
            </div>

            <div className="space-y-6">
              <p className="text-sm text-gray-400 font-medium leading-relaxed">{desc}</p>
              
              <div className="space-y-3">
                <div className="flex justify-between items-center">
                  <span className="text-[10px] font-black text-cencosud-blue uppercase">Aporte Financeiro</span>
                  <span className="font-mono font-black text-cencosud-orange bg-orange-50 px-3 py-1 rounded-lg">
                    R$ {config.capex[id].toLocaleString('pt-BR')}
                  </span>
                </div>
                
                <input 
                  type="range"
                  min="0"
                  max="200000"
                  step="5000"
                  value={config.capex[id]}
                  onChange={(e) => handleCapexChange(id, parseInt(e.target.value))}
                  className="w-full h-2 bg-gray-100 rounded-lg appearance-none cursor-pointer accent-cencosud-blue"
                />
              </div>
            </div>
          </motion.div>
        ))}
      </div>

      {/* BOX DE INSIGHT */}
      <div className="bg-blue-50 border border-blue-100 p-6 rounded-[2rem] flex items-center gap-4">
        <div className="bg-white p-3 rounded-xl text-cencosud-blue shadow-sm">
          <Info size={20} />
        </div>
        <p className="text-xs text-blue-800 font-bold leading-relaxed">
          <span className="text-cencosud-blue font-black uppercase mr-2">Dica DeDev:</span> 
          Lembre-se que cada R$ investido aqui é descontado do seu lucro bruto no final da rodada (EBITDA). Gaste com sabedoria!
        </p>
      </div>
    </div>
  );
};

export default SetupStep;