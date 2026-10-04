'use client';
import React from 'react';
import { Table, TableHeader, TableRow, TableHead, TableBody } from '@/components/ui/table';
import { cn } from '@/lib/utils';

interface ERPTableProps {
  headers: string[];
  children: React.ReactNode;
  className?: string;
}

export function ERPTable({ headers, children, className }: ERPTableProps) {
  return (
    <div className={cn("overflow-hidden border border-slate-200 dark:border-border rounded-3xl bg-white dark:bg-card shadow-sm", className)}>
      <Table>
        <TableHeader className="bg-slate-50/80 dark:bg-slate-900/50">
          <TableRow className="hover:bg-transparent">
            {headers.map(h => (
              <TableHead key={h} className="py-5 font-black text-[9px] uppercase tracking-widest text-slate-400">
                {h}
              </TableHead>
            ))}
          </TableRow>
        </TableHeader>
        <TableBody>
          {children}
        </TableBody>
      </Table>
    </div>
  );
}
