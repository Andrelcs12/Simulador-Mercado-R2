"use client";

import React, { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import {
  Database,
  TrendingUp,
  Users,
  Cpu,
  Loader2,
  CheckCircle2,
} from "lucide-react";

const messages = [
  { text: "Enviando planejamento...", icon: Database },
  { text: "Calculando mercado...", icon: Users },
  { text: "Simulando EBITDA...", icon: TrendingUp },
  { text: "Analisando operação...", icon: Cpu },
  { text: "Finalizando rodada...", icon: Loader2 },
];

export default function ProcessingPage() {
  const router = useRouter();

  const [progress, setProgress] = useState(8);
  const [messageIndex, setMessageIndex] = useState(0);
  const [completed, setCompleted] = useState(false);

  useEffect(() => {
    const p = setInterval(() => {
      setProgress((prev) => {
        // trava em 92 até confirmar finalização
        if (prev >= 92) return 92;
        return prev + 2;
      });
    }, 120);

    const m = setInterval(() => {
      setMessageIndex((i) => (i + 1) % messages.length);
    }, 1400);

    const roundFinished = localStorage.getItem("round_finished");

    // backend/finalização simulada
    const wait = setTimeout(() => {
      localStorage.setItem("round_finished", "true");
      setCompleted(true);
      setProgress(100);
    }, 4500);

    return () => {
      clearInterval(p);
      clearInterval(m);
      clearTimeout(wait);
    };
  }, []);

  useEffect(() => {
    if (!completed) return;

    const t = setTimeout(() => {
      router.push("/pages/dashboard");
    }, 1500);

    return () => clearTimeout(t);
  }, [completed, router]);

  const Icon = messages[messageIndex].icon;

  return (
    <div className="min-h-screen bg-[#F8FAFC] flex items-center justify-center px-6">

      <div className="w-full max-w-md">

        <motion.div
          initial={{ opacity: 0, y: 18 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-white rounded-3xl border border-slate-200 shadow-sm p-8"
        >

          {/* LOGO */}
          <motion.div
            animate={{ scale: [1, 1.03, 1] }}
            transition={{ repeat: Infinity, duration: 2.4 }}
            className="flex justify-center"
          >
            <img
              src="/imagens/logo.png"
              className="h-10 object-contain"
            />
          </motion.div>

          {/* TITLE */}
          <div className="mt-8 text-center">
            <h1 className="text-2xl font-black text-[#001F3F]">
              {completed
                ? "Rodada finalizada"
                : "Processando rodada"}
            </h1>

            <p className="text-sm text-slate-500 mt-2">
              {completed
                ? "Resultados sincronizados com sucesso."
                : "Aguarde enquanto os cálculos da simulação são executados."}
            </p>
          </div>

          {/* PROGRESS */}
          <div className="mt-8">
            <div className="flex items-center justify-between mb-2">
              <span className="text-xs font-bold uppercase tracking-wide text-slate-400">
                Progresso
              </span>

              <span className="text-sm font-black text-[#001F3F]">
                {progress}%
              </span>
            </div>

            <div className="h-2 rounded-full overflow-hidden bg-slate-100">
              <motion.div
                className={`h-full ${
                  completed
                    ? "bg-emerald-500"
                    : "bg-orange-500"
                }`}
                animate={{ width: `${progress}%` }}
                transition={{ duration: 0.3 }}
              />
            </div>
          </div>

          {/* STATUS */}
          <div className="mt-8 min-h-[48px] flex items-center justify-center">

            <AnimatePresence mode="wait">

              {completed ? (
                <motion.div
                  key="done"
                  initial={{ opacity: 0, y: 8 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0 }}
                  className="flex items-center gap-2 text-emerald-600 font-bold"
                >
                  <CheckCircle2 size={18} />
                  Redirecionando para o dashboard...
                </motion.div>
              ) : (
                <motion.div
                  key={messageIndex}
                  initial={{ opacity: 0, y: 8 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0 }}
                  className="flex items-center gap-2 text-sm font-bold text-slate-700"
                >
                  <Icon
                    size={16}
                    className={
                      Icon === Loader2
                        ? "animate-spin"
                        : ""
                    }
                  />

                  {messages[messageIndex].text}
                </motion.div>
              )}

            </AnimatePresence>

          </div>

        </motion.div>

      </div>

    </div>
  );
}