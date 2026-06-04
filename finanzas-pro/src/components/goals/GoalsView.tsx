'use client';
import { useState } from 'react';
import { useFinanceStore } from '@/store/useFinanceStore';
import { SavingsGoal } from '@/types';
import { Card } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { Modal } from '@/components/ui/Modal';
import { Input, Select } from '@/components/ui/Input';
import { formatCurrency } from '@/lib/utils';
import { Plus, Trash2, Target, CheckCircle, PauseCircle } from 'lucide-react';

const ICONS = ['🎥', '✈️', '🛡️', '💰', '🏠', '🚗', '💻', '📱', '🎓', '💎', '🏋️', '🌍'];
const COLORS = ['#2563EB', '#10B981', '#F59E0B', '#EF4444', '#8B5CF6', '#EC4899', '#06B6D4', '#F97316'];

const EMPTY: Omit<SavingsGoal, 'id' | 'createdAt'> = {
  name: '', targetAmount: 0, currentAmount: 0, deadline: '', color: '#2563EB', icon: '🎯', status: 'active',
};

export function GoalsView() {
  const { goals, addGoal, updateGoal, deleteGoal } = useFinanceStore();
  const [open, setOpen] = useState(false);
  const [form, setForm] = useState<Omit<SavingsGoal, 'id' | 'createdAt'>>(EMPTY);

  function save() {
    if (!form.name || !form.targetAmount) return;
    addGoal(form);
    setForm(EMPTY);
    setOpen(false);
  }

  const active = goals.filter((g) => g.status === 'active');
  const completed = goals.filter((g) => g.status === 'completed');

  const totalTarget = active.reduce((s, g) => s + g.targetAmount, 0);
  const totalSaved = active.reduce((s, g) => s + g.currentAmount, 0);

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-white text-2xl font-bold">Metas de Ahorro</h1>
          <p className="text-white/40 text-sm">Define y monitorea tus objetivos financieros</p>
        </div>
        <Button icon={<Plus size={14} />} onClick={() => setOpen(true)}>Nueva Meta</Button>
      </div>

      <div className="grid grid-cols-3 gap-4">
        <Card className="!p-4">
          <p className="text-white/40 text-xs uppercase tracking-wider mb-1">Metas Activas</p>
          <p className="text-white text-2xl font-bold">{active.length}</p>
        </Card>
        <Card className="!p-4">
          <p className="text-white/40 text-xs uppercase tracking-wider mb-1">Total Objetivo</p>
          <p className="text-blue-400 text-2xl font-bold">{formatCurrency(totalTarget)}</p>
        </Card>
        <Card className="!p-4">
          <p className="text-white/40 text-xs uppercase tracking-wider mb-1">Total Ahorrado</p>
          <p className="text-emerald-400 text-2xl font-bold">{formatCurrency(totalSaved)}</p>
          <div className="mt-2 h-1.5 bg-white/5 rounded-full">
            <div className="h-full bg-emerald-500 rounded-full" style={{ width: `${totalTarget ? (totalSaved / totalTarget) * 100 : 0}%` }} />
          </div>
        </Card>
      </div>

      {active.length > 0 && (
        <div>
          <h2 className="text-white/60 text-sm font-medium mb-3 uppercase tracking-wider">Metas Activas</h2>
          <div className="grid grid-cols-3 gap-4">
            {active.map((goal) => {
              const pct = Math.min(100, (goal.currentAmount / goal.targetAmount) * 100);
              const remaining = goal.targetAmount - goal.currentAmount;
              return (
                <Card key={goal.id} className="!p-5 group hover:border-white/10 transition-all">
                  <div className="flex items-start justify-between mb-4">
                    <div className="flex items-center gap-3">
                      <span className="text-3xl">{goal.icon}</span>
                      <div>
                        <h3 className="text-white font-semibold">{goal.name}</h3>
                        {goal.deadline && <p className="text-white/30 text-xs">Meta: {goal.deadline}</p>}
                      </div>
                    </div>
                    <div className="flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                      <button onClick={() => updateGoal(goal.id, { status: 'completed' })} className="p-1.5 rounded-lg hover:bg-emerald-500/10 text-white/30 hover:text-emerald-400 transition-all"><CheckCircle size={13} /></button>
                      <button onClick={() => deleteGoal(goal.id)} className="p-1.5 rounded-lg hover:bg-red-500/10 text-white/30 hover:text-red-400 transition-all"><Trash2 size={13} /></button>
                    </div>
                  </div>

                  <div className="mb-3">
                    <div className="flex justify-between text-sm mb-2">
                      <span className="text-white font-bold">{formatCurrency(goal.currentAmount)}</span>
                      <span className="text-white/40">{formatCurrency(goal.targetAmount)}</span>
                    </div>
                    <div className="h-2 bg-white/5 rounded-full overflow-hidden">
                      <div className="h-full rounded-full transition-all duration-700" style={{ width: `${pct}%`, backgroundColor: goal.color }} />
                    </div>
                    <div className="flex justify-between mt-1.5">
                      <span className="text-white/40 text-xs">{pct.toFixed(0)}% completado</span>
                      <span className="text-white/40 text-xs">Faltan {formatCurrency(remaining)}</span>
                    </div>
                  </div>

                  <div className="flex gap-2">
                    <input
                      type="number"
                      placeholder="Agregar aporte..."
                      className="flex-1 bg-white/5 border border-white/10 rounded-lg px-3 py-1.5 text-white text-xs placeholder:text-white/25 focus:outline-none focus:border-blue-500/40"
                      onKeyDown={(e) => {
                        if (e.key === 'Enter') {
                          const val = parseFloat((e.target as HTMLInputElement).value);
                          if (val > 0) { updateGoal(goal.id, { currentAmount: Math.min(goal.targetAmount, goal.currentAmount + val) }); (e.target as HTMLInputElement).value = ''; }
                        }
                      }}
                    />
                    <span className="text-white/20 text-xs self-center">↵</span>
                  </div>
                </Card>
              );
            })}
          </div>
        </div>
      )}

      {completed.length > 0 && (
        <div>
          <h2 className="text-white/40 text-sm font-medium mb-3 uppercase tracking-wider flex items-center gap-2">
            <CheckCircle size={14} className="text-emerald-400" /> Metas Completadas
          </h2>
          <div className="grid grid-cols-3 gap-4">
            {completed.map((goal) => (
              <Card key={goal.id} className="!p-5 opacity-60">
                <div className="flex items-center gap-3">
                  <span className="text-2xl">{goal.icon}</span>
                  <div>
                    <h3 className="text-white font-medium line-through">{goal.name}</h3>
                    <p className="text-emerald-400 text-xs">✓ {formatCurrency(goal.targetAmount)} alcanzado</p>
                  </div>
                </div>
              </Card>
            ))}
          </div>
        </div>
      )}

      {goals.length === 0 && (
        <Card className="!p-16 text-center">
          <Target size={40} className="text-white/10 mx-auto mb-4" />
          <p className="text-white/40 text-sm">No tienes metas creadas aún</p>
          <p className="text-white/20 text-xs mt-1">Crea tu primera meta de ahorro para comenzar</p>
        </Card>
      )}

      <Modal open={open} onClose={() => setOpen(false)} title="Nueva Meta de Ahorro">
        <div className="space-y-4">
          <Input label="Nombre de la Meta" placeholder="Ej: Equipo audiovisual, Vacaciones..." value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} />
          <div className="grid grid-cols-2 gap-3">
            <Input label="Monto Objetivo (USD)" type="number" min="0" value={form.targetAmount || ''} onChange={(e) => setForm({ ...form, targetAmount: parseFloat(e.target.value) || 0 })} />
            <Input label="Ahorrado Hasta Ahora" type="number" min="0" value={form.currentAmount || ''} onChange={(e) => setForm({ ...form, currentAmount: parseFloat(e.target.value) || 0 })} />
          </div>
          <Input label="Fecha Límite (opcional)" type="date" value={form.deadline} onChange={(e) => setForm({ ...form, deadline: e.target.value })} />
          <div>
            <label className="text-white/60 text-xs font-medium uppercase tracking-wider block mb-2">Icono</label>
            <div className="flex flex-wrap gap-2">
              {ICONS.map((icon) => (
                <button key={icon} onClick={() => setForm({ ...form, icon })} className={`w-9 h-9 rounded-xl text-lg flex items-center justify-center border transition-all ${form.icon === icon ? 'border-blue-500 bg-blue-500/20' : 'border-white/10 bg-white/5 hover:bg-white/10'}`}>
                  {icon}
                </button>
              ))}
            </div>
          </div>
          <div>
            <label className="text-white/60 text-xs font-medium uppercase tracking-wider block mb-2">Color</label>
            <div className="flex gap-2">
              {COLORS.map((color) => (
                <button key={color} onClick={() => setForm({ ...form, color })} className={`w-7 h-7 rounded-full border-2 transition-all ${form.color === color ? 'border-white scale-110' : 'border-transparent hover:scale-105'}`} style={{ backgroundColor: color }} />
              ))}
            </div>
          </div>
          <div className="flex gap-3 pt-2">
            <Button variant="secondary" className="flex-1" onClick={() => setOpen(false)}>Cancelar</Button>
            <Button className="flex-1" onClick={save}>Crear Meta</Button>
          </div>
        </div>
      </Modal>
    </div>
  );
}
