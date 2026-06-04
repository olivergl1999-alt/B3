'use client';
import { useMemo, useState } from 'react';
import { useFinanceStore } from '@/store/useFinanceStore';
import { getMonthlyStats, getLast6MonthsStats, getCategoryTotals, formatCurrency, formatMonthLabel, getCurrentMonth, CATEGORY_COLORS } from '@/lib/utils';
import { StatCard } from '@/components/ui/StatCard';
import { Card } from '@/components/ui/Card';
import {
  AreaChart, Area, BarChart, Bar, PieChart, Pie, Cell, ResponsiveContainer,
  XAxis, YAxis, CartesianGrid, Tooltip, Legend
} from 'recharts';
import { TrendingUp, TrendingDown, DollarSign, PiggyBank, Activity, ArrowUpRight, ArrowDownRight, ChevronLeft, ChevronRight } from 'lucide-react';
import { format, addMonths, subMonths, parseISO } from 'date-fns';
import { es } from 'date-fns/locale';

const CustomTooltip = ({ active, payload, label }: any) => {
  if (!active || !payload?.length) return null;
  return (
    <div className="bg-[#1E1E1E] border border-white/10 rounded-xl p-3 shadow-xl text-xs">
      <p className="text-white/60 mb-2">{label}</p>
      {payload.map((p: any) => (
        <p key={p.name} style={{ color: p.color }} className="font-medium">{p.name}: {formatCurrency(p.value)}</p>
      ))}
    </div>
  );
};

