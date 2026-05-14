"use client";

import React, { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import { Database, TrendingUp, Users, Cpu, Loader2 } from "lucide-react";

const messages = [
  { text: "Enviando planejamento para o servidor...", icon: Database },
  { text: "Calculando Market Share dos concorrentes...", icon: Users },
  { text: "Simulando fluxo de caixa e EBITDA...", icon: TrendingUp },
  { text: "IA analisando riscos operacionais...", icon: Cpu },
  { text: "Finalizando relatório da rodada...", icon: Loader2 },
];

export default function ProcessingPage() {
  const router = useRouter();
  const [progress, setProgress] = useState(0);
  const [messageIndex, setMessageIndex] = useState(0);

  useEffect(() => {
    // Barra: 5 segundos
    const progressTimer = setInterval(() => {
      setProgress((p) => {
        if (p >= 100) return 100;
        return p + 1;
      });
    }, 50);

    // Troca mensagens a cada 1.2s
    const messageTimer = setInterval(() => {
      setMessageIndex((i) => (i + 1) % messages.length);
    }, 1200);

    // Redireciona ao dashboard após 5.5s
    const redirectTimer = setTimeout(() => {
      router.push("/pages/dashboard");
    }, 5500);

    return () => {
      clearInterval(progressTimer);
      clearInterval(messageTimer);
      clearTimeout(redirectTimer);
    };
  }, [router]);

  const Icon = messages[messageIndex].icon;

  return (
    <div className="min-h-screen bg-[#F8FAFC] flex flex-col items-center justify-center p-6 relative overflow-hidden">

      {/* BG decorativo */}
      <div className="absolute inset-0 pointer-events-none opacity-[0.025] flex items-center justify-center">
        <img src="/imagens/logo.png" alt="" className="w-[700px] grayscale select-none" />
      </div>

      <div className="w-full max-w-md relative z-10 text-center space-y-10">

        {/* Logo pulsante */}
        <motion.div
          animate={{ scale: [1, 1.04, 1], opacity: [0.85, 1, 0.85] }}
          transition={{ duration: 2.2, repeat: Infinity, ease: "easeInOut" }}
          className="flex justify-center"
        >
          <img src="/imagens/logo.png" alt="Logo" className="h-12 object-contain" />
        </motion.div>

        {/* Título */}
        <div className="space-y-2">
          <h2 className="text-3xl font-black italic uppercase tracking-tight text-[#001F3F]">
            Processando{" "}
            <span className="text-orange-500">Simulação</span>
          </h2>
          <p className="text-[10px] font-black text-gray-400 uppercase tracking-[0.4em]">
            Aguarde o encerramento da rodada
          </p>
        </div>

        {/* Barra de progresso */}
        <div className="space-y-2">
          <div className="relative h-3 bg-gray-200 rounded-full overflow-hidden border border-gray-100">
            <motion.div
              className="absolute inset-y-0 left-0 bg-gradient-to-r from-[#001F3F] to-blue-400 rounded-full"
              style={{ boxShadow: "0 0 12px rgba(0,80,157,0.35)" }}
              initial={{ width: "0%" }}
              animate={{ width: `${progress}%` }}
              transition={{ ease: "linear" }}
            />
          </div>
          <div className="flex justify-between font-mono text-[10px] font-black text-[#001F3F] opacity-40">
            <span>{progress}% COMPLETO</span>
            <span>~{((100 - progress) * 0.05).toFixed(1)}s</span>
          </div>
        </div>

        {/* Mensagem dinâmica */}
        <div className="h-14 flex items-center justify-center">
          <AnimatePresence mode="wait">
            <motion.div
              key={messageIndex}
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -8 }}
              transition={{ duration: 0.25 }}
              className="flex items-center gap-3 bg-white px-6 py-3.5 rounded-2xl shadow-sm border border-gray-100"
            >
              <span className="text-orange-500">
                <Icon
                  size={17}
                  className={messageIndex === 4 ? "animate-spin" : ""}
                />
              </span>
              <span className="text-sm font-bold text-[#001F3F]">
                {messages[messageIndex].text}
              </span>
            </motion.div>
          </AnimatePresence>
        </div>
      </div>

      {/* Rodapé */}
      <div className="fixed bottom-8 flex items-center gap-2 text-[10px] font-black text-gray-300 tracking-widest uppercase">
        <Cpu size={11} /> Simulador EBITDA v1.0
      </div>
    </div>
  );
}