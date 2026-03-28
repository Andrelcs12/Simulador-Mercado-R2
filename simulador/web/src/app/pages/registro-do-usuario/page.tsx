"use client";

import React from 'react';
import { motion } from 'framer-motion';
import { ArrowRight, Store, User, Mail, ShieldCheck } from 'lucide-react';
import { useRouter } from 'next/navigation';

const RegistroUsuario = () => {

    const router = useRouter();
  // Em um cenário real, usaríamos react-hook-form aqui
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    // Lógica para salvar no backend e ir para o Menu do Jogo
    router.push('/pages/lobby')
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-cencosud-gray p-6">
      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="w-full max-w-md"
      >
        {/* LOGO E VOLTAR */}
        <div className="flex flex-col items-center mb-10 text-center">
          <img src="/imagens/logo.png" alt="Cencosud Logo" className="h-12 mb-6 object-contain" />
          <h2 className="text-3xl font-black text-cencosud-blue tracking-tight">
            Registro do <span className="text-cencosud-orange">Gestor</span>
          </h2>
          <p className="text-gray-500 font-medium mt-2">Inicie a configuração da sua unidade de negócio</p>
        </div>

        {/* FORMULÁRIO */}
        <div className="bg-white p-8 rounded-[2.5rem] shadow-[0_20px_60px_rgba(0,92,158,0.08)] border border-white">
          <form onSubmit={handleSubmit} className="space-y-6">
            
            {/* INPUT: NOME DO GESTOR */}
            <div className="space-y-2">
              <label className="text-xs font-black text-cencosud-blue uppercase tracking-widest ml-1">
                Nome do Gerente (CEO)
              </label>
              <div className="relative group">
                <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none text-gray-400 group-focus-within:text-cencosud-orange transition-colors">
                  <User size={18} />
                </div>
                <input 
                  required
                  type="text" 
                  placeholder="Seu nome completo"
                  className="w-full bg-gray-50 border-2 border-gray-50 rounded-2xl py-4 pl-12 pr-4 focus:bg-white focus:border-cencosud-blue outline-none transition-all font-bold text-cencosud-blue"
                />
              </div>
            </div>

            {/* INPUT: EMAIL */}
            <div className="space-y-2">
              <label className="text-xs font-black text-cencosud-blue uppercase tracking-widest ml-1">
                E-mail Corporativo
              </label>
              <div className="relative group">
                <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none text-gray-400 group-focus-within:text-cencosud-orange transition-colors">
                  <Mail size={18} />
                </div>
                <input 
                  required
                  type="email" 
                  placeholder="andre@cencosud.com.br"
                  className="w-full bg-gray-50 border-2 border-gray-50 rounded-2xl py-4 pl-12 pr-4 focus:bg-white focus:border-cencosud-blue outline-none transition-all font-bold text-cencosud-blue"
                />
              </div>
            </div>

            {/* INPUT: NOME DA EMPRESA/LOJA */}
            <div className="space-y-2">
              <label className="text-xs font-black text-cencosud-blue uppercase tracking-widest ml-1">
                Nome da Loja (Equipe)
              </label>
              <div className="relative group">
                <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none text-gray-400 group-focus-within:text-cencosud-orange transition-colors">
                  <Store size={18} />
                </div>
                <input 
                  required
                  type="text" 
                  placeholder="Ex: Bretas Alpha, GBarbosa Sul..."
                  className="w-full bg-gray-50 border-2 border-gray-50 rounded-2xl py-4 pl-12 pr-4 focus:bg-white focus:border-cencosud-blue outline-none transition-all font-bold text-cencosud-blue placeholder:text-gray-300"
                />
              </div>
            </div>

            {/* BOTÃO DE SUBMIT */}
            <button 
              type="submit"
              className="w-full flex items-center justify-center gap-3 bg-cencosud-blue text-white py-5 rounded-2xl font-black text-lg hover:bg-opacity-95 hover:shadow-xl hover:shadow-blue-100 transition-all active:scale-[0.98] mt-4"
            >
              Entrar no Jogo <ArrowRight size={22} />
            </button>
          </form>
        </div>

        {/* INFO ADICIONAL */}
        <div className="mt-8 flex items-center justify-center gap-2 text-gray-400">
          <ShieldCheck size={16} />
          <span className="text-xs font-bold uppercase tracking-tighter">
            Dados protegidos pelo protocolo de simulação
          </span>
        </div>
      </motion.div>

      {/* DETALHE DECORATIVO DE FUNDO */}
      <div className="fixed bottom-0 right-0 opacity-5 pointer-events-none">
        <img src="/imagens/logo.png" alt="" className="w-96 translate-x-1/4 translate-y-1/4" />
      </div>
    </div>
  );
};

export default RegistroUsuario;