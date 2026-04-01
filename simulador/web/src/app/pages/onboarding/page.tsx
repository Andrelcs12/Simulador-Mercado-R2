"use client";

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Settings2, ShoppingCart, BarChart3, CheckCircle2, 
  ArrowRight, ArrowLeft, Info 
} from 'lucide-react';

// Importação dos subcomponentes
import SetupStep from './components/SetupStep';
import ComercialStep from './components/ComercialStep';
import SummaryStep from './components/SummaryStep';

// --- INTERFACES PARA TIPAGEM DE ELITE ---
interface CategoriaConfig {
  estoque: number;
  margem: number;
}

interface AppConfig {
  capex: Record<string, number>;
  comercial: {
    pereciveis: CategoriaConfig;
    mercearia: CategoriaConfig;
    higiene: CategoriaConfig;
    bebidas: CategoriaConfig;
  };
}

const OnboardingPage = () => {
  const router = useRouter();
  const [step, setStep] = useState(1);
  
  // ESTADO GLOBAL TIPADO - A fonte da verdade do simulador
  const [config, setConfig] = useState<AppConfig>({
    capex: {
      seguranca: 0,
      ti: 0,
      logistica: 0,
      marketing: 0
    },
    comercial: {
      pereciveis: { estoque: 0, margem: 0 },
      mercearia: { estoque: 0, margem: 0 },
      higiene: { estoque: 0, margem: 0 },
      bebidas: { estoque: 0, margem: 0 }
    }
  });

  const nextStep = () => setStep((p) => Math.min(p + 1, 3));
  const prevStep = () => setStep((p) => Math.max(p - 1, 1));

  // FUNÇÃO DE FINALIZAÇÃO
  const handleFinalize = () => {
    // Aqui você enviaria os dados para o seu backend NestJS no futuro
    // console.log("Enviando config:", config);
    
    // Redireciona para a tela de processamento que criamos
    router.push('/pages/onboarding/processing');
  };

  const stepsInfo = [
    { id: 1, label: 'Infraestrutura', icon: <Settings2 size={18} /> },
    { id: 2, label: 'Comercial', icon: <ShoppingCart size={18} /> },
    { id: 3, label: 'Revisão', icon: <BarChart3 size={18} /> },
  ];

  return (
    <div className="min-h-screen bg-[#F8FAFC] flex flex-col font-sans selection:bg-cencosud-orange selection:text-white">
      
      {/* NAV / STEPPER */}
      <nav className="bg-white border-b border-gray-100 px-8 py-4 flex items-center justify-between sticky top-0 z-50 shadow-sm">
        <div className="flex items-center gap-4">
          <img src="/imagens/logo.png" alt="Cencosud" className="h-8" />
          <div className="h-6 w-px bg-gray-200" />
          <h1 className="text-cencosud-blue font-black uppercase tracking-tighter italic text-sm md:text-base">
            Configuração <span className="text-cencosud-orange">Rodada 01</span>
          </h1>
        </div>

        <div className="hidden md:flex items-center gap-8">
          {stepsInfo.map((s) => (
            <div key={s.id} className={`flex items-center gap-2 transition-all ${step >= s.id ? 'text-cencosud-blue' : 'text-gray-300'}`}>
              <div className={`w-8 h-8 rounded-full flex items-center justify-center font-black text-xs border-2 transition-colors ${step >= s.id ? 'border-cencosud-blue bg-blue-50' : 'border-gray-200'}`}>
                {step > s.id ? <CheckCircle2 size={14} /> : s.id}
              </div>
              <span className="text-[10px] font-black uppercase tracking-widest">{s.label}</span>
            </div>
          ))}
        </div>

        <div className="flex items-center gap-2 bg-blue-50 px-4 py-2 rounded-xl text-cencosud-blue font-bold text-xs border border-blue-100">
           <Info size={14} className="text-cencosud-orange" />
           <span className="hidden sm:inline">Orçamento:</span> 
           <span className="ml-1 text-black font-black font-mono">R$ 700.000</span>
        </div>
      </nav>

      {/* RENDERIZAÇÃO DINÂMICA DOS PASSOS */}
      <main className="flex-grow flex items-center justify-center p-4 lg:p-12 overflow-x-hidden">
        <div className="w-full max-w-5xl">
          <AnimatePresence mode="wait">
            <motion.div
              key={step}
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              transition={{ duration: 0.3, ease: "easeInOut" }}
            >
              {step === 1 && <SetupStep config={config} setConfig={setConfig} />}
              {step === 2 && <ComercialStep config={config} setConfig={setConfig} />}
              {step === 3 && <SummaryStep config={config} />}
            </motion.div>
          </AnimatePresence>
        </div>
      </main>

      {/* FOOTER DE AÇÕES */}
      <footer className="bg-white border-t border-gray-100 p-6 px-12 flex justify-between items-center sticky bottom-0 z-50">
        <button 
          onClick={prevStep}
          disabled={step === 1}
          className={`cursor-pointer flex items-center gap-2 px-6 py-3 rounded-2xl font-black text-sm transition-all ${step === 1 ? 'opacity-0 pointer-events-none' : 'text-gray-400 hover:text-cencosud-blue hover:bg-gray-50'}`}
        >
          <ArrowLeft size={18} /> Voltar
        </button>

        <div className="flex flex-col items-center">
          <span className="text-[9px] font-black text-gray-300 uppercase tracking-[0.3em]">Progresso Operacional</span>
          <div className="w-32 h-1.5 bg-gray-100 rounded-full mt-2 overflow-hidden">
            <motion.div 
              className="h-full bg-cencosud-orange" 
              animate={{ width: `${(step / 3) * 100}%` }}
              transition={{ type: "spring", stiffness: 100 }}
            />
          </div>
        </div>

        {step < 3 ? (
          <button 
            onClick={nextStep}
            className="cursor-pointer group flex items-center gap-3 bg-cencosud-blue text-white px-8 py-4 rounded-2xl font-black text-sm md:text-base hover:shadow-xl hover:shadow-blue-100 transition-all active:scale-95"
          >
            Próximo Passo 
            <ArrowRight size={20} className="group-hover:translate-x-1 transition-transform" />
          </button>
        ) : (
          <button 
            onClick={handleFinalize}
            className="cursor-pointer flex items-center gap-3 bg-green-600 text-white px-8 py-4 rounded-2xl font-black text-sm md:text-base hover:shadow-xl hover:shadow-green-100 transition-all hover:bg-green-700 active:scale-95"
          >
            Finalizar Planejamento <CheckCircle2 size={20} />
          </button>
        )}
      </footer>

      {/* MARCA D'ÁGUA DE FUNDO */}
      <div className="fixed top-1/2 left-0 -translate-y-1/2 opacity-[0.015] pointer-events-none -ml-40 select-none">
        <img src="/imagens/logo.png" alt="" className="w-[700px] rotate-90" />
      </div>
    </div>
  );
};

export default OnboardingPage;