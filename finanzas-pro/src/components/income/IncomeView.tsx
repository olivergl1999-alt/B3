'use client';
import { useState, useMemo } from 'react';
import { useFinanceStore } from '@/store/useFinanceStore';
import { Transaction } from '@/types';
import { Card } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { Modal } from '@/components/ui/Modal';
import { Input, Select } from '@/components/ui/Input';
import { Badge } from '@/components/ui/Badge';
import { formatCurrency, CATEGORY_LABELS } from '@/lib/utils';
import { Plus, Pencil, Trash2, ArrowUpRight } from 'lucide-react';
import { format } from 'date-fns';

const INCOME_CATEGORIES = [
  { value: 'sueldo', label: 'Sueldo' }, { value: 'freelance', label: 'Freelance' },
  { value: 'negocio', label: 'Negocio' }, { value: 'inversion', label: 'Inversión' },
  { value: 'deuda_cobrada', label: 'Deuda Cobrada' }, { value: 'custom', label: 'Otro' },
];
const BANKS = ['Pichincha', 'Produbanco', 'Guayaquil', 'Bolivariano', 'Efectivo'];

const EMPTY: Omit<Transaction, 'id' | 'createdAt'> = {
  type: 'income', description: '', date: format(new Date(), 'yyyy-MM-dd'),
  amount: 0, category: 'sueldo', bankAccount: 'Pichincha', status: 'completed', notes: '',
};

