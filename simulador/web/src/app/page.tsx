"use client";

import React from 'react';
import { motion } from 'framer-motion';
import { 
  ArrowRight, ShieldAlert, BarChart3, Presentation, Landmark, Store
} from 'lucide-react';
import Link from 'next/link';

const LandingPage = () => {
  return (
    <div className="h-screen w-screen bg-[#080D17] text-white font-sans overflow-hidden relative flex flex-col justify-between selection:bg-orange-500/20 selection:text-orange-500">
      
      {/* --- GRID DE FUNDO & GLOWS --- */}
      <div
        className="absolute inset-0 opacity-[0.05] pointer-events-none"
        style={{
          backgroundImage: "radial-gradient(#ffffff 1px, transparent 1px)",
          backgroundSize: "34px 34px",
        }}
      />
      <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] bg-orange-500/10 blur-[120px] rounded-full pointer-events-none" />
      <div className="absolute bottom-[-10%] right-[-10%] w-[40%] h-[40%] bg-blue-500/10 blur-[120px] rounded-full pointer-events-none" />

      {/* --- NAVBAR --- */}
      <nav className="flex items-center justify-between px-6 lg:px-12 py-5 border-b border-white/5 bg-[#080D17]/80 backdrop-blur-md relative z-50 shrink-0">
        <div className="flex items-center gap-3">
          <div className="h-8 w-8 rounded-lg bg-orange-500 flex items-center justify-center font-black text-xs text-white shadow-lg shadow-orange-500/20">
            C
          </div>
          <div className="h-5 w-px bg-white/10 mx-1" />
          <span className="text-sm sm:text-lg font-black tracking-tighter uppercase">
            Simulador <span className="text-orange-500">EBITDA</span>
          </span>
        </div>
        
        <div className="flex items-center gap-3">
          <div className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
          <span className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-400">
            Dinâmica Presencial
          </span>
        </div>
      </nav>

      {/* --- CONTEÚDO PRINCIPAL (Coluna dupla, Fullscreen sem Scroll) --- */}
      <main className="flex-1 w-full max-w-7xl mx-auto px-6 lg:px-12 flex flex-col lg:flex-row items-center justify-center gap-8 lg:gap-16 relative z-10 overflow-hidden py-4">
        
        {/* COLUNA ESQUERDA: ALINHAMENTO DA DINÂMICA EM SALA */}
        <motion.div 
          initial={{ opacity: 0, x: -30 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.6 }}
          className="flex-1 space-y-6 text-center lg:text-left max-w-xl lg:max-w-none"
        >
          <div className="space-y-3">
            <span className="inline-block bg-orange-500/10 border border-orange-500/20 text-orange-400 font-black tracking-[0.25em] text-[9px] uppercase px-3 py-1.5 rounded-md italic">
              Rodada de Negócios
            </span>
            <h1 className="text-4xl md:text-5xl lg:text-6xl font-black text-white leading-[0.95] tracking-tighter italic uppercase">
              Simulador Comercial <br />
              <span className="text-orange-500 font-black not-italic tracking-normal">Cencosud</span>
            </h1>
          </div>
          
          <p className="text-xs md:text-sm text-slate-400 leading-relaxed font-medium">
            Cada mesa de trabalho representa uma operação de loja concorrente. Discutam a estratégia com sua equipe, definam a alocação do caixa de <strong>R$ 700 mil</strong>, planejem os investimentos de CAPEX e a margem comercial das categorias. O representante consolidará as decisões neste painel ao final de cada rodada.
          </p>

          {/* PARAMETROS DA REUNIÃO / DINÂMICA PRESENCIAL */}
          <div className="grid grid-cols-2 gap-3 pt-2 text-left">
            <div className="p-4 bg-white/5 border border-white/10 rounded-2xl flex items-start gap-3">
              <Presentation className="text-orange-500 shrink-0" size={18} />
              <div>
                <h4 className="text-[11px] font-black uppercase tracking-wider text-white">4 Lojas</h4>
                <p className="text-[10px] text-slate-500 font-medium">Competição direta por volume de vendas.</p>
              </div>
            </div>
            <div className="p-4 bg-white/5 border border-white/10 rounded-2xl flex items-start gap-3">
              <Landmark className="text-orange-500 shrink-0" size={18} />
              <div>
                <h4 className="text-[11px] font-black uppercase tracking-wider text-white">Caixa de R$ 700k</h4>
                <p className="text-[10px] text-slate-500 font-medium">Gestão de compra de estoque e ativos.</p>
              </div>
            </div>
            <div className="p-4 bg-white/5 border border-white/10 rounded-2xl flex items-start gap-3">
              <ShieldAlert className="text-orange-500 shrink-0" size={18} />
              <div>
                <h4 className="text-[11px] font-black uppercase tracking-wider text-white">SLA & Punições</h4>
                <p className="text-[10px] text-slate-500 font-medium">Dias sem vender por falhas operacionais.</p>
              </div>
            </div>
            <div className="p-4 bg-white/5 border border-white/10 rounded-2xl flex items-start gap-3">
              <BarChart3 className="text-orange-500 shrink-0" size={18} />
              <div>
                <h4 className="text-[11px] font-black uppercase tracking-wider text-white">Meta EBITDA</h4>
                <p className="text-[10px] text-slate-500 font-medium">Métrica final de rentabilidade da loja.</p>
              </div>
            </div>
          </div>
        </motion.div>

        {/* COLUNA DIREITA: ENTRADA DO GERENTE RESPONSÁVEL */}
        <motion.div 
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.6, delay: 0.1 }}
          className="w-full max-w-[420px] lg:max-w-[460px] bg-white/5 border border-white/10 p-6 lg:p-8 rounded-[2.5rem] shadow-[0_40px_100px_rgba(0,0,0,0.5)] relative overflow-hidden flex flex-col justify-between backdrop-blur-sm"
        >
          {/* Tarjeta laranja superior */}
          <div className="absolute top-0 left-0 right-0 h-1.5 bg-gradient-to-r from-orange-500 to-orange-600" />
          
          <div className="space-y-6 my-auto py-4">
            <div className="w-14 h-14 rounded-2xl bg-orange-500/10 border border-orange-500/20 flex items-center justify-center text-orange-500">
              <Store size={26} />
            </div>

            <div className="space-y-2">
              <h3 className="text-2xl font-black text-white uppercase italic tracking-tighter leading-tight">
                Painel da <br />
                <span className="text-orange-500">Unidade Comercial</span>
              </h3>
              <p className="text-xs text-slate-400 font-medium leading-relaxed">
                Acesse o sistema utilizando o código projetado na abertura da rodada para iniciar a configuração da sua loja.
              </p>
            </div>

            <div className="bg-[#0c1524] border border-white/5 p-4 rounded-xl flex items-center gap-3">
              <Presentation className="text-orange-400 shrink-0" size={18} />
              <p className="text-[11px] text-slate-400 font-bold leading-tight">
                Transcreva os dados do seu planejamento para o motor de processamento.
              </p>
            </div>

            <Link 
              href="/pages/registro-do-usuario" 
              className="group w-full flex items-center justify-center gap-3 bg-orange-500 text-white py-5 rounded-xl font-black text-xs uppercase tracking-wider italic hover:bg-orange-600 hover:shadow-xl hover:shadow-orange-500/10 transition-all active:scale-[0.99]"
            >
              Abrir Sistema de Mesa
              <ArrowRight size={16} className="group-hover:translate-x-1 transition-transform" />
            </Link>
          </div>

          {/* Status do terminal de mesa */}
          <div className="pt-4 border-t border-white/5 flex items-center justify-center gap-2">
            <div className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
            <span className="text-[9px] font-black uppercase tracking-[0.25em] text-slate-500">
              Terminal Operacional Conectado
            </span>
          </div>
        </motion.div>

      </main>

      {/* --- FOOTER --- */}
      <footer className="px-6 lg:px-12 py-4 border-t border-white/5 bg-[#050910] relative z-50 shrink-0 flex flex-col sm:flex-row justify-between items-center gap-3 text-center sm:text-left">
        <p className="text-[10px] font-black text-slate-500 uppercase tracking-widest italic">
          Cencosud — Sistema de Simulação de Negócios © 2026
        </p>
        <div className="flex gap-6 text-[9px] font-black text-slate-500 uppercase tracking-widest">
          <span>Suporte à Gestão de Lojas</span>
        </div>
      </footer>

    </div>
  );
};

export default LandingPage;