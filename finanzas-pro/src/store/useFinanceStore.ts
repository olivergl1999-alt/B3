'use client';
import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { Transaction, SavingsGoal, CustomCategory, AppSettings } from '@/types';
import { format } from 'date-fns';

interface FinanceStore {
  transactions: Transaction[];
  goals: SavingsGoal[];
  customCategories: CustomCategory[];
  settings: AppSettings;
  activeView: string;
  searchQuery: string;

  // Actions
  addTransaction: (t: Omit<Transaction, 'id' | 'createdAt'>) => void;
  updateTransaction: (id: string, t: Partial<Transaction>) => void;
  deleteTransaction: (id: string) => void;
  addGoal: (g: Omit<SavingsGoal, 'id' | 'createdAt'>) => void;
  updateGoal: (id: string, g: Partial<SavingsGoal>) => void;
  deleteGoal: (id: string) => void;
  addCustomCategory: (c: Omit<CustomCategory, 'id'>) => void;
  deleteCustomCategory: (id: string) => void;
  updateSettings: (s: Partial<AppSettings>) => void;
  setActiveView: (view: string) => void;
  setSearchQuery: (q: string) => void;
  importTransactions: (transactions: Omit<Transaction, 'id' | 'createdAt'>[]) => void;
}

const INITIAL_TRANSACTIONS: Transaction[] = [
  // Feb 2025
  { id: 't1', type: 'income', description: 'Sueldo', date: '2025-02-15', amount: 200, category: 'sueldo', bankAccount: 'Pichincha', status: 'completed', createdAt: '2025-02-15' },
  { id: 't2', type: 'expense', description: 'Computadora', date: '2025-02-15', amount: 85, category: 'compras', bankAccount: 'Pichincha', status: 'completed', isFixed: false, createdAt: '2025-02-15' },
  { id: 't3', type: 'expense', description: 'Servicios básicos', date: '2025-02-15', amount: 30, category: 'servicios', bankAccount: 'Pichincha', status: 'completed', isFixed: true, createdAt: '2025-02-15' },
  { id: 't4', type: 'expense', description: 'Deu. Pao', date: '2025-02-15', amount: 70, category: 'imprevistos', bankAccount: 'Pichincha', status: 'completed', isFixed: false, createdAt: '2025-02-15' },
  { id: 't5', type: 'expense', description: 'Pasajes', date: '2025-02-15', amount: 20, category: 'transporte', bankAccount: 'Guayaquil', status: 'completed', isFixed: false, createdAt: '2025-02-15' },
  // Mar 2025
  { id: 't6', type: 'income', description: 'Sueldo', date: '2025-03-14', amount: 200, category: 'sueldo', bankAccount: 'Pichincha', status: 'completed', createdAt: '2025-03-14' },
  { id: 't7', type: 'expense', description: 'DEU.DAYA', date: '2025-03-14', amount: 11, category: 'imprevistos', bankAccount: 'Pichincha', status: 'completed', isFixed: false, createdAt: '2025-03-14' },
  { id: 't8', type: 'expense', description: 'PAG. Tarjeta', date: '2025-03-14', amount: 32.51, category: 'servicios', bankAccount: 'Guayaquil', status: 'completed', isFixed: true, createdAt: '2025-03-14' },
  { id: 't9', type: 'expense', description: 'Deu. Jessi', date: '2025-03-14', amount: 50, category: 'imprevistos', bankAccount: 'Pichincha', status: 'completed', isFixed: false, createdAt: '2025-03-14' },
  { id: 't10', type: 'expense', description: 'Pasajes', date: '2025-03-14', amount: 40, category: 'transporte', bankAccount: 'Pichincha', status: 'completed', isFixed: false, createdAt: '2025-03-14' },
  { id: 't11', type: 'expense', description: 'Caprichos', date: '2025-03-14', amount: 40, category: 'entretenimiento', bankAccount: 'Pichincha', status: 'completed', isFixed: false, createdAt: '2025-03-14' },
  { id: 't12', type: 'expense', description: 'Com. Perfu', date: '2025-03-14', amount: 20, category: 'compras', bankAccount: 'Pichincha', status: 'completed', isFixed: false, createdAt: '2025-03-14' },
  // May 2025
  { id: 't13', type: 'income', description: 'Sueldo', date: '2025-05-02', amount: 600, category: 'sueldo', bankAccount: 'Pichincha', status: 'completed', createdAt: '2025-05-02' },
  { id: 't14', type: 'income', description: 'Sueldo', date: '2025-06-02', amount: 600, category: 'sueldo', bankAccount: 'Pichincha', status: 'completed', createdAt: '2025-06-02' },
  { id: 't15', type: 'income', description: 'Sueldo', date: '2025-07-02', amount: 600, category: 'sueldo', bankAccount: 'Pichincha', status: 'completed', createdAt: '2025-07-02' },
  { id: 't16', type: 'income', description: 'Sueldo', date: '2025-08-02', amount: 600, category: 'sueldo', bankAccount: 'Pichincha', status: 'completed', createdAt: '2025-08-02' },
  { id: 't17', type: 'income', description: 'Sueldo', date: '2025-09-02', amount: 600, category: 'sueldo', bankAccount: 'Pichincha', status: 'completed', createdAt: '2025-09-02' },
  { id: 't18', type: 'income', description: 'Sueldo', date: '2025-10-02', amount: 600, category: 'sueldo', bankAccount: 'Pichincha', status: 'completed', createdAt: '2025-10-02' },
  { id: 't19', type: 'income', description: 'Sueldo', date: '2025-11-02', amount: 600, category: 'sueldo', bankAccount: 'Pichincha', status: 'completed', createdAt: '2025-11-02' },
  { id: 't20', type: 'income', description: 'Sueldo', date: '2025-12-02', amount: 600, category: 'sueldo', bankAccount: 'Pichincha', status: 'completed', createdAt: '2025-12-02' },
];

