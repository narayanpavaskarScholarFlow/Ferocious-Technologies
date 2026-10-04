'use client';
import React from 'react';

export function ERPActionBar({ children }: { children: React.ReactNode }) {
  return (
    <div className="sticky bottom-0 left-0 right-0 bg-white/80 dark:bg-card/80 backdrop-blur-md border-t border-slate-200 dark:border-border p-4 md:p-6 flex justify-end gap-4 z-40">
      {children}
    </div>
  );
}
