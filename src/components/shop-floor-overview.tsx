"use client";

import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { 
  Monitor, 
  ShoppingCart, 
  Users, 
  ArrowUpRight, 
  CheckCircle2, 
  AlertTriangle,
  Activity,
  Zap,
  Package,
  TrendingUp,
  DollarSign,
  ShieldCheck,
  ChevronRight
} from 'lucide-react';
import { 
  Bar, 
  BarChart, 
  ResponsiveContainer, 
  XAxis, 
  YAxis, 
  Tooltip as ChartTooltip, 
  Cell,
  Line,
  LineChart,
  Area,
  AreaChart
} from "recharts";
import { cn } from '@/lib/utils';

const kpiData = [
  { id: 'inventory', label: 'Material Ledger', total: '0', sub1: 'SKUs', sub1Val: 0, sub2: 'Short', sub2Val: 0, icon: Package, color: 'text-blue-500' },
  { id: 'billing', label: 'Financial Hub', total: '$0.00', sub1: 'MTD', sub1Val: '$0', sub2: 'Due', sub2Val: '$0', icon: DollarSign, color: 'text-emerald-500' },
  { id: 'orders', label: 'Active Jobs', total: '0', sub1: 'WIP', sub1Val: 0, sub2: 'Queued', sub2Val: 0, icon: ShoppingCart, color: 'text-accent' },
];

const chartData = [
  { name: 'Assembly', ok: 0, warn: 0, error: 0 },
  { name: 'Machining', ok: 0, warn: 0, error: 0 },
  { name: 'Quality', ok: 0, warn: 0, error: 0 },
  { name: 'Logistics', ok: 0, warn: 0, error: 0 },
  { name: 'Design', ok: 0, warn: 0, error: 0 },
];

interface ShopFloorOverviewProps {
  onNavigateToOrders?: () => void;
  onNavigateToMachine?: () => void;
  onNavigateToInventory?: () => void;
  onNavigateToBilling?: () => void;
}

