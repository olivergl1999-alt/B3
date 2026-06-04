'use client';
import { useState } from 'react';
import { useFinanceStore } from '@/store/useFinanceStore';
import { Card } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { formatCurrency } from '@/lib/utils';
import { Upload, Download, Trash2, Database, Bell, Shield } from 'lucide-react';
import * as XLSX from 'xlsx';
import { format } from 'date-fns';

export function SettingsView() {
  const { settings, updateSettings, transactions, importTransactions, customCategories, addCustomCategory, deleteCustomCategory } = useFinanceStore();
  const [newCat, setNewCat] = useState({ name: '', type: 'expense' as 'income' | 'expense', color: '#2563EB', icon: '📁' });

  function handleExportExcel() {
    const data = transactions.map((t) => ({
      Fecha: t.date,
      Descripción: t.description,
      Tipo: t.type === 'income' ? 'Ingreso' : 'Gasto',
      Categoría: t.category,
      Banco: t.bankAccount,
      Monto: t.amount,
      Estado: t.status === 'completed' ? 'Completado' : 'Pendiente',
    }));
    const ws = XLSX.utils.json_to_sheet(data);
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, 'Transacciones');
    XLSX.writeFile(wb, `finanzas-pro-${format(new Date(), 'yyyy-MM-dd')}.xlsx`);
  }

  function handleImportExcel(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (ev) => {
      const wb = XLSX.read(ev.target?.result, { type: 'binary' });
      const ws = wb.Sheets[wb.SheetNames[0]];
      const data = XLSX.utils.sheet_to_json(ws) as any[];
      const txs = data.filter((r) => r.Descripción && r.Monto).map((r) => ({
        type: r.Tipo === 'Ingreso' ? 'income' as const : 'expense' as const,
        description: r.Descripción || '',
        date: r.Fecha || format(new Date(), 'yyyy-MM-dd'),
        amount: parseFloat(r.Monto) || 0,
        category: r.Categoría || 'custom',
        bankAccount: r.Banco || 'Efectivo',
        status: 'completed' as const,
      }));
      if (txs.length > 0) { importTransactions(txs); alert(`${txs.length} transacciones importadas.`); }
    };
    reader.readAsBinaryString(file);
  }

  return (
    <div className="space-y-6 max-w-2xl">
      <div>
        <h1 className="text-white text-2xl font-bold">Configuración</h1>
        <p className="text-white/40 text-sm">Personaliza tu experiencia</p>
      </div>

      {/* Data management */}
      <Card className="!p-5 space-y-4">
        <div className="flex items-center gap-2 mb-2">
          <Database size={16} className="text-blue-400" />
          <h3 className="text-white font-semibold">Datos e Importación</h3>
        </div>
        <div className="grid grid-cols-3 gap-3">
          <div className="bg-white/3 rounded-xl p-3 text-center border border-white/5">
            <p className="text-white text-xl font-bold">{transactions.length}</p>
            <p className="text-white/40 text-xs mt-0.5">Transacciones</p>
          </div>
          <div className="bg-white/3 rounded-xl p-3 text-center border border-white/5">
            <p className="text-emerald-400 text-xl font-bold">{formatCurrency(transactions.filter((t) => t.type === 'income').reduce((s, t) => s + t.amount, 0))}</p>
            <p className="text-white/40 text-xs mt-0.5">Total Ingresos</p>
          </div>
          <div className="bg-white/3 rounded-xl p-3 text-center border border-white/5">
            <p className="text-red-400 text-xl font-bold">{formatCurrency(transactions.filter((t) => t.type === 'expense').reduce((s, t) => s + t.amount, 0))}</p>
            <p className="text-white/40 text-xs mt-0.5">Total Gastos</p>
          </div>
        </div>
        <div className="flex gap-3 pt-2">
          <Button variant="secondary" icon={<Download size={14} />} onClick={handleExportExcel}>Exportar Excel</Button>
          <label className="inline-flex items-center gap-2 px-4 py-2 text-sm rounded-xl border bg-white/5 hover:bg-white/10 text-white border-white/10 cursor-pointer font-medium transition-all">
            <Upload size={14} />
            Importar Excel
            <input type="file" accept=".xlsx,.xls,.csv" className="hidden" onChange={handleImportExcel} />
          </label>
        </div>
      </Card>

      {/* Custom Categories */}
      <Card className="!p-5 space-y-4">
        <h3 className="text-white font-semibold">Categorías Personalizadas</h3>
        <div className="grid grid-cols-3 gap-2">
          <Input placeholder="Nombre categoría" value={newCat.name} onChange={(e) => setNewCat({ ...newCat, name: e.target.value })} />
          <select className="bg-white/5 border border-white/10 rounded-xl px-3 py-2.5 text-white text-sm focus:outline-none" style={{ colorScheme: 'dark' }} value={newCat.type} onChange={(e) => setNewCat({ ...newCat, type: e.target.value as any })}>
            <option value="expense">Gasto</option>
            <option value="income">Ingreso</option>
          </select>
          <Button onClick={() => { if (newCat.name) { addCustomCategory(newCat); setNewCat({ ...newCat, name: '' }); } }}>Agregar</Button>
        </div>
        <div className="space-y-2">
          {customCategories.length === 0 ? (
            <p className="text-white/30 text-sm text-center py-4">Sin categorías personalizadas</p>
          ) : customCategories.map((c) => (
            <div key={c.id} className="flex items-center justify-between py-2 border-b border-white/5">
              <span className="text-white text-sm">{c.name}</span>
              <div className="flex items-center gap-3">
                <span className="text-white/40 text-xs">{c.type === 'income' ? 'Ingreso' : 'Gasto'}</span>
                <button onClick={() => deleteCustomCategory(c.id)} className="p-1.5 rounded-lg hover:bg-red-500/10 text-white/30 hover:text-red-400 transition-all"><Trash2 size={12} /></button>
              </div>
            </div>
          ))}
        </div>
      </Card>

      {/* Notifications */}
      <Card className="!p-5">
        <div className="flex items-center gap-2 mb-4">
          <Bell size={16} className="text-blue-400" />
          <h3 className="text-white font-semibold">Preferencias</h3>
        </div>
        <div className="space-y-3">
          {[
            { key: 'notifications', label: 'Notificaciones inteligentes', desc: 'Alertas de gastos y recordatorios de pago' },
          ].map(({ key, label, desc }) => (
            <div key={key} className="flex items-center justify-between py-2">
              <div>
                <p className="text-white text-sm">{label}</p>
                <p className="text-white/40 text-xs">{desc}</p>
              </div>
              <button
                onClick={() => updateSettings({ [key]: !settings[key as keyof typeof settings] })}
                className={`w-10 h-5 rounded-full transition-all relative ${settings[key as keyof typeof settings] ? 'bg-blue-600' : 'bg-white/10'}`}
              >
                <div className={`w-3.5 h-3.5 bg-white rounded-full absolute top-0.75 transition-all ${settings[key as keyof typeof settings] ? 'left-5.5' : 'left-0.75'}`} style={{ top: '3px', left: settings[key as keyof typeof settings] ? '22px' : '3px' }} />
              </button>
            </div>
          ))}
        </div>
      </Card>

      <Card className="!p-5 border-white/5">
        <div className="flex items-center gap-2 mb-2">
          <Shield size={16} className="text-blue-400" />
          <h3 className="text-white font-semibold">FinanzasPro</h3>
        </div>
        <p className="text-white/30 text-xs">Versión 1.0.0 · Control financiero personal y empresarial</p>
        <p className="text-white/20 text-xs mt-1">Datos almacenados localmente en tu navegador</p>
      </Card>
    </div>
  );
}
