'use client';
import { ReactNode } from 'react';

interface CardProps {
  children: ReactNode;
  className?: string;
  onClick?: () => void;
  hover?: boolean;
}

export function Card({ children, className = '', onClick, hover }: CardProps) {
  return (
    <div
      onClick={onClick}
      className={`bg-[#1A1A1A] border border-white/5 rounded-2xl p-6 shadow-xl ${hover ? 'cursor-pointer hover:border-blue-500/30 hover:shadow-blue-500/5 transition-all duration-200' : ''} ${className}`}
    >
      {children}
    </div>
  );
}

export function GlassCard({ children, className = '' }: { children: ReactNode; className?: string }) {
  return (
    <div className={`bg-white/5 backdrop-blur-sm border border-white/10 rounded-2xl p-6 ${className}`}>
      {children}
    </div>
  );
}
