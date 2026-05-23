"use client";

import React, { useState } from "react";
import { useRouter } from "next/navigation";
import { ShieldCheck, Loader2, ChevronRight, UserCircle2 } from "lucide-react";
import { motion } from "framer-motion";

const SetupAdmin = () => {
  const [adminName, setAdminName] = useState("");
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  const handleCreateGame = async () => {
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
    <div className="min-h-screen bg-[#080D17] flex items-center justify-center px-4 py-8 overflow-hidden relative">

      {/* BG EFFECT */}
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
        transition={{ duration: 0.4 }}
        className="relative w-full max-w-[520px]"
      >
        {/* HEADER */}
        <div className="text-center mb-8">
          <div className="w-20 h-20 rounded-[2rem] bg-orange-500 mx-auto flex items-center justify-center shadow-xl mb-6">
            <ShieldCheck className="text-white" size={36} />
          </div>
          <div className="space-y-2">
            <h1 className="text-3xl sm:text-4xl font-black text-white tracking-tight leading-tight">
              Painel <span className="text-orange-500">Mestre</span>
            </h1>
            <p className="text-slate-400 text-sm sm:text-base font-medium max-w-md mx-auto leading-relaxed">
              Configure e inicie a simulação operacional em tempo real.
            </p>
          </div>
        </div>

        {/* CARD */}
        <div className="bg-white/5 border border-white/10 rounded-[2.5rem] shadow-[0_20px_60px_rgba(0,0,0,0.4)] overflow-hidden backdrop-blur-sm">

          {/* TOP BAR */}
          <div className="bg-gradient-to-r from-orange-500 to-orange-600 px-7 py-6 relative overflow-hidden">
            <div className="absolute right-0 top-0 opacity-[0.1]">
              <ShieldCheck size={160} className="text-white" />
            </div>
            <div className="relative z-10 flex items-center gap-4">
              <div className="w-14 h-14 rounded-2xl bg-white/20 backdrop-blur-sm flex items-center justify-center">
                <ShieldCheck className="text-white" size={28} />
              </div>
              <div>
                <p className="text-white font-black uppercase tracking-[0.25em] text-xs">
                  Controle Administrativo
                </p>
                <p className="text-orange-100 text-sm mt-1">
                  Ambiente de gerenciamento da rodada
                </p>
              </div>
            </div>
          </div>

          {/* CONTENT */}
          <div className="p-6 sm:p-8">
            <div className="space-y-3">
              <label className="ml-1 flex items-center gap-2 text-[11px] uppercase tracking-[0.25em] font-black text-white">
                <UserCircle2 size={14} className="text-orange-400" />
                Nome do facilitador
              </label>
              <div className="relative">
                <UserCircle2 size={18} className="absolute left-5 top-1/2 -translate-y-1/2 text-slate-400" />
                <input
                  value={adminName}
                  onChange={(e) => setAdminName(e.target.value)}
                  onKeyDown={(e) => e.key === "Enter" && handleCreateGame()}
                  placeholder="Nome do administrador ou organizador"
                  className="w-full h-[62px] bg-white/10 border-2 border-white/10 rounded-2xl pl-14 pr-5 outline-none focus:border-orange-500 focus:bg-white/15 transition-all text-white font-semibold placeholder:text-white/25"
                />
              </div>
              <p className="text-xs text-slate-500 pl-1 leading-relaxed">
                Esse nome será utilizado como identificação do administrador da simulação.
              </p>
            </div>

            <button
              onClick={handleCreateGame}
              disabled={loading || !adminName.trim()}
              className="w-full cursor-pointer h-[62px] mt-7 rounded-2xl bg-orange-500 hover:bg-orange-400 transition-all text-white font-black text-sm sm:text-base flex items-center justify-center gap-3 shadow-lg disabled:opacity-50 disabled:cursor-not-allowed active:scale-[0.99]"
            >
              {loading ? (
                <Loader2 className="animate-spin text-white" size={22} />
              ) : (
                <>
                  Iniciar Simulação
                  <ChevronRight className="text-white" size={20} />
                </>
              )}
            </button>

            <div className="mt-8 pt-6 border-t border-white/10 flex items-center justify-center gap-3">
              <div className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
              <p className="text-[10px] uppercase tracking-[0.30em] font-black text-slate-500">
                Sistema operacional online
              </p>
            </div>
          </div>
        </div>
      </motion.div>
    </div>
  );
};

export default SetupAdmin;