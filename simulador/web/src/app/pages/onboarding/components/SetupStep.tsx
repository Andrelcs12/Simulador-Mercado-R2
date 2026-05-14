"use client";

import React from "react";
import { motion } from "framer-motion";
import {
  ShieldAlert,
  HardDrive,
  Truck,
  Megaphone,
  Monitor,
  Wrench,
  ReceiptText,
  RefreshCw,
  Info,
  LucideIcon,
} from "lucide-react";

interface SetupProps {
  config: any;
  setConfig: React.Dispatch<React.SetStateAction<any>>;
}

interface CapexItem {
  id: string;
  label: string;
  Icon: LucideIcon;
  desc: string;
  color: string;
  bg: string;
  value: string;
  insight?: string;
}

const SetupStep = ({ config, setConfig }: SetupProps) => {
  const handleCapexChange = (field: string, value: number) => {
    setConfig((prev: any) => ({
      ...prev,
      capex: {
        ...(prev?.capex ?? {}),
        [field]: value,
      },
    }));
  };

  const capexValues = Object.values(config?.capex ?? {}) as number[];

  const totalGasto = capexValues.reduce((a, b) => a + (b || 0), 0);
  const saldoRestante = 700000 - totalGasto;

  const capexItems: CapexItem[] = [
    {
      id: "seguranca",
      label: "Segurança",
      Icon: ShieldAlert,
      desc: "Monitoramento de ataques cibernéticos.",
      color: "text-red-500",
      bg: "bg-red-50",
      value: "50.000",
      insight:
        "Impacto: +20% custo de licença.\n2 dias sem vendas se não implementado.",
    },
    {
      id: "equipamentos",
      label: "Equipamentos",
      Icon: Wrench,
      desc: "Troca de equipamentos desgastados.",
      color: "text-blue-500",
      bg: "bg-blue-50",
      value: "75.000",
      insight: "Reduz manutenção mensal. 1 dia sem vendas se não feito.",
    },
    {
      id: "redes",
      label: "Redes",
      Icon: HardDrive,
      desc: "Estabilidade de rede e pagamentos.",
      color: "text-blue-500",
      bg: "bg-blue-50",
      value: "80.000",
      insight: "Evita falhas de PDV e cartão.",
    },
    {
      id: "site",
      label: "Site",
      Icon: Monitor,
      desc: "Migração da plataforma digital.",
      color: "text-orange-500",
      bg: "bg-orange-50",
      value: "65.000",
      insight: "+30% performance no digital.",
    },
    {
      id: "self-checkout",
      label: "Self Checkout",
      Icon: ReceiptText,
      desc: "Automação de checkout.",
      color: "text-red-500",
      bg: "bg-red-50",
      value: "80.000",
      insight: "Aumenta eficiência de filas.",
    },
    {
      id: "melhorias",
      label: "Melhoria Contínua",
      Icon: RefreshCw,
      desc: "Automação de processos internos.",
      color: "text-green-500",
      bg: "bg-green-50",
      value: "45.000",
      insight: "Escalabilidade operacional.",
    },
  ];

  return (
    <div className="space-y-8">
      {/* HEADER */}
      <div className="flex flex-col md:flex-row justify-between gap-4 border-l-4 border-cencosud-orange pl-6">
        <div>
          <h2 className="text-3xl md:text-4xl font-black italic uppercase text-cencosud-blue">
            Investimento <span className="text-cencosud-orange">CAPEX</span>
          </h2>
          <p className="text-xs text-gray-500 font-bold">
            Rodada 01 - Alocação de Capital
          </p>
        </div>

        <div className="bg-white px-6 py-4 rounded-2xl border">
          <p className="text-[10px] font-black text-gray-400 uppercase">
            Saldo
          </p>
          <p
            className={`text-xl font-black ${
              saldoRestante < 0 ? "text-red-500" : "text-cencosud-blue"
            }`}
          >
            R$ {saldoRestante.toLocaleString("pt-BR")}
          </p>
        </div>
      </div>

      <p className="text-sm font-bold text-blue-800">
        Selecione os investimentos CAPEX
      </p>

      {/* GRID */}
      <div className="grid md:grid-cols-2 gap-6">
        {capexItems.map(
          ({ id, label, Icon, desc, color, bg, value, insight }) => (
            <motion.div
              key={id}
              whileHover={{ y: -4 }}
              whileTap={{ scale: 0.98 }}
              onClick={() => {
                const numericValue = Number(value.replace(/\./g, ""));
                const current = config?.capex?.[id] ?? 0;

                handleCapexChange(id, current > 0 ? 0 : numericValue);
              }}
              className={`cursor-pointer bg-white p-6 rounded-2xl border-2 transition ${
                config?.capex?.[id] > 0
                  ? "border-cencosud-orange"
                  : "border-gray-100"
              }`}
            >
              <div className="flex items-center gap-4 mb-4">
                <div className={`p-3 rounded-xl ${bg} ${color}`}>
                  <Icon size={26} />
                </div>

                <div>
                  <p className="font-black text-cencosud-blue">{label}</p>
                  <p className="text-[10px] text-gray-400 uppercase">
                    CAPEX estratégico
                  </p>
                </div>
              </div>

              <p className="text-sm text-gray-500">{desc}</p>

              <div className="mt-4 flex justify-between items-center">
                <span className="text-[10px] font-black text-gray-400 uppercase">
                  Investimento
                </span>
                <span className="font-mono font-black text-cencosud-orange">
                  R$ {value}
                </span>
              </div>

              {insight && (
                <div className="mt-4 bg-slate-50 p-3 rounded-xl flex gap-2">
                  <Info size={14} className="text-cencosud-blue mt-0.5" />
                  <p className="text-[11px] text-gray-500 whitespace-pre-line">
                    {insight}
                  </p>
                </div>
              )}
            </motion.div>
          )
        )}
      </div>
    </div>
  );
};

export default SetupStep;