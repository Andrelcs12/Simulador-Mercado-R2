"use client";

import React, { useState, useEffect, useRef, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Timer, ShoppingCart, Building2, CheckCircle2,
  AlertTriangle, Loader2, Send, TrendingUp, Package, Wallet
} from 'lucide-react';
import toast, { Toaster } from 'react-hot-toast';
import { io, Socket } from 'socket.io-client';
import { useRouter } from 'next/navigation';

// ─── Tipos ─────────────────────────────────────────────────────────────────────

interface Category {
  id: string;
  name: string;
  unitCost: number;
  defaultMargin: number;
}

interface CapexItem {
  id: string;
  name: string;
  cost: number;
  description?: string;
}

interface StockInput {
  categoryId: string;
  buyQty: number;
  appliedMargin: number;
}

interface PlayerData {
  id: string;
  name: string;
  storeName: string;
  sessionId: string;
}

interface RoundData {
  roundNumber: number;
  duration: number;
  endTime: string;
}

const BUDGET_LIMIT = 700_000;

// ─── Componente ────────────────────────────────────────────────────────────────

const SimulacaoPage = () => {
  const router = useRouter();
  const socketRef = useRef<Socket | null>(null);

  // Dados persistidos
  const [player, setPlayer] = useState<PlayerData | null>(null);
  const [roundData, setRoundData] = useState<RoundData | null>(null);

  // Master data da API
  const [categories, setCategories] = useState<Category[]>([]);
  const [capexItems, setCapexItems] = useState<CapexItem[]>([]);
  const [balance, setBalance] = useState<number>(BUDGET_LIMIT);

  // Form state
  const [stockInputs, setStockInputs] = useState<Record<string, StockInput>>({});
  const [selectedCapex, setSelectedCapex] = useState<Set<string>>(new Set());

  // UI state
  const [timeLeft, setTimeLeft] = useState(0);
  const [isTimeUp, setIsTimeUp] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSubmitted, setIsSubmitted] = useState(false);
  const [isLoadingData, setIsLoadingData] = useState(true);

  const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:4000';

  // ── Custo total calculado em tempo real ─────────────────────────────────────
  const totalCost = React.useMemo(() => {
    const stockCost = Object.values(stockInputs).reduce((acc, input) => {
      const cat = categories.find(c => c.id === input.categoryId);
      if (!cat) return acc;
      return acc + cat.unitCost * input.buyQty;
    }, 0);

    const capexCost = [...selectedCapex].reduce((acc, capexId) => {
      const item = capexItems.find(c => c.id === capexId);
      return acc + (item?.cost ?? 0);
    }, 0);

    return stockCost + capexCost;
  }, [stockInputs, selectedCapex, categories, capexItems]);

  const budgetUsedPercent = Math.min(100, (totalCost / balance) * 100);
  const isOverBudget = totalCost > balance;

  // ── Timer sincronizado com o servidor ──────────────────────────────────────
  const startTimer = useCallback((endTime: string) => {
    const tick = () => {
      const remaining = Math.max(0, Math.floor((new Date(endTime).getTime() - Date.now()) / 1000));
      setTimeLeft(remaining);

      // Alerta sonoro faltando 30s
      if (remaining === 30) {
        toast('⚠️ Faltam 30 segundos!', {
          style: { background: '#f97316', color: '#fff', fontWeight: 'bold' },
          duration: 4000,
        });
      }

      if (remaining <= 0) {
        clearInterval(timerRef.current!);
      }
    };
    tick();
    timerRef.current = setInterval(tick, 1000);
  }, []);

  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null);

  // ── Inicialização ───────────────────────────────────────────────────────────
  useEffect(() => {
    const savedPlayer = localStorage.getItem('player_data');
    const savedRound = localStorage.getItem('round_data');

    if (!savedPlayer || !savedRound) {
      router.push('/pages/lobby');
      return;
    }

    const p: PlayerData = JSON.parse(savedPlayer);
    const r: RoundData = JSON.parse(savedRound);
    setPlayer(p);
    setRoundData(r);

    // Inicia timer sincronizado com o endTime do servidor
    startTimer(r.endTime);

    // Carrega dados do backend
    const loadData = async () => {
      try {
        const [masterRes, statusRes] = await Promise.all([
          fetch(`${API_URL}/minigame/master-data`),
          fetch(`${API_URL}/minigame/store-status/${p.id}`),
        ]);

        if (masterRes.ok) {
          const master = await masterRes.json();
          const cats: Category[] = master.categories ?? [];
          const capex: CapexItem[] = master.capex ?? [];
          setCategories(cats);
          setCapexItems(capex);

          // Inicializa stock inputs zerados
          const initInputs: Record<string, StockInput> = {};
          cats.forEach(c => {
            initInputs[c.id] = { categoryId: c.id, buyQty: 0, appliedMargin: c.defaultMargin };
          });
          setStockInputs(initInputs);
        }

        if (statusRes.ok) {
          const status = await statusRes.json();
          setBalance(status.balance ?? BUDGET_LIMIT);
        }
      } catch (err) {
        console.error('Erro ao carregar dados:', err);
        toast.error('Erro ao carregar dados da rodada.');
      } finally {
        setIsLoadingData(false);
      }
    };

    loadData();

    // Conecta socket
    const socket = io(`${API_URL}/simulation`, {
      reconnection: true,
      reconnectionAttempts: Infinity,
      reconnectionDelay: 1000,
    });
    socketRef.current = socket;

    socket.emit('join_session', {
      sessionId: p.sessionId,
      playerId: p.id,
      name: p.name,
    });

    // ✅ Tempo esgotado → congela formulário
    socket.on('round:time_up', () => {
      setIsTimeUp(true);
      setTimeLeft(0);
      if (timerRef.current) clearInterval(timerRef.current);
      toast('⏱ Tempo Esgotado! Formulário bloqueado.', {
        style: { background: '#002350', color: '#fff', fontWeight: 'bold' },
        duration: 5000,
      });
    });

    // Simulação encerrada → vai para ranking
    socket.on('simulation:finished', () => {
      router.push('/pages/admin/results');
    });

    return () => {
      socket.disconnect();
      if (timerRef.current) clearInterval(timerRef.current);
    };
  }, [router, API_URL, startTimer]);

  // ── Formatação do timer ─────────────────────────────────────────────────────
  const formatTime = (secs: number) => {
    const m = Math.floor(secs / 60);
    const s = secs % 60;
    return `${m.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}`;
  };

  // ── Atualizar stock inputs ──────────────────────────────────────────────────
  const updateStock = (categoryId: string, field: 'buyQty' | 'appliedMargin', value: number) => {
    setStockInputs(prev => ({
      ...prev,
      [categoryId]: { ...prev[categoryId], [field]: value },
    }));
  };

  const toggleCapex = (capexId: string) => {
    setSelectedCapex(prev => {
      const next = new Set(prev);
      if (next.has(capexId)) next.delete(capexId);
      else next.add(capexId);
      return next;
    });
  };

  // ── Submit ──────────────────────────────────────────────────────────────────
  const handleSubmit = async () => {
    if (!player || !roundData) return;

    // Validação local de orçamento
    if (isOverBudget) {
      toast.error(
        `Sua estratégia custa R$ ${totalCost.toLocaleString('pt-BR')}, mas você só tem R$ ${balance.toLocaleString('pt-BR')}`,
        { duration: 5000 }
      );
      return;
    }

    setIsSubmitting(true);

    const payload = {
      storeId: player.id,
      sessionId: player.sessionId,
      roundNumber: roundData.roundNumber,
      stockInputs: Object.values(stockInputs).filter(s => s.buyQty > 0),
      capexSelections: [...selectedCapex].map(id => ({ capexId: id })),
    };

    try {
      const res = await fetch(`${API_URL}/minigame/submit-config`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });

      if (res.status === 201) {
        // ✅ Sucesso: emite confirmação via socket
        socketRef.current?.emit('player:submit_confirmation', {
          sessionId: player.sessionId,
          playerId: player.id,
          storeName: player.storeName,
        });
        setIsSubmitted(true);
        toast.success('Decisões enviadas com sucesso!', {
          style: { background: '#002350', color: '#fff', fontWeight: 'bold' },
        });
      } else if (res.status === 400) {
        const err = await res.json();
        toast.error(`Saldo insuficiente! Sua estratégia custa R$ ${err.required?.toLocaleString('pt-BR') ?? '?'}, mas você só tem R$ ${balance.toLocaleString('pt-BR')}`, {
          duration: 6000,
        });
      } else if (res.status === 403) {
        toast.error('Rodada encerrada pelo servidor. Não é possível enviar agora.', { duration: 5000 });
      } else {
        toast.error('Erro inesperado. Tente novamente.');
      }
    } catch {
      toast.error('Falha na conexão. Tente novamente.');
    } finally {
      setIsSubmitting(false);
    }
  };

  // ── Loading ─────────────────────────────────────────────────────────────────
  if (isLoadingData) {
    return (
      <div className="min-h-screen bg-[#002350] flex flex-col items-center justify-center gap-4">
        <motion.div
          animate={{ rotate: 360 }}
          transition={{ repeat: Infinity, duration: 1, ease: 'linear' }}
          className="w-16 h-16 border-4 border-orange-500 border-t-transparent rounded-full"
        />
        <span className="text-white font-black tracking-widest text-xs uppercase italic">Carregando dados da rodada...</span>
      </div>
    );
  }

  // ── Aguardando outros jogadores (após submit) ───────────────────────────────
  if (isSubmitted) {
    return (
      <div className="min-h-screen bg-[#002350] flex flex-col items-center justify-center gap-8 p-6">
        <motion.div
          initial={{ scale: 0 }}
          animate={{ scale: 1 }}
          transition={{ type: 'spring', stiffness: 200 }}
          className="w-24 h-24 bg-emerald-500 rounded-full flex items-center justify-center shadow-2xl"
        >
          <CheckCircle2 size={48} className="text-white" />
        </motion.div>
        <div className="text-center">
          <h2 className="text-4xl font-black text-white uppercase italic tracking-tighter mb-2">
            Decisões Enviadas!
          </h2>
          <p className="text-white/50 font-bold text-sm uppercase tracking-widest">
            Aguardando outros jogadores...
          </p>
        </div>
        <div className="flex items-center gap-3 px-8 py-4 bg-white/10 rounded-2xl border border-white/20">
          <Loader2 size={18} className="text-orange-500 animate-spin" />
          <span className="text-white/70 text-xs font-black uppercase tracking-wider">
            O mestre liberará a próxima fase
          </span>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#F8FAFC] font-sans selection:bg-orange-500 relative">
      <Toaster position="top-right" />

      {/* OVERLAY TEMPO ESGOTADO */}
      <AnimatePresence>
        {isTimeUp && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="fixed inset-0 z-50 flex items-center justify-center"
          >
            <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" />
            <motion.div
              initial={{ scale: 0.8, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              className="relative z-10 bg-white rounded-[3rem] p-12 text-center shadow-2xl max-w-md mx-4"
            >
              <div className="w-20 h-20 bg-red-500 rounded-full flex items-center justify-center mx-auto mb-6">
                <Timer size={40} className="text-white" />
              </div>
              <h2 className="text-3xl font-black text-[#002350] uppercase italic tracking-tighter mb-2">
                Tempo Esgotado!
              </h2>
              <p className="text-gray-400 font-bold text-sm uppercase tracking-widest">
                O formulário foi bloqueado pelo servidor.
              </p>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* HEADER */}
      <header className="sticky top-0 z-40 bg-[#002350] px-6 md:px-12 py-4 flex justify-between items-center shadow-xl border-b-4 border-orange-500">
        <div className="flex items-center gap-4">
          <div className="w-10 h-10 bg-orange-500 rounded-xl flex items-center justify-center font-black text-white text-lg">C</div>
          <div>
            <h1 className="text-white font-black text-sm uppercase italic tracking-tight leading-none">
              SIMULADOR <span className="text-orange-500">CENCOSUD</span>
            </h1>
            <p className="text-blue-400 text-[9px] font-black uppercase tracking-widest">
              Rodada {roundData?.roundNumber ?? '?'} • {player?.storeName}
            </p>
          </div>
        </div>

        {/* TIMER */}
        <motion.div
          animate={timeLeft <= 30 && timeLeft > 0 ? { scale: [1, 1.05, 1] } : {}}
          transition={{ repeat: Infinity, duration: 0.5 }}
          className={`flex items-center gap-3 px-6 py-3 rounded-2xl font-mono font-black text-2xl border-b-4 transition-colors ${
            isTimeUp ? 'bg-red-500 border-red-700 text-white'
            : timeLeft <= 30 ? 'bg-orange-500 border-orange-700 text-white animate-pulse'
            : 'bg-white/10 border-white/20 text-white'
          }`}
        >
          <Timer size={22} className={timeLeft <= 30 ? 'text-white' : 'text-orange-500'} />
          {formatTime(timeLeft)}
        </motion.div>

        {/* ORÇAMENTO */}
        <div className="hidden md:flex flex-col items-end">
          <span className="text-blue-400 text-[9px] font-black uppercase tracking-widest">Orçamento</span>
          <span className={`text-sm font-black ${isOverBudget ? 'text-red-400' : 'text-white'}`}>
            R$ {(balance - totalCost).toLocaleString('pt-BR')} restante
          </span>
        </div>
      </header>

      {/* BARRA DE ORÇAMENTO */}
      <div className="h-2 bg-slate-200 relative">
        <motion.div
          animate={{ width: `${budgetUsedPercent}%` }}
          transition={{ duration: 0.3 }}
          className={`h-full transition-colors ${isOverBudget ? 'bg-red-500' : budgetUsedPercent > 80 ? 'bg-orange-500' : 'bg-emerald-500'}`}
        />
        {isOverBudget && (
          <div className="absolute right-0 top-0 bottom-0 flex items-center pr-2">
            <AlertTriangle size={12} className="text-red-500" />
          </div>
        )}
      </div>

      <main className="max-w-6xl mx-auto p-4 md:p-8 space-y-8">

        {/* AVISO DE ORÇAMENTO */}
        <AnimatePresence>
          {isOverBudget && (
            <motion.div
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0 }}
              className="bg-red-50 border-2 border-red-200 rounded-2xl p-4 flex items-center gap-3"
            >
              <AlertTriangle size={20} className="text-red-500 shrink-0" />
              <p className="text-red-700 font-black text-sm">
                Sua estratégia custa <strong>R$ {totalCost.toLocaleString('pt-BR')}</strong>, mas você só tem{' '}
                <strong>R$ {balance.toLocaleString('pt-BR')}</strong>. Ajuste antes de enviar.
              </p>
            </motion.div>
          )}
        </AnimatePresence>

        <div className="grid lg:grid-cols-3 gap-8">

          {/* ESTOQUE (2/3) */}
          <div className="lg:col-span-2 space-y-6">
            <div className="flex items-center gap-3 mb-2">
              <div className="p-3 bg-[#002350] rounded-2xl text-orange-500">
                <ShoppingCart size={22} />
              </div>
              <div>
                <h2 className="text-xl font-black text-[#002350] uppercase italic tracking-tighter">Gestão de Estoque</h2>
                <p className="text-[10px] text-slate-400 font-black uppercase tracking-widest">Defina quantidade e margem por categoria</p>
              </div>
            </div>

            {categories.length === 0 ? (
              <div className="bg-white rounded-3xl p-8 text-center text-slate-300 font-black uppercase text-sm">
                Nenhuma categoria carregada
              </div>
            ) : (
              <div className="space-y-4">
                {categories.map((cat, idx) => {
                  const input = stockInputs[cat.id] ?? { categoryId: cat.id, buyQty: 0, appliedMargin: cat.defaultMargin };
                  const catCost = cat.unitCost * input.buyQty;

                  return (
                    <motion.div
                      key={cat.id}
                      initial={{ opacity: 0, x: -20 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: idx * 0.05 }}
                      className={`bg-white rounded-[2rem] p-6 border-2 transition-all shadow-sm ${
                        isTimeUp ? 'opacity-60 pointer-events-none' : 'border-slate-100 hover:border-orange-200'
                      }`}
                    >
                      <div className="flex justify-between items-start mb-4">
                        <div>
                          <h3 className="font-black text-[#002350] uppercase italic tracking-tight">{cat.name}</h3>
                          <p className="text-[10px] text-slate-400 font-black uppercase">
                            Custo unitário: R$ {cat.unitCost.toFixed(2)}
                          </p>
                        </div>
                        <div className="text-right">
                          <span className="text-[10px] text-slate-300 font-black uppercase block">Custo Total</span>
                          <span className="font-black text-[#002350] text-sm">R$ {catCost.toLocaleString('pt-BR')}</span>
                        </div>
                      </div>

                      <div className="grid grid-cols-2 gap-4">
                        <div>
                          <label className="block text-[9px] font-black text-slate-400 uppercase tracking-widest mb-1 flex items-center gap-1">
                            <Package size={10} /> Quantidade (unid.)
                          </label>
                          <input
                            type="number"
                            min={0}
                            value={input.buyQty}
                            onChange={e => updateStock(cat.id, 'buyQty', Number(e.target.value))}
                            disabled={isTimeUp}
                            className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 font-black text-[#002350] text-sm outline-none focus:border-orange-400 focus:bg-white transition-all disabled:opacity-50"
                          />
                        </div>
                        <div>
                          <label className="block text-[9px] font-black text-slate-400 uppercase tracking-widest mb-1 flex items-center gap-1">
                            <TrendingUp size={10} /> Margem (%)
                          </label>
                          <input
                            type="number"
                            min={0}
                            max={100}
                            step={0.5}
                            value={input.appliedMargin}
                            onChange={e => updateStock(cat.id, 'appliedMargin', Number(e.target.value))}
                            disabled={isTimeUp}
                            className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 font-black text-[#002350] text-sm outline-none focus:border-orange-400 focus:bg-white transition-all disabled:opacity-50"
                          />
                        </div>
                      </div>
                    </motion.div>
                  );
                })}
              </div>
            )}
          </div>

          {/* CAPEX + RESUMO (1/3) */}
          <div className="space-y-6">

            {/* CAPEX */}
            <div>
              <div className="flex items-center gap-3 mb-4">
                <div className="p-3 bg-[#002350] rounded-2xl text-orange-500">
                  <Building2 size={22} />
                </div>
                <div>
                  <h2 className="text-lg font-black text-[#002350] uppercase italic tracking-tighter">Investimentos</h2>
                  <p className="text-[9px] text-slate-400 font-black uppercase tracking-widest">Selecione os CAPEXs</p>
                </div>
              </div>

              <div className="space-y-3">
                {capexItems.map((item, idx) => {
                  const checked = selectedCapex.has(item.id);
                  return (
                    <motion.button
                      key={item.id}
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: idx * 0.05 }}
                      onClick={() => !isTimeUp && toggleCapex(item.id)}
                      disabled={isTimeUp}
                      className={`w-full p-4 rounded-2xl border-2 text-left transition-all ${
                        checked
                          ? 'bg-[#002350] border-[#002350] shadow-lg'
                          : 'bg-white border-slate-100 hover:border-orange-200'
                      } ${isTimeUp ? 'opacity-50 pointer-events-none' : ''}`}
                    >
                      <div className="flex justify-between items-center">
                        <div>
                          <p className={`font-black text-xs uppercase italic tracking-tight ${checked ? 'text-white' : 'text-[#002350]'}`}>
                            {item.name}
                          </p>
                          {item.description && (
                            <p className={`text-[9px] font-bold uppercase mt-0.5 ${checked ? 'text-blue-300' : 'text-slate-400'}`}>
                              {item.description}
                            </p>
                          )}
                        </div>
                        <div className="text-right ml-2 shrink-0">
                          <span className={`text-[10px] font-black ${checked ? 'text-orange-400' : 'text-slate-400'}`}>
                            R$ {item.cost.toLocaleString('pt-BR')}
                          </span>
                          {checked && <CheckCircle2 size={14} className="text-orange-400 ml-auto mt-1" />}
                        </div>
                      </div>
                    </motion.button>
                  );
                })}
              </div>
            </div>

            {/* RESUMO FINANCEIRO */}
            <div className="bg-[#002350] rounded-[2.5rem] p-7 text-white space-y-4 border-b-8 border-orange-500 sticky top-24">
              <div className="flex items-center gap-2 text-orange-500 font-black text-[10px] uppercase tracking-widest">
                <Wallet size={14} /> Resumo Financeiro
              </div>

              <div className="space-y-2">
                <div className="flex justify-between items-center text-xs">
                  <span className="text-blue-300 font-bold uppercase">Orçamento Total</span>
                  <span className="font-black">R$ {balance.toLocaleString('pt-BR')}</span>
                </div>
                <div className="flex justify-between items-center text-xs">
                  <span className="text-blue-300 font-bold uppercase">Gasto Estoque</span>
                  <span className="font-black text-orange-400">
                    R$ {Object.values(stockInputs).reduce((acc, s) => {
                      const cat = categories.find(c => c.id === s.categoryId);
                      return acc + (cat?.unitCost ?? 0) * s.buyQty;
                    }, 0).toLocaleString('pt-BR')}
                  </span>
                </div>
                <div className="flex justify-between items-center text-xs">
                  <span className="text-blue-300 font-bold uppercase">Gasto CAPEX</span>
                  <span className="font-black text-orange-400">
                    R$ {[...selectedCapex].reduce((acc, id) => {
                      const c = capexItems.find(x => x.id === id);
                      return acc + (c?.cost ?? 0);
                    }, 0).toLocaleString('pt-BR')}
                  </span>
                </div>
                <div className="h-px bg-white/10 my-2" />
                <div className="flex justify-between items-center">
                  <span className="text-white font-black uppercase text-xs">Total</span>
                  <span className={`font-black text-lg ${isOverBudget ? 'text-red-400' : 'text-emerald-400'}`}>
                    R$ {totalCost.toLocaleString('pt-BR')}
                  </span>
                </div>
              </div>

              {/* Barra visual */}
              <div className="h-2 bg-white/10 rounded-full overflow-hidden">
                <motion.div
                  animate={{ width: `${Math.min(100, budgetUsedPercent)}%` }}
                  className={`h-full rounded-full ${isOverBudget ? 'bg-red-500' : 'bg-emerald-500'}`}
                />
              </div>

              {/* BOTÃO DE ENVIO */}
              <motion.button
                whileTap={!isSubmitting && !isTimeUp && !isOverBudget ? { scale: 0.97 } : {}}
                onClick={handleSubmit}
                disabled={isSubmitting || isTimeUp || isOverBudget}
                className={`w-full py-5 rounded-2xl font-black text-sm uppercase italic tracking-wider flex items-center justify-center gap-3 transition-all ${
                  isTimeUp
                    ? 'bg-red-500/20 text-red-300 cursor-not-allowed border border-red-500/20'
                    : isOverBudget
                    ? 'bg-red-500/20 text-red-300 cursor-not-allowed border border-red-500/20'
                    : isSubmitting
                    ? 'bg-white/10 text-white/50 cursor-not-allowed'
                    : 'bg-orange-500 hover:bg-orange-400 text-white shadow-lg shadow-orange-500/20 hover:scale-[1.02]'
                }`}
              >
                {isSubmitting ? (
                  <><Loader2 size={18} className="animate-spin" /> Enviando...</>
                ) : isTimeUp ? (
                  <><Timer size={18} /> Tempo Esgotado</>
                ) : isOverBudget ? (
                  <><AlertTriangle size={18} /> Orçamento Estourado</>
                ) : (
                  <><Send size={18} /> Enviar Decisões</>
                )}
              </motion.button>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
};

export default SimulacaoPage;
