"use client";

import React from 'react';
import { motion } from 'framer-motion';
import { ShoppingBasket, Package, Droplets, Wine, TrendingUp, Calculator, AlertCircle, LucideIcon } from 'lucide-react';

// 1. DEFINIÇÃO DAS INTERFACES (O QUE MATA O ERRO)
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

interface ComercialProps {
  config: AppConfig; // Agora o TS sabe exatamente o que tem aqui
  setConfig: React.Dispatch<React.SetStateAction<any>>;
}

interface CategoriaDisplay {
  id: keyof AppConfig['comercial'];
  label: string;
  Icon: LucideIcon;
  custoUn: number;
  cor: string;
}

const ComercialStep = ({ config, setConfig }: ComercialProps) => {
  
  const categorias: CategoriaDisplay[] = [
    { id: 'pereciveis', label: 'Perecíveis', Icon: ShoppingBasket, custoUn: 15.50, cor: 'text-red-500' },
    { id: 'mercearia', label: 'Mercearia', Icon: Package, custoUn: 8.90, cor: 'text-blue-500' },
    { id: 'higiene', label: 'Higiene & Limpeza', Icon: Droplets, custoUn: 12.40, cor: 'text-green-500' },
    { id: 'bebidas', label: 'Bebidas', Icon: Wine, custoUn: 6.20, cor: 'text-orange-500' },
  ];

  const handleUpdate = (catId: keyof AppConfig['comercial'], field: keyof CategoriaConfig, value: number) => {
    setConfig({
      ...config,
      comercial: {
        ...config.comercial,
        [catId]: { ...config.comercial[catId], [field]: value }
      }
    });
  };

  // 2. CÁLCULOS COM TIPAGEM GARANTIDA
  const totalInvestidoEstoque = categorias.reduce((acc, cat) => {
    const dados = config.comercial[cat.id];
    return acc + (dados.estoque * cat.custoUn);
  }, 0);

  const capexGasto = Object.values(config.capex).reduce((acc, curr) => acc + curr, 0);
  const saldoAtual = 700000 - capexGasto - totalInvestidoEstoque;

  // Cálculo do Markup Médio (Seguro contra unknown)
  const listaCategorias = Object.values(config.comercial) as CategoriaConfig[];
  const markupMedio = listaCategorias.reduce((acc, curr) => acc + (curr.margem || 0), 0) / 4;

  return (
    <div className="space-y-8">
      {/* HEADER */}
      <div className="flex flex-col md:flex-row justify-between items-end gap-4 border-l-4 border-cencosud-blue pl-6 py-2">
        <div>
          <h2 className="text-4xl font-black text-cencosud-blue tracking-tight uppercase italic">
            Planejamento <span className="text-cencosud-orange">Comercial</span>
          </h2>
        </div>
        
        <div className="bg-white px-6 py-4 rounded-2xl shadow-sm border border-gray-100">
          <span className="text-[10px] font-black text-gray-400 uppercase tracking-widest block mb-1">Caixa Restante</span>
          <span className={`text-2xl font-black font-mono ${saldoAtual < 0 ? 'text-red-500' : 'text-green-600'}`}>
            R$ {saldoAtual.toLocaleString('pt-BR')}
          </span>
        </div>
      </div>

      {/* TABELA */}
      <div className="bg-white rounded-[2.5rem] shadow-sm border border-gray-100 overflow-hidden">
        {categorias.map(({ id, label, Icon, custoUn, cor }) => (
          <div key={id} className="grid grid-cols-12 p-6 items-center border-b border-gray-50 last:border-0">
            <div className="col-span-4 flex items-center gap-4">
              <div className={`p-3 rounded-xl bg-gray-50 ${cor}`}><Icon size={22} /></div>
              <div>
                <h4 className="font-black text-cencosud-blue text-sm">{label}</h4>
                <p className="text-[10px] font-bold text-gray-400 font-mono">Custo: R$ {custoUn.toFixed(2)}</p>
              </div>
            </div>

            <div className="col-span-3 px-4 text-center">
              <span className="text-[9px] font-black text-gray-300 uppercase block mb-2">Compra (Un)</span>
              <input 
                type="number"
                value={config.comercial[id].estoque || ''}
                onChange={(e) => handleUpdate(id, 'estoque', parseInt(e.target.value) || 0)}
                className="w-full bg-gray-100 border-2 border-transparent focus:border-cencosud-blue focus:bg-white rounded-xl py-3 text-center font-black text-cencosud-blue outline-none transition-all"
              />
            </div>

            <div className="col-span-3 px-4 text-center">
              <span className="text-[9px] font-black text-gray-300 uppercase block mb-2">Margem (%)</span>
              <input 
                type="number"
                value={config.comercial[id].margem || ''}
                onChange={(e) => handleUpdate(id, 'margem', parseInt(e.target.value) || 0)}
                className="w-full bg-gray-100 border-2 border-transparent focus:border-cencosud-orange focus:bg-white rounded-xl py-3 text-center font-black text-cencosud-orange outline-none transition-all"
              />
            </div>

            <div className="col-span-2 text-right">
              <span className="text-[10px] font-black text-gray-400 block mb-1 uppercase">Subtotal</span>
              <span className="font-mono font-bold text-cencosud-blue text-sm">
                R$ {(config.comercial[id].estoque * custoUn).toLocaleString('pt-BR')}
              </span>
            </div>
          </div>
        ))}
      </div>

      {/* FOOTER RESUMO */}
      <div className="grid md:grid-cols-3 gap-6">
        <div className="bg-cencosud-blue p-6 rounded-[2rem] text-white flex items-center gap-4">
          <Calculator className="text-cencosud-orange" />
          <div>
            <span className="text-[10px] font-black uppercase opacity-60 block">Markup Médio</span>
            <span className="text-xl font-black">{markupMedio.toFixed(1)}%</span>
          </div>
        </div>

        <div className="bg-white p-6 rounded-[2rem] border border-gray-100 flex items-center gap-4 text-cencosud-blue">
          <TrendingUp className="text-cencosud-orange" />
          <div>
            <span className="text-[10px] font-black uppercase text-gray-400 block">Invest. Estoque</span>
            <span className="text-xl font-black">R$ {totalInvestidoEstoque.toLocaleString('pt-BR')}</span>
          </div>
        </div>

        <div className={`p-6 rounded-[2rem] border flex items-center gap-4 ${saldoAtual < 0 ? 'bg-red-50 border-red-100 text-red-600' : 'bg-green-50 border-green-100 text-green-600'}`}>
          <AlertCircle />
          <div>
            <span className="text-[10px] font-black uppercase opacity-60 block">Status Caixa</span>
            <span className="text-xl font-black uppercase italic">{saldoAtual < 0 ? 'Déficit' : 'OK'}</span>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ComercialStep;