import React from 'react';
import { cn } from '@/lib/utils';

interface GlassCardProps {
  children: React.ReactNode;
  className?: string;
}

export default function GlassCard({ children, className = '' }: GlassCardProps) {
  return (
    <div className={cn(
      'backdrop-blur-lg bg-white/80 border border-gray-200 rounded-xl shadow-lg',
      className
    )}>
      {children}
    </div>
  );
}
