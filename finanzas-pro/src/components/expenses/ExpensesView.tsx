'use client';
import { useState, useMemo } from 'react';
import { useFinanceStore } from '@/store/useFinanceStore';
import { Transaction } from '@/types';
import { Card } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { Modal } from '@/components/ui/Modal';
import { Input, Select } from '@/components/ui/Input';
import { Badge } from '@/components/ui/Badge';
import { formatCurrency, CATEGORY_LABELS, CATEGORY_COLORS, FIXED_CATEGORIES } from '@/lib/utils';
import { Plus, Pencil, Trash2, ArrowDownRight, Lock, Unlock } from 'lucide-react';
import { format } from 'date-fns';

const FIXED_CATS = [
  { value: 'internet', label: 'Internet' }, { value: 'servicios', label: 'Servicios' },
  { value: 'suscripciones', label: 'Suscripciones' }, { value: 'transporte', label: 'Transporte' },
  { value: 'nomina', label: 'Nómina' }, { value: 'alquiler', label: 'Alquiler' },
];
const VARIABLE_CATS = [
  { value: 'alimentacion', label: 'Alimentación' }, { value: 'compras', label: 'Compras' },
  { value: 'entretenimiento', label: 'Entretenimiento' }, { value: 'combustible', label: 'Combustible' },
  { value: 'imprevistos', label: 'Imprevistos' },
];
const BANKS = ['Pichincha', 'Produbanco', 'Guayaquil', 'Bolivariano', 'Efectivo'];
const ALL_CATS = [...FIXED_CATS, ...VARIABLE_CATS];

const EMPTY: Omit<Transaction, 'id' | 'createdAt'> = {
  type: 'expense', description: '', date: format(new Date(), 'yyyy-MM-dd'),
  amount: 0, category: 'alimentacion', bankAccount: 'Pichincha', status: 'completed', isFixed: false, notes: '',
};

