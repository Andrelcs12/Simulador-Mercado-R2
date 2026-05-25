"use client";

import React, { useMemo } from "react";
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

import { AppConfig, CapexKey } from "../types/onboarding";
import { useOnboarding } from "../context/OnboardingContext";

interface CapexItem {
  id: CapexKey;
  label: string;
  Icon: LucideIcon;
  custo: number;
  descricao: string;
  impacto: string;
  beneficio: string;
  regra: string;
}

export default function SetupStep({
  config,
  setConfig,
}: {
  config: AppConfig;
  setConfig: React.Dispatch<React.SetStateAction<AppConfig>>;
}) {
  const { budget, remainingBudget } = useOnboarding();

  const CAPEX_ITEMS: CapexItem[] = [
    {
      id: "seguranca",
      label: "CAPEX Segurança",
      Icon: ShieldAlert,
      custo: 50000,
      descricao:
        "Implantação de software de monitoramento e proteção cibernética em toda a infraestrutura da loja.",
      impacto:
        "Em caso de ataque sem proteção, a loja ficará indisponível por uma quantidade crítica de dias reduzindo as vendas.",
      beneficio:
        "Evita parada total. Incrementa a licença mensal atual de R$ 500 em 20% (+R$ 100/mês).",
      regra:
        "Calculado como custo fixo de investimento e adicionado às despesas recorrentes de software no simulador backend.",
    },
    {
      id: "equipamentos",
      label: "CAPEX Balança / Freezer",
      Icon: Wrench,
      custo: 75000,
      descricao:
        "Substituição de equipamentos críticos operacionais (balanças, freezers e dispositivos de loja) antigos por novos em garantia.",
      impacto:
        "Falhas de maquinário antigo paralisam o setor de Perecíveis inteiramente durante a rodada.",
      beneficio:
        "Elimina a taxa padrão de manutenção de R$ 400/mês e garante a vazão da demanda de Perecíveis.",
      regra:
        "Zera despesas de manutenção preventiva de ativos operacionais na rodada simulada.",
    },
    {
      id: "redes",
      label: "CAPEX Redes",
      Icon: HardDrive,
      custo: 80000,
      descricao:
        "Migração completa da infraestrutura de redes física e lógica para estabilidade do PDV e máquinas de cartão.",
      impacto:
        "Oscilações de rede geram perda massiva e imediata de vendas por falhas na integração de pagamentos.",
      beneficio:
        "Garante estabilidade no fluxo de caixa e processamento sem atrito das transações de pagamento.",
      regra:
        "Protege a eficiência da demanda de vendas contra gargalos de conectividade.",
    },
    {
      id: "site",
      label: "CAPEX Plataforma Digital",
      Icon: Monitor,
      custo: 65000,
      descricao:
        "Migração do e-commerce corporativo para uma infraestrutura de nuvem robusta e escalável.",
      impacto:
        "Instabilidade por lentidão derruba a conversão e zera vendas do canal digital em picos de tráfego.",
      beneficio:
        "Suporta picos de acessos simultâneos. Incrementa a licença de software atual de R$ 500 em 30% (+R$ 150/mês).",
      regra:
        "Evita gargalo de tráfego digital e atualiza a linha de custo de licenciamento no backend.",
    },
    {
      id: "selfcheckout",
      label: "CAPEX Self Checkout",
      Icon: ReceiptText,
      custo: 80000,
      descricao:
        "Aquisição e integração de 4 terminais de autoatendimento para otimização da frente de caixa.",
      impacto:
        "Sem self-checkout, filas longas geram desistência de compras e derrubam o market share real.",
      beneficio:
        "Escala o fluxo de atendimento em horários de pico. Licenciamento adicional de R$ 80 por máquina/mês.",
      regra:
        "Soma R$ 320 fixos mensais ao custo de licenciamento total de sistemas da loja no backend.",
    },
    {
      id: "melhoria",
      label: "CAPEX Melhoria Contínua",
      Icon: RefreshCw,
      custo: 45000,
      descricao:
        "Automação de relatórios gerenciais complexos e processos operacionais manuais utilizando BI e IA.",
      impacto:
        "Análises manuais lentas demoram cerca de 2h e criam gargalos humanos para a expansão da rede.",
      beneficio:
        "Garante agilidade analítica para tomadas de decisão e otimiza a produtividade operacional do time.",
      regra:
        "Aumenta a eficiência global e mitiga dores de expansão nas rodadas subsequentes.",
    },
  ];

  const toggle = (id: CapexKey, value: number) => {
    setConfig((prev) => ({
      ...prev,
      capex: {
        ...prev.capex,
        [id]: prev.capex[id] > 0 ? 0 : value,
      },
    }));
  };

  const capexTotalAtual = useMemo(() => {
    return Object.values(config.capex).reduce((a, b) => a + (b || 0), 0);
  }, [config.capex]);

  const selecionadosCount = useMemo(() => {
    return Object.values(config.capex).filter((v) => v > 0).length;
  }, [config.capex]);

  const porcentagemUso = useMemo(() => {
    return Math.min((capexTotalAtual / budget) * 100, 100);
  }, [capexTotalAtual, budget]);

  return (
    <div className="space-y-8">
      {/* HEADER */}
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-4">
        <div className="border-l-4 border-orange-500 pl-5">
          <p className="text-[11px] uppercase font-black tracking-[0.3em] text-orange-500">
            Etapa 1 de 4
          </p>

          <h2 className="text-3xl font-black text-white">
            Decisões de <span className="text-orange-500">CAPEX</span>
          </h2>

          <p className="text-sm text-slate-400 mt-2">
            Configure investimentos estruturais da operação da loja.
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

      {/* PROGRESSO */}
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
          />
        </div>
      </div>

      {/* GRID DE INVESTIMENTOS */}
      <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-5">
        {CAPEX_ITEMS.map((item, i) => {
          const isSelected = config.capex[item.id] > 0;

          return (
            <motion.button
              key={item.id}
              type="button"
              onClick={() => toggle(item.id, item.custo)}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.05 }}
              className={`text-left cursor-pointer rounded-2xl border p-5 transition focus:outline-none relative overflow-hidden flex flex-col justify-between ${
                isSelected
                  ? "bg-orange-500/10 border-orange-500 shadow-lg shadow-orange-500/5"
                  : "bg-white/5 border-white/10 hover:bg-white/10 hover:border-white/20"
              }`}
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
                    <span className="font-bold text-white/90">Regra:</span> {item.regra}
                  </div>
                  <div>
                    <span className="font-bold text-white/90">Benefício:</span> {item.beneficio}
                  </div>
                </div>
              </div>

              <div className="w-full mt-5 pt-3 border-t border-dashed border-white/10 text-xs font-black flex justify-between items-center shrink-0">
                <span className="text-slate-400 uppercase tracking-wider">Custo Ativo:</span>
                <span className={isSelected ? "text-orange-400 text-sm" : "text-white text-sm"}>
                  R$ {item.custo.toLocaleString("pt-BR")}
                </span>
              </div>
            </motion.button>
          );
        })}
      </div>

      {/* AVISO DE ORÇAMENTO EXCEDIDO */}
      {remainingBudget < 0 && (
        <motion.div 
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          className="bg-red-500/10 border border-red-500/20 text-red-400 font-bold p-5 rounded-2xl text-sm"
        >
          ⚠️ Orçamento global da loja excedido em R$ {Math.abs(remainingBudget).toLocaleString("pt-BR")}. 
          <span className="block font-normal mt-1.5 text-red-300/80 leading-relaxed">
            Atenção: Conforme o regulamento, uma taxa de juros punitiva de **12% ao mês** incidirá sobre o valor excedente no cálculo do EBITDA final no fechamento da rodada.
          </span>
        </motion.div>
      )}
    </div>
  );
}