'use client';
import React from 'react';

export function ERPPage({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-screen bg-slate-50 dark:bg-background transition-colors duration-500">
      <div className="max-w-[1600px] mx-auto p-4 md:p-8 space-y-8 animate-in fade-in duration-700">
        {children}
      </div>
    </div>
  );
}
