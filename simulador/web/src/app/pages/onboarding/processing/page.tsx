"use client";

import React, { useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import {
  Database,
  TrendingUp,
  Users,
  Cpu,
  Loader2,
  Activity,
  Terminal,
  ShieldCheck
} from "lucide-react";

// Definição estrita do tempo da animação (3000ms = 3 segundos)
const TOTAL_DURATION_MS = 3000;
const TICK_INTERVAL_MS = 30; // Atualização suave a cada 30ms

const MESSAGES_MOCK = [
  { text: "Criptografando e enviando planejamento de gôndola...", icon: Database },
  { text: "Processando algoritmos de elasticidade de mercado...", icon: Users },
  { text: "Calculando projeções matemáticas de EBITDA...", icon: TrendingUp },
  { text: "Analisando gargalos e SLA de atendimento operacional...", icon: Cpu },
  { text: "Consolidando dados e fechando rodada fiscal...", icon: Loader2 },
];

export default function ProcessingPage() {
  const router = useRouter();
  const redirectRef = useRef(false);

  const [progress, setProgress] = useState(0);
  const [messageIndex, setMessageIndex] = useState(0);
  const [completed, setCompleted] = useState(false);

  useEffect(() => {
    const startTime = Date.now();

    const progressInterval = setInterval(() => {
      const elapsedTime = Date.now() - startTime;
      
      // Calcula o percentual linear com base no tempo decorrido
      const currentProgress = Math.min(100, Math.floor((elapsedTime / TOTAL_DURATION_MS) * 100));
      
      setProgress(currentProgress);

      if (currentProgress >= 100) {
        clearInterval(progressInterval);
        if (!redirectRef.current) {
          redirectRef.current = true;
          setCompleted(true);
          
          // Aguarda 800ms com a barra cheia para o feedback visual de "Concluído" antes de mudar de tela
          setTimeout(() => {
            router.replace("/pages/dashboard");
          }, 800);
        }
      }
    }, TICK_INTERVAL_MS);

    // Rotaciona as mensagens de forma acelerada (distribuídas dinamicamente dentro dos 3 segundos)
    const messageInterval = setInterval(() => {
      setMessageIndex((i) => (i + 1) % MESSAGES_MOCK.length);
    }, TOTAL_DURATION_MS / MESSAGES_MOCK.length);

    return () => {
      clearInterval(progressInterval);
      clearInterval(messageInterval);
    };
  }, [router]);

  const CurrentIcon = MESSAGES_MOCK[messageIndex].icon;

  return (
    <div className="min-h-screen bg-[#060B13] flex items-center justify-center px-6 relative overflow-hidden font-sans">
      
      {/* Luzes e Efeitos de Fundo Neon */}
      <div className="absolute inset-0 pointer-events-none">
        <div className="absolute w-[500px] h-[500px] bg-orange-500/10 blur-[150px] rounded-full -top-40 -left-20 animate-pulse" />
        <div className="absolute w-[400px] h-[400px] bg-cyan-500/5 blur-[130px] rounded-full bottom-10 right-10" />
        <div className="absolute inset-0 bg-[linear-gradient(to_right,#ffffff03_1px,transparent_1px),linear-gradient(to_bottom,#ffffff03_1px,transparent_1px)] bg-[size:32px_32px]" />
      </div>

      <div className="w-full max-w-lg relative z-10">
        <motion.div
          initial={{ opacity: 0, y: 30, scale: 0.98 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          transition={{ duration: 0.5, ease: "easeOut" }}
          className="bg-[#0B1322]/80 backdrop-blur-2xl rounded-3xl border border-white/[0.06] shadow-[0_0_50px_rgba(0,0,0,0.6)] p-8 md:p-10 relative overflow-hidden"
        >
          {/* Efeito Glow Linear Superior */}
          <div className={`absolute top-0 left-0 right-0 h-[2px] transition-colors duration-500 ${completed ? 'bg-gradient-to-r from-transparent via-emerald-400 to-transparent shadow-[0_0_15px_#10b981]' : 'bg-gradient-to-r from-transparent via-orange-500 to-transparent shadow-[0_0_15px_#f97316]'}`} />

          {/* Top Bar / Brand */}
          <div className="flex justify-between items-center border-b border-white/[0.05] pb-6 mb-8">
            <div className="flex items-center gap-2">
              <Terminal size={16} className="text-orange-500/70" />
              <span className="text-[10px] font-mono tracking-widest uppercase text-slate-400">System_Simulation_Core</span>
            </div>
            <motion.div 
              animate={{ opacity: [0.4, 1, 0.4] }} 
              transition={{ repeat: Infinity, duration: 1.5 }}
              className="flex items-center gap-1.5"
            >
              <span className={`w-2 h-2 rounded-full shadow-[0_0_8px_currentColor] ${completed ? 'bg-emerald-400 text-emerald-400' : 'bg-orange-500 text-orange-500'}`} />
              <span className="text-[10px] font-mono font-bold tracking-wider uppercase text-slate-400">
                {completed ? "Ready" : "Syncing"}
              </span>
            </motion.div>
          </div>

          {/* Logo Principal Animada */}
          <div className="flex justify-center mb-8">
            <motion.div
              animate={completed ? { scale: [1, 1.05, 1] } : { y: [0, -4, 0] }}
              transition={{ repeat: Infinity, duration: 2, ease: "easeInOut" }}
              className="relative p-4 rounded-2xl bg-white/[0.02] border border-white/[0.04]"
            >
              <img src="/imagens/logo.png" className="h-10 object-contain max-w-[180px]" alt="Logo" />
            </motion.div>
          </div>

          {/* Títulos dinâmicos */}
          <div className="text-center space-y-2">
            <h1 className="text-2xl md:text-3xl font-black tracking-tight text-white uppercase">
              {completed ? (
                <span className="text-transparent bg-clip-text bg-gradient-to-r from-emerald-400 to-teal-200 drop-shadow-[0_0_15px_rgba(16,185,129,0.3)]">
                  Simulação Concluída
                </span>
              ) : (
                <span className="text-transparent bg-clip-text bg-gradient-to-r from-white via-slate-100 to-slate-400">
                  Processando Rodada
                </span>
              )}
            </h1>
            <p className="text-xs md:text-sm text-slate-400 max-w-sm mx-auto font-medium">
              {completed
                ? "Engine de mercado sincronizada. Inicializando painel gráfico..."
                : "Aguardando o fechamento da malha de dados dos players concorrentes."}
            </p>
          </div>

          {/* MÓDULO PROGRESSO */}
          <div className="mt-10 bg-white/[0.02] border border-white/[0.04] rounded-2xl p-5 relative">
            <div className="flex justify-between items-end mb-3">
              <span className="text-[10px] font-mono uppercase tracking-widest font-bold text-slate-400 flex items-center gap-1.5">
                <Activity size={12} className={completed ? "text-emerald-400" : "text-orange-500 animate-pulse"} />
                Matriz de Computação
              </span>
              <span className={`text-xl font-mono font-black tracking-tight ${completed ? "text-emerald-400 drop-shadow-[0_0_10px_rgba(16,185,129,0.4)]" : "text-orange-500 drop-shadow-[0_0_10px_rgba(249,115,22,0.4)]"}`}>
                {progress}%
              </span>
            </div>

            {/* Container da barra */}
            <div className="h-4 bg-[#080D16] rounded-full p-1 overflow-hidden border border-white/[0.05] shadow-inner">
              <motion.div
                className={`h-full rounded-full relative ${
                  completed 
                    ? "bg-gradient-to-r from-emerald-500 to-teal-400 shadow-[0_0_15px_rgba(16,185,129,0.6)]" 
                    : "bg-gradient-to-r from-orange-600 via-orange-500 to-amber-400 shadow-[0_0_15px_rgba(249,115,22,0.6)]"
                }`}
                style={{ width: `${progress}%` }}
                transition={{ duration: 0.05, ease: "linear" }}
              >
                <div className="absolute inset-0 bg-[linear-gradient(45deg,rgba(255,255,255,0.15)_25%,transparent_25%,transparent_50%,rgba(255,255,255,0.15)_50%,rgba(255,255,255,0.15)_75%,transparent_75%,transparent)] bg-[size:16px_16px] animate-[shimmer_1s_linear_infinite]" />
              </motion.div>
            </div>
          </div>

          {/* Sub-status Flutuante */}
          <div className="mt-8 min-h-[56px] flex items-center justify-center bg-white/[0.01] border border-white/[0.03] rounded-xl px-4 py-2">
            <AnimatePresence mode="wait">
              {completed ? (
                <motion.div
                  key="done"
                  initial={{ opacity: 0, scale: 0.95 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0 }}
                  className="flex items-center gap-2.5 text-emerald-400 text-xs font-mono uppercase tracking-wider font-bold"
                >
                  <ShieldCheck size={16} className="text-emerald-400 drop-shadow-[0_0_5px_rgba(16,185,129,0.5)]" />
                  Redirecionando para o Dashboard corporativo...
                </motion.div>
              ) : (
                <motion.div
                  key={messageIndex}
                  initial={{ opacity: 0, y: 6 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -6 }}
                  transition={{ duration: 0.2 }}
                  className="flex items-center gap-3 text-xs font-mono text-slate-300 tracking-wide text-center md:text-left"
                >
                  <div className="p-1.5 rounded-lg bg-white/[0.03] border border-white/[0.05] text-orange-500">
                    <CurrentIcon
                      size={14}
                      className={CurrentIcon === Loader2 ? "animate-spin text-orange-500" : ""}
                    />
                  </div>
                  <span className="truncate max-w-[320px]">{MESSAGES_MOCK[messageIndex].text}</span>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </motion.div>
      </div>

      <style jsx global>{`
        @keyframes shimmer {
          0% { background-position: 0 0; }
          100% { background-position: 32px 0; }
        }
      `}</style>
    </div>
  );
}