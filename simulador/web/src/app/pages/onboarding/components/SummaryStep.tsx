"use client";

import React from 'react';
import { motion } from 'framer-motion';
import { 
  BarChart3, PieChart, TrendingUp, AlertTriangle, 
  CheckCircle2, DollarSign, Zap, FileText,
  ShieldAlert, HardDrive, Truck, Megaphone, Monitor, Wrench, ReceiptText, RefreshCw,
  ShoppingBasket, Package, Droplets, Wine, Users, XCircle, ClipboardList
} from 'lucide-react';

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
  operadores?: number; // <- adicione isso ao estado global
}

interface SummaryProps {
  config: AppConfig;
}

// Mapa de ícones e labels para os CAPEX
const capexMeta: Record<string, { label: string; Icon: any; value: number }> = {
  seguranca:      { label: 'Segurança',         Icon: ShieldAlert,  value: 50000 },
  equipamentos:   { label: 'Equipamentos',      Icon: Wrench,       value: 75000 },
  redes:          { label: 'Redes',             Icon: HardDrive,    value: 80000 },
  site:           { label: 'Site',              Icon: Monitor,      value: 65000 },
  'self-checkout':{ label: 'Self Checkout',     Icon: ReceiptText,  value: 80000 },
  melhorias:      { label: 'Melhoria Contínua', Icon: RefreshCw,    value: 45000 },
};

const categoriaMeta = [
  { id: 'pereciveis', label: 'Perecíveis',      Icon: ShoppingBasket, custoUn: 15.50, cor: 'text-red-500',    bg: 'bg-red-50'    },
  { id: 'mercearia',  label: 'Mercearia',       Icon: Package,        custoUn: 8.90,  cor: 'text-blue-500',   bg: 'bg-blue-50'   },
  { id: 'higiene',    label: 'Higiene & Limpeza',Icon: Droplets,       custoUn: 12.40, cor: 'text-green-500',  bg: 'bg-green-50'  },
  { id: 'bebidas',    label: 'Bebidas',         Icon: Wine,           custoUn: 6.20,  cor: 'text-orange-500', bg: 'bg-orange-50' },
] as const;