export function ShopFloorOverview({ 
  onNavigateToOrders, 
  onNavigateToMachine, 
  onNavigateToInventory, 
  onNavigateToBilling 
}: ShopFloorOverviewProps) {
  
  const handleKPIClick = (id: string) => {
    if (id === 'orders') onNavigateToOrders?.();
    if (id === 'inventory') onNavigateToInventory?.();
    if (id === 'billing') onNavigateToBilling?.();
  };

  return (
    <div className="flex flex-col gap-8">
      <header className="flex flex-col lg:flex-row justify-between items-start lg:items-end gap-4">
        <div className="flex flex-col gap-1">
          <div className="flex items-center gap-2 text-accent font-bold text-[9px] uppercase tracking-[0.3em]">
            <div className="h-1.5 w-1.5 rounded-full bg-accent animate-pulse-red" />
            Live System Intelligence
          </div>
          <h2 className="text-3xl font-headline font-bold tracking-tight text-[#001F3D]">
            Command <span className="text-slate-400 font-medium">Matrix</span>
          </h2>
          <p className="text-slate-500 font-medium text-xs tracking-tight">Plant Operational Telemetry v2.4.0</p>
        </div>
        
        <div className="flex items-center gap-2">
          <div className="px-4 py-2 bg-emerald-500/5 rounded-lg border border-emerald-500/10 flex items-center gap-2">
            <div className="h-1.5 w-1.5 rounded-full bg-emerald-500 animate-pulse" />
            <span className="text-[9px] font-bold text-emerald-600 uppercase tracking-widest">Network Online</span>
          </div>
          <div className="px-4 py-2 bg-primary/5 rounded-lg border border-primary/10 flex items-center gap-2">
            <ShieldCheck className="h-3.5 w-3.5 text-primary" />
            <span className="text-[9px] font-bold text-primary uppercase tracking-widest">Audit Secure</span>
          </div>
        </div>
      </header>

      {/* KPI Bento Row */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {kpiData.map((kpi) => {
          const Icon = kpi.icon;
          return (
            <div 
              key={kpi.label} 
              className="glass-card p-6 group relative cursor-pointer active:scale-[0.99] transition-all border-slate-200/40"
              onClick={() => handleKPIClick(kpi.id)}
            >
              <div className="flex justify-between items-start mb-6">
                <div className="p-3 bg-slate-50 rounded-xl group-hover:bg-primary/5 transition-colors">
                  <Icon className={cn("h-5 w-5", kpi.color)} />
                </div>
                <div className="flex items-center gap-1 text-[10px] font-bold text-emerald-500">
                  <ArrowUpRight className="h-3 w-3" /> +0.0%
                </div>
              </div>
              
              <div>
                <p className="text-[9px] uppercase font-bold tracking-[0.2em] text-slate-400 mb-1">{kpi.label}</p>
                <h3 className="text-3xl font-headline font-bold tracking-tighter text-[#001F3D]">{kpi.total}</h3>
                
                <div className="flex gap-8 mt-6 pt-4 border-t border-slate-100">
                  <div>
                    <p className="text-[8px] text-slate-400 uppercase font-bold mb-0.5">{kpi.sub1}</p>
                    <p className="text-sm font-bold text-[#001F3D]">{kpi.sub1Val}</p>
                  </div>
                  <div>
                    <p className="text-[8px] text-slate-400 uppercase font-bold mb-0.5">{kpi.sub2}</p>
                    <p className="text-sm font-bold text-[#001F3D]">{kpi.sub2Val}</p>
                  </div>
                </div>
              </div>
            </div>
          );
        })}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-4">
        {/* OEE Gauge */}
        <div className="lg:col-span-4 glass-card p-8 flex flex-col items-center justify-center text-center cursor-pointer group" onClick={onNavigateToMachine}>
          <header className="w-full flex justify-between items-center mb-8">
            <h4 className="text-[9px] font-bold uppercase tracking-[0.2em] text-slate-400">Fleet Efficiency</h4>
            <Badge className="bg-accent/10 text-accent border-none text-[8px] font-bold">OEE INDEX</Badge>
          </header>
          
          <div className="relative w-48 h-48 flex items-center justify-center">
             <svg className="w-full h-full transform -rotate-90">
                <circle cx="50%" cy="50%" r="40%" stroke="currentColor" strokeWidth="8" fill="transparent" className="text-slate-100" />
                <circle cx="50%" cy="50%" r="40%" stroke="currentColor" strokeWidth="8" fill="transparent" strokeDasharray="251" strokeDashoffset="251" className="text-primary rounded-full drop-shadow-[0_0_8px_rgba(0,31,61,0.2)]" />
             </svg>
             <div className="absolute inset-0 flex flex-col items-center justify-center">
                <span className="text-5xl font-headline font-bold tracking-tighter text-[#001F3D]">0.0</span>
                <span className="text-[8px] font-bold text-slate-400 tracking-[0.3em] mt-1 uppercase">Metric_Value</span>
             </div>
          </div>
          
          <div className="mt-8 grid grid-cols-2 gap-6 w-full border-t border-slate-100 pt-6">
            <div className="text-center">
              <p className="text-[8px] font-bold text-slate-400 uppercase mb-0.5">Avail</p>
              <p className="text-base font-bold text-[#001F3D]">0%</p>
            </div>
            <div className="text-center">
              <p className="text-[8px] font-bold text-slate-400 uppercase mb-0.5">Perf</p>
              <p className="text-base font-bold text-[#001F3D]">0%</p>
            </div>
          </div>
        </div>

        {/* Load Matrix */}
        <div className="lg:col-span-8 glass-card p-8 group cursor-pointer" onClick={onNavigateToMachine}>
          <header className="flex justify-between items-center mb-10">
            <div>
              <h4 className="text-[9px] font-bold uppercase tracking-[0.2em] text-slate-400 mb-0.5">Operational Stability</h4>
              <p className="text-lg font-bold tracking-tight text-[#001F3D]">Resource Load Matrix</p>
            </div>
            <div className="flex gap-3">
              <div className="flex items-center gap-1.5">
                <div className="h-2 w-2 rounded-full bg-primary" />
                <span className="text-[8px] font-bold text-slate-400 uppercase">Stable</span>
              </div>
              <div className="flex items-center gap-1.5">
                <div className="h-2 w-2 rounded-full bg-accent" />
                <span className="text-[8px] font-bold text-slate-400 uppercase">Alert</span>
              </div>
            </div>
          </header>
          <div className="h-[240px]">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={chartData}>
                <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{fontSize: 9, fontWeight: 700, fill: '#94a3b8'}} />
                <YAxis hide />
                <ChartTooltip 
                  cursor={{fill: 'rgba(0,0,0,0.02)'}}
                  content={({active, payload}) => {
                    if (active && payload && payload.length) {
                      return (
                        <div className="bg-[#001F3D] text-white px-3 py-2 rounded-lg text-[9px] font-bold shadow-xl border border-white/10">
                          <p className="uppercase tracking-widest text-white/40 mb-0.5">{payload[0].payload.name}</p>
                          <p className="text-sm font-headline">{payload[0].value} UNITS</p>
                        </div>
                      );
                    }
                    return null;
                  }}
                />
                <Bar dataKey="ok" stackId="a" fill="#003d6b" radius={[4, 4, 0, 0]} barSize={24} />
                <Bar dataKey="error" stackId="a" fill="#ef4444" radius={[4, 4, 0, 0]} barSize={24} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>

      <div className="glass-card p-8 border-l-4 border-l-accent">
        <div className="flex justify-between items-center mb-6">
          <div>
            <h4 className="text-[9px] font-bold uppercase tracking-[0.2em] text-slate-400 mb-0.5">Critical Notifications</h4>
            <p className="text-lg font-bold tracking-tight text-[#001F3D]">Industrial System Log</p>
          </div>
          <Button variant="link" className="text-[9px] font-bold uppercase tracking-widest text-primary hover:text-accent p-0 h-auto">
            Acknowledge System_Signals <ChevronRight className="h-3 w-3 ml-1" />
          </Button>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="flex items-center justify-between p-5 bg-accent/[0.03] border border-accent/10 rounded-xl group transition-all hover:bg-accent/5">
            <div className="flex items-center gap-4">
              <div className="h-10 w-10 flex items-center justify-center bg-accent rounded-lg text-white shadow-lg shadow-accent/20">
                <AlertTriangle className="h-5 w-5" />
              </div>
              <div>
                <p className="text-[9px] font-bold text-accent uppercase tracking-widest mb-0.5">CRITICAL_EVENT</p>
                <p className="text-sm font-bold text-[#001F3D]">Root Database Initialization</p>
                <p className="text-[10px] text-slate-500 font-medium">Status: Standby for Data Injection</p>
              </div>
            </div>
            <span className="text-[9px] font-bold text-accent animate-pulse uppercase">LIVE</span>
          </div>
          
          <div className="flex items-center justify-between p-5 bg-primary/[0.03] border border-primary/10 rounded-xl group transition-all hover:bg-primary/5">
            <div className="flex items-center gap-4">
              <div className="h-10 w-10 flex items-center justify-center bg-primary rounded-lg text-white shadow-lg shadow-primary/20">
                <CheckCircle2 className="h-5 w-5" />
              </div>
              <div>
                <p className="text-[9px] font-bold text-primary uppercase tracking-widest mb-0.5">SECURITY_GATE</p>
                <p className="text-sm font-bold text-[#001F3D]">Ledger Integrity Verified</p>
                <p className="text-[10px] text-slate-500 font-medium">Node: Auth_Security_Main</p>
              </div>
            </div>
            <span className="text-[9px] font-bold text-slate-300 font-code uppercase">SYNC</span>
          </div>
        </div>
      </div>
    </div>
  );
}