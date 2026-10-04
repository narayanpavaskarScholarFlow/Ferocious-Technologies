'use client';
import React from 'react';
import { ChevronRight } from 'lucide-react';

interface ERPHeaderProps {
  breadcrumb: string[];
  title: string;
  description?: string;
  actions?: React.ReactNode;
}

export function ERPHeader({ breadcrumb, title, description, actions }: ERPHeaderProps) {
  return (
    <header className="flex flex-col lg:flex-row justify-between items-start lg:items-end gap-6 mb-8 px-2">
      <div className="flex flex-col gap-2">
        <div className="flex items-center gap-2 text-[9px] font-black text-slate-400 uppercase tracking-[0.3em]">
          {breadcrumb.map((item, idx) => (
            <React.Fragment key={item}>
              <span>{item}</span>
              {idx < breadcrumb.length - 1 && <ChevronRight className="h-2 w-2" />}
            </React.Fragment>
          ))}
        </div>
        <h2 className="text-4xl font-display font-bold tracking-tight text-[#001F3D] dark:text-white uppercase leading-none">{title}</h2>
        {description && <p className="text-xs text-muted-foreground font-medium uppercase tracking-widest mt-1">{description}</p>}
      </div>
      {actions && <div className="flex items-center gap-4">{actions}</div>}
    </header>
  );
}
