"use client";

import React from "react";
import { motion } from "framer-motion";
import {
  ShieldAlert,
  Wrench,
  HardDrive,
  Monitor,
  ReceiptText,
  RefreshCw,
  CheckCircle2,
  Info,
  LucideIcon,
} from "lucide-react";
import { AppConfig, CapexKey } from "../types/onboarding";

interface Props {
  config: AppConfig;
  setConfig: React.Dispatch<React.SetStateAction<AppConfig>>;
}

interface CapexItem {
  id: CapexKey;
  label: string;
  Icon: LucideIcon;
  custo: number;
  descricao: string;
  impacto: string;
  beneficio: string;
  risco: "alto" | "medio" | "baixo";
}

const CAPEX_ITEMS: CapexItem[] = [
  {
    id: "seguranca",
    label: "Segurança da Infraestrutura",
    Icon: ShieldAlert,
    custo: 50000,
    descricao:
      "Proteção contra ataques cibernéticos e indisponibilidade do sistema.",
    impacto:
      "Sem este investimento, existe risco de paralisação total da operação por falhas ou ataques.",
    beneficio:
      "Aumenta estabilidade e evita perda de vendas por indisponibilidade.",
    risco: "alto",
  },
  {
    id: "equipamentos",
    label: "Equipamentos Operacionais",
    Icon: Wrench,
    custo: 75000,
    descricao:
      "Substituição de equipamentos desgastados da operação da loja.",
    impacto:
      "Falhas podem causar indisponibilidade parcial, especialmente em perecíveis.",
    beneficio:
      "Reduz custos de manutenção e aumenta estabilidade operacional.",
    risco: "medio",
  },
  {
    id: "redes",
    label: "Infraestrutura de Redes",
    Icon: HardDrive,
    custo: 80000,
    descricao:
      "Estabilidade da rede, PDV e integração com meios de pagamento.",
    impacto:
      "Instabilidade pode travar vendas presenciais e pagamentos.",
    beneficio:
      "Garante continuidade das vendas e redução de falhas no caixa.",
    risco: "alto",
  },
  {
    id: "site",
    label: "Plataforma Digital",
    Icon: Monitor,
    custo: 65000,
    descricao:
      "Melhoria da plataforma de vendas online da loja.",
    impacto:
      "Instabilidade no site reduz vendas do canal digital.",
    beneficio:
      "Melhora performance e aumenta conversão digital (+30%).",
    risco: "baixo",
  },
  {
    id: "selfcheckout",
    label: "Self Checkout",
    Icon: ReceiptText,
    custo: 80000,
    descricao:
      "Implementação de caixas de autoatendimento na loja.",
    impacto:
      "Sem o investimento, filas podem reduzir vendas em picos de demanda.",
    beneficio:
      "Aumenta eficiência operacional e melhora experiência do cliente.",
    risco: "baixo",
  },
  {
    id: "melhoria",
    label: "Melhoria Contínua",
    Icon: RefreshCw,
    custo: 45000,
    descricao:
      "Automação de processos internos e melhoria de eficiência.",
    impacto:
      "Sem isso, operação pode ficar lenta para escalar.",
    beneficio:
      "Aumenta produtividade do time e reduz retrabalho.",
    risco: "baixo",
  },
];

const RISK_STYLE = {
  alto: "text-red-600 bg-red-50 border-red-200",
  medio: "text-yellow-700 bg-yellow-50 border-yellow-200",
  baixo: "text-emerald-600 bg-emerald-50 border-emerald-200",
};

const ORCAMENTO = 700000;

