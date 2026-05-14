"use client";

import React from "react";
import { motion } from "framer-motion";
import {
  ShoppingBasket,
  Package,
  Droplets,
  Computer,
  TrendingUp,
  Calculator,
  AlertCircle,
  LucideIcon,
  Info,
} from "lucide-react";

interface CategoriaConfig {
  estoque: number;
  margem: number;
}

interface AppConfig {
  capex: Record<string, number>;
  comercial: Record<string, CategoriaConfig>;
}

interface Props {
  config: AppConfig;
  setConfig: React.Dispatch<React.SetStateAction<any>>;
}

interface CategoriaDisplay {
  id: string;
  label: string;
  Icon: LucideIcon;
  custoUn: number;
  cor: string;
}

const ComercialStep = ({ config, setConfig }: Props) => {
  const categorias: CategoriaDisplay[] = [
    { id: "pereciveis", label: "Perecíveis", Icon: ShoppingBasket, custoUn: 15.5, cor: "text-red-500" },
    { id: "mercearia", label: "Mercearia", Icon: Package, custoUn: 8.9, cor: "text-blue-500" },
    { id: "eletro", label: "Eletrônicos", Icon: Computer, custoUn: 12.4, cor: "text-green-500" },
    { id: "hipel", label: "Higiene e Limpeza", Icon: Droplets, custoUn: 6.2, cor: "text-orange-500" },
  ];

  const update = (cat: string, field: keyof CategoriaConfig, value: number) => {
    setConfig((prev: any) => ({
      ...prev,
      comercial: {
        ...prev.comercial,
        [cat]: {
          ...(prev.comercial?.[cat] ?? { estoque: 0, margem: 0 }),
          [field]: value,
        },
      },
    }));
  };

  const capexTotal = Object.values(config?.capex ?? {}).reduce(
    (a: number, b: number) => a + (b || 0),
    0
  );

  const estoqueTotal = categorias.reduce((acc, c) => {
    const q = config?.comercial?.[c.id]?.estoque ?? 0;
    return acc + q * c.custoUn;
  }, 0);

  const saldo = 700000 - capexTotal - estoqueTotal;

  const markup =
    categorias.reduce(
      (a, c) => a + (config?.comercial?.[c.id]?.margem ?? 0),
      0
    ) / categorias.length;

  return (
    <div className="space-y-8">
      {/* HEADER */}
      <div className="flex flex-col md:flex-row justify-between gap-4 border-l-4 border-cencosud-blue pl-6">
        <div>
          <h2 className="text-3xl md:text-4xl font-black italic uppercase text-cencosud-blue">
            Planejamento <span className="text-cencosud-orange">Comercial</span>
          </h2>
          <p className="text-xs text-gray-500 font-bold">
            Rodada 02
          </p>
        </div>

        <div className="bg-white px-6 py-4 rounded-2xl border">
          <p className="text-[10px] font-black text-gray-400 uppercase">
            Caixa
          </p>
          <p className={`text-xl font-black ${saldo < 0 ? "text-red-500" : "text-green-600"}`}>
            R$ {saldo.toLocaleString("pt-BR")}
          </p>
        </div>
      </div>

      {/* GRID */}
      <div className="bg-white rounded-2xl border overflow-hidden">
        {categorias.map(({ id, label, Icon, custoUn, cor }) => {
          const estoque = config?.comercial?.[id]?.estoque ?? 0;
          const margem = config?.comercial?.[id]?.margem ?? 0;

          return (
            <div
              key={id}
              className="grid grid-cols-12 p-4 md:p-6 border-b last:border-0 items-center"
            >
              <div className="col-span-12 md:col-span-4 flex gap-3 items-center">
                <Icon className={cor} />
                <div>
                  <p className="font-black text-cencosud-blue">{label}</p>
                  <p className="text-[10px] text-gray-400">
                    R$ {custoUn.toFixed(2)}
                  </p>
                </div>
              </div>

              <div className="col-span-6 md:col-span-2">
                <input
                  type="number"
                  value={estoque}
                  onChange={(e) => update(id, "estoque", Number(e.target.value))}
                  className="w-full bg-gray-100 rounded-xl p-2 text-center font-black"
                />
              </div>

              <div className="col-span-6 md:col-span-2">
                <input
                  type="number"
                  value={margem}
                  onChange={(e) => update(id, "margem", Number(e.target.value))}
                  className="w-full bg-gray-100 rounded-xl p-2 text-center font-black"
                />
              </div>

              <div className="col-span-12 md:col-span-4 text-right font-mono">
                R$ {(estoque * custoUn).toLocaleString("pt-BR")}
              </div>
            </div>
          );
        })}
      </div>

      {/* FOOTER */}
      <div className="grid md:grid-cols-3 gap-4">
        <div className="bg-cencosud-blue text-white p-5 rounded-2xl">
          <Calculator />
          <p className="text-sm font-bold mt-2">Markup médio</p>
          <p className="text-xl font-black">{markup.toFixed(1)}%</p>
        </div>

        <div className="bg-white border p-5 rounded-2xl">
          <TrendingUp />
          <p className="text-sm font-bold mt-2">Estoque</p>
          <p className="text-xl font-black">
            R$ {estoqueTotal.toLocaleString("pt-BR")}
          </p>
        </div>

        <div className={`p-5 rounded-2xl border ${saldo < 0 ? "bg-red-50" : "bg-green-50"}`}>
          <AlertCircle />
          <p className="text-sm font-bold mt-2">Status</p>
          <p className="text-xl font-black">{saldo < 0 ? "Déficit" : "OK"}</p>
        </div>
      </div>
    </div>
  );
};

export default ComercialStep;