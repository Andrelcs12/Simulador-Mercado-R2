"use client";

import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  TrendingUp, Users, AlertTriangle, Smile, 
  ArrowUpRight, ArrowDownRight, Target, Zap,
  PlayCircle, ChevronRight, BarChart, 
  Package, DollarSign, ShieldCheck
} from 'lucide-react';
import toast, { Toaster } from 'react-hot-toast';

// Componente de espera (simula o mestre processando a rodada)
import StrategyWaitRoom from './components/StrategyWaitroom';

// --- INTERFACES DE DADOS ---
interface AppConfig {
  capex: Record<string, number>;
  comercial: {
    pereciveis: { estoque: number; margem: number };
    mercearia: { estoque: number; margem: number };
    higiene: { estoque: number; margem: number };
    bebidas: { estoque: number; margem: number };
  };
}

const DashboardPage = () => {
  const [isWaiting, setIsWaiting] = useState(false);
  const [userConfig, setUserConfig] = useState<AppConfig | null>(null);

  useEffect(() => {
    const saved = localStorage.getItem('simulacao_config');
    if (saved) {
      setUserConfig(JSON.parse(saved));
    }
    
    toast.success('Dados da Rodada 01 Sincronizados!', {
      style: {
        background: '#002350',
        color: '#fff',
        fontWeight: 'bold',
        borderRadius: '15px',
        border: '1px solid #ff6d00'
      },
      iconTheme: { primary: '#ff6d00', secondary: '#fff' }
    });
  }, []);

  const resultados = {
    rodada: 1,
    marketShare: 24.5,
    ebitda: 142000.00,
    perdas: 2.1,
    nps: 82,
    receitaTotal: 845000.00
  };

  const kpis = [
    { label: 'Market Share', value: `${resultados.marketShare}%`, trend: '+2.4%', up: true, icon: <Target size={20} />, color: "text-blue-600", bg: "bg-blue-50" },
    { label: 'EBITDA Operacional', value: `R$ ${resultados.ebitda.toLocaleString()}`, trend: '+12%', up: true, icon: <TrendingUp size={20} />, color: "text-green-600", bg: "bg-green-50" },
    { label: 'Índice de Perdas', value: `${resultados.perdas}%`, trend: '-0.5%', up: false, icon: <AlertTriangle size={20} />, color: "text-red-600", bg: "bg-red-50" },
    { label: 'NPS (Satisfação)', value: resultados.nps, trend: 'Elite', up: true, icon: <Smile size={20} />, color: "text-orange-600", bg: "bg-orange-50" },
  ];

  return (
    <div className="min-h-screen bg-[#F8FAFC] font-sans selection:bg-orange-500 selection:text-white">
      <Toaster position="top-right" reverseOrder={false} />
      
      <AnimatePresence>
        {isWaiting && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="fixed inset-0 z-[100]">
            <StrategyWaitRoom />
          </motion.div>
        )}
      </AnimatePresence>

      <div className="p-4 md:p-10 max-w-[1600px] mx-auto">
        
        {/* HEADER */}
        <header className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6 mb-12">
          <div>
            <div className="flex items-center gap-3 mb-3">
              <span className="bg-[#002350] text-white text-[10px] font-black px-4 py-1.5 rounded-full uppercase tracking-[0.2em] italic border-b-2 border-orange-500">
                Operação Ativa • Rodada 01
              </span>
              <div className="h-1 w-12 bg-slate-200 rounded-full" />
              <span className="text-slate-400 text-xs font-bold uppercase tracking-widest">Dashboard de Resultados</span>
            </div>
            <h1 className="text-5xl font-black text-[#002350] tracking-tighter uppercase italic">
              Performance <span className="text-orange-500">Analítica</span>
            </h1>
          </div>

          <div className="flex gap-4">
            <div className="hidden lg:flex flex-col items-end justify-center px-6 border-r border-slate-200">
              <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Orçamento Utilizado</span>
              <span className="text-xl font-black text-[#002350]">R$ 642.000 <span className="text-xs text-slate-300">/ 700k</span></span>
            </div>
            <button 
              onClick={() => {
                toast('Aguardando autorização...', { icon: '🛡️' });
                setIsWaiting(true);
              }}
              className="px-10 py-5 bg-[#002350] text-white rounded-[2rem] font-black text-sm flex items-center gap-3 hover:shadow-2xl hover:shadow-blue-900/20 transition-all hover:scale-105 active:scale-95 group"
            >
              INICIAR RODADA 02 
              <PlayCircle size={22} className="text-orange-500 group-hover:rotate-12 transition-transform" />
            </button>
          </div>
        </header>

        <main className="space-y-8">
          
          {/* GRID DE KPIS */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {kpis.map((kpi, idx) => (
              <motion.div 
                key={idx} 
                initial={{ opacity: 0, y: 20 }} 
                animate={{ opacity: 1, y: 0 }} 
                transition={{ delay: idx * 0.1 }}
                className="bg-white p-7 rounded-[2.5rem] shadow-sm border border-slate-100 relative group hover:border-orange-200 transition-colors"
              >
                <div className="flex justify-between items-start mb-6">
                  <div className={`p-4 rounded-2xl ${kpi.bg} ${kpi.color} shadow-inner`}>
                    {kpi.icon}
                  </div>
                  <div className={`flex items-center gap-1 text-[10px] font-black px-3 py-1 rounded-full ${kpi.up ? 'bg-emerald-50 text-emerald-600' : 'bg-red-50 text-red-600'}`}>
                    {kpi.trend} {kpi.up ? <ArrowUpRight size={14} /> : <ArrowDownRight size={14} />}
                  </div>
                </div>
                <span className="text-slate-400 text-[10px] font-black uppercase tracking-[0.2em] block mb-1">{kpi.label}</span>
                <h3 className="text-3xl font-black text-[#002350] italic tracking-tighter">{kpi.value}</h3>
              </motion.div>
            ))}
          </div>

          <div className="grid lg:grid-cols-3 gap-8">
            
            {/* GRÁFICO DE OPERAÇÃO COMERCIAL COM FALLBACK MOCKADO */}
            <div className="lg:col-span-2 bg-white rounded-[3rem] p-10 shadow-sm border border-slate-100 relative overflow-hidden">
              <div className="flex justify-between items-center mb-10">
                <h3 className="font-black text-[#002350] uppercase italic tracking-tighter flex items-center gap-3 text-xl">
                  <BarChart size={24} className="text-orange-500" /> 
                  Eficiência por Categoria
                </h3>
                <div className="flex gap-2">
                   <div className="flex items-center gap-2 text-[10px] font-black text-slate-400">
                     <div className="w-3 h-3 bg-orange-500 rounded-sm" /> MARGEM
                   </div>
                   <div className="flex items-center gap-2 text-[10px] font-black text-slate-400">
                     <div className="w-3 h-3 bg-[#002350] rounded-sm" /> ESTOQUE
                   </div>
                </div>
              </div>

              <div className="space-y-10">
                {(userConfig ? Object.entries(userConfig.comercial) : [
                  ['Perecíveis', { estoque: 85, margem: 32 }],
                  ['Mercearia', { estoque: 65, margem: 18 }],
                  ['Higiene', { estoque: 45, margem: 25 }],
                  ['Bebidas', { estoque: 90, margem: 40 }]
                ]).map(([key, data]: any, i) => (
                  <motion.div 
                    key={key}
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: i * 0.15 }}
                    className="relative group"
                  >
                    <div className="flex justify-between items-end mb-3">
                      <div className="flex items-center gap-3">
                        <div className="w-8 h-8 bg-slate-50 rounded-lg flex items-center justify-center border border-slate-100 transition-colors">
                          <span className="text-[10px] font-black text-[#002350]">{i + 1}</span>
                        </div>
                        <div>
                          <span className="text-[9px] font-black text-slate-300 uppercase tracking-[0.2em] block leading-none">Categoria</span>
                          <span className="text-lg font-black text-[#002350] uppercase italic tracking-tighter">{key}</span>
                        </div>
                      </div>
                      
                      <div className="text-right">
                        <div className="flex items-center justify-end gap-2">
                           <span className="text-xs font-black text-orange-500">{data.margem}%</span>
                           <div className="w-px h-3 bg-slate-200" />
                           <span className="text-xs font-black text-[#002350]">{data.estoque}%</span>
                        </div>
                        <div className="text-[9px] font-black text-slate-400 uppercase tracking-widest mt-0.5">Giro: Dinâmico</div>
                      </div>
                    </div>

                    <div className="h-5 bg-slate-50 rounded-full overflow-hidden border border-slate-100 flex shadow-inner relative">
                      <motion.div 
                        initial={{ width: 0 }} 
                        animate={{ width: `${data.estoque}%` }} 
                        transition={{ duration: 1.2, ease: "circOut", delay: i * 0.1 }}
                        className="h-full bg-[#002350] relative z-10"
                      >
                         <div className="absolute inset-0 bg-gradient-to-r from-white/5 via-white/10 to-transparent" />
                      </motion.div>

                      <motion.div 
                         initial={{ width: 0 }} 
                         animate={{ width: `${data.margem}%` }} 
                         transition={{ duration: 1.5, ease: "circOut", delay: (i * 0.1) + 0.3 }}
                         className="h-full bg-orange-500 border-l-2 border-white relative z-20"
                      />
                    </div>
                  </motion.div>
                ))}
              </div>
            </div>

            {/* COLUNA LATERAL */}
            <div className="space-y-6">
              <div className="bg-[#002350] rounded-[3rem] p-8 text-white relative overflow-hidden group shadow-2xl shadow-blue-900/40">
                <div className="absolute -right-10 -top-10 opacity-10 group-hover:scale-110 transition-transform">
                  <ShieldCheck size={200} />
                </div>
                <h3 className="text-[10px] font-black uppercase tracking-[0.4em] mb-8 text-orange-500 italic">Recomendação da IA</h3>
                <div className="flex gap-4 mb-6">
                  <div className="w-12 h-12 bg-white/10 rounded-2xl flex items-center justify-center backdrop-blur-md">
                    <Zap className="text-orange-500" />
                  </div>
                  <p className="text-lg font-bold leading-tight italic">
                    "André, sua alocação em <span className="text-orange-500">TI</span> reduziu filas em 15%, mas o estoque de perecíveis está crítico."
                  </p>
                </div>
                <button className="w-full py-4 bg-white/5 hover:bg-white/10 border border-white/10 rounded-2xl text-[10px] font-black uppercase tracking-widest transition-all">
                  Ver Relatório Detalhado
                </button>
              </div>

              <div className="bg-white rounded-[2.5rem] p-8 border border-slate-100 shadow-sm">
  <h4 className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-6 flex items-center gap-2 italic">
    <Package size={14} className="text-orange-500" /> Investimentos em Infra
  </h4>
  <div className="space-y-4">
    {(userConfig ? Object.entries(userConfig.capex) : [
      ['Tecnologia e TI', 150000],
      ['Logística Avançada', 280000],
      ['Marketing Digital', 120000],
      ['Reforma de PDV', 92000]
    ]).map(([infra, valor]: any) => (
      <motion.div 
        key={infra} 
        initial={{ opacity: 0, x: 10 }}
        animate={{ opacity: 1, x: 0 }}
        className="flex justify-between items-center p-4 bg-slate-50 rounded-2xl border border-slate-100 hover:border-orange-200 hover:bg-white transition-all group"
      >
        <div className="flex items-center gap-3">
          <div className="w-1.5 h-1.5 rounded-full bg-orange-500 shadow-[0_0_8px_rgba(249,115,22,0.6)]" />
          <span className="text-xs font-black text-[#002350] uppercase italic tracking-tighter">
            {infra.replace('check_', '').replace('_', ' ')}
          </span>
        </div>
        <div className="text-right">
          <span className="text-[10px] block font-black text-slate-300 uppercase leading-none mb-1">Alocado</span>
          <span className="text-xs font-mono font-bold text-slate-600 group-hover:text-orange-600 transition-colors">
            R$ {valor.toLocaleString()}
          </span>
        </div>
      </motion.div>
    ))}
  </div>
  
  {/* Rodapé do Card com Totalizador Sutil */}
  <div className="mt-6 pt-6 border-t border-dashed border-slate-100 flex justify-between items-center">
    <span className="text-[9px] font-black text-slate-400 uppercase">Capacidade de Expansão</span>
    <span className="text-[10px] font-black text-[#002350] bg-slate-100 px-2 py-1 rounded-md italic">+12.4%</span>
  </div>
</div>


            </div>

          </div>
        </main>
      </div>

      <footer className="mt-12 py-8 px-10 border-t border-slate-200 flex justify-between items-center opacity-40 font-black">
        <div className="flex items-center gap-4">
          <img src="/imagens/logo.png" alt="Cencosud" className="h-5 grayscale" />
          <span className="text-[9px] uppercase tracking-widest italic">Cencosud Simulator v2.0 • Protocolo DeDev</span>
        </div>
      </footer>
    </div>
  );
};

export default DashboardPage;