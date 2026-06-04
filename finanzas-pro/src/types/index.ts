export type TransactionType = 'income' | 'expense';
export type PaymentStatus = 'pending' | 'completed';
export type ExpenseCategory =
  | 'internet' | 'servicios' | 'suscripciones' | 'transporte' | 'nomina' | 'alquiler'
  | 'alimentacion' | 'compras' | 'entretenimiento' | 'combustible' | 'imprevistos'
  | 'custom';
export type ExpenseType = 'fixed' | 'variable';
export type IncomeCategory =
  | 'sueldo' | 'freelance' | 'negocio' | 'inversion' | 'deuda_cobrada' | 'custom';
export type BankAccount = 'Pichincha' | 'Produbanco' | 'Guayaquil' | 'Bolivariano' | 'Efectivo' | 'custom';
export type GoalStatus = 'active' | 'completed' | 'paused';

export interface Transaction {
  id: string;
  type: TransactionType;
  description: string;
  date: string; // ISO date
  amount: number;
  category: string;
  bankAccount: string;
  status: PaymentStatus;
  notes?: string;
  isFixed?: boolean;
  tags?: string[];
  createdAt: string;
}

export interface SavingsGoal {
  id: string;
  name: string;
  targetAmount: number;
  currentAmount: number;
  deadline?: string;
  color: string;
  icon: string;
  status: GoalStatus;
  createdAt: string;
}

export interface CustomCategory {
  id: string;
  name: string;
  type: TransactionType;
  color: string;
  icon: string;
  isFixed?: boolean;
}

export interface AppSettings {
  currency: string;
  theme: 'light' | 'dark';
  language: string;
  notifications: boolean;
  monthlyBudget?: number;
}

export interface MonthlyStats {
  month: string; // YYYY-MM
  totalIncome: number;
  totalExpenses: number;
  netProfit: number;
  savings: number;
  fixedExpenses: number;
  variableExpenses: number;
  avgDailyExpense: number;
}
