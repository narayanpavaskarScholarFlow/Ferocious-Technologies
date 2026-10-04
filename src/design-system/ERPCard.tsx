'use client';
import React from 'react';
import { Card } from '@/components/ui/card';
import { cn } from '@/lib/utils';

export function ERPCard({ children, className, padding = true }: { children: React.ReactNode; className?: string; padding?: boolean }) {
  return (
    <Card className={cn("bg-white dark:bg-card border-slate-200 dark:border-border shadow-xl rounded-[2.5rem] overflow-hidden", padding ? "p-8 md:p-10" : "p-0", className)}>
      {children}
    </Card>
  );
}
