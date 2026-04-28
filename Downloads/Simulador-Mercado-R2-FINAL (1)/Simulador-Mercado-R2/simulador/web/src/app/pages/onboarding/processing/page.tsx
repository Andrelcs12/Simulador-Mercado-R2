"use client";

import React, { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { motion, AnimatePresence } from 'framer-motion';
import { Loader2, Database, TrendingUp, Users, Cpu } from 'lucide-react';

const ProcessingPage = () => {
  const router = useRouter();
  const [progress, setProgress] = useState(0);
  const [messageIndex, setMessageIndex] = useState(0);

  const messages = [
    { text: "Enviando planejamento para o servidor...", icon: <Database size={18} /> },
    { text: "Calculando Market Share dos concorrentes...", icon: <Users size={18} /> },
    { text: "Simulando fluxo de caixa e EBITDA...", icon: <TrendingUp size={18} /> },
    { text: "IA DeDev analisando riscos operacionais...", icon: <Cpu size={18} /> },
    { text: "Finalizando relatório da Rodada 01...", icon: <Loader2 size={18} className="animate-spin" /> },
  ];

  useEffect(() => {
    // 1. Cronômetro da Barra de Progresso (5 segundos)
    const timer = setInterval(() => {
      setProgress((oldProgress) => {
        if (oldProgress === 100) return 100;
        return Math.min(oldProgress + 1, 100);
      });
    }, 50); // 50ms * 100 = 5000ms (5s)

    // 2. Troca de mensagens a cada 1.2s
    const messageTimer = setInterval(() => {
      setMessageIndex((prev) => (prev + 1) % messages.length);
    }, 1200);

    // 3. Redirecionamento após 5.5s (para dar um respiro no 100%)
    const redirectTimer = setTimeout(() => {
      router.push('/pages/dashboard');
    }, 5500);

    return () => {
      clearInterval(timer);
      clearInterval(messageTimer);
      clearTimeout(redirectTimer);
    };
  }, [router]);

  return (
    <div className="min-h-screen bg-[#F8FAFC] flex flex-col items-center justify-center p-6 overflow-hidden relative">
      
      {/* BACKGROUND DECORATIVO */}
      <div className="absolute inset-0 z-0 opacity-[0.03] pointer-events-none flex items-center justify-center">
        <img src="/imagens/logo.png" alt="" className="w-[800px] grayscale" />
      </div>

      <div className="w-full max-w-md relative z-10 text-center space-y-10">
        
        {/* LOGO PULSANTE */}
        <motion.div
          animate={{ scale: [1, 1.05, 1], opacity: [0.8, 1, 0.8] }}
          transition={{ duration: 2, repeat: Infinity }}
          className="flex justify-center"
        >
          <img src="/imagens/logo.png" alt="Cencosud" className="h-12" />
        </motion.div>

        <div className="space-y-6">
          <div className="space-y-2">
            <h2 className="text-3xl font-black text-cencosud-blue italic uppercase tracking-tighter">
              Processando <span className="text-cencosud-orange">Simulação</span>
            </h2>
            <p className="text-[10px] font-black text-gray-400 uppercase tracking-[0.4em]">Aguarde o encerramento da rodada</p>
          </div>

          {/* BARRA DE PROGRESSO ESTILO DE DEV */}
          <div className="relative h-4 bg-gray-200 rounded-full overflow-hidden shadow-inner border border-gray-100">
            <motion.div 
              className="absolute top-0 left-0 h-full bg-gradient-to-r from-cencosud-blue to-blue-400 shadow-[0_0_15px_rgba(0,80,157,0.3)]"
              initial={{ width: "0%" }}
              animate={{ width: `${progress}%` }}
              transition={{ ease: "linear" }}
            />
          </div>
          <div className="flex justify-between font-mono text-[10px] font-black text-cencosud-blue opacity-50">
            <span>{progress}% COMPLETE</span>
            <span>EST. TIME: 5.0S</span>
          </div>
        </div>

        {/* MENSAGENS DINÂMICAS COM ANIMATE PRESENCE */}
        <div className="h-12 flex items-center justify-center">
          <AnimatePresence mode="wait">
            <motion.div
              key={messageIndex}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              className="flex items-center gap-3 text-cencosud-blue bg-white px-6 py-3 rounded-2xl shadow-sm border border-gray-50"
            >
              <span className="text-cencosud-orange">{messages[messageIndex].icon}</span>
              <span className="text-sm font-bold">{messages[messageIndex].text}</span>
            </motion.div>
          </AnimatePresence>
        </div>
      </div>

      {/* RODAPÉ TÉCNICO */}
      <div className="fixed bottom-10 flex flex-col items-center gap-2">
        <div className="flex items-center gap-2 text-[10px] font-black text-gray-300 tracking-widest uppercase">
          <Cpu size={12} /> Powered by DeDev Engine v1.0
        </div>
      </div>
    </div>
  );
};

export default ProcessingPage;