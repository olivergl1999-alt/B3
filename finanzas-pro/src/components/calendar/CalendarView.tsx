'use client';
import { useState, useMemo } from 'react';
import { useFinanceStore } from '@/store/useFinanceStore';
import { formatCurrency } from '@/lib/utils';
import { ChevronLeft, ChevronRight, ArrowUpRight, ArrowDownRight } from 'lucide-react';
import { format, startOfMonth, endOfMonth, eachDayOfInterval, getDay, parseISO, isSameDay, addMonths, subMonths } from 'date-fns';
import { es } from 'date-fns/locale';

export function CalendarView() {
  const { transactions } = useFinanceStore();
  const [currentDate, setCurrentDate] = useState(new Date());
  const [selected, setSelected] = useState<Date | null>(null);

  const monthStart = startOfMonth(currentDate);
  const monthEnd = endOfMonth(currentDate);
  const days = eachDayOfInterval({ start: monthStart, end: monthEnd });
  const startPad = getDay(monthStart);

  const txByDay = useMemo(() => {
    const map: Record<string, typeof transactions> = {};
    transactions.forEach((t) => {
      const key = t.date.slice(0, 10);
      if (!map[key]) map[key] = [];
      map[key].push(t);
    });
    return map;
  }, [transactions]);

  const selectedTxs = selected
    ? (txByDay[format(selected, 'yyyy-MM-dd')] || [])
    : [];

  const DAYS = ['Dom', 'Lun', 'Mar', 'Mié', 'Jue', 'Vie', 'Sáb'];

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-white text-2xl font-bold">Calendario Financiero</h1>
          <p className="text-white/40 text-sm">Visualiza pagos y cobros por fecha</p>
        </div>
        <div className="flex items-center gap-2 bg-[#1A1A1A] border border-white/5 rounded-xl px-4 py-2">
          <button onClick={() => setCurrentDate(subMonths(currentDate, 1))} className="text-white/40 hover:text-white transition-colors"><ChevronLeft size={16} /></button>
          <span className="text-white text-sm font-medium min-w-[140px] text-center capitalize">
            {format(currentDate, 'MMMM yyyy', { locale: es })}
          </span>
          <button onClick={() => setCurrentDate(addMonths(currentDate, 1))} className="text-white/40 hover:text-white transition-colors"><ChevronRight size={16} /></button>
        </div>
      </div>

      <div className="grid grid-cols-7 gap-2 bg-[#1A1A1A] border border-white/5 rounded-2xl p-4">
        {DAYS.map((d) => (
          <div key={d} className="text-white/30 text-xs font-medium text-center py-2 uppercase tracking-wider">{d}</div>
        ))}
        {Array.from({ length: startPad }).map((_, i) => <div key={`pad-${i}`} />)}
        {days.map((day) => {
          const key = format(day, 'yyyy-MM-dd');
          const dayTxs = txByDay[key] || [];
          const dayIncome = dayTxs.filter((t) => t.type === 'income').reduce((s, t) => s + t.amount, 0);
          const dayExpense = dayTxs.filter((t) => t.type === 'expense').reduce((s, t) => s + t.amount, 0);
          const isSelected = selected && isSameDay(day, selected);
          const isToday = isSameDay(day, new Date());
          return (
            <button
              key={key}
              onClick={() => setSelected(isSelected ? null : day)}
              className={`min-h-[70px] rounded-xl p-2 text-left transition-all border ${isSelected ? 'border-blue-500 bg-blue-500/10' : isToday ? 'border-blue-500/30 bg-blue-500/5' : 'border-transparent hover:border-white/10 hover:bg-white/3'}`}
            >
              <span className={`text-xs font-medium ${isToday ? 'text-blue-400' : 'text-white/50'}`}>{format(day, 'd')}</span>
              <div className="mt-1 space-y-0.5">
                {dayIncome > 0 && (
                  <div className="flex items-center gap-1">
                    <div className="w-1.5 h-1.5 rounded-full bg-emerald-400" />
                    <span className="text-emerald-400 text-[10px] truncate">${dayIncome}</span>
                  </div>
                )}
                {dayExpense > 0 && (
                  <div className="flex items-center gap-1">
                    <div className="w-1.5 h-1.5 rounded-full bg-red-400" />
                    <span className="text-red-400 text-[10px] truncate">${dayExpense}</span>
                  </div>
                )}
              </div>
            </button>
          );
        })}
      </div>

      {selected && (
        <div className="bg-[#1A1A1A] border border-white/5 rounded-2xl p-5">
          <h3 className="text-white font-semibold mb-4">
            {format(selected, "d 'de' MMMM, yyyy", { locale: es })}
            <span className="text-white/40 text-sm font-normal ml-2">({selectedTxs.length} transacciones)</span>
          </h3>
          {selectedTxs.length === 0 ? (
            <p className="text-white/30 text-sm">Sin transacciones este día</p>
          ) : (
            <div className="space-y-2">
              {selectedTxs.map((t) => (
                <div key={t.id} className="flex items-center justify-between py-2 border-b border-white/5 last:border-0">
                  <div className="flex items-center gap-3">
                    <div className={`w-7 h-7 rounded-lg flex items-center justify-center ${t.type === 'income' ? 'bg-emerald-500/15' : 'bg-red-500/15'}`}>
                      {t.type === 'income' ? <ArrowUpRight size={13} className="text-emerald-400" /> : <ArrowDownRight size={13} className="text-red-400" />}
                    </div>
                    <div>
                      <p className="text-white text-sm">{t.description}</p>
                      <p className="text-white/40 text-xs">{t.bankAccount}</p>
                    </div>
                  </div>
                  <span className={`font-semibold text-sm ${t.type === 'income' ? 'text-emerald-400' : 'text-red-400'}`}>
                    {t.type === 'income' ? '+' : '-'}{formatCurrency(t.amount)}
                  </span>
                </div>
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  );
}
