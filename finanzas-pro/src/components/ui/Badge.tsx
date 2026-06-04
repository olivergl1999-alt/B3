'use client';
interface BadgeProps { children: React.ReactNode; variant?: 'green' | 'red' | 'blue' | 'yellow' | 'gray'; size?: 'sm' | 'xs'; }
export function Badge({ children, variant = 'gray', size = 'sm' }: BadgeProps) {
  const colors = {
    green: 'bg-emerald-500/15 text-emerald-400 border-emerald-500/20',
    red: 'bg-red-500/15 text-red-400 border-red-500/20',
    blue: 'bg-blue-500/15 text-blue-400 border-blue-500/20',
    yellow: 'bg-amber-500/15 text-amber-400 border-amber-500/20',
    gray: 'bg-white/5 text-white/50 border-white/10',
  };
  const sizes = { sm: 'px-2.5 py-0.5 text-xs', xs: 'px-2 py-0.5 text-[10px]' };
  return (
    <span className={`inline-flex items-center rounded-full border font-medium ${colors[variant]} ${sizes[size]}`}>
      {children}
    </span>
  );
}
