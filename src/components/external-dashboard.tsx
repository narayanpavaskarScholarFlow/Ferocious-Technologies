
"use client";

import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Globe, ExternalLink, RefreshCw, ShieldCheck } from 'lucide-react';
import { useState } from 'react';

interface ExternalDashboardProps {
  url: string;
  title?: string;
}

export function ExternalDashboard({ url, title = 'Integrated Matrix Hub' }: ExternalDashboardProps) {
  const [isLoading, setIsLoading] = useState(true);

  return (
    <div className="h-full flex flex-col gap-6 animate-in fade-in duration-1000 overflow-hidden">
      <header className="flex flex-col lg:flex-row justify-between items-start lg:items-end gap-4 px-2 shrink-0">
        <div className="flex flex-col gap-1">
          <div className="flex items-center gap-2 text-primary font-bold text-[9px] uppercase tracking-[0.3em]">
            <Globe className="h-3.5 w-3.5" />
            External System Node
          </div>
          <h2 className="text-3xl font-display font-bold tracking-tight text-[#001F3D]">
            {title.split(' ').slice(0, -1).join(' ')} <span className="text-slate-400 font-medium">{title.split(' ').slice(-1)}</span>
          </h2>
          <p className="text-xs text-muted-foreground font-medium uppercase tracking-widest">Unified operational bridge to sub-system matrix.</p>
        </div>
        
        <div className="flex items-center gap-4">
          <Badge variant="outline" className="h-9 px-4 rounded-xl border-emerald-200 bg-emerald-50 font-bold text-[9px] uppercase tracking-widest text-emerald-700 flex gap-2">
            <ShieldCheck className="h-3 w-3" /> Secure Tunnel Active
          </Badge>
          <Button 
            variant="outline" 
            className="h-10 rounded-xl border-slate-200 bg-white text-[10px] font-bold uppercase tracking-widest gap-2 shadow-sm"
            onClick={() => window.open(url, '_blank')}
          >
            <ExternalLink className="h-3.5 w-3.5 text-slate-400" /> Open Full Scale
          </Button>
        </div>
      </header>

      <Card className="flex-1 bg-white border-slate-200 shadow-2xl rounded-[2.5rem] overflow-hidden relative group">
        {isLoading && (
          <div className="absolute inset-0 flex flex-col items-center justify-center bg-slate-50 z-20">
            <RefreshCw className="h-12 w-12 text-primary animate-spin mb-4" />
            <p className="text-[10px] font-bold uppercase text-slate-400 tracking-[0.3em]">Establishing Matrix Sync...</p>
          </div>
        )}
        <iframe 
          src={url} 
          className="w-full h-full border-none"
          onLoad={() => setIsLoading(false)}
          title="External Integrated Hub"
          sandbox="allow-same-origin allow-scripts allow-popups allow-forms"
        />
        
        {/* Overlay protection for scroll interaction focus */}
        <div className="absolute bottom-6 right-6 pointer-events-none z-30 opacity-0 group-hover:opacity-100 transition-opacity">
           <div className="bg-[#001F3D] text-white px-4 py-2 rounded-full text-[8px] font-bold uppercase tracking-widest shadow-2xl border border-white/10">
              Interactive Hub Terminal v2.4
           </div>
        </div>
      </Card>
    </div>
  );
}
