'use client';
import { ReactNode } from 'react';
import { TrendingUp, TrendingDown } from 'lucide-react';

interface StatCardProps {
  title: string;
  value: string;
  subtitle?: string;
  icon: ReactNode;
  trend?: number;
  color?: string;
  bgColor?: string;
}

export function StatCard({ title, value, subtitle, icon, trend, color = '#2563EB', bgColor }: StatCardProps) {
  const trendPositive = trend !== undefined && trend >= 0;
  return (
    <div className="bg-[#1A1A1A] border border-white/5 rounded-2xl p-5 hover:border-white/10 transition-all duration-200 shadow-xl">
      <div className="flex items-start justify-between mb-4">
        <div
          className="w-10 h-10 rounded-xl flex items-center justify-center text-lg"
          style={{ backgroundColor: bgColor || color + '20', color }}
        >
          {icon}
        </div>
        {trend !== undefined && (
          <div className={`flex items-center gap-1 text-xs font-medium px-2 py-1 rounded-full ${trendPositive ? 'bg-emerald-500/10 text-emerald-400' : 'bg-red-500/10 text-red-400'}`}>
            {trendPositive ? <TrendingUp size={10} /> : <TrendingDown size={10} />}
            {Math.abs(trend).toFixed(1)}%
          </div>
        )}
      </div>
      <div>
        <p className="text-white/50 text-xs font-medium uppercase tracking-wider mb-1">{title}</p>
        <p className="text-white text-2xl font-bold tracking-tight">{value}</p>
        {subtitle && <p className="text-white/40 text-xs mt-1">{subtitle}</p>}
      </div>
    </div>
  );
}
