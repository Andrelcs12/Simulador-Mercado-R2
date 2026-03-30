"use client";
import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import { ShieldCheck, Loader2, ChevronRight, UserCircle2 } from 'lucide-react';
import { motion } from 'framer-motion';

const SetupAdmin = () => {
  const [adminName, setAdminName] = useState('');
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  const handleCreateGame = async () => {
    if (!adminName.trim()) return alert("Por favor, identifique-se como facilitador.");

    setLoading(true);
    try {
      // 1. Criar a sessão no Backend (NestJS)
      const res = await fetch('http://localhost:4000/minigame/create-session', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ adminName: adminName.trim() }) 
      });

      if (!res.ok) throw new Error("Erro ao conectar com o servidor");
      
      const session = await res.json();

      // 2. Persistência Local (Crucial para o Dashboard e Sockets)
      localStorage.setItem(`admin_session_id`, session.id);
      localStorage.setItem(`admin_name`, adminName.trim());
      
      // 3. Redirecionamento para o Dashboard de Controle
      router.push(`/pages/admin/dashboard`); 

    } catch (error) {
      console.error(error);
      alert("Falha ao criar ambiente de simulação. Verifique se o servidor backend está rodando na porta 4000.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#002350] flex items-center justify-center p-6 font-sans relative overflow-hidden">
      
        {/* Efeito de Fundo - Grid Corporativo */}
<div 
  className="absolute inset-0 opacity-10 pointer-events-none" 
  style={{ 
    backgroundImage: 'radial-gradient(#ffffff 1px, transparent 1px)', 
    backgroundSize: '40px 40px' 
  }} 
/>

      <motion.div 
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        className="bg-white p-10 md:p-14 rounded-[3rem] shadow-[0_50px_100px_rgba(0,0,0,0.5)] w-full max-w-xl relative z-10 border-b-[8px] border-orange-500"
      >
        {/* Marca d'água de Segurança */}
        <div className="absolute top-0 right-0 p-10 opacity-[0.03] pointer-events-none">
          <ShieldCheck size={180} className="text-[#002350]" />
        </div>

        {/* Cabeçalho */}
        <div className="mb-12 relative">
          <div className="flex items-center gap-3 mb-4">
             <div className="w-12 h-12 bg-[#002350] rounded-2xl flex items-center justify-center shadow-lg shadow-blue-900/20">
                <ShieldCheck className="text-orange-500" size={28} />
             </div>
             <h1 className="text-3xl font-black text-[#002350] italic tracking-tighter uppercase leading-none">
                Master <span className="text-orange-500">Setup</span>
             </h1>
          </div>
          <p className="text-slate-400 font-bold text-[10px] uppercase tracking-[0.3em] ml-1">
            Cencosud Simulation Protocol v2.0
          </p>
        </div>

        {/* Formulário */}
        <div className="space-y-8">
          <div className="space-y-3">
            <label className="text-[11px] font-black text-[#002350]/60 uppercase ml-5 flex items-center gap-2">
              <UserCircle2 size={14} className="text-orange-500" /> Identificação do Facilitador
            </label>
            <input 
              value={adminName}
              onChange={(e) => setAdminName(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && handleCreateGame()}
              placeholder="Ex: Consultor Técnico Cencosud"
              className="w-full bg-slate-50 p-6 rounded-[2.2rem] outline-none border-2 border-slate-100 focus:border-orange-500 focus:bg-white transition-all font-bold text-[#002350] shadow-inner text-lg placeholder:text-slate-300"
            />
          </div>

          <button 
            onClick={handleCreateGame}
            disabled={loading || !adminName.trim()}
            className="w-full bg-[#002350] hover:bg-[#00357a] text-white p-7 rounded-[2.2rem] font-black text-xl flex items-center justify-center gap-4 transition-all shadow-2xl hover:shadow-blue-900/30 disabled:opacity-30 disabled:cursor-not-allowed group relative overflow-hidden"
          >
            {loading ? (
              <Loader2 className="animate-spin text-orange-500" size={32} />
            ) : (
              <>
                <span className="relative z-10 italic">GERAR AMBIENTE OPERACIONAL</span>
                <ChevronRight className="relative z-10 group-hover:translate-x-2 transition-transform text-orange-500" size={24} />
              </>
            )}
            
            {/* Efeito de brilho no hover */}
            <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/5 to-transparent -translate-x-full group-hover:translate-x-full transition-transform duration-1000" />
          </button>
        </div>

        {/* Rodapé de Branding */}
        <div className="mt-14 pt-10 border-t border-slate-100 flex items-center justify-between opacity-60">
          <div className="flex items-center gap-2">
            <div className="w-2 h-2 bg-emerald-500 rounded-full animate-pulse" />
            <span className="text-[9px] font-black text-[#002350] tracking-widest uppercase italic">Sistema Cencosud Online</span>
          </div>
          <span className="text-[9px] font-black italic text-slate-400 uppercase tracking-widest">
            DeDev <span className="text-orange-500">Protocol</span>
          </span>
        </div>
      </motion.div>
    </div>
  );
};

export default SetupAdmin;