export function IncomeView() {
  const { transactions, addTransaction, updateTransaction, deleteTransaction } = useFinanceStore();
  const [open, setOpen] = useState(false);
  const [editing, setEditing] = useState<Transaction | null>(null);
  const [form, setForm] = useState<Omit<Transaction, 'id' | 'createdAt'>>(EMPTY);
  const [filter, setFilter] = useState('all');

  const incomes = useMemo(() =>
    transactions.filter((t) => t.type === 'income').sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime()),
    [transactions]
  );

  const filtered = useMemo(() =>
    filter === 'all' ? incomes : incomes.filter((t) => t.status === filter),
    [incomes, filter]
  );

  const total = incomes.reduce((s, t) => s + (t.status === 'completed' ? t.amount : 0), 0);
  const pending = incomes.filter((t) => t.status === 'pending').reduce((s, t) => s + t.amount, 0);

  function openNew() { setEditing(null); setForm(EMPTY); setOpen(true); }
  function openEdit(t: Transaction) {
    setEditing(t);
    setForm({ type: t.type, description: t.description, date: t.date, amount: t.amount, category: t.category, bankAccount: t.bankAccount, status: t.status, notes: t.notes });
    setOpen(true);
  }
  function save() {
    if (!form.description || !form.amount) return;
    if (editing) updateTransaction(editing.id, form);
    else addTransaction(form);
    setOpen(false);
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-white text-2xl font-bold">Ingresos</h1>
          <p className="text-white/40 text-sm">Gestión de todos tus ingresos</p>
        </div>
        <Button icon={<Plus size={14} />} onClick={openNew}>Nuevo Ingreso</Button>
      </div>

      <div className="grid grid-cols-3 gap-4">
        <Card className="!p-4 bg-emerald-500/5 border-emerald-500/20">
          <p className="text-emerald-400/60 text-xs uppercase tracking-wider mb-1">Total Cobrado</p>
          <p className="text-emerald-400 text-2xl font-bold">{formatCurrency(total)}</p>
        </Card>
        <Card className="!p-4">
          <p className="text-white/40 text-xs uppercase tracking-wider mb-1">Pendiente</p>
          <p className="text-amber-400 text-2xl font-bold">{formatCurrency(pending)}</p>
        </Card>
        <Card className="!p-4">
          <p className="text-white/40 text-xs uppercase tracking-wider mb-1">Transacciones</p>
          <p className="text-white text-2xl font-bold">{incomes.length}</p>
        </Card>
      </div>

      <Card className="!p-0 overflow-hidden">
        <div className="flex items-center justify-between p-4 border-b border-white/5">
          <div className="flex gap-2">
            {['all', 'completed', 'pending'].map((f) => (
              <button key={f} onClick={() => setFilter(f)} className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-all ${filter === f ? 'bg-white/10 text-white' : 'text-white/40 hover:text-white'}`}>
                {f === 'all' ? 'Todos' : f === 'completed' ? 'Cobrados' : 'Pendientes'}
              </button>
            ))}
          </div>
          <span className="text-white/30 text-xs">{filtered.length} registros</span>
        </div>
        <table className="w-full">
          <thead>
            <tr className="border-b border-white/5">
              {['Descripción', 'Fecha', 'Categoría', 'Banco', 'Estado', 'Monto', ''].map((h) => (
                <th key={h} className="text-left text-white/30 text-xs uppercase tracking-wider px-4 py-3 font-medium">{h}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {filtered.length === 0 ? (
              <tr><td colSpan={7} className="text-center text-white/30 py-12 text-sm">Sin ingresos registrados</td></tr>
            ) : filtered.map((t) => (
              <tr key={t.id} className="border-b border-white/3 hover:bg-white/3 transition-colors group">
                <td className="px-4 py-3">
                  <div className="flex items-center gap-3">
                    <div className="w-7 h-7 rounded-lg bg-emerald-500/15 flex items-center justify-center">
                      <ArrowUpRight size={12} className="text-emerald-400" />
                    </div>
                    <span className="text-white text-sm">{t.description}</span>
                  </div>
                </td>
                <td className="px-4 py-3 text-white/50 text-sm">{t.date}</td>
                <td className="px-4 py-3"><Badge variant="blue">{CATEGORY_LABELS[t.category] || t.category}</Badge></td>
                <td className="px-4 py-3 text-white/50 text-sm">{t.bankAccount}</td>
                <td className="px-4 py-3"><Badge variant={t.status === 'completed' ? 'green' : 'yellow'}>{t.status === 'completed' ? 'Cobrado' : 'Pendiente'}</Badge></td>
                <td className="px-4 py-3 text-emerald-400 font-semibold text-sm">+{formatCurrency(t.amount)}</td>
                <td className="px-4 py-3">
                  <div className="flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                    <button onClick={() => openEdit(t)} className="p-1.5 rounded-lg hover:bg-white/10 text-white/40 hover:text-white transition-all"><Pencil size={12} /></button>
                    <button onClick={() => deleteTransaction(t.id)} className="p-1.5 rounded-lg hover:bg-red-500/10 text-white/40 hover:text-red-400 transition-all"><Trash2 size={12} /></button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </Card>

      <Modal open={open} onClose={() => setOpen(false)} title={editing ? 'Editar Ingreso' : 'Nuevo Ingreso'}>
        <div className="space-y-4">
          <Input label="Descripción / Cliente" placeholder="Ej: Sueldo mensual, Factura cliente..." value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })} />
          <div className="grid grid-cols-2 gap-3">
            <Input label="Monto (USD)" type="number" min="0" step="0.01" placeholder="0.00" value={form.amount || ''} onChange={(e) => setForm({ ...form, amount: parseFloat(e.target.value) || 0 })} />
            <Input label="Fecha" type="date" value={form.date} onChange={(e) => setForm({ ...form, date: e.target.value })} />
          </div>
          <div className="grid grid-cols-2 gap-3">
            <Select label="Categoría" value={form.category} onChange={(e) => setForm({ ...form, category: e.target.value })}>
              {INCOME_CATEGORIES.map((c) => <option key={c.value} value={c.value}>{c.label}</option>)}
            </Select>
            <Select label="Banco / Método" value={form.bankAccount} onChange={(e) => setForm({ ...form, bankAccount: e.target.value })}>
              {BANKS.map((b) => <option key={b} value={b}>{b}</option>)}
            </Select>
          </div>
          <Select label="Estado" value={form.status} onChange={(e) => setForm({ ...form, status: e.target.value as any })}>
            <option value="completed">Cobrado</option>
            <option value="pending">Pendiente</option>
          </Select>
          <div className="flex gap-3 pt-2">
            <Button variant="secondary" className="flex-1" onClick={() => setOpen(false)}>Cancelar</Button>
            <Button className="flex-1" onClick={save}>{editing ? 'Guardar Cambios' : 'Registrar Ingreso'}</Button>
          </div>
        </div>
      </Modal>
    </div>
  );
}
