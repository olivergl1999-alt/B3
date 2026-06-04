'use client';
import { useMemo, useState } from 'react';
import { useFinanceStore } from '@/store/useFinanceStore';
import { getLast6MonthsStats, getCategoryTotals, formatCurrency, formatMonthLabel, CATEGORY_COLORS, CATEGORY_LABELS } from '@/lib/utils';
import { Card } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
  LineChart, Line, Legend, PieChart, Pie, Cell
} from 'recharts';
import { Download, FileText } from 'lucide-react';

const Tip = ({ active, payload, label }: any) => {
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

export function ReportsView() {
  const { transactions } = useFinanceStore();
  const [period, setPeriod] = useState<'monthly' | 'category' | 'flow'>('monthly');

  const last6 = useMemo(() => getLast6MonthsStats(transactions), [transactions]);
  const categoryExpenses = useMemo(() => getCategoryTotals(transactions, 'expense'), [transactions]);
  const categoryIncomes = useMemo(() => getCategoryTotals(transactions, 'income'), [transactions]);

  const monthlyChart = last6.map((s) => ({
    name: formatMonthLabel(s.month),
    Ingresos: s.totalIncome,
    Gastos: s.totalExpenses,
    Utilidad: s.netProfit,
    'Gasto Fijo': s.fixedExpenses,
    'Gasto Variable': s.variableExpenses,
  }));

  const flowData = last6.map((s, i) => ({
    name: formatMonthLabel(s.month),
    'Flujo Neto': s.netProfit,
    'Acumulado': last6.slice(0, i + 1).reduce((sum, m) => sum + m.netProfit, 0),
  }));

  const totalIncome = last6.reduce((s, m) => s + m.totalIncome, 0);
  const totalExpenses = last6.reduce((s, m) => s + m.totalExpenses, 0);
  const avgIncome = totalIncome / 6;
  const avgExpenses = totalExpenses / 6;

  function exportCSV() {
    const rows = [['Fecha', 'Descripción', 'Tipo', 'Categoría', 'Banco', 'Monto', 'Estado']];
    transactions.forEach((t) => {
      rows.push([t.date, t.description, t.type === 'income' ? 'Ingreso' : 'Gasto', CATEGORY_LABELS[t.category] || t.category, t.bankAccount, t.amount.toString(), t.status === 'completed' ? 'Completado' : 'Pendiente']);
    });
    const csv = rows.map((r) => r.join(',')).join('\n');
    const blob = new Blob([csv], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url; a.download = 'finanzas-pro.csv'; a.click();
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-white text-2xl font-bold">Reportes</h1>
          <p className="text-white/40 text-sm">Análisis detallado de tus finanzas</p>
        </div>
        <div className="flex gap-2">
          <Button variant="secondary" icon={<Download size={14} />} onClick={exportCSV}>Exportar CSV</Button>
          <Button variant="secondary" icon={<FileText size={14} />}>Exportar PDF</Button>
        </div>
      </div>

      {/* Summary */}
      <div className="grid grid-cols-4 gap-4">
        {[
          { label: 'Promedio Ingresos/Mes', value: formatCurrency(avgIncome), color: 'text-emerald-400' },
          { label: 'Promedio Gastos/Mes', value: formatCurrency(avgExpenses), color: 'text-red-400' },
          { label: 'Rentabilidad Promedio', value: `${totalIncome > 0 ? (((totalIncome - totalExpenses) / totalIncome) * 100).toFixed(1) : 0}%`, color: 'text-blue-400' },
          { label: 'Flujo Acumulado 6M', value: formatCurrency(totalIncome - totalExpenses), color: (totalIncome - totalExpenses) >= 0 ? 'text-emerald-400' : 'text-red-400' },
        ].map((s) => (
          <Card key={s.label} className="!p-4">
            <p className="text-white/40 text-xs uppercase tracking-wider mb-1">{s.label}</p>
            <p className={`text-xl font-bold ${s.color}`}>{s.value}</p>
          </Card>
        ))}
      </div>

      {/* Tab selector */}
      <div className="flex gap-2 bg-[#1A1A1A] border border-white/5 rounded-xl p-1.5 w-fit">
        {[['monthly', 'Mensual'], ['category', 'Por Categoría'], ['flow', 'Flujo de Caja']].map(([id, label]) => (
          <button key={id} onClick={() => setPeriod(id as any)} className={`px-4 py-2 rounded-lg text-sm font-medium transition-all ${period === id ? 'bg-blue-600 text-white shadow-lg shadow-blue-500/20' : 'text-white/40 hover:text-white'}`}>
            {label}
          </button>
        ))}
      </div>

      {period === 'monthly' && (
        <div className="grid grid-cols-2 gap-4">
          <Card className="!p-5">
            <h3 className="text-white font-semibold mb-4">Ingresos vs Gastos (6 meses)</h3>
            <ResponsiveContainer width="100%" height={250}>
              <BarChart data={monthlyChart} barSize={16} barGap={4}>
                <CartesianGrid strokeDasharray="3 3" stroke="#ffffff08" />
                <XAxis dataKey="name" tick={{ fill: '#ffffff40', fontSize: 11 }} axisLine={false} tickLine={false} />
                <YAxis tick={{ fill: '#ffffff40', fontSize: 11 }} axisLine={false} tickLine={false} tickFormatter={(v) => `$${v}`} />
                <Tooltip content={<Tip />} />
                <Legend wrapperStyle={{ fontSize: 12, color: '#ffffff60' }} />
                <Bar dataKey="Ingresos" fill="#10B981" radius={[4, 4, 0, 0]} />
                <Bar dataKey="Gastos" fill="#EF4444" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </Card>
          <Card className="!p-5">
            <h3 className="text-white font-semibold mb-4">Desglose de Gastos</h3>
            <ResponsiveContainer width="100%" height={250}>
              <BarChart data={monthlyChart} barSize={16} barGap={4}>
                <CartesianGrid strokeDasharray="3 3" stroke="#ffffff08" />
                <XAxis dataKey="name" tick={{ fill: '#ffffff40', fontSize: 11 }} axisLine={false} tickLine={false} />
                <YAxis tick={{ fill: '#ffffff40', fontSize: 11 }} axisLine={false} tickLine={false} tickFormatter={(v) => `$${v}`} />
                <Tooltip content={<Tip />} />
                <Legend wrapperStyle={{ fontSize: 12, color: '#ffffff60' }} />
                <Bar dataKey="Gasto Fijo" fill="#8B5CF6" radius={[4, 4, 0, 0]} stackId="a" />
                <Bar dataKey="Gasto Variable" fill="#F59E0B" radius={[4, 4, 0, 0]} stackId="a" />
              </BarChart>
            </ResponsiveContainer>
          </Card>
        </div>
      )}

      {period === 'category' && (
        <div className="grid grid-cols-2 gap-4">
          <Card className="!p-5">
            <h3 className="text-white font-semibold mb-4">Top Categorías de Gasto</h3>
            {categoryExpenses.length > 0 ? (
              <>
                <ResponsiveContainer width="100%" height={220}>
                  <PieChart>
                    <Pie data={categoryExpenses.slice(0, 8)} cx="50%" cy="50%" innerRadius={50} outerRadius={80} paddingAngle={3} dataKey="value">
                      {categoryExpenses.slice(0, 8).map((_, i) => (
                        <Cell key={i} fill={Object.values(CATEGORY_COLORS)[i % 14]} />
                      ))}
                    </Pie>
                    <Tooltip formatter={(v) => formatCurrency(Number(v))} />
                  </PieChart>
                </ResponsiveContainer>
                <div className="space-y-2 mt-2">
                  {categoryExpenses.slice(0, 6).map((d, i) => (
                    <div key={d.name} className="flex items-center gap-3">
                      <div className="w-2.5 h-2.5 rounded-full shrink-0" style={{ backgroundColor: Object.values(CATEGORY_COLORS)[i % 14] }} />
                      <div className="flex-1">
                        <div className="flex justify-between text-xs mb-1">
                          <span className="text-white/70">{d.name}</span>
                          <span className="text-white font-medium">{formatCurrency(d.value)}</span>
                        </div>
                        <div className="h-1 bg-white/5 rounded-full">
                          <div className="h-full rounded-full" style={{ width: `${(d.value / categoryExpenses[0].value) * 100}%`, backgroundColor: Object.values(CATEGORY_COLORS)[i % 14] }} />
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </>
            ) : <p className="text-white/30 text-sm text-center py-16">Sin datos</p>}
          </Card>
          <Card className="!p-5">
            <h3 className="text-white font-semibold mb-4">Fuentes de Ingreso</h3>
            {categoryIncomes.length > 0 ? (
              <div className="space-y-3">
                {categoryIncomes.map((d, i) => (
                  <div key={d.name} className="flex items-center gap-3">
                    <div className="w-2.5 h-2.5 rounded-full shrink-0" style={{ backgroundColor: Object.values(CATEGORY_COLORS)[i % 14] }} />
                    <div className="flex-1">
                      <div className="flex justify-between text-sm mb-1">
                        <span className="text-white/70">{d.name}</span>
                        <span className="text-emerald-400 font-medium">{formatCurrency(d.value)}</span>
                      </div>
                      <div className="h-1.5 bg-white/5 rounded-full">
                        <div className="h-full rounded-full bg-emerald-500" style={{ width: `${(d.value / categoryIncomes[0].value) * 100}%` }} />
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            ) : <p className="text-white/30 text-sm text-center py-16">Sin datos</p>}
          </Card>
        </div>
      )}

      {period === 'flow' && (
        <Card className="!p-5">
          <h3 className="text-white font-semibold mb-4">Flujo de Caja y Balance Acumulado</h3>
          <ResponsiveContainer width="100%" height={300}>
            <LineChart data={flowData}>
              <CartesianGrid strokeDasharray="3 3" stroke="#ffffff08" />
              <XAxis dataKey="name" tick={{ fill: '#ffffff40', fontSize: 11 }} axisLine={false} tickLine={false} />
              <YAxis tick={{ fill: '#ffffff40', fontSize: 11 }} axisLine={false} tickLine={false} tickFormatter={(v) => `$${v}`} />
              <Tooltip content={<Tip />} />
              <Legend wrapperStyle={{ fontSize: 12, color: '#ffffff60' }} />
              <Line type="monotone" dataKey="Flujo Neto" stroke="#2563EB" strokeWidth={2} dot={{ fill: '#2563EB', r: 4 }} />
              <Line type="monotone" dataKey="Acumulado" stroke="#10B981" strokeWidth={2} strokeDasharray="5 5" dot={{ fill: '#10B981', r: 4 }} />
            </LineChart>
          </ResponsiveContainer>
        </Card>
      )}
    </div>
  );
}
