"use client";

import { motion } from "framer-motion";
import {
  ShieldAlert,
  Wrench,
  HardDrive,
  Monitor,
  ReceiptText,
  RefreshCw,
  LucideIcon,
} from "lucide-react";
import { AppConfig, CategoriaKey } from "../types/onboarding";

interface Props {
  config: AppConfig;
  setConfig: React.Dispatch<React.SetStateAction<AppConfig>>;
}

type CapexItem = {
  id: string;
  label: string;
  icon: LucideIcon;
  desc: string;
  value: number;
};

const CAPEX_ITEMS: CapexItem[] = [
  { id: "seguranca", label: "Segurança", icon: ShieldAlert, desc: "Proteção operacional", value: 50000 },
  { id: "equipamentos", label: "Equipamentos", icon: Wrench, desc: "Hardware", value: 75000 },
  { id: "redes", label: "Redes", icon: HardDrive, desc: "Estabilidade", value: 80000 },
  { id: "site", label: "Site", icon: Monitor, desc: "Digital", value: 65000 },
  { id: "selfcheckout", label: "Self Checkout", icon: ReceiptText, desc: "Automação", value: 80000 },
  { id: "melhoria", label: "Melhoria", icon: RefreshCw, desc: "Eficiência", value: 45000 },
];

export default function SetupStep({ config, setConfig }: Props) {
  const toggle = (id: string, value: number) => {
    setConfig((prev) => ({
      ...prev,
      capex: {
        ...prev.capex,
        [id]: prev.capex[id] ? 0 : value,
      },
    }));
  };

  const total = Object.values(config.capex).reduce((a, b) => a + b, 0);
  const saldo = 700000 - total;

  return (
    <div className="space-y-6">

      <div>
        <h2 className="text-2xl font-black flex items-center gap-2">
          <ShieldAlert /> CAPEX
        </h2>
        <p className="text-sm text-gray-500">
          Escolha investimentos estratégicos.
        </p>
      </div>

      <div className="p-4 border rounded-xl">
        <p className="text-sm font-bold">Saldo</p>
        <p className={`text-xl font-black ${saldo < 0 ? "text-red-500" : ""}`}>
          R$ {saldo.toLocaleString("pt-BR")}
        </p>
      </div>

      <div className="grid md:grid-cols-2 gap-4">
        {CAPEX_ITEMS.map((item) => {
          const Icon = item.icon;
          const selected = config.capex[item.id] > 0;

          return (
            <motion.div
              key={item.id}
              whileHover={{ scale: 1.02 }}
              onClick={() => toggle(item.id, item.value)}
              className={`p-5 border rounded-xl cursor-pointer ${
                selected ? "border-blue-500 bg-blue-50" : ""
              }`}
            >
              <div className="flex items-center gap-2">
                <Icon size={18} />
                <p className="font-bold">{item.label}</p>
              </div>

              <p className="text-sm text-gray-500 mt-2">{item.desc}</p>

              <p className="mt-3 font-mono font-bold">
                R$ {item.value.toLocaleString("pt-BR")}
              </p>
            </motion.div>
          );
        })}
      </div>
    </div>
  );
}