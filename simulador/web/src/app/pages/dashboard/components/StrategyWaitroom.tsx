"use client";

import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Timer, Users2, MessageSquare, ShieldCheck, Zap, Lock } from 'lucide-react';

const StrategyWaitRoom = () => {
  const [timeLeft, setTimeLeft] = useState(300); // 5 minutos em segundos

  useEffect(() => {
    if (timeLeft <= 0) return;
    const timer = setInterval(() => setTimeLeft(t => t - 1), 1000);
    return () => clearInterval(timer);
  }, [timeLeft]);

  const minutes = Math.floor(timeLeft / 60);
  const seconds = timeLeft % 60;

  return (
    <div className="fixed inset-0 z-[100] bg-cencosud-blue/95 backdrop-blur-xl flex items-center justify-center p-6">
      <div className="max-w-3xl w-full">
        
        {/* STATUS DO ADMIN */}
        <div className="flex justify-center mb-8">
           <div className="bg-white/10 border border-white/20 px-6 py-2 rounded-full flex items-center gap-3">
              <div className="w-2 h-2 bg-yellow-400 rounded-full animate-pulse" />
              <span className="text-white text-[10px] font-black uppercase tracking-widest">
                Aguardando autorização da Controladoria (Admin)
              </span>
           </div>
        </div>

        <div className="bg-white rounded-[3rem] p-10 shadow-2xl relative overflow-hidden">
          {/* DECORAÇÃO BACKGROUND */}
          <div className="absolute top-0 right-0 p-10 opacity-5">
            <Users2 size={200} />
          </div>

          <div className="relative z-10 text-center space-y-8">
            <div className="space-y-2">
              <h2 className="text-4xl font-black text-cencosud-blue italic uppercase tracking-tighter">
                Tempo de <span className="text-cencosud-orange">Estratégia</span>
              </h2>
              <p className="text-gray-400 font-bold text-sm uppercase tracking-widest">Debatam os resultados da Rodada 01 com sua equipe</p>
            </div>

            {/* COUNTDOWN VISUAL */}
            <div className="flex justify-center gap-4 font-mono">
              <div className="bg-gray-50 px-6 py-4 rounded-3xl border border-gray-100">
                <span className="block text-4xl font-black text-cencosud-blue">{minutes.toString().padStart(2, '0')}</span>
                <span className="text-[10px] font-black text-gray-300 uppercase">Min</span>
              </div>
              <span className="text-4xl font-black text-cencosud-blue self-center">:</span>
              <div className="bg-gray-50 px-6 py-4 rounded-3xl border border-gray-100">
                <span className="block text-4xl font-black text-cencosud-blue">{seconds.toString().padStart(2, '0')}</span>
                <span className="text-[10px] font-black text-gray-300 uppercase">Seg</span>
              </div>
            </div>

            {/* CHECKLIST DE DEBATE (IA DEDEV GIVING PROMPTS) */}
            <div className="grid md:grid-cols-2 gap-4 text-left">
               <div className="p-4 bg-blue-50 rounded-2xl border border-blue-100 flex gap-3">
                  <Zap className="text-cencosud-orange shrink-0" size={20} />
                  <p className="text-[11px] font-bold text-blue-900 leading-tight">
                    Analise: O Markup de **Mercearia** foi agressivo demais? O Market Share caiu?
                  </p>
               </div>
               <div className="p-4 bg-orange-50 rounded-2xl border border-orange-100 flex gap-3">
                  <ShieldCheck className="text-cencosud-blue shrink-0" size={20} />
                  <p className="text-[11px] font-bold text-orange-900 leading-tight">
                    Planeje: Como o CAPEX em **Logística** vai impactar o abastecimento agora?
                  </p>
               </div>
            </div>

            <div className="pt-6 border-t border-gray-100">
               <div className="flex items-center justify-center gap-4 text-gray-400">
                  <Lock size={16} />
                  <span className="text-xs font-black uppercase tracking-widest italic animate-pulse">
                    Acesso à Rodada 02 Bloqueado
                  </span>
               </div>
            </div>
          </div>
        </div>

        {/* MENSAGEM DE RODAPÉ */}
        <p className="text-center mt-8 text-white/50 text-[10px] font-bold uppercase tracking-[0.3em]">
          O jogo continuará automaticamente quando o cronômetro zerar ou o Admin liberar.
        </p>
      </div>
    </div>
  );
};

export default StrategyWaitRoom;