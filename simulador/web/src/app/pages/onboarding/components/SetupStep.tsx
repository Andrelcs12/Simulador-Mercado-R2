"use client";

import React from 'react';
import { motion } from 'framer-motion';
import { 
  ShieldAlert, HardDrive, Truck, Megaphone, Monitor, Wrench, ReceiptText, RefreshCw,
  Info, LucideIcon 
} from 'lucide-react';

interface SetupProps {
  config: any;
  setConfig: React.Dispatch<React.SetStateAction<any>>;
}

// Definimos a estrutura dos itens para facilitar o loop
interface CapexItem {
  id: string;
  label: string;
  Icon: LucideIcon; // Usamos o tipo do componente, não o elemento
  desc: string;
  color: string;
  bg: string;
  value: string;
  insight?: string;
}

const SetupStep = ({ config, setConfig }: SetupProps) => {
  
  const handleCapexChange = (field: string, value: number) => {
    setConfig({
      ...config,
      capex: { ...config.capex, [field]: value }
    });
  };

  const totalGasto = Object.values(config.capex).reduce((a: any, b: any) => a + b, 0);
  const saldoRestante = 700000 - (totalGasto as number);

  const capexItems: CapexItem[] = [
    { 
      id: 'seguranca', 
      label: 'Segurança', 
      Icon: ShieldAlert, 
      desc: 'Instalar softwares de monitoramento de ataques cibernéticos para prevenir possíveis ataques no ambiente.',
      color: 'text-red-500',
      bg: 'bg-red-50',
      value: '50.000',
      insight: 'Efetuando o CAPEX ocorrerá um incremento de 20% no valor de R$ 500,00 que é pago atualmente referente a licença da plataforma. \n\n2 dias sem vendas caso não ocorra a efetuação desse CAPEX. (Somado ao SLA)',
    },
    { 
      id: 'equipamentos', 
      label: 'Equipamentos', 
      Icon: Wrench, 
      desc: 'Adquirir novos equipamentos para a troca dos atuais, tendo em vista que estão bem desgastados.',
      color: 'text-blue-500',
      bg: 'bg-blue-50',
      value: '75.000',
      insight: 'Efetuando o CAPEX não será necessário pagar a taxa de manutenção de R$ 400,00 em equipamentos, pois serão novos em garantia. \n\n1 dia sem vendas caso não ocorra a efetuação desse CAPEX. (Somado ao SLA)',
    },
    { 
      id: 'redes', 
      label: 'Redes', 
      Icon: HardDrive, 
      desc: 'Efetuar a migração da infraestrutura de redes da loja, pois está apresentando oscilação na conexão com os parceiros, inclusive o sistema de cartão que opera no PDV.',
      color: 'text-blue-500',
      bg: 'bg-blue-50',
      value: '80.000',
      insight: '2 dias sem vendas caso não ocorra a efetuação desse CAPEX. (Somado ao SLA)',
    },
    { 
      id: 'site', 
      label: 'Site', 
      Icon: Monitor, 
      desc: 'Migrar nossa plataforma de vendas no digital para outra mais robusta, estamos tendo reclamações de lentidão no site que afeta a venda no digital.',
      color: 'text-orange-500',
      bg: 'bg-orange-50',
      value: '65.000',
      insight: 'Efetuando o CAPEX ocorrerá um incremento de 30% no valor de R$ 500,00 que é pago atualmente referente a licença da plataforma. \n\n1 dia sem vendas caso não ocorra a efetuação desse CAPEX. (Somado ao SLA)',
    },
    { 
      id: 'self-checkout', 
      label: 'Self Checkout', 
      Icon: ReceiptText, 
      desc: 'Adquirir self checkouts para a operação da loja.',
      color: 'text-red-500',
      bg: 'bg-red-50',
      value: '80.000',
      insight: 'A implementação desse CAPEX ajudará no serviço prestado aos clientes dando maior agilidade as filas, isso também acarretará um aumento de custo com o licenciamento, pois para cada self o custo é de R$ 80,00 por mês. \n\n2 dias sem vendas caso não ocorra a efetuação desse CAPEX. (Somado ao SLA)',
    },
    { 
      id: 'melhorias', 
      label: 'Melhoria Contínua', 
      Icon: RefreshCw, 
      desc: 'Efetuar melhorias em relatórios gerenciais que demoram em média duas horas para gerar e automatizar processos manuais.',
      color: 'text-green-500',
      bg: 'bg-green-50',
      value: '45.000',
      insight: 'Caso não implemente esse CAPEX a loja poderá ter dificuldade em expandir sua operação, pois o time atual não terá braços para novas demandas.',
    },
  ];

  return (
    <div className="space-y-8">
      {/* HEADER LOCAL */}
      <div className="flex flex-col md:flex-row justify-between items-end gap-4 border-l-4 border-cencosud-orange pl-6 py-2">
        <div>
          <h2 className="text-4xl font-black text-cencosud-blue tracking-tight uppercase italic">
            Investimento <span className="text-cencosud-orange">CAPEX</span>
          </h2>
          <p className="text-gray-500 font-bold text-xs mt-1">Sessão de Alocação de Capital - Rodada 01</p>
        </div>
        
        <div className="bg-white px-6 py-4 rounded-2xl shadow-sm border border-gray-100">
          <span className="text-[10px] font-black text-gray-400 uppercase tracking-widest block mb-1">Saldo para Mercadorias</span>
          <span className={`text-2xl font-black font-mono ${saldoRestante < 0 ? 'text-red-500' : 'text-cencosud-blue'}`}>
            R$ {saldoRestante.toLocaleString('pt-BR')}
          </span>
        </div>
      </div>

      <p className="text-base text-blue-800 font-bold leading-relaxed">
          Selecione o CAPEX que deseja escolher:
      </p>

      {/* BOX DE INSIGHT */}
      <div className="bg-blue-50 border border-blue-100 p-6 rounded-[2rem] flex items-center gap-4">
        <div className="bg-white p-3 rounded-xl text-cencosud-blue shadow-sm">
          <Info size={20} />
        </div>
        <p className="text-xs text-blue-800 font-bold leading-relaxed">
          <span className="text-cencosud-blue font-black uppercase mr-2">Dica:</span> 
          Lembre-se que cada R$ investido aqui é descontado do seu lucro bruto no final da rodada (EBITDA). Gaste com sabedoria!
        </p>
      </div>

      {/* GRID DE CARDS */}
      <div className="grid md:grid-cols-2 gap-6">
        {capexItems.map(({ id, label, Icon, desc, color, bg, value, insight}) => (
          <motion.div 
            key={id}
            whileHover={{ y: -4 }}
            whileTap={{ scale: 0.98 }}
            onClick={ () => {
              const numericValue = parseInt(value.replace('.', ''));
              const newValue = config.capex[id] > 0 ? 0 : numericValue;
              handleCapexChange(id, newValue);
            }}
            className={`cursor-pointer transition-colors duration-300 bg-white p-6 rounded-[2rem] shadow-sm border-2 ${
                      config.capex[id] > 0 ? 'border-cencosud-orange shadow-md' : 'border-gray-100'
                      }`}
          >
            <div className="flex items-center gap-4 mb-6">
              <div className={`p-4 rounded-2xl ${bg} ${color}`}>
                <Icon size={28} /> {/* Aqui o size funciona perfeitamente */}
              </div>
              <div>
                <h4 className="text-lg font-black text-cencosud-blue">{label}</h4>
                <p className="text-[10px] text-gray-400 font-black uppercase tracking-widest">Investimento Crítico</p>
              </div>
            </div>

            <div className="space-y-6">
              <p className="text-sm text-gray-400 font-medium leading-relaxed">{desc}</p>
              
              <div className="space-y-3">
                <div className="flex justify-between items-center">
                  <span className="text-[10px] font-black text-cencosud-blue uppercase">Aporte Financeiro</span>
                  <span className="font-mono font-black text-cencosud-orange bg-orange-50 px-3 py-1 rounded-lg">
                    R$ {value}
                  </span>
                </div>

                      {/* --- NOVO MINI BOX DE INSIGHT --- */}
                {insight && (
                  <div className="mt-4 bg-slate-50 border border-slate-100 p-3 rounded-xl flex items-start gap-3 whitespace-pre-line">
                    <Info size={16} className="text-cencosud-blue shrink-0 mt-0.5" />
                    <p className="text-[11px] text-slate-500 font-medium leading-relaxed">
                      <span className="text-cencosud-blue font-black uppercase mr-1">Impacto:</span>
                      {insight}
                    </p>
                  </div>
                )}
                {/* -------------------------------- */}
                
              </div>
            </div>
          </motion.div>
        ))}
      </div>

      
    </div>
  );
};

export default SetupStep;