'use client';
import React from 'react';

export function ERPSection({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div className="space-y-6">
      <div className="flex items-center gap-3 border-l-4 border-primary pl-4">
        <h3 className="text-xs font-black uppercase text-slate-500 tracking-widest">{title}</h3>
      </div>
      {children}
    </div>
  );
}
