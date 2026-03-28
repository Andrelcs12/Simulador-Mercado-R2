"use client";

import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Users, ShieldCheck, Box, BarChart4, Wallet, 
  CheckCircle2, Clock, ArrowRight, LayoutDashboard,
  Trophy, Activity, Timer
} from 'lucide-react';

const LobbyPage = () => {
  const [tempoRestante, setTempoRestante] = useState(2700); // 45:00 min em segundos
  const [cargos, setCargos] = useState({
    servicos: "",
    abastecimento: "",
    comercial: "",
    operacional: ""
  });

  /* // Cronômetro estilo Kahoot
  useEffect(() => {
    const timer = setInterval(() => {
      setTempoRestante((prev) => (prev > 0 ? prev - 1 : 0));
    }, 1000);
    return () => clearInterval(timer);
  }, []);

  const formatTime = (seconds: number) => {
    const m = Math.floor(seconds / 60);
    const s = seconds % 60;
    return `${m}:${s < 10 ? '0' : ''}${s}`;
  };

  */

  return (
    <div className="min-h-screen bg-[#F8FAFC] p-4 lg:p-8 font-sans selection:bg-cencosud-orange selection:text-white">
      
      {/* HEADER DINÂMICO */}
      <div className="max-w-7xl mx-auto mb-4 flex flex-col md:flex-row justify-between items-center gap-6">
        <motion.div 
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          className="flex items-center gap-4 bg-white px-6 py-3 rounded-2xl shadow-sm border border-gray-100"
        >
          <img src="/imagens/logo.png" alt="Cencosud" className="h-7" />
          <div className="h-4 w-px bg-gray-200" />
          <span className="text-sm font-black text-cencosud-blue uppercase tracking-widest">Sessão #402</span>
        </motion.div>

        {/* TIMER KAHOOT STYLE */}
        <motion.div 
          animate={{ scale: [1, 1.02, 1] }}
          transition={{ duration: 1, repeat: Infinity }}
          className="bg-cencosud-blue text-white px-10 py-4 rounded-2xl shadow-xl flex items-center gap-4 border-b-4 border-black/20"
        >
          <Timer className="text-cencosud-orange animate-pulse" />
          <div className="flex flex-col">
            <span className="text-[10px] font-black uppercase opacity-60 leading-none">Tempo de Rodada</span>
            <span className="text-3xl font-black font-mono">45:00</span>
          </div>
        </motion.div>

        <div className="flex items-center gap-3 bg-white px-6 py-3 rounded-2xl shadow-sm border border-gray-100 font-black text-cencosud-blue">
          <Activity size={18} className="text-green-500" />
          SERVER: <span className="text-green-500">ONLINE</span>
        </div>
      </div>

      <div className="max-w-7xl mx-auto grid lg:grid-cols-12 gap-8">
        
        {/* LADO ESQUERDO: LEADERBOARD / STATUS */}
        <div className="lg:col-span-4 space-y-6">
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="bg-white p-8 rounded-[2.5rem] shadow-sm border border-gray-100"
          >
            <h3 className="font-black text-cencosud-blue mb-6 flex items-center gap-2 uppercase tracking-tight">
              <Trophy size={20} className="text-cencosud-orange" /> Concorrentes (4/4)
            </h3>
            <div className="space-y-4">
              {['GBarbosa Sul', 'Bretas Alpha', 'Perini Master'].map((loja, i) => (
                <motion.div 
                  initial={{ opacity: 0, x: -10 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: i * 0.1 }}
                  key={loja} 
                  className="flex items-center justify-between p-4 bg-gray-50 rounded-2xl border border-gray-100"
                >
                  <span className="font-black text-cencosud-blue text-sm">{loja}</span>
                  <div className="flex items-center gap-2">
                    <span className="w-2 h-2 rounded-full bg-green-500 animate-pulse" />
                    <span className="text-[9px] font-black text-gray-400 uppercase tracking-widest">READY</span>
                  </div>
                </motion.div>
              ))}
            </div>
          </motion.div>

          <div className="bg-gradient-to-br from-cencosud-orange to-orange-600 p-8 rounded-[2.5rem] text-white shadow-lg shadow-orange-100 relative overflow-hidden group">
             <div className="relative z-10 font-black italic text-2xl mb-2">PONTO DE ATENÇÃO:</div>
             <p className="relative z-10 text-orange-50 text-sm font-medium leading-relaxed">
               O grupo vencedor será aquele com o melhor % de EBITDA acumulado após as 3 rodadas.
             </p>
             <Box className="absolute -right-4 -bottom-4 w-32 h-32 opacity-20 rotate-12 group-hover:rotate-0 transition-transform duration-500" />
          </div>
        </div>

        {/* LADO DIREITO: GRID DE MEMBROS */}
        <div className="lg:col-span-8">
          <motion.div 
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="bg-white p-8 lg:p-12 rounded-[3rem] shadow-[0_30px_60px_rgba(0,0,0,0.02)] border border-white"
          >
            <div className="mb-10">
              <h2 className="text-4xl font-black text-cencosud-blue mb-4">
                Escala do <span className="text-cencosud-orange">Time</span>
              </h2>
              <p className="text-gray-400 font-bold uppercase text-[10px] tracking-[0.2em]">
                Preencha os nomes para iniciar o jogo
              </p>
            </div>

            <div className="grid md:grid-cols-2 gap-8">
              {/* CARD DE CARGO DINÂMICO */}
              {[
                { key: 'servicos', label: 'Gerente de Serviços', icon: <ShieldCheck />, desc: 'CAPEX & Infraestrutura' },
                { key: 'abastecimento', label: 'Abastecimento', icon: <Box />, desc: 'Gestão de Estoque & Aging' },
                { key: 'comercial', label: 'Planejamento', icon: <BarChart4 />, desc: 'Pricing & Margem Comercial' },
                { key: 'operacional', label: 'Operacional', icon: <Wallet />, desc: 'PDV & Equipe de Loja' },
              ].map((cargo) => (
                <motion.div 
                  whileHover={{ y: -5 }}
                  key={cargo.key}
                  className="relative p-6 rounded-[2rem] bg-gray-50 border-2 border-transparent focus-within:border-cencosud-blue focus-within:bg-white transition-all shadow-sm focus-within:shadow-xl"
                >
                  <div className="flex items-center gap-3 mb-4 text-cencosud-blue">
                    <div className="p-2 bg-white rounded-xl shadow-sm text-cencosud-orange">
                      {cargo.icon}
                    </div>
                    <div>
                      <span className="block font-black uppercase text-[10px] tracking-widest leading-none mb-1 opacity-50">{cargo.desc}</span>
                      <span className="font-black text-sm uppercase">{cargo.label}</span>
                    </div>
                  </div>
                  <input 
                    type="text" 
                    placeholder="Nome do integrante"
                    className="w-full bg-transparent outline-none font-bold text-lg text-cencosud-blue placeholder:text-gray-300 px-2"
                  />
                </motion.div>
              ))}
            </div>

            <motion.div 
              layout
              className="mt-12 p-8 bg-cencosud-blue rounded-[2.5rem] flex flex-col md:flex-row items-center justify-between gap-6"
            >
              <div className="flex items-center gap-5">
                <div className="w-16 h-16 bg-white/10 rounded-2xl flex items-center justify-center text-cencosud-orange border border-white/10">
                  <CheckCircle2 size={32} />
                </div>
                <div>
                  <h4 className="text-xl font-black text-white italic">Configuração Finalizada?</h4>
                  <p className="text-blue-200 text-sm font-bold">O Mestre da Rodada iniciará o jogo em breve.</p>
                </div>
              </div>
              
              <button className="group flex items-center gap-3 bg-cencosud-orange text-white px-10 py-5 rounded-2xl font-black text-lg hover:shadow-2xl hover:shadow-orange-300 transition-all hover:scale-105 active:scale-95">
                Confirmar Board <ArrowRight size={22} className="group-hover:translate-x-1 transition-transform" />
              </button>
            </motion.div>
          </motion.div>
        </div>
      </div>

      {/* BACKGROUND DECOR */}
      <div className="fixed -bottom-20 -right-20 pointer-events-none opacity-[0.03]">
        <img src="/imagens/logo.png" alt="" className="w-[600px]" />
      </div>
    </div>
  );
};

export default LobbyPage;