const INITIAL_GOALS: SavingsGoal[] = [
  { id: 'g1', name: 'Equipo Audiovisual', targetAmount: 1500, currentAmount: 350, deadline: '2025-12-31', color: '#2563EB', icon: '🎥', status: 'active', createdAt: '2025-01-01' },
  { id: 'g2', name: 'Vacaciones', targetAmount: 800, currentAmount: 200, deadline: '2025-07-01', color: '#10B981', icon: '✈️', status: 'active', createdAt: '2025-01-01' },
  { id: 'g3', name: 'Fondo de Emergencia', targetAmount: 2000, currentAmount: 500, deadline: '2025-12-31', color: '#F59E0B', icon: '🛡️', status: 'active', createdAt: '2025-01-01' },
];

function genId() {
  return Date.now().toString(36) + Math.random().toString(36).slice(2);
}

export const useFinanceStore = create<FinanceStore>()(
  persist(
    (set, get) => ({
      transactions: INITIAL_TRANSACTIONS,
      goals: INITIAL_GOALS,
      customCategories: [],
      settings: { currency: 'USD', theme: 'dark', language: 'es', notifications: true },
      activeView: 'dashboard',
      searchQuery: '',

      addTransaction: (t) => set((s) => ({
        transactions: [...s.transactions, { ...t, id: genId(), createdAt: format(new Date(), 'yyyy-MM-dd') }]
      })),
      updateTransaction: (id, t) => set((s) => ({
        transactions: s.transactions.map((tx) => tx.id === id ? { ...tx, ...t } : tx)
      })),
      deleteTransaction: (id) => set((s) => ({
        transactions: s.transactions.filter((tx) => tx.id !== id)
      })),
      addGoal: (g) => set((s) => ({
        goals: [...s.goals, { ...g, id: genId(), createdAt: format(new Date(), 'yyyy-MM-dd') }]
      })),
      updateGoal: (id, g) => set((s) => ({
        goals: s.goals.map((goal) => goal.id === id ? { ...goal, ...g } : goal)
      })),
      deleteGoal: (id) => set((s) => ({
        goals: s.goals.filter((g) => g.id !== id)
      })),
      addCustomCategory: (c) => set((s) => ({
        customCategories: [...s.customCategories, { ...c, id: genId() }]
      })),
      deleteCustomCategory: (id) => set((s) => ({
        customCategories: s.customCategories.filter((c) => c.id !== id)
      })),
      updateSettings: (s) => set((prev) => ({
        settings: { ...prev.settings, ...s }
      })),
      setActiveView: (view) => set({ activeView: view }),
      setSearchQuery: (q) => set({ searchQuery: q }),
      importTransactions: (transactions) => set((s) => ({
        transactions: [
          ...s.transactions,
          ...transactions.map((t) => ({ ...t, id: genId(), createdAt: format(new Date(), 'yyyy-MM-dd') }))
        ]
      })),
    }),
    { name: 'finanzas-pro-store' }
  )
);
