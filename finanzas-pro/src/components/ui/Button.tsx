'use client';
import { ReactNode, ButtonHTMLAttributes } from 'react';

interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  children: ReactNode;
  variant?: 'primary' | 'secondary' | 'ghost' | 'danger';
  size?: 'sm' | 'md' | 'lg';
  icon?: ReactNode;
}

export function Button({ children, variant = 'primary', size = 'md', icon, className = '', ...props }: ButtonProps) {
  const variants = {
    primary: 'bg-blue-600 hover:bg-blue-500 text-white border-transparent shadow-lg shadow-blue-500/20',
    secondary: 'bg-white/5 hover:bg-white/10 text-white border-white/10',
    ghost: 'bg-transparent hover:bg-white/5 text-white/70 hover:text-white border-transparent',
    danger: 'bg-red-500/10 hover:bg-red-500/20 text-red-400 border-red-500/20',
  };
  const sizes = {
    sm: 'px-3 py-1.5 text-xs',
    md: 'px-4 py-2 text-sm',
    lg: 'px-6 py-3 text-base',
  };
  return (
    <button
      className={`inline-flex items-center gap-2 rounded-xl border font-medium transition-all duration-150 disabled:opacity-50 disabled:cursor-not-allowed ${variants[variant]} ${sizes[size]} ${className}`}
      {...props}
    >
      {icon && <span className="shrink-0">{icon}</span>}
      {children}
    </button>
  );
}