export function ExpensesView() {
  const { transactions, addTransaction, updateTransaction, deleteTransaction } = useFinanceStore();
  const [open, setOpen] = useState(false);
  const [editing, setEditing] = useState<Transaction | null>(null);
  const [form, setForm] = useState<Omit<Transaction, 'id' | 'createdAt'>>(EMPTY);
  const [tab, setTab] = useState<'all' | 'fixed' | 'variable'>('all');

  const expenses = useMemo(() =>
    transactions.filter((t) => t.type === 'expense').sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime()),
    [transactions]
  );

  const filtered = useMemo(() => {
    if (tab === 'fixed') return expenses.filter((t) => FIXED_CATEGORIES.includes(t.category) || t.isFixed);
    if (tab === 'variable') return expenses.filter((t) => !FIXED_CATEGORIES.includes(t.category) && !t.isFixed);
    return expenses;
  }, [expenses, tab]);

  const totalFixed = expenses.filter((t) => FIXED_CATEGORIES.includes(t.category) || t.isFixed).reduce((s, t) => s + t.amount, 0);
  const totalVariable = expenses.filter((t) => !FIXED_CATEGORIES.includes(t.category) && !t.isFixed).reduce((s, t) => s + t.amount, 0);
  const total = expenses.reduce((s, t) => s + t.amount, 0);

  function openNew() { setEditing(null); setForm(EMPTY); setOpen(true); }
  function openEdit(t: Transaction) {
    setEditing(t);
    setForm({ type: t.type, description: t.description, date: t.date, amount: t.amount, category: t.category, bankAccount: t.bankAccount, status: t.status, isFixed: t.isFixed, notes: t.notes });
    setOpen(true);
  }
  function save() {
    if (!form.description || !form.amount) return;
    const isFixed = FIXED_CATEGORIES.includes(form.category);
    if (editing) updateTransaction(editing.id, { ...form, isFixed });
    else addTransaction({ ...form, isFixed });
    setOpen(false);
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-white text-2xl font-bold">Gastos</h1>
          <p className="text-white/40 text-sm">Clasifica y controla todos tus gastos</p>
        </div>
        <Button icon={<Plus size={14} />} onClick={openNew}>Nuevo Gasto</Button>
      </div>

      <div className="grid grid-cols-3 gap-4">
        <Card className="!p-4">
          <p className="text-white/40 text-xs uppercase tracking-wider mb-1">Total Gastos</p>
          <p className="text-red-400 text-2xl font-bold">{formatCurrency(total)}</p>
        </Card>
        <Card className="!p-4 border-purple-500/20">
          <div className="flex items-center gap-2 mb-1">
            <Lock size={11} className="text-purple-400" />
            <p className="text-white/40 text-xs uppercase tracking-wider">Gastos Fijos</p>
          </div>
          <p className="text-purple-400 text-2xl font-bold">{formatCurrency(totalFixed)}</p>
          <p className="text-white/30 text-xs mt-1">{expenses.length ? ((totalFixed / total) * 100).toFixed(0) : 0}% del total</p>
        </Card>
        <Card className="!p-4 border-amber-500/20">
          <div className="flex items-center gap-2 mb-1">
            <Unlock size={11} className="text-amber-400" />
            <p className="text-white/40 text-xs uppercase tracking-wider">Gastos Variables</p>
          </div>
          <p className="text-amber-400 text-2xl font-bold">{formatCurrency(totalVariable)}</p>
          <p className="text-white/30 text-xs mt-1">{expenses.length ? ((totalVariable / total) * 100).toFixed(0) : 0}% del total</p>
        </Card>
      </div>

      <Card className="!p-0 overflow-hidden">
        <div className="flex items-center justify-between p-4 border-b border-white/5">
          <div className="flex gap-2">
            {(['all', 'fixed', 'variable'] as const).map((t) => (
              <button key={t} onClick={() => setTab(t)} className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-all ${tab === t ? 'bg-white/10 text-white' : 'text-white/40 hover:text-white'}`}>
                {t === 'all' ? 'Todos' : t === 'fixed' ? '🔒 Fijos' : '📊 Variables'}
              </button>
            ))}
          </div>
          <span className="text-white/30 text-xs">{filtered.length} registros</span>
        </div>
        <table className="w-full">
          <thead>
            <tr className="border-b border-white/5">
              {['Descripción', 'Fecha', 'Categoría', 'Banco', 'Tipo', 'Monto', ''].map((h) => (
                <th key={h} className="text-left text-white/30 text-xs uppercase tracking-wider px-4 py-3 font-medium">{h}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {filtered.length === 0 ? (
              <tr><td colSpan={7} className="text-center text-white/30 py-12 text-sm">Sin gastos registrados</td></tr>
            ) : filtered.map((t) => {
              const isFixed = FIXED_CATEGORIES.includes(t.category) || t.isFixed;
              const catColor = CATEGORY_COLORS[t.category] || '#94A3B8';
              return (
                <tr key={t.id} className="border-b border-white/3 hover:bg-white/3 transition-colors group">
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-3">
                      <div className="w-7 h-7 rounded-lg flex items-center justify-center" style={{ backgroundColor: catColor + '20' }}>
                        <ArrowDownRight size={12} style={{ color: catColor }} />
                      </div>
                      <span className="text-white text-sm">{t.description}</span>
                    </div>
                  </td>
                  <td className="px-4 py-3 text-white/50 text-sm">{t.date}</td>
                  <td className="px-4 py-3">
                    <span className="px-2 py-0.5 rounded-full text-xs font-medium border" style={{ color: catColor, borderColor: catColor + '30', backgroundColor: catColor + '10' }}>
                      {CATEGORY_LABELS[t.category] || t.category}
                    </span>
                  </td>
                  <td className="px-4 py-3 text-white/50 text-sm">{t.bankAccount}</td>
                  <td className="px-4 py-3">
                    <Badge variant={isFixed ? 'blue' : 'yellow'}>{isFixed ? '🔒 Fijo' : '📊 Variable'}</Badge>
                  </td>
                  <td className="px-4 py-3 text-red-400 font-semibold text-sm">-{formatCurrency(t.amount)}</td>
                  <td className="px-4 py-3">
                    <div className="flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                      <button onClick={() => openEdit(t)} className="p-1.5 rounded-lg hover:bg-white/10 text-white/40 hover:text-white transition-all"><Pencil size={12} /></button>
                      <button onClick={() => deleteTransaction(t.id)} className="p-1.5 rounded-lg hover:bg-red-500/10 text-white/40 hover:text-red-400 transition-all"><Trash2 size={12} /></button>
                    </div>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </Card>

      <Modal open={open} onClose={() => setOpen(false)} title={editing ? 'Editar Gasto' : 'Nuevo Gasto'}>
        <div className="space-y-4">
          <Input label="Descripción" placeholder="Ej: Luz eléctrica, Supermercado..." value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })} />
          <div className="grid grid-cols-2 gap-3">
            <Input label="Monto (USD)" type="number" min="0" step="0.01" placeholder="0.00" value={form.amount || ''} onChange={(e) => setForm({ ...form, amount: parseFloat(e.target.value) || 0 })} />
            <Input label="Fecha" type="date" value={form.date} onChange={(e) => setForm({ ...form, date: e.target.value })} />
          </div>
          <div className="grid grid-cols-2 gap-3">
            <Select label="Categoría" value={form.category} onChange={(e) => setForm({ ...form, category: e.target.value })}>
              <optgroup label="— Gastos Fijos —">
                {FIXED_CATS.map((c) => <option key={c.value} value={c.value}>{c.label}</option>)}
              </optgroup>
              <optgroup label="— Gastos Variables —">
                {VARIABLE_CATS.map((c) => <option key={c.value} value={c.value}>{c.label}</option>)}
              </optgroup>
            </Select>
            <Select label="Banco / Método" value={form.bankAccount} onChange={(e) => setForm({ ...form, bankAccount: e.target.value })}>
              {BANKS.map((b) => <option key={b} value={b}>{b}</option>)}
            </Select>
          </div>
          <Select label="Estado" value={form.status} onChange={(e) => setForm({ ...form, status: e.target.value as any })}>
            <option value="completed">Pagado</option>
            <option value="pending">Pendiente</option>
          </Select>
          <div className="flex gap-3 pt-2">
            <Button variant="secondary" className="flex-1" onClick={() => setOpen(false)}>Cancelar</Button>
            <Button className="flex-1" onClick={save}>{editing ? 'Guardar Cambios' : 'Registrar Gasto'}</Button>
          </div>
        </div>
      </Modal>
    </div>
  );
}
