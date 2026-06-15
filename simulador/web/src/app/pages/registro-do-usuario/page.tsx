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
      // sessionStorage isola a identidade por ABA — evita que duas contas
      // abertas em abas diferentes do mesmo navegador sobrescrevam uma à outra.
      sessionStorage.setItem("player_data", JSON.stringify(data));
      router.push("/pages/lobby");
    } catch (err: any) {
      alert(err.message || "Erro na conexão");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen w-full bg-[#080D17] flex items-center justify-center px-4 py-6 sm:py-8 overflow-x-hidden overflow-y-auto relative">

      {/* --- BG EFFECT (Glows controlados para evitar overflow-x) --- */}
      <div className="absolute inset-0 w-full h-full overflow-hidden pointer-events-none select-none z-0">
        <div
          className="absolute inset-0 opacity-[0.08]"
          style={{
            backgroundImage: "radial-gradient(#ffffff 1px, transparent 1px)",
            backgroundSize: "34px 34px",
          }}
        />
        <div className="absolute top-[-10%] left-[-10%] w-[70%] sm:w-[40%] h-[30%] bg-orange-500/10 blur-[100px] rounded-full" />
        <div className="absolute bottom-[-10%] right-[-10%] w-[70%] sm:w-[40%] h-[30%] bg-blue-500/10 blur-[100px] rounded-full" />
      </div>

      <motion.div
        initial={{ opacity: 0, y: 15 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4 }}
        className="relative w-full max-w-[480px] my-auto z-10"
      >
        {/* --- HEADER --- */}
        <div className="text-center mb-6 sm:mb-8">
          <div className="w-14 h-14 sm:w-18 sm:h-18 rounded-2xl bg-orange-500 mx-auto flex items-center justify-center shadow-lg shadow-orange-500/20 mb-4 shrink-0">
            <Store className="text-white" size={26} />
          </div>
          <h1 className="text-2xl sm:text-3xl font-black text-white tracking-tight uppercase italic">
            Acesso à <span className="text-orange-500 not-italic tracking-normal">Simulação</span>
          </h1>
          <p className="text-slate-400 text-xs sm:text-sm font-medium max-w-xs sm:max-w-sm mx-auto leading-relaxed mt-2">
            Identifique os dados da sua unidade para sincronizar o terminal operacional.
          </p>
        </div>

        {/* --- CARD PRINCIPAL --- */}
        <div className="bg-white/5 border border-white/10 rounded-[2rem] shadow-[0_30px_80px_rgba(0,0,0,0.6)] overflow-hidden backdrop-blur-md w-full">

          {/* HEAD DO CARD */}
          <div className="bg-gradient-to-r from-orange-500 to-orange-600 px-5 sm:px-7 py-4 sm:py-5 relative overflow-hidden">
            <div className="absolute right-[-20px] top-[-20px] opacity-[0.08] pointer-events-none select-none">
              <Store size={140} className="text-white" />
            </div>
            <div className="relative z-10 flex items-center gap-3">
              <div className="w-10 h-10 sm:w-12 sm:h-12 rounded-xl bg-white/20 backdrop-blur-sm flex items-center justify-center shrink-0 text-white">
                <Store size={20} />
              </div>
              <div>
                <p className="text-white font-black uppercase tracking-[0.2em] text-[10px] sm:text-xs">
                  Terminal do Participante
                </p>
                <p className="text-orange-100 text-[11px] sm:text-xs mt-0.5 font-medium">
                  Insira as credenciais da sua equipe
                </p>
              </div>
            </div>
          </div>

          {/* FORMULÁRIO */}
          <form onSubmit={handleSubmit} className="p-5 sm:p-7 space-y-4 sm:space-y-5">

            {/* CÓDIGO DA SESSÃO */}
            <div>
              <label className="ml-1 flex items-center gap-2 text-[10px] uppercase tracking-[0.2em] font-black text-orange-400">
                <Hash size={12} />
                Código da sessão
              </label>
              <div className="relative mt-1.5">
                <Hash size={16} className="absolute left-4 top-1/2 -translate-y-1/2 text-orange-400" />
                <input
                  required
                  maxLength={4}
                  type="text"
                  value={formData.sessionCode}
                  onChange={(e) => setFormData({ ...formData, sessionCode: e.target.value.toUpperCase() })}
                  placeholder="EX: ABCD"
                  className="w-full h-[52px] sm:h-[58px] bg-white/5 border-2 border-white/10 rounded-xl pl-11 pr-4 outline-none focus:border-orange-500 focus:bg-white/10 transition-all text-orange-400 placeholder:text-white/15 font-black tracking-[0.3em] text-lg uppercase"
                />
              </div>
            </div>

            {/* NOME DO GERENTE */}
            <div>
              <label className="ml-1 flex items-center gap-2 text-[10px] uppercase tracking-[0.2em] font-black text-white">
                <User size={12} className="text-orange-500" />
                Nome do Representante
              </label>
              <div className="relative mt-1.5">
                <User size={16} className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" />
                <input
                  required
                  type="text"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  placeholder="Seu nome completo"
                  className="w-full h-[52px] sm:h-[58px] bg-white/5 border-2 border-white/10 rounded-xl pl-11 pr-4 outline-none focus:border-orange-500 focus:bg-white/10 transition-all text-white font-semibold text-sm placeholder:text-white/20"
                />
              </div>
            </div>

            {/* NOME DA UNIDADE */}
            <div>
              <label className="ml-1 flex items-center gap-2 text-[10px] uppercase tracking-[0.2em] font-black text-white">
                <Store size={12} className="text-orange-500" />
                Nome da Unidade Comercial
              </label>
              <div className="relative mt-1.5">
                <Store size={16} className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" />
                <input
                  required
                  type="text"
                  value={formData.storeName}
                  onChange={(e) => setFormData({ ...formData, storeName: e.target.value })}
                  placeholder="EX: Loja Norte ou Equipe 01"
                  className="w-full h-[52px] sm:h-[58px] bg-white/5 border-2 border-white/10 rounded-xl pl-11 pr-4 outline-none focus:border-orange-500 focus:bg-white/10 transition-all text-white font-semibold text-sm placeholder:text-white/20"
                />
              </div>
            </div>

            {/* BOTÃO SUBMIT */}
            <button
              type="submit"
              disabled={loading || !formData.sessionCode || !formData.name || !formData.storeName}
              className="w-full cursor-pointer h-[52px] sm:h-[58px] rounded-xl bg-orange-500 hover:bg-orange-600 transition-all text-white font-black text-xs sm:text-sm uppercase tracking-wider italic flex items-center justify-center gap-2 shadow-md hover:shadow-lg hover:shadow-orange-500/10 disabled:opacity-40 disabled:cursor-not-allowed active:scale-[0.99] pt-0.5 mt-2 shrink-0"
            >
              {loading ? (
                <Loader2 className="animate-spin text-white" size={18} />
              ) : (
                <>
                  Acessar Simulador
                  <ArrowRight className="text-white" size={16} />
                </>
              )}
            </button>

            {/* STATUS RODAPÉ */}
            <div className="pt-4 border-t border-white/5 flex items-center justify-center gap-2">
              <div className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
              <p className="text-[9px] uppercase tracking-[0.2em] font-black text-slate-500 text-center">
                Terminal Conectado
              </p>
            </div>

          </form>
        </div>
      </motion.div>
    </div>
  );
};

export default RegistroUsuario;