'use client';
import React from 'react';

export function ERPFormLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-8 md:gap-12">
      {children}
    </div>
  );
}
