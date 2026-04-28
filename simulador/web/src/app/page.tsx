"use client";

import React from 'react';
import { motion } from 'framer-motion';
import { 
  AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer 
} from 'recharts';
import { 
  ArrowRight, Users, Box, BarChart4, ShieldCheck, Wallet, 
  Hash, Menu
} from 'lucide-react';
import Link from 'next/link';

const chartData = [
  { name: 'R1', ebitda: 400 },
  { name: 'R2', ebitda: 900 },
  { name: 'R3', ebitda: 1600 },
];

const LandingPage = () => {
  return (
    <div className="min-h-screen bg-white font-sans text-gray-900 overflow-x-hidden selection:bg-orange-100 selection:text-orange-600">
      
      {/* --- NAVBAR --- */}
      <nav className="flex items-center justify-between px-6 lg:px-10 py-5 bg-white/90 backdrop-blur-md border-b border-gray-100 sticky top-0 z-50">
        <div className="flex items-center gap-2 sm:gap-4">
          <img src="/imagens/logo.png" alt="Cencosud Logo" className="h-7 sm:h-10 object-contain" />
          <div className="h-6 w-px bg-gray-200 mx-1 sm:mx-2" />
          <span className="text-base sm:text-xl font-black text-[#002350] uppercase tracking-tighter">
            Simulador <span className="text-orange-500">EBITDA</span>
          </span>
        </div>
        
        {/* Mobile Menu Icon (Visual Only for now) */}
        <div className="md:hidden text-[#002350]">
            <Menu size={24} strokeWidth={3} />
        </div>

        <div className="hidden md:flex items-center gap-8 font-black text-[#002350] text-xs uppercase tracking-widest">
          <a href="#dinamica" className="hover:text-orange-500 transition">A Dinâmica</a>
          <a href="#projeto-residencia" className="hover:text-orange-500 transition">Arquitetura</a>
          <Link href="/pages/registro-do-usuario" className="bg-orange-500 text-white px-8 py-3 rounded-xl font-black hover:bg-orange-600 transition shadow-xl shadow-orange-200 uppercase italic">
            Acessar Simulação
          </Link>
        </div>
      </nav>

      {/* --- HERO SECTION --- */}
      <section className="relative px-6 lg:px-10 pt-12 lg:pt-20 pb-20 lg:pb-32 max-w-7xl mx-auto flex flex-col lg:flex-row items-center gap-12 lg:gap-16">
        <motion.div 
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
          className="flex-1 text-center lg:text-left"
        >
          <h1 className="text-5xl md:text-6xl lg:text-7xl font-black text-[#002350] leading-[0.95] mb-6 tracking-tighter italic">
            Decisões que <br />
            <span className="text-orange-500 font-black not-italic tracking-normal">Geram Valor.</span>
          </h1>
          
          <p className="text-base md:text-lg text-slate-500 mb-8 max-w-lg mx-auto lg:mx-0 leading-relaxed font-semibold">
            Assuma o comando de uma unidade de negócio. Gerencie estoque, precificação e CAPEX para maximizar o EBITDA e dominar o market share.
          </p>

          <div className="flex flex-col sm:flex-row justify-center lg:justify-start gap-4">
            <Link href="/pages/registro-do-usuario" className="group flex items-center justify-center gap-3 bg-[#002350] text-white px-8 lg:px-10 py-5 rounded-2xl lg:rounded-[1.5rem] font-black text-xs lg:text-sm uppercase italic hover:shadow-2xl hover:shadow-blue-900/30 transition-all hover:-translate-y-1">
              Iniciar Rodada de Negócios <ArrowRight size={18} className="group-hover:translate-x-2 transition-transform" />
            </Link>
          </div>
        </motion.div>

        {/* GRÁFICO DA HERO */}
        <motion.div 
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          className="flex-1 w-full max-w-2xl bg-white p-6 lg:p-10 rounded-[2.5rem] lg:rounded-[3.5rem] shadow-[0_40px_100px_rgba(0,35,80,0.08)] border border-slate-50 relative"
        >
          <div className="mb-8 lg:mb-10 flex flex-row justify-between items-start">
            <div>
              <p className="text-[9px] text-slate-400 font-black uppercase tracking-[0.2em] mb-2">Performance Acumulada</p>
              <h3 className="text-2xl lg:text-4xl font-black text-[#002350] tracking-tighter italic uppercase leading-none">Meta <span className="text-orange-500">EBITDA</span></h3>
            </div>
            <div className="text-right">
              <span className="block text-xl lg:text-2xl font-black text-[#002350] italic">R-03</span>
              <span className="text-[9px] font-black text-emerald-600 bg-emerald-50 px-2 py-1 rounded-full uppercase">+24%</span>
            </div>
          </div>
          
          <div className="h-[200px] lg:h-[300px] w-full">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={chartData}>
                <defs>
                  <linearGradient id="colorEbitda" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#f97316" stopOpacity={0.3}/>
                    <stop offset="95%" stopColor="#f97316" stopOpacity={0}/>
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{fill: '#64748b', fontSize: 11, fontWeight: 900}} />
                <YAxis hide />
                <Tooltip 
                  contentStyle={{borderRadius: '20px', border: 'none', boxShadow: '0 20px 40px rgba(0,0,0,0.1)', padding: '15px'}}
                  itemStyle={{color: '#002350', fontWeight: 900, fontSize: '12px', textTransform: 'uppercase'}}
                />
                <Area type="monotone" dataKey="ebitda" stroke="#f97316" strokeWidth={6} fillOpacity={1} fill="url(#colorEbitda)" />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </motion.div>
      </section>

      {/* --- SEÇÃO: ESTRUTURA ORGANIZACIONAL --- */}
      <section id="dinamica" className="bg-[#002350] py-20 lg:py-32 px-6 lg:px-10 text-white relative overflow-hidden">
        <div className="absolute inset-0 opacity-10 pointer-events-none">
          <div className="absolute top-0 right-0 w-[300px] lg:w-[600px] h-[300px] lg:h-[600px] bg-orange-500 rounded-full blur-[100px] lg:blur-[150px] -translate-y-1/2 translate-x-1/3" />
        </div>

        <div className="max-w-7xl mx-auto text-center relative z-10">
          <motion.div initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} className="mb-12 lg:mb-20 px-4">
            <span className="text-orange-500 font-black tracking-[0.4em] text-[10px] uppercase mb-4 block italic">Hierarquia Operacional</span>
            <h2 className="text-4xl lg:text-6xl font-black tracking-tighter leading-none italic uppercase">
              O seu <span className="text-orange-500 not-italic">Squad de Resultados</span>
            </h2>
          </motion.div>
          
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4">
            {[
              { role: 'Gerente Geral', icon: Users, desc: 'Liderança do squad, visão macro de P&L e alinhamento de metas.' },
              { role: 'Serviços & TI', icon: ShieldCheck, desc: 'Gestão de ativos, infraestrutura física e mitigação de riscos técnicos.' },
              { role: 'Abastecimento', icon: Box, desc: 'Controle de ruptura, giro de perecíveis e prevenção de quebras.' },
              { role: 'Comercial', icon: BarChart4, desc: 'Estratégia de preço, análise de margem e competitividade local.' },
              { role: 'Operações', icon: Wallet, desc: 'Foco no PDV, produtividade da equipe e experiência do cliente.' },
            ].map((item, idx) => (
              <motion.div 
                key={idx}
                initial={{ opacity: 0, scale: 0.95 }}
                whileInView={{ opacity: 1, scale: 1 }}
                transition={{ delay: idx * 0.05 }}
                className="group p-6 lg:p-8 rounded-[2rem] lg:rounded-[2.5rem] bg-white/5 border border-white/10 hover:border-orange-500/50 transition-all duration-500 text-left lg:text-center flex lg:flex-col items-start lg:items-center gap-6 lg:gap-0"
              >
                <div className="shrink-0 w-12 h-12 lg:w-16 lg:h-16 bg-white/5 rounded-2xl flex items-center justify-center text-orange-500 lg:mb-6 group-hover:bg-orange-500 group-hover:text-white transition-all duration-500">
                  <item.icon size={26} strokeWidth={2.5} />
                </div>
                <div>
                    <h4 className="text-base lg:text-lg font-black mb-2 lg:mb-3 tracking-tight uppercase italic">{item.role}</h4>
                    <p className="text-[12px] lg:text-[13px] text-blue-100/60 leading-relaxed font-bold">{item.desc}</p>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* --- SEÇÃO: NÚCLEO DA RESIDÊNCIA TÉCNICA --- */}
      <section id="projeto-residencia" className="py-20 lg:py-32 px-6 lg:px-10 max-w-7xl mx-auto overflow-hidden">
        <div className="grid lg:grid-cols-2 gap-12 lg:gap-20 items-center">
          
          <motion.div 
            initial={{ opacity: 0, x: -30 }} 
            whileInView={{ opacity: 1, x: 0 }} 
            viewport={{ once: true }}
            className="space-y-8 lg:space-y-12"
          >
            <header>
              <span className="text-orange-500 font-black tracking-[0.3em] text-[10px] uppercase mb-2 block italic">
                Infraestrutura do Projeto
              </span>
              <h2 className="text-4xl lg:text-5xl font-black text-[#002350] leading-[0.95] tracking-tighter italic uppercase">
                Arquitetura <br/>
                <span className="text-orange-500 not-italic text-3xl lg:text-4xl">Sistêmica & Dados</span>
              </h2>
              <p className="mt-6 text-slate-500 font-bold text-sm leading-relaxed max-w-lg">
                Desenvolvimento de um ecossistema full-stack para simulação de cenários de varejo, 
                utilizando o stack de alta performance focado em escalabilidade e precisão de cálculos de margem.
              </p>
            </header>
            
            <div className="space-y-6 lg:space-y-8 border-l-2 border-slate-100 pl-6 lg:pl-8">
              {[
                { title: "Motor de Cálculo EBITDA", desc: "Algoritmos em NestJS processando em tempo real a relação entre CMV, Quebras e Despesas Operacionais." },
                { title: "Sincronização via WebSockets", desc: "Atualização instantânea do Dashboard de indicadores para todos os players conectados na sessão." },
                { title: "Persistência Relacional", desc: "Modelagem de dados complexa em PostgreSQL via Prisma ORM, garantindo integridade ACID em transações financeiras." }
              ].map((item, i) => (
                <div key={i} className="relative group">
                  <div className="absolute -left-[31px] lg:-left-[35px] top-1.5 w-2.5 h-2.5 bg-orange-500 rounded-full group-hover:scale-150 transition-transform shadow-[0_0_10px_rgba(249,115,22,0.5)]" />
                  <h4 className="text-base lg:text-lg font-black text-[#002350] mb-1 uppercase italic tracking-tight">{item.title}</h4>
                  <p className="text-slate-500 font-bold text-[11px] lg:text-xs leading-relaxed">{item.desc}</p>
                </div>
              ))}
            </div>
          </motion.div>

          {/* DASHBOARD TÉCNICO */}
          <motion.div 
            initial={{ opacity: 0, y: 30 }} 
            whileInView={{ opacity: 1, y: 0 }} 
            viewport={{ once: true }}
            className="bg-slate-50 rounded-[2rem] lg:rounded-[3rem] p-6 lg:p-10 border border-slate-200 shadow-inner w-full"
          >
            <div className="space-y-6">
              <div className="flex justify-between items-center">
                <div className="w-10 h-10 lg:w-12 lg:h-12 bg-[#002350] rounded-xl flex items-center justify-center">
                  <Hash className="text-orange-500" size={22} />
                </div>
                <span className="text-[9px] font-black text-slate-400 uppercase tracking-[0.2em]">Build v2.0.4</span>
              </div>

              <div className="space-y-3">
                <h3 className="text-xl lg:text-2xl font-black text-[#002350] uppercase italic tracking-tighter">Stack Tecnológico</h3>
                <div className="flex flex-wrap gap-1.5 lg:gap-2">
                  {['NestJS', 'Fastify', 'Prisma', 'PostgreSQL', 'Socket.io', 'Tailwind'].map((tech) => (
                    <span key={tech} className="px-3 py-1.5 bg-white border border-slate-200 rounded-lg text-[9px] lg:text-[10px] font-black text-[#002350] uppercase">
                      {tech}
                    </span>
                  ))}
                </div>
              </div>

              <div className="space-y-4 pt-4">
                <div className="bg-[#002350] p-5 lg:p-6 rounded-[1.5rem] lg:rounded-[2rem] text-white">
                  <p className="text-[8px] font-black uppercase tracking-widest text-orange-400 mb-2 italic">Objetivo do Módulo</p>
                  <p className="text-xs lg:text-sm font-bold leading-tight">
                    Simular a operação de uma loja onde cada decisão de investimento (CAPEX) ou corte de custos (OPEX) impacta o lucro.
                  </p>
                </div>
                
                <div className="bg-white p-5 lg:p-6 rounded-[1.5rem] lg:rounded-[2rem] border border-slate-200">
                   <div className="flex justify-between items-center mb-3">
                      <span className="text-[9px] font-black uppercase text-slate-400">Status do Ambiente</span>
                      <span className="flex items-center gap-1.5 text-[9px] font-black text-emerald-500 uppercase">
                        <div className="w-1.5 h-1.5 bg-emerald-500 rounded-full animate-pulse" /> Operacional
                      </span>
                   </div>
                   <p className="text-[11px] lg:text-xs font-bold text-[#002350] leading-snug italic">
                     Conexão ativa com PostgreSQL (Neon) e servidor pronto para múltiplas salas simultâneas.
                   </p>
                </div>
              </div>
            </div>
          </motion.div>
        </div>
      </section>

      {/* --- FOOTER --- */}
      <footer className="py-12 lg:py-20 px-6 lg:px-10 border-t border-slate-100 bg-slate-50/50">
        <div className="max-w-7xl mx-auto flex flex-col md:flex-row justify-between items-center gap-8 text-center md:text-left">
          <div className="flex flex-col sm:flex-row items-center gap-4">
            <img src="/imagens/logo.png" alt="Cencosud Logo" className="h-8 opacity-70 grayscale hover:grayscale-0 transition-all" />
            <div className="hidden sm:block h-4 w-px bg-slate-300" />
            <span className="text-[9px] font-black text-slate-400 uppercase tracking-[0.2em]">Ambiente de Capacitação Estratégica</span>
          </div>
          
          <div className="flex flex-wrap justify-center gap-4 lg:gap-8 text-[10px] font-black text-[#002350] uppercase tracking-widest italic">
            <a href="#" className="hover:text-orange-500 transition">Privacidade</a>
            <a href="#" className="hover:text-orange-500 transition">Termos</a>
            <a href="#" className="hover:text-orange-500 transition">Suporte</a>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default LandingPage;