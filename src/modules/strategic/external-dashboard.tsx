"use client";

import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Globe, ExternalLink, RefreshCw, ShieldCheck } from 'lucide-react';
import { useState } from 'react';

export function ExternalDashboard({ url, title = 'External Node Hub' }: { url: string; title?: string }) {
  const [isLoading, setIsLoading] = useState(true);

  return (
    <div className="h-full flex flex-col gap-6 animate-in fade-in duration-1000 overflow-hidden px-2">
      <header className="flex flex-col lg:flex-row justify-between items-start lg:items-end gap-4 shrink-0">
        <div className="flex flex-col gap-1">
          <div className="flex items-center gap-3 text-primary font-bold text-[9px] uppercase tracking-[0.3em]">
            <Globe className="h-3.5 w-3.5" />
            External Network Bridge
          </div>
          <h2 className="text-3xl font-display font-bold tracking-tight text-[#001F3D] uppercase">{title}</h2>
        </div>
        <div className="flex items-center gap-4">
          <Badge variant="outline" className="h-9 px-4 rounded-xl border-emerald-200 bg-emerald-50 text-emerald-700 font-bold text-[9px] uppercase gap-2">
            <ShieldCheck className="h-3 w-3" /> Secure Tunnel Active
          </Badge>
          <Button variant="outline" className="h-10 rounded-xl border-slate-200 bg-white text-[10px] font-bold uppercase tracking-widest gap-2 shadow-sm" onClick={() => window.open(url, '_blank')}>
            <ExternalLink className="h-3.5 w-3.5" /> Full Scale Node
          </Button>
        </div>
      </header>

      <Card className="flex-1 bg-white border-slate-200 shadow-2xl rounded-[2.5rem] overflow-hidden relative group">
        {isLoading && (
          <div className="absolute inset-0 flex flex-col items-center justify-center bg-slate-50 z-20">
            <RefreshCw className="h-12 w-12 text-primary animate-spin mb-4" />
            <p className="text-[10px] font-bold uppercase text-slate-400 tracking-[0.3em]">Establishing Connection Matrix...</p>
          </div>
        )}
        <iframe src={url} className="w-full h-full border-none" onLoad={() => setIsLoading(false)} />
      </Card>
    </div>
  );
}
