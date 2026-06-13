"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { io, Socket } from "socket.io-client";
import toast from "react-hot-toast";
import { useRouter } from "next/navigation";
import { useOnboarding } from "../context/OnboardingContext";

const normalizeEndTime = (raw: any): number | null => {
  if (!raw) return null;
  const ms = typeof raw === "number" ? raw : new Date(raw).getTime();
  return isNaN(ms) ? null : ms;
};

// ✅ Normaliza qualquer string para chave simples
function normalizeKey(str: string): string {
  return str
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/[^a-z0-9]+/g, "")
    .trim();
}

// ✅ Dicionário de aliases: chave do config.comercial -> variações possíveis no banco
const CATEGORY_ALIASES: Record<string, string[]> = {
  pereciveis: [
    "pereciveis", "perecivel", "perecíveis", "perecível",
    "fresh", "hortifruti", "frescor", "resfriados",
  ],
  mercearia: [
    "mercearia", "grocery", "merceariaseca", "seca",
    "alimentos", "alimentosseco", "secoseembalados",
  ],
  eletro: [
    "eletro", "eletronicos", "eletrodomesticos",
    "electronics", "eletroeletronicos", "eletronico",
  ],
  hipel: [
    "hipel", "higiene", "higienelimpeza", "limpeza",
    "higienepessoal", "cleaning", "higieneebeleza",
    "cuidadospessoais", "limpezaeconservacao",
  ],
};

function matchCategory(dbName: string): string | null {
  const normalized = normalizeKey(dbName);

  // 1. Tentativa de match exato após normalização
  for (const [key, aliases] of Object.entries(CATEGORY_ALIASES)) {
    if (aliases.map(normalizeKey).includes(normalized)) {
      return key;
    }
  }

  // 2. Tentativa de match parcial (contém)
  for (const [key, aliases] of Object.entries(CATEGORY_ALIASES)) {
    const normalizedAliases = aliases.map(normalizeKey);
    if (
      normalizedAliases.some(
        (alias) => normalized.includes(alias) || alias.includes(normalized)
      )
    ) {
      return key;
    }
  }

  return null;
}

