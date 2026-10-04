"use client";

import { useState, useMemo } from 'react';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { 
  FileBarChart, 
  Download, 
  Search, 
  Filter, 
  Calendar, 
  PieChart, 
  TrendingUp, 
  Box, 
  ShoppingCart, 
  Factory, 
  ShieldCheck, 
  ChevronRight,
  Landmark,
  ClipboardList
} from 'lucide-react';
import { BillingRecord, Order, Machine, WorkLogEntry, QualityReport } from '@/lib/types';
import { Input } from '@/components/ui/input';
import { DatePicker } from '@/components/ui/date-picker';
import { cn } from '@/lib/utils';

interface ReportCenterProps {
  billing: BillingRecord[];
  orders: Order[];
  machines: Machine[];
  logs: WorkLogEntry[];
  reports: QualityReport[];
}

export function ReportCenter({ billing, orders, machines, logs, reports }: ReportCenterProps) {
  const [activeHub, setActiveHub] = useState('financial');
  const [searchTerm, setSearchTerm] = useState('');

  const reportCategories = [
    { id: 'financial', label: 'Financial Reports', icon: Landmark },
    { id: 'production', label: 'Production Reports', icon: Factory },
    { id: 'quality', label: 'Quality Reports', icon: ShieldCheck },
    { id: 'management', label: 'Management Reports', icon: PieChart },
  ];

  return (
    <div className="space-y-8 animate-in fade-in duration-1000">
      <header className="flex flex-col lg:flex-row justify-between items-start lg:items-end gap-6 px-2">
        <div className="flex flex-col gap-2">
          <div className="flex items-center gap-3 text-primary font-bold text-xs uppercase tracking-[0.2em]">
            <FileBarChart className="h-4 w-4" />
            Institutional Intelligence
          </div>
          <h2 className="text-4xl font-display font-bold tracking-tight text-[#001F3D] uppercase">
            Report <span className="text-slate-400 font-medium">Center</span>
          </h2>
          <p className="text-muted-foreground font-medium uppercase text-[10px] tracking-widest">Consolidated analytical matrices for cross-functional governance.</p>
        </div>
      </header>

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
        {reportCategories.map(cat => (
          <button 
            key={cat.id}
            onClick={() => setActiveHub(cat.id)}
            className={cn(
              "p-8 rounded-[2.5rem] border-2 transition-all flex flex-col gap-6 text-left group",
              activeHub === cat.id 
                ? "bg-[#001F3D] border-[#001F3D] text-white shadow-2xl shadow-primary/20" 
                : "bg-white border-slate-100 text-slate-400 hover:border-primary/20"
            )}
          >
            <div className={cn(
              "p-4 rounded-2xl w-fit transition-transform group-hover:scale-110",
              activeHub === cat.id ? "bg-primary text-[#001F3D]" : "bg-slate-50 text-slate-400"
            )}>
              <cat.icon className="h-8 w-8" />
            </div>
            <div>
              <p className="text-[10px] font-black uppercase tracking-widest mb-1 opacity-60">Matrix Node</p>
              <h3 className="text-lg font-display font-black uppercase leading-tight">{cat.label}</h3>
            </div>
          </button>
        ))}
      </div>

      <Card className="overflow-hidden border-slate-200 bg-white shadow-2xl rounded-[2.5rem]">
        <div className="p-8 border-b border-slate-100 bg-slate-50/50 flex flex-col md:flex-row justify-between items-center gap-6">
          <div className="flex items-center gap-4">
             <div className="p-3 bg-[#001F3D] rounded-xl text-white shadow-lg"><ClipboardList className="h-6 w-6" /></div>
             <div>
                <h3 className="text-xl font-display font-bold text-[#001F3D] uppercase tracking-tight">Consolidated Ledger</h3>
                <p className="text-[10px] text-slate-400 font-bold uppercase tracking-[0.2em] mt-1">Audit-Ready Matrix Protocol</p>
             </div>
          </div>
          <div className="flex items-center gap-4">
            <div className="relative w-72">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
              <Input placeholder="Filter matrix..." className="h-11 pl-10 rounded-xl bg-white border-slate-200 text-xs font-bold uppercase" value={searchTerm} onChange={(e)=>setSearchTerm(e.target.value)} />
            </div>
            <Button variant="outline" className="h-11 rounded-xl font-bold uppercase text-[9px] tracking-widest gap-2">
              <Download className="h-4 w-4" /> EXPORT_ALL
            </Button>
          </div>
        </div>

        <div className="p-12 text-center opacity-30 h-96 flex flex-col items-center justify-center">
           <FileBarChart className="h-24 w-24 mb-6 text-slate-300" />
           <h4 className="text-2xl font-display font-bold uppercase tracking-tight">Report Matrix Idle</h4>
           <p className="text-xs font-bold uppercase tracking-widest mt-2">Initialize Hub selection to generate specific operational metadata.</p>
        </div>
      </Card>
    </div>
  );
}
