"use client";

import React from 'react';
import { motion } from 'framer-motion';
import { 
  BarChart3, PieChart, TrendingUp, AlertTriangle, 
  CheckCircle2, DollarSign, Zap, FileText 
} from 'lucide-react';

// REUTILIZANDO AS INTERFACES PARA SEGURANÇA DE TIPO
interface CategoriaConfig {
  estoque: number;
  margem: number;
}

interface AppConfig {
  capex: Record<string, number>;
  comercial: {
    pereciveis: CategoriaConfig;
    mercearia: CategoriaConfig;
    higiene: CategoriaConfig;
    bebidas: CategoriaConfig;
  };
}

interface SummaryProps {
  config: AppConfig;
}

const SummaryStep = ({ config }: SummaryProps) => {
  // CÁLCULOS TOTAIS
  const totalCapex = Object.values(config.capex).reduce((acc, curr) => acc + curr, 0);
  
  const custosUnidades = { pereciveis: 15.5, mercearia: 8.9, higiene: 12.4, bebidas: 6.2 };
  
  const totalEstoque = 
    (config.comercial.pereciveis.estoque * custosUnidades.pereciveis) +
    (config.comercial.mercearia.estoque * custosUnidades.mercearia) +
    (config.comercial.higiene.estoque * custosUnidades.higiene) +
    (config.comercial.bebidas.estoque * custosUnidades.bebidas);

  const saldoFinal = 700000 - totalCapex - totalEstoque;
  const markupMedio = (
    config.comercial.pereciveis.margem + 
    config.comercial.mercearia.margem + 
    config.comercial.higiene.margem + 
    config.comercial.bebidas.margem
  ) / 4;

  return (
    <div className="space-y-8 pb-10">
      {/* HEADER DO RESUMO */}
      <div className="border-l-4 border-green-500 pl-6 py-2">
        <h2 className="text-4xl font-black text-cencosud-blue tracking-tight uppercase italic">
          Resumo <span className="text-green-500">Executivo</span>
        </h2>
        <p className="text-gray-500 font-bold text-xs mt-1 italic uppercase">Análise Final de Viabilidade - Rodada 01</p>
      </div>

      <div className="grid lg:grid-cols-3 gap-8">
        
        {/* COLUNA 1: ALOCAÇÃO FINANCEIRA (GRÁFICO VISUAL) */}
        <motion.div 
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          className="lg:col-span-1 bg-white p-8 rounded-[2.5rem] shadow-sm border border-gray-100"
        >
          <h3 className="font-black text-cencosud-blue mb-6 flex items-center gap-2 text-sm uppercase">
            <PieChart size={18} className="text-cencosud-orange" /> Divisão de Verba
          </h3>
          
          <div className="space-y-6">
            {/* BARRA PROGRESSIVA DE CAPEX */}
            <div>
              <div className="flex justify-between text-[10px] font-black uppercase mb-2">
                <span className="text-gray-400">Investimento CAPEX</span>
                <span className="text-cencosud-blue">R$ {totalCapex.toLocaleString()}</span>
              </div>
              <div className="h-4 bg-gray-100 rounded-full overflow-hidden">
                <motion.div 
                  initial={{ width: 0 }}
                  animate={{ width: `${(totalCapex / 395000) * 100}%` }}
                  className="h-full bg-cencosud-blue"
                />
              </div>
            </div>

            {/* BARRA PROGRESSIVA DE ESTOQUE */}
            <div>
              <div className="flex justify-between text-[10px] font-black uppercase mb-2">
                <span className="text-gray-400">Compra de Mercadoria</span>
                <span className="text-cencosud-blue">R$ {totalEstoque.toLocaleString()}</span>
              </div>
              <div className="h-4 bg-gray-100 rounded-full overflow-hidden">
                <motion.div 
                  initial={{ width: 0 }}
                  animate={{ width: `${(totalEstoque / 700000) * 100}%` }}
                  className="h-full bg-cencosud-orange"
                />
              </div>
            </div>

            <div className={`p-4 rounded-2xl border-2 border-dashed flex items-center justify-between ${saldoFinal < 0 ? 'border-red-200 bg-red-50 text-red-600' : 'border-green-100 bg-green-50 text-green-600'}`}>
              <span className="text-xs font-black uppercase italic">Saldo Livre</span>
              <span className="font-mono font-black">R$ {saldoFinal.toLocaleString()}</span>
            </div>
          </div>
        </motion.div>

        {/* COLUNA 2: MÉTRICAS DE PERFORMANCE ESTIMADAS */}
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="lg:col-span-2 space-y-6"
        >
          <div className="grid md:grid-cols-2 gap-6">
            <div className="bg-white p-6 rounded-[2rem] border border-gray-100 shadow-sm relative overflow-hidden">
              <Zap className="absolute -right-4 -top-4 w-24 h-24 text-blue-50 opacity-50" />
              <div className="relative z-10">
                <span className="text-[10px] font-black text-gray-400 uppercase tracking-widest block mb-2">Poder de Markup</span>
                <h4 className="text-3xl font-black text-cencosud-blue italic">{markupMedio.toFixed(1)}%</h4>
                <p className="text-[10px] text-blue-400 font-bold mt-2 uppercase tracking-tighter">Acima da média do setor</p>
              </div>
            </div>

            <div className="bg-white p-6 rounded-[2rem] border border-gray-100 shadow-sm relative overflow-hidden">
              <TrendingUp className="absolute -right-4 -top-4 w-24 h-24 text-orange-50 opacity-50" />
              <div className="relative z-10">
                <span className="text-[10px] font-black text-gray-400 uppercase tracking-widest block mb-2">Projeção EBITDA</span>
                <h4 className="text-3xl font-black text-cencosud-orange italic">R$ {(totalEstoque * (1 + markupMedio/100) * 0.15).toLocaleString('pt-BR', { maximumFractionDigits: 0 })}</h4>
                <p className="text-[10px] text-orange-400 font-bold mt-2 uppercase tracking-tighter">Estimativa baseada em margem</p>
              </div>
            </div>
          </div>

          {/* CHECKLIST DE VALIDAÇÃO */}
          <div className="bg-cencosud-blue p-8 rounded-[2.5rem] text-white">
            <h3 className="font-black uppercase text-xs tracking-widest mb-6 flex items-center gap-2 opacity-70">
              <FileText size={16} /> Checklist de Operação
            </h3>
            <div className="grid md:grid-cols-2 gap-4 text-sm font-bold">
              <div className="flex items-center gap-3">
                <CheckCircle2 size={18} className="text-green-400" />
                <span>CAPEX alocado corretamente</span>
              </div>
              <div className="flex items-center gap-3">
                <CheckCircle2 size={18} className="text-green-400" />
                <span>Estoque mínimo atingido</span>
              </div>
              <div className={`flex items-center gap-3 ${saldoFinal < 0 ? 'text-red-400' : 'text-green-400'}`}>
                {saldoFinal < 0 ? <AlertTriangle size={18} /> : <CheckCircle2 size={18} />}
                <span>{saldoFinal < 0 ? 'Orçamento Excedido' : 'Orçamento em Dia'}</span>
              </div>
              <div className="flex items-center gap-3">
                <CheckCircle2 size={18} className="text-green-400" />
                <span>Markup estratégico definido</span>
              </div>
            </div>
          </div>
        </motion.div>
      </div>

      {/* FOOTER DE AVISO IA */}
      <motion.div 
        animate={{ scale: [1, 1.01, 1] }}
        transition={{ duration: 2, repeat: Infinity }}
        className="bg-yellow-50 border border-yellow-100 p-6 rounded-[2rem] flex items-center gap-5"
      >
        <div className="p-3 bg-white rounded-xl shadow-sm text-yellow-600">
          <AlertTriangle size={24} />
        </div>
        <div>
          <h5 className="font-black text-cencosud-blue text-xs uppercase tracking-widest leading-none mb-1">Atenção André (Gestor)</h5>
          <p className="text-xs text-yellow-800 font-bold opacity-80">
            Uma vez que você confirmar o planejamento, os dados serão enviados para o processamento da rodada. Certifique-se de que os Gerentes de Categoria estão de acordo com o markup médio de **{markupMedio.toFixed(1)}%**.
          </p>
        </div>
      </motion.div>
    </div>
  );
};

export default SummaryStep;