export function useOnboardingSession(API_URL: string) {
  const {
    player,
    setPlayer,
    round,
    setRound,
    setTimeLeft,
    submitted,
    setSubmitted,
    submitting,
    setSubmitting,
    config,
    setMaxStockConfig,
  } = useOnboarding();

  const router = useRouter();

  const socketRef = useRef<Socket | null>(null);
  const joinedRef = useRef(false);
  const timerRef = useRef<NodeJS.Timeout | null>(null);
  // Trava síncrona contra envio duplicado: não depende do ciclo de render do React
  const submittingRef = useRef(false);

  const [categoryMap, setCategoryMap] = useState<Record<string, string>>({});
  const [categoriesLoaded, setCategoriesLoaded] = useState(false);
  // Indica que o onboarding já carregou o estado da rodada atual e limpou resíduos.
  // Os redirects da página só podem agir depois disso (evita pular a rodada).
  const [initialized, setInitialized] = useState(false);

  const applyMaxStockConfig = useCallback(
    (maxStock?: {
      pereciveis?: number;
      mercearia?: number;
      eletro?: number;
      hipel?: number;
    }) => {
      if (!maxStock) return;
      setMaxStockConfig((prev) => ({ ...prev, ...maxStock }));
    },
    [setMaxStockConfig]
  );

  const startTimer = useCallback(
    (endTimeMs: number) => {
      if (timerRef.current) clearInterval(timerRef.current);
      const tick = () => {
        const diff = Math.max(0, Math.floor((endTimeMs - Date.now()) / 1000));
        setTimeLeft(diff);
      };
      tick();
      timerRef.current = setInterval(tick, 1000);
    },
    [setTimeLeft]
  );

  // ✅ Busca e mapeia categorias do backend
  useEffect(() => {
    const fetchCategories = async () => {
      try {
        const res = await fetch(`${API_URL}/minigame/categories`);
        if (!res.ok) throw new Error("Falha ao buscar categorias");

        const data: { id: string; name: string }[] = await res.json();

        // LOG para debug — remover após confirmar mapeamento correto
        console.log(
          "[categories] nomes no banco:",
          data.map((c) => c.name)
        );

        const map: Record<string, string> = {};
        const unmapped: string[] = [];

        for (const cat of data) {
          const key = matchCategory(cat.name);
          if (key) {
            map[key] = cat.id;
            console.log(
              `[categories] OK: "${cat.name}" -> "${key}" (${cat.id})`
            );
          } else {
            unmapped.push(cat.name);
            console.warn(`[categories] SEM MAPEAMENTO: "${cat.name}"`);
          }
        }

        if (unmapped.length > 0) {
          console.error(
            "[categories] Categorias sem mapeamento:",
            unmapped
          );
          toast.error(
            `Categorias não mapeadas: ${unmapped.join(", ")}. Contate o suporte.`
          );
          // ✅ Mesmo com unmapped, carrega o que tiver para não bloquear tudo
        }

        setCategoryMap(map);
        // ✅ Só bloqueia se NENHUMA categoria foi mapeada
        setCategoriesLoaded(Object.keys(map).length > 0);
      } catch (err) {
        console.error("Erro ao carregar categorias:", err);
        toast.error("Erro ao carregar categorias do servidor.");
      }
    };

    fetchCategories();
  }, [API_URL]);

  // Inicialização do socket
  useEffect(() => {
    const saved = sessionStorage.getItem("player_data");
    if (!saved) return;

    const p = JSON.parse(saved);
    setPlayer(p);

    // Clean slate ao entrar no onboarding: limpa estado de envio/cronômetro residual
    // da rodada anterior ANTES de marcar como inicializado (tudo no mesmo tick → batched).
    setSubmitted(false);
    setSubmitting(false);
    setTimeLeft(0);

    const savedRound = sessionStorage.getItem("round_data");
    if (savedRound) {
      try {
        const parsed = JSON.parse(savedRound);
        if (parsed.maxStock) applyMaxStockConfig(parsed.maxStock);

        const endMs = normalizeEndTime(parsed.endTime);
        if (endMs && endMs > Date.now()) {
          setRound({
            roundId: parsed.roundId,
            roundNumber: parsed.roundNumber,
            duration: parsed.duration,
            endTime: endMs,
          });
          startTimer(endMs);
        }
      } catch (e) {
        console.error("Erro ao recuperar cache da rodada", e);
      }
    }

    // Libera os redirects da página somente após o estado da rodada estar consistente.
    setInitialized(true);

    const socket = io(`${API_URL}/simulation`, {
      reconnection: true,
      transports: ["websocket"],
    });
    socketRef.current = socket;

    socket.on("connect", () => {
      if (joinedRef.current) return;
      socket.emit("join_session", {
        sessionId: p.sessionId,
        playerId: p.id,
      });
      socket.emit("session:get_state", { sessionId: p.sessionId });
      joinedRef.current = true;
    });

    socket.on("round:started", (data: any) => {
      const endMs = normalizeEndTime(data.endTime);
      applyMaxStockConfig(data.maxStock);

      const normalized = {
        roundId: data.roundId,
        roundNumber: data.roundNumber,
        duration: data.duration,
        endTime: endMs,
      };

      setRound(normalized);
      setSubmitted(false);
      setSubmitting(false);

      sessionStorage.setItem(
        "round_data",
        JSON.stringify({ ...normalized, maxStock: data.maxStock })
      );

      if (endMs) startTimer(endMs);
      toast.success(`Rodada ${data.roundNumber} iniciada!`);
    });

    socket.on(
      "round:time_updated",
      (data: { endTime: number; duration: number }) => {
        const endMs = normalizeEndTime(data.endTime);
        setRound((prev) =>
          prev ? { ...prev, duration: data.duration, endTime: endMs } : null
        );
        if (endMs) {
          startTimer(endMs);
          toast("⏱️ Tempo da rodada alterado!");
        }
      }
    );

    socket.on("player:config_submitted", () => {
      setSubmitted(true);
      setSubmitting(false);
      toast.success("Configurações salvas com sucesso!");
    });

    socket.on("player:submit_error", (data: { message: string }) => {
      setSubmitting(false);
      const msg = data.message || "Erro ao salvar configurações.";
      // "Config já enviada nesta rodada" não é falha: a config já está salva.
      if (/j[áa]\s*enviad/i.test(msg)) {
        setSubmitted(true);
        toast.success("Configurações já registradas nesta rodada.");
        return;
      }
      toast.error(msg);
    });

    socket.on("round:finished", () => {
      if (timerRef.current) clearInterval(timerRef.current);
      setTimeLeft(0);
    });

    // Fim NATURAL (todas as rodadas) → tela de resultado final (pódio).
    socket.on("session:finalized", () => {
      if (timerRef.current) clearInterval(timerRef.current);
      router.push("/pages/dashboard/final");
    });

    // Encerramento pelo facilitador → notifica e volta à página inicial.
    socket.on("session:finished", () => {
      if (timerRef.current) clearInterval(timerRef.current);
      toast("A sessão foi encerrada pelo facilitador.", { icon: "🏁", duration: 4000 });
      sessionStorage.removeItem("player_data");
      sessionStorage.removeItem("round_data");
      setTimeout(() => router.push("/"), 1500);
    });

    return () => {
      socket.disconnect();
      if (timerRef.current) clearInterval(timerRef.current);
    };
  }, [
    API_URL,
    applyMaxStockConfig,
    setPlayer,
    setRound,
    setSubmitting,
    setSubmitted,
    setTimeLeft,
    startTimer,
    router,
  ]);

  

  // ✅ submit corrigido e padronizado com os slugs do banco
const submit = useCallback(
  async (payload: {
    playerId: string;
    sessionId: string;
    roundId: string;
    storeId?: string;
  }): Promise<void> => {
    if (!socketRef.current) throw new Error("Socket não conectado.");
    // Trava síncrona: barra um segundo disparo antes do estado React refletir
    if (submittingRef.current || submitting || submitted) return;
    if (!categoriesLoaded) throw new Error("Categorias ainda não carregadas.");

    submittingRef.current = true;

    // Mapeamento de chaves amigáveis (UI) para Slugs reais (Banco/Seed)
    const CAPEX_SLUG_MAP: Record<string, string> = {
      "seguranca": "seguranca",
      "equipamentos": "freezer", // 👈 Adicione esta linha (ou altere "freezer" para o slug exato do banco, ex: "balanca")
      "freezer": "freezer",
      "balanca": "freezer",
      "redes": "redes",
      "selfcheckout": "self-checkout",
      "self-checkout": "self-checkout",
      "site": "site",
      "bi": "bi",
      "melhoria": "bi", // 👈 Mapeia também a chave "melhoria" usada na UI do seu SetupStep
      "melhoriacontinua": "bi"
    };

    let stockInputs: {
      categoryId: string;
      buyQty: number;
      commercialMargin: number;
      expectedSellPrice: number;
    }[];
    let capexSelections: { capexId: string }[];

    try {
      // 1. Processar Estoque
      stockInputs = Object.entries(config.comercial).map(([key, val]) => {
        const categoryId = categoryMap[key];
        if (!categoryId) {
          console.error(`[submit] Categoria "${key}" não encontrada no mapa.`, categoryMap);
          throw new Error(`Categoria "${key}" não mapeada.`);
        }
        return {
          categoryId,
          buyQty: val.estoque,
          commercialMargin: val.margem,
          expectedSellPrice: 0,
        };
      });

      // 2. Processar CAPEX com conversão de Slug
      capexSelections = Object.entries(config.capex)
        .filter(([, v]) => (v ?? 0) > 0)
        .map(([key]) => ({
          // Converte a chave da UI para o slug técnico do banco
          capexId: CAPEX_SLUG_MAP[key.toLowerCase()] || key.toLowerCase()
        }));
    } catch (err) {
      // Falha na montagem do payload: libera a trava para permitir nova tentativa
      submittingRef.current = false;
      throw err;
    }

    // 3. Envio via Socket
    return new Promise<void>((resolve, reject) => {
      const socket = socketRef.current!;

      const cleanup = () => {
        clearTimeout(timeout);
        socket.off("player:config_submitted", onSuccess);
        socket.off("player:submit_error", onError);
        submittingRef.current = false;
      };

      const onSuccess = () => {
        cleanup();
        setSubmitted(true);
        resolve();
      };

      const onError = (data: { message?: string }) => {
        cleanup();
        const msg = data?.message || "Erro no envio das configurações.";
        // Idempotência: se o servidor diz que a config já existe nesta rodada,
        // o objetivo do usuário já foi atingido — trata como sucesso.
        if (/j[áa]\s*enviad/i.test(msg)) {
          setSubmitted(true);
          resolve();
          return;
        }
        reject(new Error(msg));
      };

      const timeout = setTimeout(() => {
        cleanup();
        reject(new Error("Timeout: servidor não confirmou o envio."));
      }, 10000);

      socket.once("player:config_submitted", onSuccess);
      socket.once("player:submit_error", onError);

      socket.emit("player:submit_config", {
        ...payload,
        operatorsQty: config.operadoresCaixa,
        serviceOperatorsQty: config.operadoresAtendimento,
        quizScore: config.quizScore,
        stockInputs,
        capexSelections,
      });
    });
  },
  [categoryMap, categoriesLoaded, submitting, submitted, config, setSubmitted]
);



  const timeUp =
    (round?.endTime ?? 0) > 0 ? Date.now() >= (round?.endTime ?? 0) : false;

  return { submit, categoriesLoaded, timeUp, initialized };
}