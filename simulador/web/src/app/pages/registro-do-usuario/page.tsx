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
    sessionCode: '' // Novo campo essencial
  });
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      // Chamada para a API do NestJS
      const response = await fetch('http://localhost:4000/minigame/register', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          name: formData.name,
          email: formData.email,
          storeName: formData.storeName,
          sessionCode: formData.sessionCode.toUpperCase(), // Garante o match com o banco
          role: "CEO" 
        }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Código da sala inválido ou erro no registro');
      }

      const player = await response.json();

      // Guardamos os dados (incluindo o sessionId UUID que o back retornou)
      localStorage.setItem('player_data', JSON.stringify(player));

      // Redireciona para o Lobby
      router.push('/pages/lobby');
    } catch (error: any) {
      alert(error.message || "Erro na conexão com o servidor");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-100 p-6 font-sans">
      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="w-full max-w-md"
      >
        <div className="flex flex-col items-center mb-10 text-center">
          <img src="/imagens/logo.png" alt="Logo" className="h-12 mb-6 object-contain" />
          <h2 className="text-3xl font-black text-blue-900 tracking-tight">
            Registro do <span className="text-orange-500">Gestor</span>
          </h2>
          <p className="text-gray-500 font-medium mt-2 italic">Acesse a sala de simulação da sua unidade</p>
        </div>

        <div className="bg-white p-8 rounded-[2.5rem] shadow-xl border border-white">
          <form onSubmit={handleSubmit} className="space-y-5">
            
            {/* INPUT: CÓDIGO DA SALA (O QUE APARECE NO TELÃO) */}
            <div className="space-y-2">
              <label className="text-xs font-black text-orange-500 uppercase tracking-widest ml-1">
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
                  className="w-full bg-orange-50 border-2 border-orange-100 rounded-2xl py-4 pl-12 pr-4 focus:bg-white focus:border-orange-500 outline-none transition-all font-black text-2xl text-orange-600 tracking-[0.3em] placeholder:text-orange-200"
                />
              </div>
            </div>

            <div className="h-px bg-gray-100 w-full my-2" />

            {/* INPUT: NOME */}
            <div className="space-y-2">
              <label className="text-xs font-black text-blue-900 uppercase tracking-widest ml-1">
                Nome do Gerente (CEO)
              </label>
              <div className="relative group">
                <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none text-gray-400 group-focus-within:text-blue-900 transition-colors">
                  <User size={18} />
                </div>
                <input 
                  required
                  type="text" 
                  value={formData.name}
                  onChange={(e) => setFormData({...formData, name: e.target.value})}
                  placeholder="Seu nome completo"
                  className="w-full bg-gray-50 border-2 border-gray-50 rounded-2xl py-4 pl-12 pr-4 focus:bg-white focus:border-blue-900 outline-none transition-all font-bold text-blue-900"
                />
              </div>
            </div>

            {/* INPUT: EMAIL */}
            <div className="space-y-2">
              <label className="text-xs font-black text-blue-900 uppercase tracking-widest ml-1">
                E-mail Corporativo
              </label>
              <div className="relative group">
                <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none text-gray-400 group-focus-within:text-blue-900 transition-colors">
                  <Mail size={18} />
                </div>
                <input 
                  required
                  type="email" 
                  value={formData.email}
                  onChange={(e) => setFormData({...formData, email: e.target.value})}
                  placeholder="exemplo@cencosud.com.br"
                  className="w-full bg-gray-50 border-2 border-gray-50 rounded-2xl py-4 pl-12 pr-4 focus:bg-white focus:border-blue-900 outline-none transition-all font-bold text-blue-900"
                />
              </div>
            </div>

            {/* INPUT: LOJA */}
            <div className="space-y-2">
              <label className="text-xs font-black text-blue-900 uppercase tracking-widest ml-1">
                Nome da Loja (Unidade)
              </label>
              <div className="relative group">
                <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none text-gray-400 group-focus-within:text-blue-900 transition-colors">
                  <Store size={18} />
                </div>
                <input 
                  required
                  type="text" 
                  value={formData.storeName}
                  onChange={(e) => setFormData({...formData, storeName: e.target.value})}
                  placeholder="Ex: Bretas Centro, GBarbosa Sul..."
                  className="w-full bg-gray-50 border-2 border-gray-50 rounded-2xl py-4 pl-12 pr-4 focus:bg-white focus:border-blue-900 outline-none transition-all font-bold text-blue-900 placeholder:text-gray-300"
                />
              </div>
            </div>

            <button 
              type="submit"
              disabled={loading}
              className="w-full flex items-center justify-center gap-3 bg-blue-900 text-white py-5 rounded-2xl font-black text-lg hover:bg-blue-800 hover:shadow-xl transition-all active:scale-[0.98] mt-4 disabled:opacity-70 disabled:cursor-not-allowed"
            >
              {loading ? (
                <Loader2 className="animate-spin" size={22} />
              ) : (
                <>Entrar na Sala <ArrowRight size={22} /></>
              )}
            </button>
          </form>
        </div>

        <div className="mt-8 flex items-center justify-center gap-2 text-gray-400">
          <ShieldCheck size={16} />
          <span className="text-xs font-bold uppercase tracking-tighter">
            Conexão segura via Cencosud Labs
          </span>
        </div>
      </motion.div>
    </div>
  );
};

export default RegistroUsuario;