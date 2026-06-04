'use client';
import { Sidebar } from '@/components/Sidebar';
import { useFinanceStore } from '@/store/useFinanceStore';
import { Dashboard } from '@/components/dashboard/Dashboard';
import { IncomeView } from '@/components/income/IncomeView';
import { ExpensesView } from '@/components/expenses/ExpensesView';
import { ReportsView } from '@/components/reports/ReportsView';
import { GoalsView } from '@/components/goals/GoalsView';
import { CalendarView } from '@/components/calendar/CalendarView';
import { AnalyticsView } from '@/components/analytics/AnalyticsView';
import { SettingsView } from '@/components/settings/SettingsView';

const VIEWS: Record<string, React.ComponentType> = {
  dashboard: Dashboard,
  income: IncomeView,
  expenses: ExpensesView,
  reports: ReportsView,
  goals: GoalsView,
  calendar: CalendarView,
  analytics: AnalyticsView,
  settings: SettingsView,
};

export default function App() {
  const { activeView, searchQuery } = useFinanceStore();
  const View = VIEWS[activeView] || Dashboard;

  return (
    <div className="flex h-full">
      <Sidebar />
      <main className="flex-1 ml-64 h-full overflow-y-auto bg-[#111111]">
        {searchQuery && (
          <div className="px-8 pt-6">
            <div className="bg-blue-500/10 border border-blue-500/20 rounded-xl px-4 py-3 text-blue-300 text-sm">
              🔍 Buscando: <strong>"{searchQuery}"</strong> — Usa los módulos para filtrar resultados
            </div>
          </div>
        )}
        <div className="px-8 py-8">
          <View />
        </div>
      </main>
    </div>
  );
}