export function Dashboard() {
  const { transactions, goals } = useFinanceStore();
  const [currentMonth, setCurrentMonth] = useState(getCurrentMonth());

  const stats = useMemo(() => getMonthlyStats(transactions, currentMonth), [transactions, currentMonth]);
  const last6 = useMemo(() => getLast6MonthsStats(transactions), [transactions]);
  const prevMonth = useMemo(() => {
    const prev = format(subMonths(parseISO(currentMonth + '-01'), 1), 'yyyy-MM');
    return getMonthlyStats(transactions, prev);
  }, [transactions, currentMonth]);

  const incomeTrend = prevMonth.totalIncome > 0 ? ((stats.totalIncome - prevMonth.totalIncome) / prevMonth.totalIncome) * 100 : 0;
  const expenseTrend = prevMonth.totalExpenses > 0 ? ((stats.totalExpenses - prevMonth.totalExpenses) / prevMonth.totalExpenses) * 100 : 0;

  const categoryData = useMemo(() => getCategoryTotals(transactions, 'expense', currentMonth), [transactions, currentMonth]);

  const recentTxs = useMemo(() =>
    transactions
      .filter((t) => t.date.startsWith(currentMonth))
      .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())
      .slice(0, 8),
    [transactions, currentMonth]
  );

  const chartData = last6.map((s) => ({
    name: formatMonthLabel(s.month),
    Ingresos: s.totalIncome,
    Gastos: s.totalExpenses,
    Utilidad: s.netProfit,
  }));

  const goalsProgress = goals.filter((g) => g.status === 'active');

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-white text-2xl font-bold tracking-tight">Dashboard</h1>
          <p className="text-white/40 text-sm mt-0.5">Resumen financiero completo</p>
        </div>
        <div className="flex items-center gap-2 bg-[#1A1A1A] border border-white/5 rounded-xl px-4 py-2">
          <button onClick={() => setCurrentMonth(format(subMonths(parseISO(currentMonth + '-01'), 1), 'yyyy-MM'))}
            className="text-white/40 hover:text-white transition-colors">
            <ChevronLeft size={16} />
          </button>
          <span className="text-white text-sm font-medium min-w-[120px] text-center capitalize">
            {format(parseISO(currentMonth + '-01'), 'MMMM yyyy', { locale: es })}
          </span>
          <button onClick={() => setCurrentMonth(format(addMonths(parseISO(currentMonth + '-01'), 1), 'yyyy-MM'))}
            className="text-white/40 hover:text-white transition-colors">
            <ChevronRight size={16} />
          </button>
        </div>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard title="Ingresos del Mes" value={formatCurrency(stats.totalIncome)} subtitle={`vs ${formatCurrency(prevMonth.totalIncome)} mes anterior`} icon={<TrendingUp size={16} />} trend={incomeTrend} color="#10B981" />
        <StatCard title="Gastos del Mes" value={formatCurrency(stats.totalExpenses)} subtitle={`Fijos: ${formatCurrency(stats.fixedExpenses)}`} icon={<TrendingDown size={16} />} trend={-expenseTrend} color="#EF4444" />
        <StatCard title="Utilidad Neta" value={formatCurrency(stats.netProfit)} subtitle={stats.netProfit >= 0 ? 'Balance positivo ✓' : 'Balance negativo ⚠'} icon={<DollarSign size={16} />} color="#2563EB" />
        <StatCard title="Gasto Promedio/Día" value={formatCurrency(stats.avgDailyExpense)} subtitle={`Ahorro estimado: ${formatCurrency(stats.savings)}`} icon={<Activity size={16} />} color="#F59E0B" />
      </div>

      {/* Secondary Stats */}
      <div className="grid grid-cols-3 gap-4">
        <Card className="!p-4">
          <p className="text-white/40 text-xs uppercase tracking-wider mb-2">Gastos Fijos</p>
          <p className="text-white text-xl font-bold">{formatCurrency(stats.fixedExpenses)}</p>
          <div className="mt-2 h-1.5 bg-white/5 rounded-full overflow-hidden">
            <div className="h-full bg-purple-500 rounded-full" style={{ width: `${stats.totalExpenses ? (stats.fixedExpenses / stats.totalExpenses) * 100 : 0}%` }} />
          </div>
          <p className="text-white/30 text-xs mt-1">{stats.totalExpenses ? ((stats.fixedExpenses / stats.totalExpenses) * 100).toFixed(0) : 0}% del total</p>
        </Card>
        <Card className="!p-4">
          <p className="text-white/40 text-xs uppercase tracking-wider mb-2">Gastos Variables</p>
          <p className="text-white text-xl font-bold">{formatCurrency(stats.variableExpenses)}</p>
          <div className="mt-2 h-1.5 bg-white/5 rounded-full overflow-hidden">
            <div className="h-full bg-amber-500 rounded-full" style={{ width: `${stats.totalExpenses ? (stats.variableExpenses / stats.totalExpenses) * 100 : 0}%` }} />
          </div>
          <p className="text-white/30 text-xs mt-1">{stats.totalExpenses ? ((stats.variableExpenses / stats.totalExpenses) * 100).toFixed(0) : 0}% del total</p>
        </Card>
        <Card className="!p-4 bg-gradient-to-br from-blue-600/20 to-blue-900/20 border-blue-500/20">
          <p className="text-blue-300/60 text-xs uppercase tracking-wider mb-2">Dinero Disponible</p>
          <p className={`text-2xl font-bold ${stats.netProfit >= 0 ? 'text-emerald-400' : 'text-red-400'}`}>{formatCurrency(stats.netProfit)}</p>
          <p className="text-blue-300/40 text-xs mt-2">Ingresos − Todos los gastos</p>
        </Card>
      </div>

      {/* Charts Row */}
      <div className="grid grid-cols-5 gap-4">
        {/* Area Chart */}
        <Card className="col-span-3 !p-5">
          <h3 className="text-white font-semibold mb-4">Evolución 6 Meses</h3>
          <ResponsiveContainer width="100%" height={220}>
            <AreaChart data={chartData}>
              <defs>
                <linearGradient id="ig" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#10B981" stopOpacity={0.3} />
                  <stop offset="95%" stopColor="#10B981" stopOpacity={0} />
                </linearGradient>
                <linearGradient id="eg" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#EF4444" stopOpacity={0.3} />
                  <stop offset="95%" stopColor="#EF4444" stopOpacity={0} />
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke="#ffffff08" />
              <XAxis dataKey="name" tick={{ fill: '#ffffff40', fontSize: 11 }} axisLine={false} tickLine={false} />
              <YAxis tick={{ fill: '#ffffff40', fontSize: 11 }} axisLine={false} tickLine={false} tickFormatter={(v) => `$${v}`} />
              <Tooltip content={<CustomTooltip />} />
              <Area type="monotone" dataKey="Ingresos" stroke="#10B981" strokeWidth={2} fill="url(#ig)" />
              <Area type="monotone" dataKey="Gastos" stroke="#EF4444" strokeWidth={2} fill="url(#eg)" />
            </AreaChart>
          </ResponsiveContainer>
        </Card>

        {/* Pie Chart */}
        <Card className="col-span-2 !p-5">
          <h3 className="text-white font-semibold mb-4">Distribución de Gastos</h3>
          {categoryData.length > 0 ? (
            <>
              <ResponsiveContainer width="100%" height={160}>
                <PieChart>
                  <Pie data={categoryData} cx="50%" cy="50%" innerRadius={45} outerRadius={70} paddingAngle={3} dataKey="value">
                    {categoryData.map((entry, i) => (
                      <Cell key={i} fill={Object.values(CATEGORY_COLORS)[i % Object.keys(CATEGORY_COLORS).length]} />
                    ))}
                  </Pie>
                  <Tooltip formatter={(v) => formatCurrency(Number(v))} />
                </PieChart>
              </ResponsiveContainer>
              <div className="space-y-1.5 mt-2">
                {categoryData.slice(0, 4).map((d, i) => (
                  <div key={d.name} className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <div className="w-2 h-2 rounded-full" style={{ backgroundColor: Object.values(CATEGORY_COLORS)[i % Object.keys(CATEGORY_COLORS).length] }} />
                      <span className="text-white/60 text-xs">{d.name}</span>
                    </div>
                    <span className="text-white text-xs font-medium">{formatCurrency(d.value)}</span>
                  </div>
                ))}
              </div>
            </>
          ) : (
            <div className="h-40 flex items-center justify-center text-white/30 text-sm">Sin datos este mes</div>
          )}
        </Card>
      </div>

      {/* Bar Chart + Recent Transactions */}
      <div className="grid grid-cols-5 gap-4">
        <Card className="col-span-2 !p-5">
          <h3 className="text-white font-semibold mb-4">Utilidad Mensual</h3>
          <ResponsiveContainer width="100%" height={200}>
            <BarChart data={chartData} barSize={18}>
              <CartesianGrid strokeDasharray="3 3" stroke="#ffffff08" />
              <XAxis dataKey="name" tick={{ fill: '#ffffff40', fontSize: 10 }} axisLine={false} tickLine={false} />
              <YAxis tick={{ fill: '#ffffff40', fontSize: 10 }} axisLine={false} tickLine={false} tickFormatter={(v) => `$${v}`} />
              <Tooltip content={<CustomTooltip />} />
              <Bar dataKey="Utilidad" fill="#2563EB" radius={[4, 4, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </Card>

        {/* Recent Transactions */}
        <Card className="col-span-3 !p-5">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-white font-semibold">Transacciones Recientes</h3>
            <span className="text-white/30 text-xs">{recentTxs.length} este mes</span>
          </div>
          <div className="space-y-2">
            {recentTxs.length === 0 ? (
              <p className="text-white/30 text-sm text-center py-8">Sin transacciones este mes</p>
            ) : (
              recentTxs.map((tx) => (
                <div key={tx.id} className="flex items-center justify-between py-2 border-b border-white/5 last:border-0">
                  <div className="flex items-center gap-3">
                    <div className={`w-8 h-8 rounded-xl flex items-center justify-center ${tx.type === 'income' ? 'bg-emerald-500/15' : 'bg-red-500/15'}`}>
                      {tx.type === 'income' ? <ArrowUpRight size={14} className="text-emerald-400" /> : <ArrowDownRight size={14} className="text-red-400" />}
                    </div>
                    <div>
                      <p className="text-white text-sm font-medium">{tx.description}</p>
                      <p className="text-white/40 text-xs">{tx.bankAccount} · {tx.date}</p>
                    </div>
                  </div>
                  <span className={`font-semibold text-sm ${tx.type === 'income' ? 'text-emerald-400' : 'text-red-400'}`}>
                    {tx.type === 'income' ? '+' : '-'}{formatCurrency(tx.amount)}
                  </span>
                </div>
              ))
            )}
          </div>
        </Card>
      </div>

      {/* Goals Preview */}
      {goalsProgress.length > 0 && (
        <Card className="!p-5">
          <h3 className="text-white font-semibold mb-4">Metas de Ahorro</h3>
          <div className="grid grid-cols-3 gap-4">
            {goalsProgress.map((goal) => {
              const pct = Math.min(100, (goal.currentAmount / goal.targetAmount) * 100);
              return (
                <div key={goal.id} className="bg-white/3 rounded-xl p-4 border border-white/5">
                  <div className="flex items-center gap-2 mb-3">
                    <span className="text-2xl">{goal.icon}</span>
                    <div>
                      <p className="text-white text-sm font-medium">{goal.name}</p>
                      <p className="text-white/40 text-xs">{formatCurrency(goal.currentAmount)} / {formatCurrency(goal.targetAmount)}</p>
                    </div>
                  </div>
                  <div className="h-1.5 bg-white/5 rounded-full overflow-hidden">
                    <div className="h-full rounded-full transition-all duration-500" style={{ width: `${pct}%`, backgroundColor: goal.color }} />
                  </div>
                  <p className="text-white/40 text-xs mt-1.5 text-right">{pct.toFixed(0)}% completado</p>
                </div>
              );
            })}
          </div>
        </Card>
      )}
    </div>
  );
}
