"use client";

import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  TrendingUp, Users, AlertTriangle, Smile, 
  ArrowUpRight, ArrowDownRight, Target, Zap,
  PlayCircle, ChevronRight, Lock
} from 'lucide-react';

// Importamos o componente de espera que criamos
import StrategyWaitRoom from './components/StrategyWaitroom';

const DashboardPage = () => {
  // Estado para controlar se o time está em "Debate Estratégico"
  const [isWaiting, setIsWaiting] = useState(false);

  const resultados = {
    rodada: 1,
    marketShare: 24.5,
    ebitda: 142000.00,
    perdas: 2.1,
    nps: 82,
  };

  const kpis = [
    { label: 'Market Share', value: `${resultados.marketShare}%`, trend: '+2.4%', up: true, icon: <Target className="text-blue-600" />, color: "bg-blue-50" },
    { label: 'EBITDA Operacional', value: `R$ ${resultados.ebitda.toLocaleString()}`, trend: '+12%', up: true, icon: <TrendingUp className="text-green-600" />, color: "bg-green-50" },
    { label: 'Índice de Perdas', value: `${resultados.perdas}%`, trend: '-0.5%', up: false, icon: <AlertTriangle className="text-red-600" />, color: "bg-red-50" },
    { label: 'NPS (Satisfação)', value: resultados.nps, trend: 'Elite', up: true, icon: <Smile className="text-orange-600" />, color: "bg-orange-50" },
  ];

  return (
    <div className="min-h-screen bg-[#F8FAFC] font-sans">
      
      {/* SE ESTIVER EM ESPERA, MOSTRA O WAIT ROOM POR CIMA */}
      <AnimatePresence>
        {isWaiting && (
          <motion.div 
            initial={{ opacity: 0 }} 
            animate={{ opacity: 1 }} 
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-[100]"
          >
            <StrategyWaitRoom />
          </motion.div>
        )}
      </AnimatePresence>

      <div className="p-4 md:p-10">
        <header className="max-w-7xl mx-auto flex flex-col md:flex-row justify-between items-start md:items-center gap-6 mb-10">
          <div>
            <div className="flex items-center gap-2 mb-2">
              <span className="bg-cencosud-blue text-white text-[10px] font-black px-3 py-1 rounded-full uppercase tracking-widest">
                Rodada 01 Finalizada
              </span>
              <span className="text-gray-300 text-xs font-bold">André, analise os dados com seu squad:</span>
            </div>
            <h1 className="text-4xl font-black text-cencosud-blue tracking-tighter uppercase italic">
              Performance <span className="text-cencosud-orange">Geral</span>
            </h1>
          </div>

          <div className="flex gap-4 w-full md:w-auto">
            {/* O BOTÃO AGORA ATIVA O MODO DE ESPERA/DEBATE */}
            <button 
              onClick={() => setIsWaiting(true)}
              className="flex-1 md:flex-none px-8 py-4 bg-cencosud-blue text-white rounded-2xl font-black text-sm flex items-center justify-center gap-2 hover:shadow-xl hover:shadow-blue-200 transition-all hover:scale-105"
            >
              Iniciar Rodada 02 <PlayCircle size={18} className="text-cencosud-orange" />
            </button>
          </div>
        </header>

        <main className="max-w-7xl mx-auto space-y-8">
          {/* GRID DE KPIS */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {kpis.map((kpi, idx) => (
              <motion.div key={idx} initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: idx * 0.1 }}
                className="bg-white p-6 rounded-[2.5rem] shadow-sm border border-gray-100 relative overflow-hidden group">
                <div className="flex justify-between items-start mb-4">
                  <div className={`p-3 rounded-2xl ${kpi.color}`}>{kpi.icon}</div>
                  <div className={`flex items-center gap-1 text-[10px] font-black uppercase ${kpi.up ? 'text-green-500' : 'text-red-500'}`}>
                    {kpi.trend} {kpi.up ? <ArrowUpRight size={14} /> : <ArrowDownRight size={14} />}
                  </div>
                </div>
                <span className="text-gray-400 text-[10px] font-black uppercase tracking-widest block">{kpi.label}</span>
                <h3 className="text-2xl font-black text-cencosud-blue mt-1 italic">{kpi.value}</h3>
              </motion.div>
            ))}
          </div>

          {/* O RESTO DO SEU DASHBOARD (Gráficos e Insights) CONTINUA AQUI IGUAL AO QUE VOCÊ TINHA */}
          <div className="grid lg:grid-cols-3 gap-8">
            <div className="lg:col-span-2 bg-white rounded-[3rem] p-8 shadow-sm border border-gray-100">
               {/* ... seu código do gráfico aqui ... */}
               <h3 className="font-black text-cencosud-blue uppercase italic tracking-tighter flex items-center gap-2 mb-8">
                   <Zap size={20} className="text-cencosud-orange" /> Receita vs Margem
               </h3>
               <div className="space-y-8">
                {['Perecíveis', 'Mercearia', 'Higiene', 'Bebidas'].map((cat, i) => (
                  <div key={cat} className="space-y-2">
                    <div className="flex justify-between text-xs font-black uppercase italic">
                      <span className="text-cencosud-blue">{cat}</span>
                      <span className="text-gray-400">R$ {((i + 1) * 45000).toLocaleString()}</span>
                    </div>
                    <div className="h-3 bg-gray-100 rounded-full overflow-hidden">
                      <motion.div initial={{ width: 0 }} animate={{ width: `${85 - (i * 15)}%` }} className={`h-full ${i === 0 ? 'bg-cencosud-orange' : 'bg-cencosud-blue'}`} />
                    </div>
                  </div>
                ))}
               </div>
            </div>

            <div className="lg:col-span-1 bg-cencosud-blue rounded-[3rem] p-8 text-white relative overflow-hidden">
               {/* ... seu código do insight da IA aqui ... */}
               <h3 className="text-xs font-black uppercase tracking-[0.3em] mb-6 opacity-60">Consultoria DeDev</h3>
               <p className="text-lg font-bold leading-relaxed italic mb-6">
                 "O estoque de **Bebidas** ficou abaixo da demanda. Ajuste para a Rodada 02!"
               </p>
            </div>
          </div>
        </main>
      </div>

      {/* MARCA D'ÁGUA */}
      <div className="fixed bottom-0 right-0 opacity-[0.03] pointer-events-none select-none">
        <img src="/imagens/logo.png" alt="" className="w-[500px]" />
      </div>
    </div>
  );
};

export default DashboardPage;