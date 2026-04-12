"use client";

import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { 
  ShoppingCart, 
  ArrowUpRight, 
  ShieldCheck, 
  Package, 
  DollarSign, 
  ChevronRight,
  Zap,
  Cpu,
  TrendingUp,
  Clock
} from 'lucide-react';
import { 
  ResponsiveContainer, 
  XAxis, 
  YAxis, 
  Tooltip as ChartTooltip, 
  Area,
  AreaChart
} from "recharts";
import { cn } from '@/lib/utils';
import { Order } from '@/lib/types';

interface ShopFloorOverviewProps {
  orders: Order[];
  onNavigateToOrders?: () => void;
  onNavigateToMachine?: () => void;
  onNavigateToInventory?: () => void;
  onNavigateToBilling?: () => void;
}

export function ShopFloorOverview({ 
  orders,
  onNavigateToOrders, 
  onNavigateToMachine, 
  onNavigateToInventory, 
  onNavigateToBilling 
}: ShopFloorOverviewProps) {
  
  const kpiData = [
    { id: 'inventory', label: 'Material Ledger', total: '0', sub1: 'SKUs', sub1Val: 0, sub2: 'Short', sub2Val: 0, icon: Package, color: 'text-blue-500', bg: 'bg-blue-50' },
    { id: 'billing', label: 'Financial Hub', total: '₹ 0.00', sub1: 'MTD', sub1Val: '₹ 0', sub2: 'Due', sub2Val: '₹ 0', icon: DollarSign, color: 'text-emerald-500', bg: 'bg-emerald-50' },
    { id: 'orders', label: 'Active Jobs', total: orders.length.toString(), sub1: 'WIP', sub1Val: orders.filter(o => o.status === 'Active').length, sub2: 'Queued', sub2Val: orders.filter(o => o.status === 'Pending').length, icon: ShoppingCart, color: 'text-indigo-500', bg: 'bg-indigo-50' },
  ];

  const chartData = [
    { name: 'Mon', value: 45 },
    { name: 'Tue', value: 52 },
    { name: 'Wed', value: 48 },
    { name: 'Thu', value: 61 },
    { name: 'Fri', value: 55 },
    { name: 'Sat', value: 67 },
    { name: 'Sun', value: 70 },
  ];

  const handleKPIClick = (id: string) => {
    if (id === 'orders') onNavigateToOrders?.();
    if (id === 'inventory') onNavigateToInventory?.();
    if (id === 'billing') onNavigateToBilling?.();
  };

  return (
    <div className="space-y-12 animate-in fade-in duration-1000">
      <header className="flex flex-col lg:flex-row justify-between items-start lg:items-end gap-6">
        <div className="flex flex-col gap-2">
          <div className="flex items-center gap-3 text-primary font-bold text-[10px] uppercase tracking-[0.4em]">
            <Zap className="h-4 w-4 fill-primary" />
            Live Matrix Telemetry
          </div>
          <h2 className="text-5xl font-headline font-bold tracking-tighter text-[#001F3D]">
            Command <span className="text-slate-400 font-medium">Matrix</span>
          </h2>
          <p className="text-slate-500 font-bold text-[10px] uppercase tracking-[0.2em] mt-1">Operational Node: MASTER_CTRL_ALPHA</p>
        </div>
        
        <div className="flex items-center gap-4">
          <div className="px-6 py-3 bg-white shadow-2xl shadow-blue-900/5 border border-blue-50 rounded-2xl flex items-center gap-4">
            <div className="h-2.5 w-2.5 rounded-full bg-emerald-500 animate-pulse shadow-[0_0_12px_rgba(16,185,129,0.6)]" />
            <span className="text-[10px] font-bold text-[#001F3D] uppercase tracking-[0.2em]">Network Verified</span>
          </div>
          <Button variant="outline" className="rounded-2xl h-12 border-slate-200 gap-3 font-bold text-[10px] uppercase tracking-widest shadow-sm hover:bg-slate-50 transition-all">
            <ShieldCheck className="h-4 w-4 text-primary" /> Security Audit
          </Button>
        </div>
      </header>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8">
        {kpiData.map((kpi) => {
          const Icon = kpi.icon;
          return (
            <Card 
              key={kpi.label} 
              className="premium-card p-10 group cursor-pointer active:scale-[0.98]"
              onClick={() => handleKPIClick(kpi.id)}
            >
              <div className="flex justify-between items-start mb-10">
                <div className={cn("p-5 rounded-[1.5rem] shadow-lg transition-all group-hover:scale-110 group-hover:rotate-3", kpi.bg)}>
                  <Icon className={cn("h-7 w-7", kpi.color)} />
                </div>
                <div className="flex items-center gap-1.5 text-[11px] font-bold text-emerald-500 bg-emerald-50 px-4 py-1.5 rounded-full">
                  <ArrowUpRight className="h-3.5 w-3.5" /> {orders.length > 0 ? '+14.2%' : '0%'}
                </div>
              </div>
              
              <div>
                <p className="text-[10px] uppercase font-bold tracking-[0.3em] text-slate-400 mb-2">{kpi.label}</p>
                <h3 className="text-5xl font-headline font-bold tracking-tighter text-[#001F3D]">{kpi.total}</h3>
                
                <div className="grid grid-cols-2 gap-8 mt-10 pt-8 border-t border-slate-50">
                  <div className="space-y-1">
                    <p className="text-[9px] text-slate-400 uppercase font-bold tracking-widest">{kpi.sub1}</p>
                    <p className="text-xl font-bold text-[#001F3D]">{kpi.sub1Val}</p>
                  </div>
                  <div className="space-y-1">
                    <p className="text-[9px] text-slate-400 uppercase font-bold tracking-widest">{kpi.sub2}</p>
                    <p className="text-xl font-bold text-[#001F3D]">{kpi.sub2Val}</p>
                  </div>
                </div>
              </div>
            </Card>
          );
        })}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        <Card className="lg:col-span-8 p-12 bg-white border-none shadow-[0_40px_80px_-20px_rgba(0,0,0,0.08)] rounded-[3rem] space-y-12 group relative overflow-hidden">
          <div className="absolute top-0 right-0 p-10 opacity-[0.03] group-hover:opacity-[0.08] transition-opacity">
            <TrendingUp className="h-40 w-40" />
          </div>
          
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-6 relative z-10">
            <div className="space-y-2">
              <div className="flex items-center gap-3">
                <div className="h-1.5 w-10 bg-primary rounded-full" />
                <h4 className="text-[10px] font-bold uppercase tracking-[0.4em] text-slate-400">Yield Velocity</h4>
              </div>
              <p className="text-3xl font-display font-bold tracking-tight text-[#001F3D]">Plant Productivity Index</p>
            </div>
            <div className="flex gap-3">
              <Badge className="bg-[#001F3D] text-white border-none text-[9px] font-bold px-5 py-2 rounded-full uppercase tracking-widest">LIVE_FEED</Badge>
              <Badge variant="outline" className="border-slate-200 text-slate-400 text-[9px] font-bold px-5 py-2 rounded-full uppercase tracking-widest">MTD_WINDOW</Badge>
            </div>
          </div>

          <div className="h-[340px] w-full relative z-10">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={chartData}>
                <defs>
                  <linearGradient id="colorValue" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#6366f1" stopOpacity={0.2}/>
                    <stop offset="95%" stopColor="#6366f1" stopOpacity={0}/>
                  </linearGradient>
                </defs>
                <XAxis 
                  dataKey="name" 
                  axisLine={false} 
                  tickLine={false} 
                  tick={{fontSize: 10, fontWeight: 700, fill: '#94a3b8'}} 
                  dy={20}
                />
                <YAxis hide />
                <ChartTooltip 
                  content={({active, payload}) => {
                    if (active && payload && payload.length) {
                      return (
                        <div className="bg-[#001F3D] text-white px-6 py-4 rounded-2xl shadow-2xl border-none animate-in zoom-in-95">
                          <p className="text-[10px] font-bold uppercase tracking-[0.3em] text-white/40 mb-2">{payload[0].payload.name}</p>
                          <p className="text-2xl font-display font-bold">{payload[0].value}% <span className="text-[10px] text-emerald-400 ml-1">UPTIME</span></p>
                        </div>
                      );
                    }
                    return null;
                  }}
                />
                <Area 
                  type="monotone" 
                  dataKey="value" 
                  stroke="#6366f1" 
                  strokeWidth={5} 
                  fillOpacity={1} 
                  fill="url(#colorValue)" 
                  animationDuration={2500}
                />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </Card>

        <Card className="lg:col-span-4 p-12 bg-[#001F3D] text-white border-none shadow-2xl shadow-blue-900/20 rounded-[3rem] flex flex-col justify-between relative overflow-hidden group cursor-pointer" onClick={onNavigateToMachine}>
          <div className="absolute inset-0 opacity-[0.03] pointer-events-none" style={{ backgroundImage: 'radial-gradient(#fff 1px, transparent 0)', backgroundSize: '40px 40px' }} />
          <div className="absolute top-0 right-0 p-8 opacity-10 group-hover:opacity-20 transition-all duration-1000 group-hover:scale-110">
            <Cpu className="h-40 w-40" />
          </div>
          
          <div className="relative z-10">
            <header className="flex justify-between items-center mb-16">
              <div className="p-4 bg-white/10 backdrop-blur-xl rounded-2xl border border-white/10 shadow-xl">
                <TrendingUp className="h-7 w-7 text-primary" />
              </div>
              <Badge className="bg-primary text-white border-none text-[9px] font-bold tracking-[0.3em] px-5 py-2 rounded-full uppercase">OEE_PROTOCOL</Badge>
            </header>
            
            <div className="space-y-6">
              <p className="text-[11px] font-bold uppercase tracking-[0.4em] text-white/40">Global Fleet Efficiency</p>
              <h3 className="text-7xl font-display font-bold tracking-tighter">{orders.length > 0 ? '84.2' : '0.0'}<span className="text-2xl ml-1 text-white/20">%</span></h3>
              <p className="text-[13px] font-medium text-white/60 leading-relaxed max-w-[240px]">
                Consolidated operational telemetry across all active production nodes.
              </p>
            </div>
          </div>

          <div className="space-y-8 pt-12 border-t border-white/10 relative z-10">
            <div className="flex justify-between items-center group/btn">
              <span className="text-[10px] font-bold uppercase tracking-[0.3em] text-white/40 group-hover/btn:text-white transition-colors">Asset Telemetry Matrix</span>
              <div className="h-12 w-12 bg-white/5 border border-white/10 rounded-full flex items-center justify-center group-hover/btn:bg-primary group-hover/btn:border-primary transition-all duration-500 shadow-xl">
                <ChevronRight className="h-6 w-6" />
              </div>
            </div>
          </div>
        </Card>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        <Card className="p-10 bg-white border-none shadow-xl shadow-blue-900/5 rounded-[2.5rem] flex items-center gap-8 group transition-all hover:translate-y-[-4px]">
          <div className="h-20 w-20 bg-emerald-50 rounded-3xl flex items-center justify-center text-emerald-500 shrink-0 shadow-lg shadow-emerald-500/5 transition-transform duration-700 group-hover:scale-110 group-hover:rotate-6">
            <ShieldCheck className="h-10 w-10" />
          </div>
          <div className="flex-1 space-y-2">
            <p className="text-[10px] font-bold text-slate-400 uppercase tracking-[0.3em]">Security Health</p>
            <p className="text-xl font-display font-bold text-[#001F3D] uppercase tracking-tight">Ledger Protocol Active</p>
            <div className="flex items-center gap-3">
              <div className="h-2 w-2 rounded-full bg-emerald-500 shadow-[0_0_8px_rgba(16,185,129,0.6)]" />
              <p className="text-[11px] text-slate-500 font-bold uppercase tracking-widest">Nodes Synchronized</p>
            </div>
          </div>
        </Card>

        <Card className="p-10 bg-white border-none shadow-xl shadow-blue-900/5 rounded-[2.5rem] flex items-center gap-8 group transition-all hover:translate-y-[-4px]">
          <div className="h-20 w-20 bg-primary/5 rounded-3xl flex items-center justify-center text-primary shrink-0 shadow-lg shadow-primary/5 transition-transform duration-700 group-hover:scale-110 group-hover:-rotate-6">
            <Clock className="h-10 w-10" />
          </div>
          <div className="flex-1 space-y-2">
            <p className="text-[10px] font-bold text-slate-400 uppercase tracking-[0.3em]">Uptime Telemetry</p>
            <p className="text-xl font-display font-bold text-[#001F3D] uppercase tracking-tight">99.9% Production Stability</p>
            <div className="flex items-center gap-3">
              <div className="h-2 w-2 rounded-full bg-primary animate-pulse shadow-[0_0_8px_rgba(99,102,241,0.6)]" />
              <p className="text-[11px] text-slate-500 font-bold uppercase tracking-widest">Monitoring {orders.length} Threads</p>
            </div>
          </div>
        </Card>
      </div>
    </div>
  );
}
