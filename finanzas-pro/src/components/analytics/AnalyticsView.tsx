'use client';
import { useMemo } from 'react';
import { useFinanceStore } from '@/store/useFinanceStore';
import { getLast6MonthsStats, getCategoryTotals, formatCurrency, formatMonthLabel, CATEGORY_COLORS, CATEGORY_LABELS } from '@/lib/utils';
import { Card } from '@/components/ui/Card';
import {
  LineChart, Line, AreaChart, Area, RadarChart, Radar, PolarGrid, PolarAngleAxis,
  XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend, BarChart, Bar, Cell
} from 'recharts';

const Tip = ({ active, payload, label }: any) => {
  if (!active || !payload?.length) return null;
  return (
    <div className="bg-[#1E1E1E] border border-white/10 rounded-xl p-3 text-xs shadow-xl">
      <p className="text-white/60 mb-2">{label}</p>
      {payload.map((p: any) => (
        <p key={p.name} style={{ color: p.color }} className="font-medium">{p.name}: {formatCurrency(p.value)}</p>
      ))}
    </div>
  );
};

export function AnalyticsView() {
  const { transactions } = useFinanceStore();
  const last6 = useMemo(() => getLast6MonthsStats(transactions), [transactions]);
  const catExpenses = useMemo(() => getCategoryTotals(transactions, 'expense'), [transactions]);

  const totalIncome = last6.reduce((s, m) => s + m.totalIncome, 0);
  const totalExpenses = last6.reduce((s, m) => s + m.totalExpenses, 0);
  const netProfit = totalIncome - totalExpenses;
  const rentability = totalIncome > 0 ? ((netProfit / totalIncome) * 100) : 0;

  const projectionData = useMemo(() => {
    const avgIncome = totalIncome / 6;
    const avgExpenses = totalExpenses / 6;
    return Array.from({ length: 6 }, (_, i) => ({
      name: `+${i + 1}m`,
      'Ingreso Proyectado': Math.round(avgIncome * (1 + i * 0.02)),
      'Gasto Proyectado': Math.round(avgExpenses * (1 + i * 0.01)),
    }));
  }, [totalIncome, totalExpenses]);

  const radarData = catExpenses.slice(0, 6).map((c) => ({
    subject: c.name.slice(0, 8),
    value: c.value,
  }));

  const barColors = ['#2563EB', '#10B981', '#F59E0B', '#EF4444', '#8B5CF6', '#EC4899'];

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-white text-2xl font-bold">Analíticas Avanzadas</h1>
        <p className="text-white/40 text-sm">Indicadores de rendimiento financiero</p>
      </div>

      {/* KPIs */}
      <div className="grid grid-cols-4 gap-4">
        {[
          { label: 'Balance General', value: formatCurrency(netProfit), color: netProfit >= 0 ? '#10B981' : '#EF4444', sub: 'Últimos 6 meses' },
          { label: 'Rentabilidad', value: `${rentability.toFixed(1)}%`, color: '#2563EB', sub: 'Ingresos − Gastos / Ingresos' },
          { label: 'Ratio Ahorro', value: `${totalIncome > 0 ? ((Math.max(0, netProfit) / totalIncome) * 100).toFixed(1) : 0}%`, color: '#10B981', sub: 'Del total de ingresos' },
          { label: 'Gasto / Ingreso', value: `${totalIncome > 0 ? ((totalExpenses / totalIncome) * 100).toFixed(0) : 0}%`, color: '#F59E0B', sub: 'Eficiencia de gasto' },
        ].map((kpi) => (
          <Card key={kpi.label} className="!p-5">
            <p className="text-white/40 text-xs uppercase tracking-wider mb-2">{kpi.label}</p>
            <p className="text-2xl font-bold" style={{ color: kpi.color }}>{kpi.value}</p>
            <p className="text-white/30 text-xs mt-1">{kpi.sub}</p>
          </Card>
        ))}
      </div>

      {/* Charts */}
      <div className="grid grid-cols-2 gap-4">
        <Card className="!p-5">
          <h3 className="text-white font-semibold mb-4">Proyección Financiera (6 meses)</h3>
          <ResponsiveContainer width="100%" height={230}>
            <AreaChart data={projectionData}>
              <defs>
                <linearGradient id="pi" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#10B981" stopOpacity={0.3} />
                  <stop offset="95%" stopColor="#10B981" stopOpacity={0} />
                </linearGradient>
                <linearGradient id="pe" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#EF4444" stopOpacity={0.3} />
                  <stop offset="95%" stopColor="#EF4444" stopOpacity={0} />
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke="#ffffff08" />
              <XAxis dataKey="name" tick={{ fill: '#ffffff40', fontSize: 11 }} axisLine={false} tickLine={false} />
              <YAxis tick={{ fill: '#ffffff40', fontSize: 11 }} axisLine={false} tickLine={false} tickFormatter={(v) => `$${v}`} />
              <Tooltip content={<Tip />} />
              <Legend wrapperStyle={{ fontSize: 12, color: '#ffffff60' }} />
              <Area type="monotone" dataKey="Ingreso Proyectado" stroke="#10B981" strokeWidth={2} fill="url(#pi)" strokeDasharray="5 5" />
              <Area type="monotone" dataKey="Gasto Proyectado" stroke="#EF4444" strokeWidth={2} fill="url(#pe)" strokeDasharray="5 5" />
            </AreaChart>
          </ResponsiveContainer>
        </Card>

        <Card className="!p-5">
          <h3 className="text-white font-semibold mb-4">Distribución de Gastos</h3>
          <ResponsiveContainer width="100%" height={230}>
            <BarChart data={catExpenses.slice(0, 7)} layout="vertical" barSize={12}>
              <CartesianGrid strokeDasharray="3 3" stroke="#ffffff08" horizontal={false} />
              <XAxis type="number" tick={{ fill: '#ffffff40', fontSize: 10 }} axisLine={false} tickLine={false} tickFormatter={(v) => `$${v}`} />
              <YAxis type="category" dataKey="name" tick={{ fill: '#ffffff60', fontSize: 11 }} axisLine={false} tickLine={false} width={80} />
              <Tooltip content={<Tip />} />
              <Bar dataKey="value" radius={[0, 4, 4, 0]}>
                {catExpenses.slice(0, 7).map((_, i) => <Cell key={i} fill={barColors[i % barColors.length]} />)}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </Card>
      </div>

      <div className="grid grid-cols-3 gap-4">
        <Card className="!p-5 col-span-2">
          <h3 className="text-white font-semibold mb-4">Evolución Utilidad Mensual</h3>
          <ResponsiveContainer width="100%" height={200}>
            <LineChart data={last6.map((s) => ({ name: formatMonthLabel(s.month), Utilidad: s.netProfit, Ingresos: s.totalIncome, Gastos: s.totalExpenses }))}>
              <CartesianGrid strokeDasharray="3 3" stroke="#ffffff08" />
              <XAxis dataKey="name" tick={{ fill: '#ffffff40', fontSize: 11 }} axisLine={false} tickLine={false} />
              <YAxis tick={{ fill: '#ffffff40', fontSize: 11 }} axisLine={false} tickLine={false} tickFormatter={(v) => `$${v}`} />
              <Tooltip content={<Tip />} />
              <Legend wrapperStyle={{ fontSize: 12, color: '#ffffff60' }} />
              <Line type="monotone" dataKey="Ingresos" stroke="#10B981" strokeWidth={2} dot={false} />
              <Line type="monotone" dataKey="Gastos" stroke="#EF4444" strokeWidth={2} dot={false} />
              <Line type="monotone" dataKey="Utilidad" stroke="#2563EB" strokeWidth={2.5} dot={{ fill: '#2563EB', r: 4 }} />
            </LineChart>
          </ResponsiveContainer>
        </Card>

        <Card className="!p-5">
          <h3 className="text-white font-semibold mb-4">Radar de Gastos</h3>
          {radarData.length > 0 ? (
            <ResponsiveContainer width="100%" height={200}>
              <RadarChart data={radarData}>
                <PolarGrid stroke="#ffffff15" />
                <PolarAngleAxis dataKey="subject" tick={{ fill: '#ffffff50', fontSize: 10 }} />
                <Radar name="Gastos" dataKey="value" stroke="#2563EB" fill="#2563EB" fillOpacity={0.2} strokeWidth={2} />
                <Tooltip formatter={(v) => formatCurrency(Number(v))} />
              </RadarChart>
            </ResponsiveContainer>
          ) : <p className="text-white/30 text-sm text-center py-16">Sin datos</p>}
        </Card>
      </div>
    </div>
  );
}