export default function SetupStep({ config, setConfig }: Props) {
  const toggle = (id: CapexKey, value: number) => {
    setConfig((prev) => ({
      ...prev,
      capex: {
        ...prev.capex,
        [id]: prev.capex[id] > 0 ? 0 : value,
      },
    }));
  };

  const total = Object.values(config.capex).reduce((a, b) => a + b, 0);
  const saldo = ORCAMENTO - total;
  const selecionados = Object.values(config.capex).filter((v) => v > 0).length;
  const pct = Math.min((total / ORCAMENTO) * 100, 100);

  return (
    <div className="space-y-8">

      {/* HEADER */}
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-4">
        <div className="border-l-4 border-orange-500 pl-5">
          <p className="text-[11px] uppercase font-black tracking-[0.3em] text-orange-500">
            Etapa 1 de 4
          </p>

          <h2 className="text-3xl md:text-4xl font-black text-[#001F3F]">
            Decisões de <span className="text-orange-500">CAPEX</span>
          </h2>

          <p className="text-sm text-slate-500 mt-2">
            Defina os investimentos estratégicos da loja. Cada escolha impacta custo, risco e operação.
          </p>
        </div>

        <div className="text-right">
          <p className="text-[10px] uppercase font-black text-slate-400">
            Orçamento disponível
          </p>
          <p className={`text-2xl font-black ${saldo < 0 ? "text-red-500" : "text-[#001F3F]"}`}>
            R$ {saldo.toLocaleString("pt-BR")}
          </p>
        </div>
      </div>

      {/* PROGRESSO */}
      <div className="space-y-2">
        <div className="flex justify-between text-xs font-bold text-slate-500 uppercase">
          <span>{selecionados} investimentos selecionados</span>
          <span>R$ {total.toLocaleString("pt-BR")}</span>
        </div>

        <div className="h-2 bg-slate-100 rounded-full overflow-hidden">
          <motion.div
            className="h-full bg-orange-500"
            animate={{ width: `${pct}%` }}
          />
        </div>
      </div>

      {/* GRID */}
      <div className="grid md:grid-cols-2 xl:grid-cols-3 gap-4">

        {CAPEX_ITEMS.map((item, i) => {
          const selected = config.capex[item.id] > 0;

          return (
            <motion.button
              key={item.id}
              onClick={() => toggle(item.id, item.custo)}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.05 }}
              className={`relative text-left rounded-2xl border p-5 transition ${
                selected
                  ? "bg-[#001F3F] text-white border-[#001F3F]"
                  : "bg-white border-slate-200"
              }`}
            >

              {selected && (
                <CheckCircle2 className="absolute top-3 right-3 text-orange-400" />
              )}

              {/* HEADER ITEM */}
              <div className="flex items-center gap-3 mb-3">
                <div className="w-10 h-10 rounded-xl bg-slate-100 flex items-center justify-center">
                  <item.Icon size={18} className="text-[#FF6D00]" />
                </div>

                <div>
                  <p className="font-black text-sm">{item.label}</p>

                  <span
                    className={`text-[10px] px-2 py-0.5 rounded-full border ${
                      RISK_STYLE[item.risco]
                    }`}
                  >
                    {item.risco === "alto"
                      ? "Alto impacto operacional"
                      : item.risco === "medio"
                      ? "Impacto moderado"
                      : "Baixo risco operacional"}
                  </span>
                </div>
              </div>

              {/* DESCRIÇÃO */}
              <p className="text-xs opacity-80 mb-3">
                {item.descricao}
              </p>

              {/* IMPACTO */}
              <div className="text-[11px] text-slate-500 flex gap-2 mb-2">
                <Info size={12} />
                <span><b>Impacto:</b> {item.impacto}</span>
              </div>

              {/* BENEFÍCIO */}
              <div className="text-[11px] text-slate-500 flex gap-2">
                <Info size={12} />
                <span><b>Benefício:</b> {item.beneficio}</span>
              </div>

              {/* VALOR */}
              <div className="mt-4 pt-3 border-t font-black text-sm">
                R$ {item.custo.toLocaleString("pt-BR")}
              </div>
            </motion.button>
          );
        })}

      </div>

      {/* ALERTA */}
      {saldo < 0 && (
        <div className="bg-red-50 border border-red-200 text-red-600 font-bold p-4 rounded-2xl">
          Orçamento excedido em R$ {Math.abs(saldo).toLocaleString("pt-BR")}
        </div>
      )}
    </div>
  );
}