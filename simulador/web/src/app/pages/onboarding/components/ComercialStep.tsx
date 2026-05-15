"use client";

import { AppConfig, CategoriaKey } from "../types/onboarding";
import {
  ShoppingBasket,
  Package,
  Computer,
  Droplets,
} from "lucide-react";

interface Props {
  config: AppConfig;
  setConfig: React.Dispatch<React.SetStateAction<AppConfig>>;
}

const CATEGORIES: {
  id: CategoriaKey;
  label: string;
  icon: any;
  custo: number;
}[] = [
  { id: "pereciveis", label: "Perecíveis", icon: ShoppingBasket, custo: 15.5 },
  { id: "mercearia", label: "Mercearia", icon: Package, custo: 8.9 },
  { id: "eletro", label: "Eletrônicos", icon: Computer, custo: 12.4 },
  { id: "hipel", label: "Higiene", icon: Droplets, custo: 6.2 },
];

export default function ComercialStep({ config, setConfig }: Props) {
  const update = (
    cat: CategoriaKey,
    field: "estoque" | "margem",
    value: number
  ) => {
    setConfig((prev) => ({
      ...prev,
      comercial: {
        ...prev.comercial,
        [cat]: {
          ...prev.comercial[cat],
          [field]: value,
        },
      },
    }));
  };

  const custoTotal = CATEGORIES.reduce((acc, c) => {
    const qty = config.comercial[c.id].estoque;
    return acc + qty * c.custo;
  }, 0);

  const margemMedia =
    CATEGORIES.reduce(
      (acc, c) => acc + config.comercial[c.id].margem,
      0
    ) / CATEGORIES.length;

  return (
    <div className="space-y-6">

      <div>
        <h2 className="text-2xl font-black">Comercial</h2>
        <p className="text-sm text-gray-500">
          Defina estoque e margem. Isso impacta receita e lucro.
        </p>
      </div>

      <div className="border rounded-xl overflow-hidden">
        {CATEGORIES.map((c) => {
          const Icon = c.icon;
          const data = config.comercial[c.id];

          return (
            <div
              key={c.id}
              className="grid grid-cols-4 gap-3 p-4 border-b items-center"
            >
              <div className="flex items-center gap-2">
                <Icon size={18} />
                <span className="font-bold">{c.label}</span>
              </div>

              <input
                type="number"
                value={data.estoque}
                onChange={(e) =>
                  update(c.id, "estoque", Number(e.target.value))
                }
                className="border p-2 rounded"
              />

              <input
                type="number"
                value={data.margem}
                onChange={(e) =>
                  update(c.id, "margem", Number(e.target.value))
                }
                className="border p-2 rounded"
              />

              <div className="text-right font-mono">
                R$ {(data.estoque * c.custo).toLocaleString("pt-BR")}
              </div>
            </div>
          );
        })}
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div className="p-4 border rounded-xl">
          <p className="font-bold">Custo total</p>
          <p>R$ {custoTotal.toLocaleString("pt-BR")}</p>
        </div>

        <div className="p-4 border rounded-xl">
          <p className="font-bold">Margem média</p>
          <p>{margemMedia.toFixed(1)}%</p>
        </div>
      </div>
    </div>
  );
}