"use client";

import React, { useState } from "react";
import { useRouter } from "next/navigation";
import { ShieldCheck, Loader2, ChevronRight, UserCircle2 } from "lucide-react";
import { motion } from "framer-motion";

const SetupAdmin = () => {
  const [adminName, setAdminName] = useState("");
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  const handleCreateGame = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    
    if (!adminName.trim()) {
      alert("Por favor, identifique-se como facilitador.");
      return;
    }
    setLoading(true);
    try {
      const res = await fetch(
        `${process.env.NEXT_PUBLIC_API_URL}/minigame/create-session`,
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ adminName: adminName.trim() }),
        }
      );
      if (!res.ok) throw new Error("Erro ao criar sessão");
      const session = await res.json();
      localStorage.setItem("admin_session_id", session.id);
      localStorage.setItem("admin_name", adminName.trim());
      router.push("/pages/admin/dashboard");
    } catch (err) {
      console.error(err);
      alert("Erro ao iniciar simulação. Verifique o backend.");
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
            <ShieldCheck className="text-white" size={26} />
          </div>
          <div className="space-y-1.5">
            <h1 className="text-2xl sm:text-3xl font-black text-white tracking-tight uppercase italic">
              Painel <span className="text-orange-500 not-italic tracking-normal">Mestre</span>
            </h1>
            <p className="text-slate-400 text-xs sm:text-sm font-medium max-w-xs sm:max-w-sm mx-auto leading-relaxed">
              Configure e inicie a simulação operacional em tempo real.
            </p>
          </div>
        </div>

        {/* --- CARD PRINCIPAL --- */}
        <div className="bg-white/5 border border-white/10 rounded-[2rem] shadow-[0_30px_80px_rgba(0,0,0,0.6)] overflow-hidden backdrop-blur-md w-full">

          {/* HEAD DO CARD */}
          <div className="bg-gradient-to-r from-orange-500 to-orange-600 px-5 sm:px-7 py-4 sm:py-5 relative overflow-hidden">
            <div className="absolute right-[-20px] top-[-20px] opacity-[0.08] pointer-events-none select-none">
              <ShieldCheck size={140} className="text-white" />
            </div>
            <div className="relative z-10 flex items-center gap-3">
              <div className="w-10 h-10 sm:w-12 sm:h-12 rounded-xl bg-white/20 backdrop-blur-sm flex items-center justify-center shrink-0 text-white">
                <ShieldCheck size={20} />
              </div>
              <div>
                <p className="text-white font-black uppercase tracking-[0.2em] text-[10px] sm:text-xs">
                  Controle Administrativo
                </p>
                <p className="text-orange-100 text-[11px] sm:text-xs mt-0.5 font-medium">
                  Ambiente de gerenciamento da rodada
                </p>
              </div>
            </div>
          </div>

          {/* FORMULÁRIO */}
          <form onSubmit={handleCreateGame} className="p-5 sm:p-7 space-y-4 sm:space-y-5">
            <div className="space-y-2.5">
              <label className="ml-1 flex items-center gap-2 text-[10px] uppercase tracking-[0.2em] font-black text-white">
                <UserCircle2 size={12} className="text-orange-500" />
                Nome do facilitador
              </label>
              <div className="relative">
                <UserCircle2 size={16} className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" />
                <input
                  required
                  type="text"
                  value={adminName}
                  onChange={(e) => setAdminName(e.target.value)}
                  placeholder="Nome do administrador ou organizador"
                  className="w-full h-[52px] sm:h-[58px] bg-white/5 border-2 border-white/10 rounded-xl pl-11 pr-4 outline-none focus:border-orange-500 focus:bg-white/10 transition-all text-white font-semibold text-sm placeholder:text-white/20"
                />
              </div>
              <p className="text-[11px] text-slate-500 pl-1 leading-normal font-medium">
                Esse nome será utilizado como identificação do administrador da simulação.
              </p>
            </div>

            {/* BOTÃO ACTION */}
            <button
              type="submit"
              disabled={loading || !adminName.trim()}
              className="w-full cursor-pointer h-[52px] sm:h-[58px] rounded-xl bg-orange-500 hover:bg-orange-600 transition-all text-white font-black text-xs sm:text-sm uppercase tracking-wider italic flex items-center justify-center gap-2 shadow-md hover:shadow-lg hover:shadow-orange-500/10 disabled:opacity-40 disabled:cursor-not-allowed active:scale-[0.99] pt-0.5 mt-2 shrink-0"
            >
              {loading ? (
                <Loader2 className="animate-spin text-white" size={18} />
              ) : (
                <>
                  Iniciar Simulação
                  <ChevronRight className="text-white" size={16} />
                </>
              )}
            </button>

            {/* STATUS RODAPÉ */}
            <div className="pt-4 border-t border-white/5 flex items-center justify-center gap-2">
              <div className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
              <p className="text-[9px] uppercase tracking-[0.2em] font-black text-slate-500 text-center">
                Sistema Operacional Online
              </p>
            </div>
          </form>

        </div>
      </motion.div>
    </div>
  );
};

export default SetupAdmin;