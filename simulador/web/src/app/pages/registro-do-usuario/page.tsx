"use client";

import React, { useState } from "react";
import { motion } from "framer-motion";
import {
  ArrowRight,
  Store,
  User,
  Loader2,
  Hash,
} from "lucide-react";
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
      const API_URL =
        process.env.NEXT_PUBLIC_API_URL || "http://localhost:4000";

      const response = await fetch(
        `${API_URL}/minigame/register`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            sessionCode: formData.sessionCode.toUpperCase(),
            name: formData.name,
            storeName: formData.storeName,
            role: "STORE_MANAGER",
          }),
        }
      );

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || "Erro ao entrar na sala");
      }

      localStorage.setItem("player_data", JSON.stringify(data));
      router.push("/pages/lobby");
    } catch (err: any) {
      alert(err.message || "Erro na conexão");
    } finally {
      setLoading(false);
    }
  };

  
  return (
  <div className="min-h-screen bg-[#F4F7FB] flex items-center justify-center px-4 py-8">
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4 }}
      className="w-full max-w-[470px]"
    >
      {/* HEADER */}
      <div className="text-center mb-8">
        <img
          src="/imagens/logo.png"
          alt="Logo"
          className="h-12 mx-auto mb-6 object-contain"
        />

        <div className="space-y-2">
          <h1 className="text-3xl sm:text-4xl font-black tracking-tight text-blue-950 leading-tight">
            Entrada da{" "}
            <span className="text-orange-500">
              Simulação Operacional
            </span>
          </h1>

          <p className="text-gray-500 text-sm sm:text-base font-medium max-w-sm mx-auto leading-relaxed">
            Informe os dados da sua unidade para participar da rodada em tempo real.
          </p>
        </div>
      </div>

      {/* CARD */}
      <div className="bg-white border border-gray-100 rounded-[2.2rem] shadow-[0_20px_60px_rgba(15,23,42,0.08)] overflow-hidden">

        {/* TOP BAR */}
        <div className="bg-gradient-to-r from-blue-900 to-blue-800 px-6 py-5">
          <div className="flex items-center gap-3">
            <div className="w-11 h-11 rounded-2xl bg-white/10 flex items-center justify-center backdrop-blur-sm">
              <Store className="text-orange-400" size={22} />
            </div>

            <div>
              <p className="text-white text-sm font-black uppercase tracking-widest">
                Acesso da Loja
              </p>

              <p className="text-blue-100 text-xs">
                Painel de entrada da simulação
              </p>
            </div>
          </div>
        </div>

        {/* FORM */}
        <form
          onSubmit={handleSubmit}
          className="p-5 sm:p-7 space-y-5"
        >
          {/* CÓDIGO */}
          <div>
            <label className="ml-1 text-[10px] uppercase tracking-[0.25em] font-black text-orange-500">
              Código da sala
            </label>

            <div className="relative mt-2">
              <Hash
                size={18}
                className="absolute left-4 top-1/2 -translate-y-1/2 text-orange-400"
              />

              <input
                required
                maxLength={4}
                type="text"
                value={formData.sessionCode}
                onChange={(e) =>
                  setFormData({
                    ...formData,
                    sessionCode: e.target.value.toUpperCase(),
                  })
                }
                placeholder="EX: XPT0"
                className="w-full h-[62px] pl-12 pr-4 bg-orange-50 border-2 border-orange-100 rounded-2xl outline-none focus:border-orange-500 focus:bg-white text-orange-600 placeholder:text-orange-300 font-black tracking-[0.30em] text-xl transition-all"
              />
            </div>
          </div>

          {/* GERENTE */}
          <div>
            <label className="ml-1 text-[10px] uppercase tracking-[0.25em] font-black text-blue-950">
              Nome do gerente
            </label>

            <div className="relative mt-2">
              <User
                size={18}
                className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400"
              />

              <input
                required
                type="text"
                value={formData.name}
                onChange={(e) =>
                  setFormData({
                    ...formData,
                    name: e.target.value,
                  })
                }
                placeholder="Ex: André Lucas"
                className="w-full h-[58px] pl-12 pr-4 bg-gray-50 border-2 border-gray-100 rounded-2xl outline-none focus:border-blue-900 focus:bg-white text-blue-950 placeholder:text-gray-400 font-bold transition-all"
              />
            </div>
          </div>

          {/* LOJA */}
          <div>
            <label className="ml-1 text-[10px] uppercase tracking-[0.25em] font-black text-blue-950">
              Nome da unidade
            </label>

            <div className="relative mt-2">
              <Store
                size={18}
                className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400"
              />

              <input
                required
                type="text"
                value={formData.storeName}
                onChange={(e) =>
                  setFormData({
                    ...formData,
                    storeName: e.target.value,
                  })
                }
                placeholder="Ex: GBarbosa Jardins"
                className="w-full h-[58px] pl-12 pr-4 bg-gray-50 border-2 border-gray-100 rounded-2xl outline-none focus:border-blue-900 focus:bg-white text-blue-950 placeholder:text-gray-400 font-bold transition-all"
              />
            </div>
          </div>

          {/* BOTÃO */}
          <button
            type="submit"
            disabled={loading}
            className="w-full h-[60px] rounded-2xl bg-blue-900 hover:bg-blue-800 transition-all text-white font-black text-sm sm:text-base flex items-center justify-center gap-3 shadow-lg hover:shadow-blue-200 disabled:opacity-70 disabled:cursor-not-allowed active:scale-[0.99] mt-2"
          >
            {loading ? (
              <Loader2 className="animate-spin" size={22} />
            ) : (
              <>
                Entrar na Simulação
                <ArrowRight size={20} />
              </>
            )}
          </button>
        </form>
      </div>

      {/* FOOTER */}
      <div className="mt-6 text-center">
        <p className="text-[10px] uppercase tracking-[0.30em] font-black text-gray-400">
          Plataforma de Simulação • Operação em Tempo Real
        </p>
      </div>
    </motion.div>
  </div>
);
}

export default RegistroUsuario;