const SummaryStep = ({ config }: SummaryProps) => {
  const totalCapex = Object.values(config.capex).reduce((acc, curr) => acc + curr, 0);

  const custosUnidades = { pereciveis: 15.5, mercearia: 8.9, higiene: 12.4, bebidas: 6.2 };
  const totalEstoque =
    (config.comercial.pereciveis.estoque * custosUnidades.pereciveis) +
    (config.comercial.mercearia.estoque  * custosUnidades.mercearia)  +
    (config.comercial.higiene.estoque    * custosUnidades.higiene)    +
    (config.comercial.bebidas.estoque    * custosUnidades.bebidas);

  const saldoFinal = 700000 - totalCapex - totalEstoque;
  const markupMedio = (
    config.comercial.pereciveis.margem +
    config.comercial.mercearia.margem  +
    config.comercial.higiene.margem    +
    config.comercial.bebidas.margem
  ) / 4;

  const operadores = config.operadores ?? 0;
  const margemOperadores = (operadores / 10) * 100;
  const taxaSLA = operadores < 6 ? 6 - operadores : 1;

  const capexSelecionados = Object.entries(config.capex).filter(([, v]) => v > 0);
  const capexNaoSelecionados = Object.entries(config.capex).filter(([, v]) => v === 0);

  return (
    <div className="space-y-8 pb-10">
      {/* HEADER */}
      <div className="border-l-4 border-green-500 pl-6 py-2">
        <h2 className="text-4xl font-black text-cencosud-blue tracking-tight uppercase italic">
          Resumo <span className="text-green-500">Executivo</span>
        </h2>
        <p className="text-gray-500 font-bold text-xs mt-1">Sessão de Alocação de Capital - Rodada Final</p>
      </div>

      {/* ===================== BOX DE SUMÁRIO DAS DECISÕES ===================== */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.1 }}
        className="bg-white rounded-[2.5rem] border border-gray-100 shadow-sm overflow-hidden"
      >
        {/* Cabeçalho da box */}
        <div className="bg-cencosud-blue px-8 py-5 flex items-center gap-3">
          <ClipboardList size={20} className="text-cencosud-orange" />
          <h3 className="font-black text-white uppercase text-sm tracking-widest">
            Resumo das Decisões Tomadas
          </h3>
        </div>

        <div className="grid lg:grid-cols-3 divide-y lg:divide-y-0 lg:divide-x divide-gray-100">

          {/* ---- COLUNA 1: CAPEX ---- */}
          <div className="p-6 space-y-4">
            <h4 className="text-[10px] font-black text-gray-400 uppercase tracking-widest flex items-center gap-2">
              <DollarSign size={13} className="text-cencosud-orange" /> Investimentos CAPEX
            </h4>

            {/* Selecionados */}
            {capexSelecionados.length === 0 && (
              <p className="text-xs text-gray-400 italic">Nenhum CAPEX selecionado.</p>
            )}
            {capexSelecionados.map(([id, valor]) => {
              const meta = capexMeta[id];
              if (!meta) return null;
              const { label, Icon } = meta;
              return (
                <div key={id} className="flex items-center gap-3">
                  <div className="p-2 rounded-xl bg-green-50 text-green-500 shrink-0">
                    <Icon size={15} />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-xs font-black text-cencosud-blue truncate">{label}</p>
                    <p className="text-[10px] text-gray-400 font-mono">
                      R$ {valor.toLocaleString('pt-BR')}
                    </p>
                  </div>
                  <CheckCircle2 size={16} className="text-green-400 shrink-0" />
                </div>
              );
            })}

            {/* Não selecionados */}
            {capexNaoSelecionados.map(([id]) => {
              const meta = capexMeta[id];
              if (!meta) return null;
              const { label, Icon } = meta;
              return (
                <div key={id} className="flex items-center gap-3 opacity-40">
                  <div className="p-2 rounded-xl bg-gray-100 text-gray-400 shrink-0">
                    <Icon size={15} />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-xs font-black text-gray-400 truncate line-through">{label}</p>
                    <p className="text-[10px] text-gray-300 font-mono">Não selecionado</p>
                  </div>
                  <XCircle size={16} className="text-gray-300 shrink-0" />
                </div>
              );
            })}

            {/* Total CAPEX */}
            <div className="pt-3 border-t border-gray-100 flex justify-between items-center">
              <span className="text-[10px] font-black text-gray-400 uppercase">Total CAPEX</span>
              <span className="font-mono font-black text-cencosud-blue text-sm">
                R$ {totalCapex.toLocaleString('pt-BR')}
              </span>
            </div>
          </div>

          {/* ---- COLUNA 2: COMERCIAL ---- */}
          <div className="p-6 space-y-4">
            <h4 className="text-[10px] font-black text-gray-400 uppercase tracking-widest flex items-center gap-2">
              <ShoppingBasket size={13} className="text-cencosud-orange" /> Planejamento Comercial
            </h4>

            {categoriaMeta.map(({ id, label, Icon, custoUn, cor, bg }) => {
              const dados = config.comercial[id];
              const subtotal = dados.estoque * custoUn;
              return (
                <div key={id} className="flex items-center gap-3">
                  <div className={`p-2 rounded-xl ${bg} ${cor} shrink-0`}>
                    <Icon size={15} />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-xs font-black text-cencosud-blue">{label}</p>
                    <div className="flex gap-3 mt-0.5">
                      <span className="text-[10px] text-gray-400 font-mono">
                        {dados.estoque} un
                      </span>
                      <span className="text-[10px] text-cencosud-orange font-black">
                        {dados.margem}% margem
                      </span>
                    </div>
                  </div>
                  <span className="text-[10px] font-mono font-black text-cencosud-blue shrink-0">
                    R$ {subtotal.toLocaleString('pt-BR', { maximumFractionDigits: 0 })}
                  </span>
                </div>
              );
            })}

            {/* Totais comercial */}
            <div className="pt-3 border-t border-gray-100 space-y-1">
              <div className="flex justify-between">
                <span className="text-[10px] font-black text-gray-400 uppercase">Invest. Estoque</span>
                <span className="font-mono font-black text-cencosud-blue text-sm">
                  R$ {totalEstoque.toLocaleString('pt-BR', { maximumFractionDigits: 0 })}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-[10px] font-black text-gray-400 uppercase">Markup Médio</span>
                <span className="font-mono font-black text-cencosud-orange text-sm">
                  {markupMedio.toFixed(1)}%
                </span>
              </div>
            </div>
          </div>

          {/* ---- COLUNA 3: OPERADORES + SALDO ---- */}
          <div className="p-6 space-y-4">
            <h4 className="text-[10px] font-black text-gray-400 uppercase tracking-widest flex items-center gap-2">
              <Users size={13} className="text-cencosud-orange" /> Operadores & Caixa
            </h4>

            {/* Card operadores */}
            <div className="bg-blue-50 rounded-2xl p-4 space-y-3">
              <div className="flex justify-between items-center">
                <span className="text-[10px] font-black text-gray-400 uppercase">Operadores</span>
                <span className="font-mono font-black text-cencosud-blue text-lg">{operadores}</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-[10px] font-black text-gray-400 uppercase">Margem Operadores</span>
                <span className="font-mono font-black text-cencosud-orange">{margemOperadores}%</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-[10px] font-black text-gray-400 uppercase">Taxa SLA</span>
                <span className={`font-mono font-black text-sm ${taxaSLA > 1 ? 'text-red-500' : 'text-green-500'}`}>
                  {taxaSLA} dia(s)
                </span>
              </div>
              {/* Barra visual operadores */}
              <div className="h-2 bg-white rounded-full overflow-hidden">
                <motion.div
                  initial={{ width: 0 }}
                  animate={{ width: `${margemOperadores}%` }}
                  transition={{ delay: 0.3 }}
                  className="h-full bg-cencosud-orange rounded-full"
                />
              </div>
            </div>

            {/* Saldo final */}
            <div className={`rounded-2xl p-4 border-2 border-dashed space-y-2 ${
              saldoFinal < 0 ? 'border-red-200 bg-red-50' : 'border-green-100 bg-green-50'
            }`}>
              <span className={`text-[10px] font-black uppercase ${saldoFinal < 0 ? 'text-red-500' : 'text-green-600'}`}>
                Saldo Final de Caixa
              </span>
              <p className={`font-mono font-black text-xl ${saldoFinal < 0 ? 'text-red-500' : 'text-green-600'}`}>
                R$ {saldoFinal.toLocaleString('pt-BR', { maximumFractionDigits: 0 })}
              </p>
              <div className="space-y-1 pt-1 border-t border-dashed border-current opacity-50">
                <div className="flex justify-between text-[10px] font-bold">
                  <span>Orçamento</span><span>R$ 700.000</span>
                </div>
                <div className="flex justify-between text-[10px] font-bold">
                  <span>- CAPEX</span><span>R$ {totalCapex.toLocaleString('pt-BR')}</span>
                </div>
                <div className="flex justify-between text-[10px] font-bold">
                  <span>- Estoque</span>
                  <span>R$ {totalEstoque.toLocaleString('pt-BR', { maximumFractionDigits: 0 })}</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </motion.div>
      {/* ===================================================================== */}

      <div className="grid lg:grid-cols-3 gap-8">
        {/* COLUNA 1: DIVISÃO DE VERBA */}
        <motion.div
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          className="lg:col-span-1 bg-white p-8 rounded-[2.5rem] shadow-sm border border-gray-100"
        >
          <h3 className="font-black text-cencosud-blue mb-6 flex items-center gap-2 text-sm uppercase">
            <PieChart size={18} className="text-cencosud-orange" /> Divisão de Verba
          </h3>
          <div className="space-y-6">
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

        {/* COLUNA 2: MÉTRICAS + CHECKLIST */}
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
                <h4 className="text-3xl font-black text-cencosud-orange italic">R$ {(totalEstoque * (1 + markupMedio / 100) * 0.15).toLocaleString('pt-BR', { maximumFractionDigits: 0 })}</h4>
                <p className="text-[10px] text-orange-400 font-bold mt-2 uppercase tracking-tighter">Estimativa baseada em margem</p>
              </div>
            </div>
          </div>

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
              <div className={`flex items-center gap-3 ${operadores >= 6 ? 'text-green-400' : 'text-yellow-400'}`}>
                {operadores >= 6 ? <CheckCircle2 size={18} /> : <AlertTriangle size={18} />}
                <span>{operadores >= 6 ? `${operadores} Operadores Contratados` : 'Operadores Abaixo do Ideal'}</span>
              </div>
            </div>
          </div>
        </motion.div>
      </div>

      {/* FOOTER AVISO */}
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