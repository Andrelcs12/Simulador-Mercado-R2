"use client";

import React, { useMemo } from "react";
import { motion, HTMLMotionProps } from "framer-motion";
import {
  ShieldAlert,
  Wrench,
  HardDrive,
  Monitor,
  ReceiptText,
  RefreshCw,
  LucideIcon,
} from "lucide-react";

import { CapexKey } from "../types/onboarding";
import { useOnboarding } from "../context/OnboardingContext";

interface CapexItem {
  id: CapexKey;
  label: string;
  Icon: LucideIcon;
  custo: number;
  descricao: string;
  impacto: string;
  beneficio: string;
}

export default function SetupStep() {
  const { config, dispatch, budget, remainingBudget } = useOnboarding();

  const CAPEX_ITEMS: CapexItem[] = [
    {
      id: "seguranca",
      label: "CAPEX Segurança",
      Icon: ShieldAlert,
      custo: 50000,
      descricao:
        "Implantação de software de monitoramento e proteção cibernética contra invasões na infraestrutura da loja.",
      impacto:
        "Em caso de ataque, a loja ficará sem operar por 2 dias. Sem a proteção, a interrupção é total e impacta drasticamente o faturamento.",
      beneficio:
        "Garante a continuidade da operação. O investimento adiciona um custo fixo de R$ 100 mensais ao valor da licença da plataforma.",
    },
    {
      id: "equipamentos",
      label: "CAPEX Balança / Freezer",
      Icon: Wrench,
      custo: 75000,
      descricao:
        "Substituição de equipamentos críticos e maquinários desgastados (balanças e freezers) por novos em garantia de fábrica.",
      impacto:
        "Falhas nos equipamentos atuais paralisam as vendas da categoria de Perecíveis por 1 dia durante a rodada.",
      beneficio:
        "Elimina a taxa fixa de manutenção de R$ 400 mensais e protege o fluxo de vendas da categoria de Perecíveis.",
    },
    {
      id: "redes",
      label: "CAPEX Redes",
      Icon: HardDrive,
      custo: 80000,
      descricao:
        "Migração completa e reestruturação da infraestrutura física e lógica de redes para estabilização do PDV e máquinas de cartão.",
      impacto:
        "Oscilações ou queda de conexão geram falhas críticas na integração de pagamentos e perda de vendas por 2 dias.",
      beneficio:
        "Garante estabilidade na transmissão de dados, contingência no checkout e processamento de transações sem atrito.",
    },
    {
      id: "site",
      label: "CAPEX Melhorias no Site",
      Icon: Monitor,
      custo: 65000,
      descricao:
        "Migração da plataforma de vendas digital para uma infraestrutura em nuvem robusta, eliminando lentidões crônicas.",
      impacto:
        "A indisponibilidade ou instabilidade do site durante picos de tráfego derruba conversões e interrompe o canal digital por 1 dia.",
      beneficio:
        "Suporta alta demanda simultânea. O investimento adiciona um custo fixo de R$ 150 mensais ao valor da licença da plataforma.",
    },
    {
      id: "selfcheckout",
      label: "CAPEX Self Checkout",
      Icon: ReceiptText,
      custo: 80000,
      descricao:
        "Aquisição e integração de 4 terminais de autoatendimento para vazão e otimização da frente de caixa.",
      impacto:
        "Em picos de tráfego, sem os terminais, a loja sofre com filas longas e desistência de clientes, perdendo vendas por 2 dias.",
      beneficio:
        "Aumenta a velocidade de atendimento e melhora a experiência do cliente. Adiciona R$ 320 mensais fixos em custos de licenciamento.",
    },
    {
      id: "melhoria",
      label: "CAPEX Melhoria Contínua",
      Icon: RefreshCw,
      custo: 45000,
      descricao:
        "Automação de relatórios gerenciais e processos manuais através de rotinas otimizadas com IA.",
      impacto:
        "Processamento manual lento consome 2 horas diárias da equipe, gerando dificuldades severas para expansão da rede.",
      beneficio:
        "Garante agilidade analítica e operacional, liberando a equipe para focar em demandas de crescimento e novas oportunidades.",
    },
  ];

  const toggleCapex = (id: CapexKey, custo: number) => {
    const currentValue = config.capex[id] || 0;
    const nextValue = currentValue > 0 ? 0 : custo;

    dispatch({
      type: "UPDATE_CAPEX",
      payload: { id, value: nextValue },
    });
  };

  const capexTotalAtual = useMemo(() => {
    return Object.values(config.capex).reduce((a, b) => a + (b || 0), 0);
  }, [config.capex]);

  const selecionadosCount = useMemo(() => {
    return Object.values(config.capex).filter((v) => (v || 0) > 0).length;
  }, [config.capex]);

  const porcentagemUso = useMemo(() => {
    return Math.min((capexTotalAtual / budget) * 100, 100);
  }, [capexTotalAtual, budget]);

  return (
    <div className="space-y-8">
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-4">
        <div className="border-l-4 border-orange-500 pl-5">
          <p className="text-[11px] uppercase font-black tracking-[0.3em] text-orange-500">
            Etapa 1 de 4
          </p>
          <h2 className="text-3xl font-black text-white">
            Decisões de <span className="text-orange-500">CAPEX</span>
          </h2>
          <p className="text-sm text-slate-400 mt-2">
            Configure investimentos estruturais da operação da loja para mitigar riscos de SLA.
          </p>
        </div>

        <div className="text-right">
          <p className="text-[10px] uppercase font-black text-slate-500 tracking-wider">
            Saldo Real Restante (Global)
          </p>
          <p
            className={`text-2xl font-black ${
              remainingBudget < 0 ? "text-red-500" : "text-emerald-400"
            }`}
          >
            R$ {remainingBudget.toLocaleString("pt-BR")}
          </p>
        </div>
      </div>

      <div className="space-y-2">
        <div className="flex justify-between text-xs font-bold text-slate-400 uppercase tracking-wider">
          <span>{selecionadosCount} Ativos Selecionados</span>
          <span>Investimento CAPEX: R$ {capexTotalAtual.toLocaleString("pt-BR")}</span>
        </div>

        <div className="h-2 bg-white/10 rounded-full overflow-hidden">
          <motion.div
            className="h-full bg-orange-500"
            animate={{ width: `${porcentagemUso}%` }}
            transition={{ type: "spring", stiffness: 65 }}
            {...({} as HTMLMotionProps<"div">)}
          />
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-5">
        {CAPEX_ITEMS.map((item, i) => {
          const isSelected = (config.capex[item.id] || 0) > 0;

          return (
            <motion.button
              key={item.id}
              type="button"
              onClick={() => toggleCapex(item.id, item.custo)}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.05 }}
              className={`text-left cursor-pointer rounded-2xl border p-5 transition focus:outline-none relative overflow-hidden flex flex-col justify-between ${
                isSelected
                  ? "bg-orange-500/10 border-orange-500 shadow-lg shadow-orange-500/5"
                  : "bg-white/5 border-white/10 hover:bg-white/10 hover:border-white/20"
              }`}
              {...({} as HTMLMotionProps<"button">)}
            >
              <div>
                <div className="flex items-center gap-3 mb-4">
                  <div
                    className={`w-10 h-10 rounded-xl flex items-center justify-center transition-colors ${
                      isSelected ? "bg-orange-500/20" : "bg-white/5"
                    }`}
                  >
                    <item.Icon
                      size={18}
                      className={isSelected ? "text-orange-400" : "text-slate-400"}
                    />
                  </div>
                  <p className="font-black text-sm text-white">{item.label}</p>
                </div>

                <p className="text-xs mb-4 leading-relaxed text-slate-300">
                  {item.descricao}
                </p>

                <div className="space-y-1.5 text-[11px] text-slate-400">
                  <div>
                    <span className="font-bold text-white/90">Impacto:</span> {item.impacto}
                  </div>
                  <div>
                    <span className="font-bold text-white/90">Benefício:</span> {item.beneficio}
                  </div>
                </div>
              </div>

              <div className="w-full mt-5 pt-3 border-t border-dashed border-white/10 text-xs font-black flex justify-between items-center shrink-0">
                <span className="text-slate-400 uppercase tracking-wider">Custo do Ativo:</span>
                <span className={isSelected ? "text-orange-400 text-sm" : "text-white text-sm"}>
                  R$ {item.custo.toLocaleString("pt-BR")}
                </span>
              </div>
            </motion.button>
          );
        })}
      </div>

      {remainingBudget < 0 && (
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          className="bg-red-500/10 border border-red-500/20 text-red-400 font-bold p-5 rounded-2xl text-sm"
          {...({} as HTMLMotionProps<"div">)}
        >
          ⚠️ Alerta de Overdraft: Caixa de R$ 700.000 excedido em R${" "}
          {Math.abs(remainingBudget).toLocaleString("pt-BR")}.
          <span className="block font-normal mt-1.5 text-red-300/80 leading-relaxed">
            Atenção: Uma taxa de juros de 12% ao mês incidirá sobre o valor excedente no cálculo final do seu resultado.
          </span>
        </motion.div>
      )}
    </div>
  );
}