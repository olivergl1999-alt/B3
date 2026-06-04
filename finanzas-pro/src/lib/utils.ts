import { Transaction, MonthlyStats } from '@/types';
import { format, parseISO, startOfMonth, endOfMonth, eachDayOfInterval, getDaysInMonth } from 'date-fns';
import { es } from 'date-fns/locale';

export function formatCurrency(amount: number, currency = 'USD'): string {
  return new Intl.NumberFormat('es-EC', { style: 'currency', currency, minimumFractionDigits: 2 }).format(amount);
}

export function getMonthlyStats(transactions: Transaction[], month: string): MonthlyStats {
  const monthTxs = transactions.filter((t) => t.date.startsWith(month));
  const income = monthTxs.filter((t) => t.type === 'income' && t.status === 'completed');
  const expenses = monthTxs.filter((t) => t.type === 'expense' && t.status === 'completed');
  const totalIncome = income.reduce((s, t) => s + t.amount, 0);
  const totalExpenses = expenses.reduce((s, t) => s + t.amount, 0);
  const fixedExpenses = expenses.filter((t) => t.isFixed).reduce((s, t) => s + t.amount, 0);
  const variableExpenses = expenses.filter((t) => !t.isFixed).reduce((s, t) => s + t.amount, 0);
  const days = getDaysInMonth(parseISO(month + '-01'));
  return {
    month,
    totalIncome,
    totalExpenses,
    netProfit: totalIncome - totalExpenses,
    savings: Math.max(0, totalIncome - totalExpenses),
    fixedExpenses,
    variableExpenses,
    avgDailyExpense: totalExpenses / days,
  };
}

export function getLast6MonthsStats(transactions: Transaction[]): MonthlyStats[] {
  const months: string[] = [];
  const now = new Date();
  for (let i = 5; i >= 0; i--) {
    const d = new Date(now.getFullYear(), now.getMonth() - i, 1);
    months.push(format(d, 'yyyy-MM'));
  }
  return months.map((m) => getMonthlyStats(transactions, m));
}

export function getCategoryTotals(transactions: Transaction[], type: 'income' | 'expense', month?: string) {
  let txs = transactions.filter((t) => t.type === type && t.status === 'completed');
  if (month) txs = txs.filter((t) => t.date.startsWith(month));
  const totals: Record<string, number> = {};
  for (const tx of txs) {
    totals[tx.category] = (totals[tx.category] || 0) + tx.amount;
  }
  return Object.entries(totals).map(([name, value]) => ({ name: CATEGORY_LABELS[name] || name, value }))
    .sort((a, b) => b.value - a.value);
}

export const CATEGORY_LABELS: Record<string, string> = {
  internet: 'Internet', servicios: 'Servicios', suscripciones: 'Suscripciones',
  transporte: 'Transporte', nomina: 'Nómina', alquiler: 'Alquiler',
  alimentacion: 'Alimentación', compras: 'Compras', entretenimiento: 'Entretenimiento',
  combustible: 'Combustible', imprevistos: 'Imprevistos',
  sueldo: 'Sueldo', freelance: 'Freelance', negocio: 'Negocio',
  inversion: 'Inversión', deuda_cobrada: 'Deuda Cobrada', custom: 'Personalizado',
};

export const CATEGORY_COLORS: Record<string, string> = {
  internet: '#6366F1', servicios: '#8B5CF6', suscripciones: '#EC4899',
  transporte: '#F59E0B', nomina: '#EF4444', alquiler: '#DC2626',
  alimentacion: '#10B981', compras: '#3B82F6', entretenimiento: '#F472B6',
  combustible: '#F97316', imprevistos: '#94A3B8',
  sueldo: '#2563EB', freelance: '#10B981', negocio: '#059669',
  inversion: '#0EA5E9', deuda_cobrada: '#6366F1', custom: '#94A3B8',
};

export const FIXED_CATEGORIES = ['internet', 'servicios', 'suscripciones', 'transporte', 'nomina', 'alquiler'];
export const VARIABLE_CATEGORIES = ['alimentacion', 'compras', 'entretenimiento', 'combustible', 'imprevistos'];

export function getCurrentMonth(): string {
  return format(new Date(), 'yyyy-MM');
}

export function formatMonthLabel(month: string): string {
  return format(parseISO(month + '-01'), 'MMM yyyy', { locale: es });
}

export function classifyExpense(category: string): 'fixed' | 'variable' {
  return FIXED_CATEGORIES.includes(category) ? 'fixed' : 'variable';
}
