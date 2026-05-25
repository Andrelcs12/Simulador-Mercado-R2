"use client";

import React, { useState } from "react";
import { motion } from "framer-motion";
import { ArrowRight, Store, User, Loader2, Hash } from "lucide-react";
import { useRouter } from "next/navigation";

const RegistroUsuario = () => {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    sessionCode: "",
    name: "",
    storeName: "",
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:4000";
      const response = await fetch(`${API_URL}/minigame/register`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          sessionCode: formData.sessionCode.toUpperCase(),
          name: formData.name,
          storeName: formData.storeName,
          role: "STORE_MANAGER",
        }),
      });
      const data = await response.json();
      if (!response.ok) throw new Error(data.message || "Erro ao entrar na sala");
      localStorage.setItem("player_data", JSON.stringify(data));
      router.push("/pages/lobby");
    } catch (err: any) {
      alert(err.message || "Erro na conexão");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#080D17] flex items-center justify-center px-4 py-8 overflow-hidden relative">

      {/* BG */}
      <div
        className="absolute inset-0 opacity-[0.08] pointer-events-none"
        style={{
          backgroundImage: "radial-gradient(#ffffff 1px, transparent 1px)",
          backgroundSize: "34px 34px",
        }}
      />

      <div className="absolute top-[-120px] left-[-120px] w-[280px] h-[280px] bg-orange-500/10 blur-3xl rounded-full" />
      <div className="absolute bottom-[-120px] right-[-120px] w-[280px] h-[280px] bg-blue-500/10 blur-3xl rounded-full" />

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.35 }}
        className="relative w-full max-w-[500px]"
      >
        {/* HEADER */}
        <div className="text-center mb-8">
          <div className="w-20 h-20 rounded-[2rem] bg-orange-500 mx-auto flex items-center justify-center shadow-xl mb-6">
            <Store className="text-white" size={34} />
          </div>
          <h1 className="text-3xl sm:text-4xl font-black text-white tracking-tight leading-tight">
            Entrada da <span className="text-orange-500">Simulação</span>
          </h1>
          <p className="text-slate-400 text-sm sm:text-base font-medium max-w-md mx-auto leading-relaxed mt-3">
            Identifique sua unidade para acessar a rodada em tempo real.
          </p>
        </div>

        {/* CARD */}
        <div className="bg-white/5 border border-white/10 rounded-[2.5rem] shadow-[0_20px_60px_rgba(0,0,0,0.4)] overflow-hidden backdrop-blur-sm">

          {/* TOP BAR */}
          <div className="bg-gradient-to-r from-orange-500 to-orange-600 px-7 py-6 relative overflow-hidden">
            <div className="absolute right-0 top-0 opacity-[0.1]">
              <Store size={160} className="text-white" />
            </div>
            <div className="relative z-10 flex items-center gap-4">
              <div className="w-14 h-14 rounded-2xl bg-white/20 backdrop-blur-sm flex items-center justify-center">
                <Store className="text-white" size={28} />
              </div>
              <div>
                <p className="text-white font-black uppercase tracking-[0.25em] text-xs">
                  Acesso da Loja
                </p>
                <p className="text-orange-100 text-sm mt-1">
                  Painel operacional do participante
                </p>
              </div>
            </div>
          </div>

          {/* FORM */}
          <form onSubmit={handleSubmit} className="p-6 sm:p-8 space-y-5">

            {/* SESSION */}
            <div>
              <label className="ml-1 flex items-center gap-2 text-[11px] uppercase tracking-[0.25em] font-black text-orange-400">
                <Hash size={14} />
                Código da sessão
              </label>
              <div className="relative mt-3">
                <Hash size={18} className="absolute left-5 top-1/2 -translate-y-1/2 text-orange-400" />
                <input
                  required
                  maxLength={4}
                  type="text"
                  value={formData.sessionCode}
                  onChange={(e) => setFormData({ ...formData, sessionCode: e.target.value.toUpperCase() })}
                  placeholder="DIGITE O CÓDIGO"
                  className="w-full h-[62px] bg-white/10 border-2 border-white/10 rounded-2xl pl-14 pr-5 outline-none focus:border-orange-500 focus:bg-white/15 transition-all text-orange-400 placeholder:text-white/20 font-black tracking-[0.30em] text-xl uppercase"
                />
              </div>
            </div>

            {/* NAME */}
            <div>
              <label className="ml-1 flex items-center gap-2 text-[11px] uppercase tracking-[0.25em] font-black text-white">
                <User size={14} className="text-orange-400" />
                Nome do gerente
              </label>
              <div className="relative mt-3">
                <User size={18} className="absolute left-5 top-1/2 -translate-y-1/2 text-slate-400" />
                <input
                  required
                  type="text"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  placeholder="Seu nome de identificação"
                  className="w-full h-[62px] bg-white/10 border-2 border-white/10 rounded-2xl pl-14 pr-5 outline-none focus:border-orange-500 focus:bg-white/15 transition-all text-white font-semibold placeholder:text-white/25"
                />
              </div>
            </div>

            {/* STORE */}
            <div>
              <label className="ml-1 flex items-center gap-2 text-[11px] uppercase tracking-[0.25em] font-black text-white">
                <Store size={14} className="text-orange-400" />
                Nome da unidade
              </label>
              <div className="relative mt-3">
                <Store size={18} className="absolute left-5 top-1/2 -translate-y-1/2 text-slate-400" />
                <input
                  required
                  type="text"
                  value={formData.storeName}
                  onChange={(e) => setFormData({ ...formData, storeName: e.target.value })}
                  placeholder="Identificação da loja ou equipe"
                  className="w-full h-[62px] bg-white/10 border-2 border-white/10 rounded-2xl pl-14 pr-5 outline-none focus:border-orange-500 focus:bg-white/15 transition-all text-white font-semibold placeholder:text-white/25"
                />
              </div>
            </div>

            {/* BUTTON */}
            <button
              type="submit"
              disabled={loading || !formData.sessionCode || !formData.name || !formData.storeName}
              className="w-full cursor-pointer h-[62px] rounded-2xl bg-orange-500 hover:bg-orange-400 transition-all text-white font-black text-sm sm:text-base flex items-center justify-center gap-3 shadow-lg disabled:opacity-50 disabled:cursor-not-allowed active:scale-[0.99] mt-2"
            >
              {loading ? (
                <Loader2 className="animate-spin text-white" size={22} />
              ) : (
                <>
                  Entrar na Simulação
                  <ArrowRight className="text-white" size={20} />
                </>
              )}
            </button>

            {/* STATUS */}
            <div className="pt-6 border-t border-white/10 flex items-center justify-center gap-3">
              <div className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
              <p className="text-[10px] uppercase tracking-[0.30em] font-black text-slate-500 text-center">
                Sistema operacional online
              </p>
            </div>

          </form>
        </div>
      </motion.div>
    </div>
  );
};

export default RegistroUsuario;