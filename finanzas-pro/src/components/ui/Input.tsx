'use client';
import { InputHTMLAttributes, SelectHTMLAttributes, TextareaHTMLAttributes } from 'react';

interface InputProps extends InputHTMLAttributes<HTMLInputElement> { label?: string; error?: string; }
interface SelectProps extends SelectHTMLAttributes<HTMLSelectElement> { label?: string; error?: string; children: React.ReactNode; }
interface TextareaProps extends TextareaHTMLAttributes<HTMLTextAreaElement> { label?: string; error?: string; }

const base = 'w-full bg-white/5 border border-white/10 rounded-xl px-3 py-2.5 text-white text-sm placeholder:text-white/30 focus:outline-none focus:border-blue-500/50 focus:bg-white/8 transition-all';

export function Input({ label, error, className = '', ...props }: InputProps) {
  return (
    <div className="flex flex-col gap-1.5">
      {label && <label className="text-white/60 text-xs font-medium uppercase tracking-wider">{label}</label>}
      <input className={`${base} ${className}`} {...props} />
      {error && <p className="text-red-400 text-xs">{error}</p>}
    </div>
  );
}

export function Select({ label, error, children, className = '', ...props }: SelectProps) {
  return (
    <div className="flex flex-col gap-1.5">
      {label && <label className="text-white/60 text-xs font-medium uppercase tracking-wider">{label}</label>}
      <select className={`${base} ${className}`} style={{ colorScheme: 'dark' }} {...props}>
        {children}
      </select>
      {error && <p className="text-red-400 text-xs">{error}</p>}
    </div>
  );
}

export function Textarea({ label, error, className = '', ...props }: TextareaProps) {
  return (
    <div className="flex flex-col gap-1.5">
      {label && <label className="text-white/60 text-xs font-medium uppercase tracking-wider">{label}</label>}
      <textarea className={`${base} resize-none ${className}`} {...props} />
      {error && <p className="text-red-400 text-xs">{error}</p>}
    </div>
  );
}
