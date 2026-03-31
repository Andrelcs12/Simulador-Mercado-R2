"use client";

import React from 'react';
import { motion } from 'framer-motion';
import { 
  AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer 
} from 'recharts';
import { 
  ArrowRight, Users, Box, BarChart4, ShieldCheck, Wallet, 
  Landmark, TrendingUp, Zap, Activity,
  Hash
} from 'lucide-react';
import Link from 'next/link';

const chartData = [
  { name: 'R1', ebitda: 400 },
  { name: 'R2', ebitda: 900 },
  { name: 'R3', ebitda: 1600 },
];

const LandingPage = () => {
  return (
    <div className="min-h-screen bg-white font-sans text-gray-900 overflow-x-hidden">
      
      {/* --- NAVBAR --- */}
      <nav className="flex items-center justify-between px-6 lg:px-10 py-5 bg-white/90 backdrop-blur-md border-b border-gray-100 sticky top-0 z-50">
        <div className="flex items-center gap-4">
          <img src="/imagens/logo.png" alt="Cencosud Logo" className="h-10 object-contain" />
          <div className="h-6 w-px bg-gray-200 mx-2" />
          <span className="text-xl font-black text-[#002350] uppercase tracking-tighter">
            Simulador <span className="text-orange-500">EBITDA</span>
          </span>
        </div>
        
        <div className="hidden md:flex items-center gap-8 font-black text-[#002350] text-xs uppercase tracking-widest">
          <a href="#dinamica" className="hover:text-orange-500 transition">A Dinâmica</a>
          <a href="#capex" className="hover:text-orange-500 transition">Gestão Financeira</a>
          <Link href="/pages/registro-do-usuario" className="bg-orange-500 text-white px-8 py-3 rounded-xl font-black hover:bg-orange-600 transition shadow-xl shadow-orange-200 uppercase italic">
            Acessar Simulação
          </Link>
        </div>
      </nav>

      {/* --- HERO SECTION --- */}
      <section className="relative px-6 lg:px-10 pt-20 pb-32 max-w-7xl mx-auto flex flex-col lg:flex-row items-center gap-16">
        <motion.div 
          initial={{ opacity: 0, x: -60 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.8 }}
          className="flex-1 text-left"
        >
          
          
          <h1 className="text-6xl lg:text-7xl font-black text-[#002350] leading-[0.95] mb-8 tracking-tighter italic">
            Decisões que <br />
            <span className="text-orange-500 font-black not-italic">Geram Valor.</span>
          </h1>
          
          <p className="text-lg text-slate-500 mb-10 max-w-lg leading-relaxed font-semibold">
            Assuma o comando de uma unidade de negócio. Gerencie estoque, precificação e CAPEX para maximizar o EBITDA e dominar o market share.
          </p>

          <div className="flex flex-col sm:flex-row gap-4">
            <Link href="/pages/registro-do-usuario" className="group flex items-center justify-center gap-3 bg-[#002350] text-white px-10 py-5 rounded-[1.5rem] font-black text-sm uppercase italic hover:shadow-2xl hover:shadow-blue-900/30 transition-all hover:-translate-y-1">
              Iniciar Rodada de Negócios <ArrowRight size={18} className="group-hover:translate-x-2 transition-transform" />
            </Link>
          </div>
        </motion.div>

        {/* GRÁFICO DA HERO */}
        <motion.div 
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          className="flex-1 w-full max-w-2xl bg-white p-10 rounded-[3.5rem] shadow-[0_40px_100px_rgba(0,35,80,0.08)] border border-slate-50 relative"
        >
          <div className="mb-10 flex justify-between items-start">
            <div>
              <p className="text-[10px] text-slate-400 font-black uppercase tracking-[0.2em] mb-2">Performance Acumulada</p>
              <h3 className="text-4xl font-black text-[#002350] tracking-tighter italic uppercase leading-none">Meta <span className="text-orange-500">EBITDA</span></h3>
            </div>
            <div className="text-right">
              <span className="block text-2xl font-black text-[#002350] italic">Rodada 03</span>
              <span className="text-[10px] font-black text-emerald-600 bg-emerald-50 px-3 py-1 rounded-full uppercase">+24.8% Evolução</span>
            </div>
          </div>
          
          <div className="h-[300px] w-full">
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
      <section id="dinamica" className="bg-[#002350] py-32 px-6 lg:px-10 text-white relative overflow-hidden">
        <div className="absolute inset-0 opacity-10 pointer-events-none">
          <div className="absolute top-0 right-0 w-[600px] h-[600px] bg-orange-500 rounded-full blur-[150px] -translate-y-1/2 translate-x-1/3" />
        </div>

        <div className="max-w-7xl mx-auto text-center relative z-10">
          <motion.div initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} className="mb-20">
            <span className="text-orange-500 font-black tracking-[0.4em] text-[10px] uppercase mb-4 block italic">Hierarquia Operacional</span>
            <h2 className="text-5xl lg:text-6xl font-black tracking-tighter leading-none italic uppercase">
              O seu <span className="text-orange-500 not-italic">Squad de Resultados</span>
            </h2>
          </motion.div>
          
          <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-5 gap-4">
            {[
              { role: 'Gerente Geral', icon: Users, desc: 'Liderança do squad, visão macro de P&L e alinhamento de metas.' },
              { role: 'Serviços & TI', icon: ShieldCheck, desc: 'Gestão de ativos, infraestrutura física e mitigação de riscos técnicos.' },
              { role: 'Abastecimento', icon: Box, desc: 'Controle de ruptura, giro de perecíveis e prevenção de quebras.' },
              { role: 'Comercial', icon: BarChart4, desc: 'Estratégia de preço, análise de margem e competitividade local.' },
              { role: 'Operações', icon: Wallet, desc: 'Foco no PDV, produtividade da equipe e experiência do cliente.' },
            ].map((item, idx) => (
              <motion.div 
                key={idx}
                initial={{ opacity: 0, scale: 0.9 }}
                whileInView={{ opacity: 1, scale: 1 }}
                transition={{ delay: idx * 0.1 }}
                className="group p-8 rounded-[2.5rem] bg-white/5 border border-white/10 hover:border-orange-500/50 transition-all duration-500"
              >
                <div className="w-16 h-16 bg-white/5 rounded-2xl flex items-center justify-center text-orange-500 mb-6 group-hover:bg-orange-500 group-hover:text-white transition-all duration-500">
                  <item.icon size={30} strokeWidth={2.5} />
                </div>
                <h4 className="text-lg font-black mb-3 tracking-tight uppercase italic">{item.role}</h4>
                <p className="text-[13px] text-blue-100/60 leading-relaxed font-bold">{item.desc}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* --- SEÇÃO: NÚCLEO DA RESIDÊNCIA TÉCNICA (DEVDERE) --- */}
<section id="projeto-residencia" className="py-32 px-6 lg:px-10 max-w-7xl mx-auto overflow-hidden">
  <div className="grid lg:grid-cols-2 gap-20 items-start">
    
    <motion.div 
      initial={{ opacity: 0, x: -30 }} 
      whileInView={{ opacity: 1, x: 0 }} 
      viewport={{ once: true }}
      className="space-y-12"
    >
      <header>
        <span className="text-orange-500 font-black tracking-[0.3em] text-[10px] uppercase mb-2 block italic">
          Infraestrutura do Projeto
        </span>
        <h2 className="text-5xl font-black text-[#002350] leading-[0.95] tracking-tighter italic uppercase">
          Arquitetura <br/>
          <span className="text-orange-500 not-italic text-4xl">Sistêmica & Dados</span>
        </h2>
        <p className="mt-6 text-slate-500 font-bold text-sm leading-relaxed max-w-lg">
          Desenvolvimento de um ecossistema full-stack para simulação de cenários de varejo, 
          utilizando o stack de alta performance focado em escalabilidade e precisão de cálculos de margem.
        </p>
      </header>
      
      <div className="space-y-8 border-l-2 border-slate-100 pl-8">
        {[
          { title: "Motor de Cálculo EBITDA", desc: "Algoritmos em NestJS processando em tempo real a relação entre CMV, Quebras e Despesas Operacionais." },
          { title: "Sincronização via WebSockets", desc: "Atualização instantânea do Dashboard de indicadores para todos os players conectados na sessão." },
          { title: "Persistência Relacional", desc: "Modelagem de dados complexa em PostgreSQL via Prisma ORM, garantindo integridade ACID em transações financeiras." }
        ].map((item, i) => (
          <div key={i} className="relative group">
            <div className="absolute -left-[35px] top-1 w-3 h-3 bg-orange-500 rounded-full group-hover:scale-150 transition-transform shadow-[0_0_10px_rgba(249,115,22,0.5)]" />
            <h4 className="text-lg font-black text-[#002350] mb-1 uppercase italic tracking-tight">{item.title}</h4>
            <p className="text-slate-500 font-bold text-xs leading-relaxed">{item.desc}</p>
          </div>
        ))}
      </div>
    </motion.div>

    {/* DASHBOARD INDICADOR DE PERFORMANCE TÉCNICA */}
    <motion.div 
      initial={{ opacity: 0, scale: 0.95 }} 
      whileInView={{ opacity: 1, scale: 1 }} 
      viewport={{ once: true }}
      className="bg-slate-50 rounded-[3rem] p-10 border border-slate-200 shadow-inner"
    >
      <div className="space-y-6">
        <div className="flex justify-between items-end">
          <div className="w-12 h-12 bg-[#002350] rounded-xl flex items-center justify-center">
            <Hash  className="text-orange-500" size={24} />
          </div>
          <span className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em]">Build v2.0.4 - Residencia</span>
        </div>

        <div className="space-y-4">
          <h3 className="text-2xl font-black text-[#002350] uppercase italic">Stack Tecnológico</h3>
          <div className="flex flex-wrap gap-2">
            {['NestJS', 'Fastify', 'Prisma', 'PostgreSQL', 'Socket.io', 'Tailwind'].map((tech) => (
              <span key={tech} className="px-4 py-2 bg-white border border-slate-200 rounded-full text-[10px] font-black text-[#002350] uppercase">
                {tech}
              </span>
            ))}
          </div>
        </div>

        <div className="grid grid-cols-1 gap-4 pt-6">
          <div className="bg-[#002350] p-6 rounded-[2rem] text-white">
            <p className="text-[9px] font-black uppercase tracking-widest text-orange-400 mb-2">Objetivo do Módulo</p>
            <p className="text-sm font-bold leading-snug">
              Simular a operação de uma loja Cencosud, onde cada decisão de investimento (CAPEX) ou corte de custos (OPEX) impacta diretamente o lucro líquido.
            </p>
          </div>
          
          <div className="bg-white p-6 rounded-[2rem] border border-slate-200">
             <div className="flex justify-between items-center mb-4">
                <span className="text-[10px] font-black uppercase text-slate-400">Status do Ambiente</span>
                <span className="flex items-center gap-2 text-[10px] font-black text-emerald-500 uppercase">
                  <div className="w-2 h-2 bg-emerald-500 rounded-full animate-pulse" /> Operacional
                </span>
             </div>
             <p className="text-xs font-bold text-[#002350]">
               Conexão estabelecida com o banco de dados Neon (PostgreSQL) e servidor de sinalização pronto para múltiplas salas.
             </p>
          </div>
        </div>
      </div>
    </motion.div>

  </div>
</section>

      {/* --- FOOTER --- */}
      <footer className="py-20 px-6 lg:px-10 border-t border-slate-100 bg-slate-50/50">
        <div className="max-w-7xl mx-auto flex flex-col md:flex-row justify-between items-center gap-10">
          <div className="flex items-center gap-4">
            <img src="/imagens/logo.png" alt="Cencosud Logo" className="h-10 opacity-70 grayscale hover:grayscale-0 transition-all" />
            <div className="h-4 w-px bg-slate-300" />
            <span className="text-[10px] font-black text-slate-400 uppercase tracking-[0.3em]">Ambiente de Capacitação Estratégica</span>
          </div>
          
          <div className="flex gap-8 text-[11px] font-black text-[#002350] uppercase tracking-widest italic">
            <a href="#" className="hover:text-orange-500 transition">Privacidade</a>
            <a href="#" className="hover:text-orange-500 transition">Termos de Uso</a>
            <a href="#" className="hover:text-orange-500 transition">Suporte Técnico</a>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default LandingPage;