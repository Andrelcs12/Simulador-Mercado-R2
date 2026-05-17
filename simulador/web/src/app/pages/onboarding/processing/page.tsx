"use client";

import React, { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import { Database, TrendingUp, Users, Cpu, Loader2 } from "lucide-react";

const messages = [
  { text: "Enviando planejamento...", icon: Database },
  { text: "Calculando mercado...", icon: Users },
  { text: "Simulando EBITDA...", icon: TrendingUp },
  { text: "Analisando operação...", icon: Cpu },
  { text: "Finalizando rodada...", icon: Loader2 },
];

export default function ProcessingPage() {
  const router = useRouter();
  const [progress, setProgress] = useState(0);
  const [messageIndex, setMessageIndex] = useState(0);

  useEffect(() => {
    const p = setInterval(() => {
      setProgress((x) => Math.min(100, x + 2));
    }, 80);

    const m = setInterval(() => {
      setMessageIndex((i) => (i + 1) % messages.length);
    }, 1200);

    const t = setTimeout(() => {
      router.push("/pages/dashboard");
    }, 5000);

    return () => {
      clearInterval(p);
      clearInterval(m);
      clearTimeout(t);
    };
  }, [router]);

  const Icon = messages[messageIndex].icon;

  return (
    <div className="min-h-screen flex items-center justify-center bg-[#F8FAFC]">
      <div className="w-full max-w-md text-center space-y-8">

        <motion.div
          animate={{ scale: [1, 1.05, 1] }}
          transition={{ repeat: Infinity, duration: 2 }}
        >
          <img src="/imagens/logo.png" className="h-10 mx-auto" />
        </motion.div>

        <div className="text-2xl font-black text-[#001F3F]">
          Processando rodada
        </div>

        <div className="h-2 bg-gray-200 rounded-full overflow-hidden">
          <motion.div
            className="h-full bg-blue-600"
            animate={{ width: `${progress}%` }}
          />
        </div>

        <AnimatePresence mode="wait">
          <motion.div
            key={messageIndex}
            className="flex items-center justify-center gap-2 text-sm font-bold"
          >
            <Icon size={16} />
            {messages[messageIndex].text}
          </motion.div>
        </AnimatePresence>
      </div>
    </div>
  );
}