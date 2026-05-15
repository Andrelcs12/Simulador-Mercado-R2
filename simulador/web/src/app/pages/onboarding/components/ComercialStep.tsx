"use client";

import React from "react";
import {
  ShoppingBasket,
  Package,
  Droplets,
  Computer,
  TrendingUp,
  Calculator,
  AlertCircle,
  LucideIcon,
} from "lucide-react";

interface CategoriaConfig {
  estoque: number;
  margem: number;
}

interface Props {
  config: any;
  setConfig: React.Dispatch<React.SetStateAction<any>>;
}

const ComercialStep = ({ config, setConfig }: Props) => {
  const categorias = [
    { id: "pereciveis", label: "Perecíveis", Icon: ShoppingBasket, custo: 15.5 },
    { id: "mercearia", label: "Mercearia", Icon: Package, custo: 8.9 },
    { id: "eletro", label: "Eletrônicos", Icon: Computer, custo: 12.4 },
    { id: "hipel", label: "Higiene", Icon: Droplets, custo: 6.2 },
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

  const capexTotal = Object.values(config?.capex ?? {})
    .filter(Boolean).length;

  const estoqueTotal = categorias.reduce((acc, c) => {
    const q = config?.comercial?.[c.id]?.estoque ?? 0;
    return acc + q * c.custo;
  }, 0);

  const saldo = 700000 - capexTotal * 70000 - estoqueTotal;

  const markup =
    categorias.reduce(
      (a, c) => a + (config?.comercial?.[c.id]?.margem ?? 0),
      0
    ) / categorias.length;

  return (
    <div className="space-y-8">

      {/* HEADER */}
      <div className="border-l-4 border-blue-600 pl-6">
        <h2 className="text-3xl font-black uppercase">
          Planejamento Comercial
        </h2>
      </div>

      {/* SALDO */}
      <div className="bg-white p-4 border rounded-xl">
        <p className="font-bold">
          Saldo: R$ {saldo.toLocaleString("pt-BR")}
        </p>
      </div>

      {/* GRID */}
      <div className="bg-white border rounded-xl overflow-hidden">
        {categorias.map(({ id, label, Icon, custo }) => {
          const estoque = config?.comercial?.[id]?.estoque ?? 0;
          const margem = config?.comercial?.[id]?.margem ?? 0;

          return (
            <div key={id} className="p-4 border-b grid grid-cols-4 gap-4 items-center">

              <div className="flex gap-2 items-center">
                <Icon />
                <p className="font-bold">{label}</p>
              </div>

              <input
                type="number"
                value={estoque}
                onChange={(e) => update(id, "estoque", Number(e.target.value))}
                className="p-2 border rounded"
              />

              <input
                type="number"
                value={margem}
                onChange={(e) => update(id, "margem", Number(e.target.value))}
                className="p-2 border rounded"
              />

              <div className="text-right font-mono">
                R$ {(estoque * custo).toLocaleString("pt-BR")}
              </div>
            </div>
          );
        })}
      </div>

      {/* FOOTER */}
      <div className="grid grid-cols-3 gap-4">

        <div className="p-4 border rounded-xl">
          <p className="font-bold">Markup</p>
          <p>{markup.toFixed(1)}%</p>
        </div>

        <div className="p-4 border rounded-xl">
          <p className="font-bold">Estoque</p>
          <p>R$ {estoqueTotal.toLocaleString("pt-BR")}</p>
        </div>

        <div className="p-4 border rounded-xl">
          <p className="font-bold">Status</p>
          <p>{saldo > 0 ? "OK" : "Déficit"}</p>
        </div>

      </div>

    </div>
  );
};

export default ComercialStep;