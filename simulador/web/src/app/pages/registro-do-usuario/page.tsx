"use client";

import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { ArrowRight, Store, User, Mail, ShieldCheck, Loader2, Hash } from 'lucide-react';
import { useRouter } from 'next/navigation';

const RegistroUsuario = () => {
  const router = useRouter();

  // Estados para o formulário
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    storeName: '',
    sessionCode: ''
  });
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/minigame/register`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ...formData,
          sessionCode: formData.sessionCode.toUpperCase(),
          role: "CEO" 
        }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Código da sala inválido ou erro no registro');
      }

      const player = await response.json();
      localStorage.setItem('player_data', JSON.stringify(player));
      router.push('/pages/lobby');
    } catch (error: any) {
      alert(error.message || "Erro na conexão com o servidor");
    } finally {
      setLoading(false);
    }
  };

  return (
    // Ajustado para ocupar a tela inteira e permitir scroll em telas pequenas
    <div className="min-h-screen w-full flex items-center justify-center bg-gray-100 p-4 sm:p-6 font-sans overflow-y-auto">
      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="w-full max-w-[440px] py-8" // Max-width ideal para Mobile e Desktop
      >
        {/* HEADER RESPONSIVO */}
        <div className="flex flex-col items-center mb-8 text-center px-4">
          <img src="/imagens/logo.png" alt="Logo" className="h-10 sm:h-12 mb-4 sm:mb-6 object-contain" />
          <h2 className="text-2xl sm:text-3xl font-black text-blue-900 tracking-tight">
            Registro do <span className="text-orange-500">Gestor</span>
          </h2>
          <p className="text-gray-500 text-sm sm:text-base font-medium mt-1 italic leading-tight">
            Acesse a sala de simulação da sua unidade
          </p>
        </div>

        {/* CARD DO FORMULÁRIO */}
        <div className="bg-white p-6 sm:p-8 rounded-[2rem] sm:rounded-[2.5rem] shadow-xl border border-white">
          <form onSubmit={handleSubmit} className="space-y-4 sm:space-y-5">
            
            {/* INPUT: CÓDIGO DA SALA */}
            <div className="space-y-1.5">
              <label className="text-[10px] sm:text-xs font-black text-orange-500 uppercase tracking-widest ml-1">
                Código da Sala (4 dígitos)
              </label>
              <div className="relative group">
                <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none text-orange-300 group-focus-within:text-orange-500 transition-colors">
                  <Hash size={18} />
                </div>
                <input 
                  required
                  maxLength={4}
                  type="text" 
                  value={formData.sessionCode}
                  onChange={(e) => setFormData({...formData, sessionCode: e.target.value.toUpperCase()})}
                  placeholder="EX: XPT0"
                  className="w-full bg-orange-50 border-2 border-orange-100 rounded-2xl py-3 sm:py-4 pl-12 pr-4 focus:bg-white focus:border-orange-500 outline-none transition-all font-black text-xl sm:text-2xl text-orange-600 tracking-[0.3em] placeholder:text-orange-200"
                />
              </div>
            </div>

            <div className="h-px bg-gray-100 w-full my-1" />

            {/* INPUTS PADRÃO (NOME, EMAIL, LOJA) */}
            {[
              { id: 'name', label: 'Nome do Gerente (CEO)', icon: User, placeholder: 'Seu nome completo', type: 'text' },
              { id: 'email', label: 'E-mail Corporativo', icon: Mail, placeholder: 'exemplo@cencosud.com.br', type: 'email' },
              { id: 'storeName', label: 'Nome da Loja (Unidade)', icon: Store, placeholder: 'Ex: GBarbosa Sul...', type: 'text' }
            ].map((input) => (
              <div key={input.id} className="space-y-1.5">
                <label className="text-[10px] sm:text-xs font-black text-blue-900 uppercase tracking-widest ml-1">
                  {input.label}
                </label>
                <div className="relative group">
                  <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none text-gray-400 group-focus-within:text-blue-900 transition-colors">
                    <input.icon size={18} />
                  </div>
                  <input 
                    required
                    type={input.type}
                    value={(formData as any)[input.id]}
                    onChange={(e) => setFormData({...formData, [input.id]: e.target.value})}
                    placeholder={input.placeholder}
                    className="w-full bg-gray-50 border-2 border-gray-50 rounded-2xl py-3 sm:py-4 pl-12 pr-4 focus:bg-white focus:border-blue-900 outline-none transition-all font-bold text-blue-900 text-sm sm:text-base placeholder:text-gray-300"
                  />
                </div>
              </div>
            ))}

            {/* BOTÃO SUBMIT */}
            <button 
              type="submit"
              disabled={loading}
              className="w-full flex items-center justify-center gap-3 bg-blue-900 text-white py-4 sm:py-5 rounded-2xl font-black text-base sm:text-lg hover:bg-blue-800 hover:shadow-xl transition-all active:scale-[0.98] mt-2 disabled:opacity-70 disabled:cursor-not-allowed"
            >
              {loading ? (
                <Loader2 className="animate-spin" size={22} />
              ) : (
                <>Entrar na Sala <ArrowRight size={22} /></>
              )}
            </button>
          </form>
        </div>

        {/* FOOTER */}
        <div className="mt-6 flex items-center justify-center gap-2 text-gray-400 px-4 text-center">
          <ShieldCheck size={14} className="shrink-0" />
          <span className="text-[9px] sm:text-[10px] font-black uppercase tracking-tighter">
            Conexão segura via Cencosud Labs & DeDev
          </span>
        </div>
      </motion.div>
    </div>
  );
};

export default RegistroUsuario;