'use client';
import { useFinanceStore } from '@/store/useFinanceStore';
import {
  LayoutDashboard, TrendingUp, TrendingDown, BarChart3, Target, Calendar,
  LineChart, Settings, Zap, Search, Bell, ChevronRight
} from 'lucide-react';

const NAV = [
  { id: 'dashboard', label: 'Dashboard', icon: LayoutDashboard },
  { id: 'income', label: 'Ingresos', icon: TrendingUp },
  { id: 'expenses', label: 'Gastos', icon: TrendingDown },
  { id: 'reports', label: 'Reportes', icon: BarChart3 },
  { id: 'goals', label: 'Metas', icon: Target },
  { id: 'calendar', label: 'Calendario', icon: Calendar },
  { id: 'analytics', label: 'Analíticas', icon: LineChart },
];

export function Sidebar() {
  const { activeView, setActiveView, searchQuery, setSearchQuery } = useFinanceStore();

  return (
    <aside className="w-64 h-screen flex flex-col bg-[#111111] border-r border-white/5 fixed left-0 top-0 z-40">
      {/* Logo */}
      <div className="p-6 border-b border-white/5">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 rounded-xl bg-gradient-to-br from-blue-500 to-blue-700 flex items-center justify-center">
            <Zap size={16} className="text-white" />
          </div>
          <div>
            <h1 className="text-white font-bold text-sm tracking-tight">FinanzasPro</h1>
            <p className="text-white/30 text-[10px]">Control Financiero</p>
          </div>
        </div>
      </div>

      {/* Search */}
      <div className="px-4 pt-4">
        <div className="relative">
          <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-white/30" />
          <input
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Buscar..."
            className="w-full bg-white/5 border border-white/8 rounded-xl pl-9 pr-3 py-2 text-white text-xs placeholder:text-white/25 focus:outline-none focus:border-blue-500/40 transition-all"
          />
        </div>
      </div>

      {/* Navigation */}
      <nav className="flex-1 p-4 space-y-1 overflow-y-auto">
        <p className="text-white/25 text-[10px] font-semibold uppercase tracking-widest px-3 mb-3">Menú Principal</p>
        {NAV.map(({ id, label, icon: Icon }) => {
          const active = activeView === id;
          return (
            <button
              key={id}
              onClick={() => setActiveView(id)}
              className={`w-full flex items-center justify-between px-3 py-2.5 rounded-xl text-sm font-medium transition-all duration-150 group ${active ? 'bg-blue-600 text-white shadow-lg shadow-blue-500/20' : 'text-white/50 hover:text-white hover:bg-white/5'}`}
            >
              <div className="flex items-center gap-3">
                <Icon size={16} className={active ? 'text-white' : 'text-white/40 group-hover:text-white/70'} />
                {label}
              </div>
              {active && <ChevronRight size={12} className="text-white/60" />}
            </button>
          );
        })}
      </nav>

      {/* Bottom */}
      <div className="p-4 border-t border-white/5 space-y-1">
        <button
          onClick={() => setActiveView('settings')}
          className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-all text-white/50 hover:text-white hover:bg-white/5 ${activeView === 'settings' ? 'bg-white/10 text-white' : ''}`}
        >
          <Settings size={16} className="text-white/40" />
          Configuración
        </button>
        <div className="flex items-center gap-3 px-3 py-3">
          <div className="w-7 h-7 rounded-full bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center text-[10px] font-bold text-white">
            U
          </div>
          <div className="min-w-0">
            <p className="text-white text-xs font-medium truncate">Mi Cuenta</p>
            <p className="text-white/30 text-[10px] truncate">Pro Plan</p>
          </div>
          <Bell size={14} className="ml-auto text-white/30 hover:text-white/70 cursor-pointer shrink-0" />
        </div>
      </div>
    </aside>
  );
}
