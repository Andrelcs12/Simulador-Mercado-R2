"use client";

import React, { useState } from "react";
import { useRouter } from "next/navigation";
import {
  ShieldCheck,
  Loader2,
  ChevronRight,
  UserCircle2,
} from "lucide-react";
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
    <div className="min-h-screen bg-[#001f3f] flex items-center justify-center p-4 sm:p-6 font-sans relative overflow-hidden">

      {/* background grid */}
      <div
        className="absolute inset-0 opacity-[0.06] pointer-events-none"
        style={{
          backgroundImage:
            "radial-gradient(#ffffff 1px, transparent 1px)",
          backgroundSize: "36px 36px",
        }}
      />

      <motion.div
        initial={{ opacity: 0, scale: 0.98 }}
        animate={{ opacity: 1, scale: 1 }}
        className="relative w-full max-w-md sm:max-w-xl bg-white rounded-[2rem] sm:rounded-[2.5rem] shadow-2xl border-b-4 border-orange-500 p-6 sm:p-10"
      >
        {/* watermark */}
        <div className="absolute top-4 right-4 opacity-[0.04] pointer-events-none">
          <ShieldCheck size={140} className="text-[#001f3f]" />
        </div>

        {/* header */}
        <div className="mb-8 sm:mb-10">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 sm:w-12 sm:h-12 bg-[#001f3f] rounded-xl flex items-center justify-center">
              <ShieldCheck className="text-orange-500" size={22} />
            </div>

            <div>
              <h1 className="text-xl sm:text-3xl font-black text-[#001f3f] leading-tight">
                Configuração{" "}
                <span className="text-orange-500">Mestra</span>
              </h1>

              <p className="text-[10px] sm:text-[11px] tracking-[0.2em] uppercase text-slate-400 font-bold mt-1">
                Simulação Operacional Cencosud
              </p>
            </div>
          </div>
        </div>

        {/* input */}
        <div className="space-y-3 mb-8">
          <label className="flex items-center gap-2 text-[11px] font-bold text-[#001f3f]/60 uppercase">
            <UserCircle2 size={14} className="text-orange-500" />
            Facilitador
          </label>

          <input
            value={adminName}
            onChange={(e) => setAdminName(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && handleCreateGame()}
            placeholder="Ex: Consultor Cencosud / Operação Brasil"
            className="w-full bg-slate-50 border border-slate-200 focus:border-orange-500 focus:bg-white transition-all rounded-2xl px-5 py-4 sm:py-5 text-[#001f3f] font-semibold outline-none placeholder:text-slate-400"
          />
        </div>

        {/* button */}
        <button
          onClick={handleCreateGame}
          disabled={loading || !adminName.trim()}
          className="w-full bg-[#001f3f] hover:bg-[#003366] transition-all text-white font-black rounded-2xl py-4 sm:py-5 flex items-center justify-center gap-3 disabled:opacity-40 disabled:cursor-not-allowed"
        >
          {loading ? (
            <Loader2 className="animate-spin text-orange-500" size={22} />
          ) : (
            <>
              <span className="uppercase tracking-wide text-sm sm:text-base">
                Iniciar Simulação
              </span>
              <ChevronRight className="text-orange-500" size={18} />
            </>
          )}
        </button>

        {/* footer */}
        <div className="mt-8 pt-6 border-t border-slate-100 flex justify-center">
          <div className="flex items-center gap-2">
            <div className="w-2 h-2 bg-emerald-500 rounded-full animate-pulse" />
            <span className="text-[10px] font-bold text-slate-500 uppercase tracking-widest">
              Cencosud Simulation Engine
            </span>
          </div>
        </div>
      </motion.div>
    </div>
  );
};

export default SetupAdmin;