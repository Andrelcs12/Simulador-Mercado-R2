"use client";

import React from 'react';
import { motion } from 'framer-motion';
import { 
  AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer 
} from 'recharts';
import { 
  ArrowRight, Users, Box, BarChart4, ShieldCheck, Wallet, PlayCircle, ChevronDown 
} from 'lucide-react';
import Link from 'next/link';

// Mock de dados para o gráfico de performance da Home
const chartData = [
  { name: 'R1', ebitda: 400, share: 20 },
  { name: 'R2', ebitda: 900, share: 28 },
  { name: 'R3', ebitda: 1600, share: 35 },
];

const LandingPage = () => {
  return (
    <div className="min-h-screen bg-white font-sans text-gray-900 overflow-x-hidden">
      
      {/* --- NAVBAR --- */}
      <nav className="flex items-center justify-between px-10 py-5 bg-white/90 backdrop-blur-md border-b border-gray-100 sticky top-0 z-50">
        <div className="flex items-center gap-4">
          <img src="/imagens/logo.png" alt="Cencosud Logo" className="h-10 object-contain" />
          <div className="h-6 w-px bg-gray-200 mx-2" />
          <span className="text-xl font-black text-cencosud-blue uppercase tracking-tighter">
            Simulador <span className="text-cencosud-orange">EBTIDA</span>
          </span>
        </div>
        
        <div className="hidden md:flex gap-8 font-bold text-cencosud-blue">
          <a href="#dinamica" className="hover:text-cencosud-orange transition">Dinâmica</a>
          <a href="#capex" className="hover:text-cencosud-orange transition">CAPEX</a>
          <Link href="/pages/registro-do-usuario" className="bg-cencosud-orange text-white px-8 py-2 rounded-lg font-bold hover:bg-orange-600 transition shadow-lg shadow-orange-200">
            Entrar no jogo
          </Link>
        </div>
      </nav>

      {/* --- HERO SECTION --- */}
      <section className="relative px-10 pt-20 pb-32 max-w-7xl mx-auto flex flex-col lg:flex-row items-center gap-16">
        <motion.div 
          initial={{ opacity: 0, x: -60 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.8, ease: "easeOut" }}
          className="flex-1 text-left"
        >
          <div className="inline-flex items-center gap-2 px-4 py-1.5 mb-8 rounded-full bg-blue-50 border border-blue-100 text-cencosud-blue text-xs font-black uppercase tracking-widest">
            <span className="w-2 h-2 rounded-full bg-cencosud-orange animate-pulse" />
            Caixa Disponível: R$ 700.000,00
          </div>
          
          <h1 className="text-6xl lg:text-7xl font-black text-cencosud-blue leading-[1.05] mb-8">
            Decisões que <br />
            <span className="text-cencosud-orange">Geram Valor.</span>
          </h1>
          
          <p className="text-xl text-gray-500 mb-10 max-w-lg leading-relaxed font-medium">
            Assuma a gestão de uma das 4 lojas e prove sua competência estratégica. 
            Estoque, Precificação e CAPEX: o EBITDA final está em suas mãos.
          </p>

          <div className="flex flex-col sm:flex-row gap-4">
               <Link href="/pages/registro-do-usuario" className="flex items-center justify-center gap-3 bg-cencosud-blue text-white px-10 py-5 rounded-2xl font-black text-lg hover:shadow-2xl hover:shadow-blue-300 transition-all hover:-translate-y-1">
              Iniciar Rodada <ArrowRight size={22} />
            </Link>
            <button className="flex items-center justify-center gap-3 bg-white text-cencosud-blue border-2 border-cencosud-blue px-10 py-5 rounded-2xl font-black text-lg hover:bg-gray-50 transition-all">
              Manual do Gestor
            </button>
          </div>
        </motion.div>

        {/* GRÁFICO ANIMADO NA HERO */}
        <motion.div 
          initial={{ opacity: 0, scale: 0.8, rotate: 2 }}
          animate={{ opacity: 1, scale: 1, rotate: 0 }}
          transition={{ duration: 1, delay: 0.3 }}
          className="flex-1 w-full max-w-2xl bg-white p-8 rounded-[2.5rem] shadow-[0_30px_100px_rgba(0,92,158,0.12)] border border-gray-50 relative"
        >
          <div className="mb-8 flex justify-between items-start">
            <div>
              <p className="text-xs text-gray-400 font-bold uppercase tracking-widest mb-1">Indicador de Performance</p>
              <h3 className="text-3xl font-black text-cencosud-blue tracking-tight italic">EBITDA <span className="text-cencosud-orange">Target</span></h3>
            </div>
            <div className="text-right">
              <span className="block text-2xl font-black text-cencosud-blue">Rodada 03</span>
              <span className="text-sm font-bold text-green-500 bg-green-50 px-2 py-1 rounded">+24.8% vs R2</span>
            </div>
          </div>
          
          <div className="h-[320px] w-full">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={chartData}>
                <defs>
                  <linearGradient id="colorBlue" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#005C9E" stopOpacity={0.4}/>
                    <stop offset="95%" stopColor="#005C9E" stopOpacity={0}/>
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f0f0f0" />
                <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{fill: '#999', fontSize: 12, fontWeight: 'bold'}} />
                <YAxis hide />
                <Tooltip 
                  contentStyle={{borderRadius: '16px', border: 'none', boxShadow: '0 10px 30px rgba(0,0,0,0.1)'}}
                  itemStyle={{color: '#005C9E', fontWeight: 'bold'}}
                />
                <Area type="monotone" dataKey="ebitda" stroke="#005C9E" strokeWidth={5} fillOpacity={1} fill="url(#colorBlue)" />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </motion.div>
      </section>

      {/* --- CARGOS EXECUTIVOS --- */}
      <section id="dinamica" className="bg-cencosud-blue py-28 px-10 text-white relative overflow-hidden">
        <div className="max-w-7xl mx-auto text-center relative z-10">
          <motion.h2 
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            className="text-4xl lg:text-5xl font-black mb-20 tracking-tight"
          >
            A Estrutura do seu <span className="text-cencosud-orange">Controle Comercial</span>
          </motion.h2>
          
          <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-5 gap-6">
            {[
              { role: 'CEO / Gerente', icon: <Users />, desc: 'Lidera a estratégia e unifica o interesse de todas as áreas.' },
              { role: 'Serviços', icon: <ShieldCheck />, desc: 'Gerencia a infraestrutura, TI e o plano de CAPEX.' },
              { role: 'Abastecimento', icon: <Box />, desc: 'Responsável pelo Giro de Estoque e prevenção de Aging.' },
              { role: 'Planejamento', icon: <BarChart4 />, desc: 'Estrategista de Pricing, Markup e Margem Comercial.' },
              { role: 'Operacional', icon: <Wallet />, desc: 'Focado em PDV, Self-Checkout e escala de Operadores.' },
            ].map((item, idx) => (
              <motion.div 
                key={idx}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ delay: idx * 0.1 }}
                className="group p-8 rounded-[2rem] bg-white/5 border border-white/10 hover:bg-white/10 hover:border-cencosud-orange transition-all cursor-default"
              >
                <div className="text-cencosud-orange mb-6 group-hover:scale-110 transition-transform flex justify-center">
  {/* Adicionamos <{ size: number }> para validar a prop */}
  {React.cloneElement(item.icon as React.ReactElement<{ size: number }>, { size: 36 })}
</div>
                <h4 className="text-xl font-black mb-4">{item.role}</h4>
                <p className="text-sm text-blue-100/70 leading-relaxed font-medium">{item.desc}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* --- REGRAS DE CAPITAL (CAPEX) --- */}
      <section id="capex" className="py-32 px-10 max-w-7xl mx-auto">
        <div className="grid lg:grid-cols-2 gap-24 items-center">
          <motion.div 
            initial={{ opacity: 0, x: -40 }}
            whileInView={{ opacity: 1, x: 0 }}
            className="space-y-10"
          >
            <h2 className="text-5xl font-black text-cencosud-blue leading-tight">
              Gestão de <span className="text-cencosud-orange">CAPEX</span> & Risco Operacional
            </h2>
            
            <div className="grid gap-8">
              <div className="flex gap-6">
                <div className="w-14 h-14 shrink-0 bg-blue-50 text-cencosud-blue rounded-2xl flex items-center justify-center">
                  <ShieldCheck size={30} />
                </div>
                <div>
                  <h4 className="text-xl font-black text-cencosud-blue mb-2">Prevenção de Ataques (Segurança)</h4>
                  <p className="text-gray-500 font-medium">Investimento crítico para evitar dias de indisponibilidade total da operação.</p>
                </div>
              </div>
              <div className="flex gap-6">
                <div className="w-14 h-14 shrink-0 bg-orange-50 text-cencosud-orange rounded-2xl flex items-center justify-center">
                  <Box size={30} />
                </div>
                <div>
                  <h4 className="text-xl font-black text-cencosud-blue mb-2">Eficiência Logística (Balança/Freezer)</h4>
                  <p className="text-gray-500 font-medium">Garante que a venda de Perecíveis não seja interrompida por falhas técnicas.</p>
                </div>
              </div>
            </div>
          </motion.div>

          <motion.div 
            initial={{ opacity: 0, x: 40 }}
            whileInView={{ opacity: 1, x: 0 }}
            className="grid grid-cols-2 gap-6"
          >
            <div className="p-10 rounded-[2.5rem] bg-cencosud-gray flex flex-col justify-center">
              <h3 className="text-5xl font-black text-cencosud-blue mb-2">12%</h3>
              <p className="text-xs font-black text-gray-400 uppercase tracking-widest">Juros/mês sobre estouro de caixa</p>
            </div>
            <div className="p-10 rounded-[2.5rem] bg-cencosud-orange text-white flex flex-col justify-center shadow-2xl shadow-orange-200">
              <h3 className="text-5xl font-black mb-2">04</h3>
              <p className="text-xs font-black text-orange-100 uppercase tracking-widest">Lojas em disputa direta</p>
            </div>
            <div className="col-span-2 p-10 rounded-[2.5rem] bg-cencosud-blue text-white flex justify-between items-center group cursor-pointer hover:bg-cencosud-blue/95 transition-all">
              <div>
                <h3 className="text-3xl font-black mb-2 leading-none italic">SLA & CSAT</h3>
                <p className="text-sm font-bold text-blue-200 uppercase tracking-tighter">O nível de serviço define o seu market share</p>
              </div>
              <div className="bg-cencosud-orange p-4 rounded-2xl group-hover:translate-x-2 transition-transform">
                <ArrowRight size={24} />
              </div>
            </div>
          </motion.div>
        </div>
      </section>

      {/* --- FOOTER --- */}
      <footer className="py-16 px-10 border-t border-gray-100 bg-white">
        <div className="max-w-7xl mx-auto flex flex-col md:flex-row justify-between items-center gap-10">
          <div className="flex items-center gap-4">
            <img src="/imagens/logo.png" alt="Cencosud Logo" className="h-10 opacity-80" />
            <div className="h-4 w-px bg-gray-300" />
            <span className="text-xs font-bold text-gray-400 uppercase tracking-[0.2em]">High Performance Business Engine</span>
          </div>
          
          <div className="flex gap-8 text-sm font-black text-cencosud-blue uppercase">
            <a href="#" className="hover:text-cencosud-orange">Privacy</a>
            <a href="#" className="hover:text-cencosud-orange">Terms</a>
            <a href="#" className="hover:text-cencosud-orange">Support</a>
          </div>

          
        </div>
      </footer>
    </div>
  );
};

export default LandingPage;