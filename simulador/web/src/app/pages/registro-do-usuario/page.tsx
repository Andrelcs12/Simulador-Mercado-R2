"use client";

import React, { useState } from "react";
import { motion } from "framer-motion";
import {
  ArrowRight,
  Store,
  User,
  Mail,
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
    email: "",
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
            ...formData,
            sessionCode: formData.sessionCode.toUpperCase(),
            role: "MANAGER",
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
    <div className="min-h-screen bg-[#F8FAFC] flex items-center justify-center p-4 sm:p-6">

      <motion.div
        initial={{
          opacity: 0,
          y: 20,
        }}
        animate={{
          opacity: 1,
          y: 0,
        }}
        className="w-full max-w-[460px]"
      >

        {/* HEADER */}
        <div className="text-center mb-8 px-2">
          <img
            src="/imagens/logo.png"
            alt="Logo"
            className="h-10 sm:h-12 mx-auto mb-5 object-contain"
          />

          <h1 className="text-2xl sm:text-3xl font-black text-blue-900 tracking-tight leading-tight">
            Entrada da{" "}
            <span className="text-orange-500">Simulação</span>
          </h1>

          <p className="text-gray-500 mt-2 text-sm sm:text-base font-medium">
            Conecte sua unidade à rodada operacional
          </p>
        </div>

        {/* CARD */}
        <div className="bg-white p-5 sm:p-8 rounded-[2rem] sm:rounded-[2.5rem] border border-gray-100 shadow-xl">

          <form onSubmit={handleSubmit} className="space-y-5">

            {/* CODIGO */}
            <div>
              <label className="text-[10px] uppercase tracking-widest font-black text-orange-500 ml-1">
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
                  className="w-full pl-12 pr-4 py-4 sm:py-5 bg-orange-50 border-2 border-orange-100 rounded-2xl outline-none focus:border-orange-500 focus:bg-white text-orange-600 placeholder:text-orange-300 font-black tracking-[0.25em] text-lg sm:text-2xl transition-all"
                />
              </div>
            </div>

            {/* NOME */}
            <div>
              <label className="text-[10px] uppercase tracking-widest font-black text-blue-900 ml-1">
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
                  className="w-full pl-12 pr-4 py-4 bg-gray-50 border-2 border-gray-100 rounded-2xl outline-none focus:border-blue-900 focus:bg-white text-blue-900 placeholder:text-gray-400 font-bold text-sm sm:text-base transition-all"
                />
              </div>
            </div>

            {/* EMAIL */}
            <div>
              <label className="text-[10px] uppercase tracking-widest font-black text-blue-900 ml-1">
                E-mail corporativo
              </label>

              <div className="relative mt-2">
                <Mail
                  size={18}
                  className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400"
                />

                <input
                  required
                  type="email"
                  value={formData.email}
                  onChange={(e) =>
                    setFormData({
                      ...formData,
                      email: e.target.value,
                    })
                  }
                  placeholder="gestor@empresa.com"
                  className="w-full pl-12 pr-4 py-4 bg-gray-50 border-2 border-gray-100 rounded-2xl outline-none focus:border-blue-900 focus:bg-white text-blue-900 placeholder:text-gray-400 font-bold text-sm sm:text-base transition-all"
                />
              </div>
            </div>

            {/* LOJA */}
            <div>
              <label className="text-[10px] uppercase tracking-widest font-black text-blue-900 ml-1">
                Nome da loja
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
                  className="w-full pl-12 pr-4 py-4 bg-gray-50 border-2 border-gray-100 rounded-2xl outline-none focus:border-blue-900 focus:bg-white text-blue-900 placeholder:text-gray-400 font-bold text-sm sm:text-base transition-all"
                />
              </div>
            </div>

            {/* BOTAO */}
            <button
              type="submit"
              disabled={loading}
              className="w-full bg-blue-900 text-white py-4 sm:py-5 rounded-2xl font-black text-sm sm:text-base flex items-center justify-center gap-3 hover:bg-blue-800 transition-all active:scale-[0.98] shadow-lg hover:shadow-blue-200 disabled:opacity-70 disabled:cursor-not-allowed mt-2"
            >
              {loading ? (
                <Loader2 className="animate-spin" size={22} />
              ) : (
                <>
                  Entrar na Simulação
                  <ArrowRight size={22} />
                </>
              )}
            </button>
          </form>
        </div>

        {/* FOOTER */}
        <div className="mt-6 text-center px-4">
          <p className="text-[10px] uppercase tracking-[0.2em] font-black text-gray-400">
            Plataforma operacional • Cencosud Labs
          </p>
        </div>
      </motion.div>
    </div>
  );
};

export default RegistroUsuario;